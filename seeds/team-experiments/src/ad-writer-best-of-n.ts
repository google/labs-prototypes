/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, base, board, code } from "@google-labs/breadboard";
import { agents } from "@google-labs/agent-kit";
import { core } from "@google-labs/core-kit";

const NUMBER_OF_WORKERS = 4;
const NUMBER_OF_HEADLINES = 20;
const NUMBER_OF_DESCRIPTIONS = 20;

const INSIST_ON_SHORT =
  "The headlines must be very short to fit into 30 character limit, and descriptions must fit into 90 characters. Pack the punch into as few words as possible. Follow the best practices for Google Ads.";

const adCampaignSchema = {
  type: "object",
  properties: {
    adCampaign: {
      type: "object",
      description: "the ad campaign",
      properties: {
        headlines: {
          type: "array",
          items: {
            type: "string",
            description: `an ad headline (each must fit into 30 characters, up to ${NUMBER_OF_HEADLINES}  headlines)`,
          },
        },
        descriptions: {
          type: "array",
          items: {
            type: "string",
            description: `the  description (each must fit into 90 characters, up to ${NUMBER_OF_DESCRIPTIONS} descriptions)`,
          },
        },
      },
    },
  },
} satisfies Schema;

type AdCampaign = {
  adCampaign: {
    headlines: string[];
    descriptions: string[];
  };
};

// const adSchema = {
//   type: "object",
//   properties: {
//     headline: {
//       type: "string",
//       description: "a headline that fits into the 30 character limit",
//     },
//     description: {
//       type: "string",
//       description: "a description that fits into the 90 character limit",
//     },
//   },
// } satisfies Schema;

const requirementsSchema = {
  type: "object",
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          requirement: {
            type: "string",
            description: "the requirement",
          },
          justification: {
            type: "string",
            description: "reasoning behind including this requirement",
          },
        },
      },
    },
  },
} satisfies Schema;

const extractPrompt = code(({ json }) => {
  const { prompt } = json as { prompt: string };
  return { prompt };
});

const extractJson = code(({ context }) => {
  const list = (context as ContextItem[]) || [];
  const last = list[list.length - 1];
  const json = JSON.parse(last.parts.text);
  return { json };
});

const discardByLength = code(({ context }) => {
  const list = (context as ContextItem[]) || [];
  const last = list[list.length - 1];
  const json = JSON.parse(last.parts.text);
  const { adCampaign } = json as AdCampaign;
  const headlines: string[] = [];
  for (const headline of adCampaign.headlines) {
    if (headline.length > 30) continue;
    headlines.push(headline);
  }
  const descriptions: string[] = [];
  for (const description of adCampaign.descriptions) {
    if (description.length > 90) continue;
    descriptions.push(description);
  }
  if (descriptions.length === 0 && headlines.length === 0) {
    // Let's try again.
    const again = [list[0]];
    return { context: again };
  }
  adCampaign.descriptions = descriptions;
  adCampaign.headlines = headlines;
  return { adCampaign };
});

type ContextItem = {
  role: string;
  parts: { text: string };
};

/**
 * Will check character limits and insert a special prompt
 * if the limits are exceeded.
 */
const checkCharacterLimits = code(({ context }) => {
  const list = (context as ContextItem[]) || [];
  const last = list[list.length - 1] as ContextItem;
  const json = JSON.parse(last.parts.text);
  const { adCampaign } = json as AdCampaign;
  const warning = [
    `You are a brilliant copy editor who is famous brevity, making ads in the ad campaign fit into the character limits while retaining their meaning and impact. Given the ad, follow instructions below:`,
  ];
  for (const headline of adCampaign.headlines) {
    if (headline.length > 30) {
      warning.push(
        `The headline "${headline}" is ${headline.length} characters long, but needs to be 30 characters. Shorten it.`
      );
    }
  }
  for (const description of adCampaign.descriptions) {
    if (description.length > 90) {
      warning.push(
        `The description "${description}" is ${description.length} characters long, but needs to be 90 characters. Shorten it.`
      );
    }
  }
  if (warning.length > 1) {
    return { warning: warning.join("\n\n") };
  }
  return { context };
});

const refineAd = board(({ context }) => {
  const limitChecker = checkCharacterLimits({
    $metadata: {
      title: "Character Limit Checker",
    },
    context: context,
  });

  const shortener = agents.structuredWorker({
    $metadata: {
      title: "Ad Shortener",
    },
    instruction: limitChecker.warning,
    context,
    schema: adCampaignSchema,
  });

  base.output({
    $metadata: {
      title: "Successful exit",
    },
    exit: limitChecker.context,
  });

  return { context: shortener.context };
});

const adExample = `
# Search Engine Marketing Document

Write an ad for Breadboard. The ad must incorporate the following key messages: 
- Breadboard for Developers
- Play and experiment with AI Patterns
- Prototype quickly
- Use with Gemini APIs 
- Integrate AI Into Your Project
- Create graphs with prompts
- Accessible AI for Developers`;

const createList = code(({ n }) => {
  return { list: [...Array(n).keys()] };
});

export default await board(({ context }) => {
  context.title("Ad specs").format("multiline").examples(adExample);

  const customerPromptMaker = agents.structuredWorker({
    $metadata: {
      title: "Customer Prompt Maker",
      description: "Conjuring up a persona to represent a customer",
      logLevel: "info",
    },
    instruction: `Using the audience information in the search engine marketing overview, create a prompt for a bot who will pretend to be the target audience for the ad. The prompt needs to incorporate the sense of skepticism and weariness of ads, yet willingness to provide constructive feedback. The prompt needs to be in the form of:
    
    "You are [persona]. You are [list of traits]."`,
    schema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "the prompt for the bot",
        },
      },
    },
    context,
  });

  const listMaker = createList({
    $metadata: { title: "Worker Allocator" },
    n: NUMBER_OF_WORKERS,
  });

  const writingSubteam = board(({ context, critic }) => {
    const adWriter = agents.structuredWorker({
      $metadata: {
        title: "Ad Writer",
      },
      instruction: `You are a professional Google Ads writer. Write an ad campaign of ${NUMBER_OF_HEADLINES} headlines and ${NUMBER_OF_DESCRIPTIONS} descriptions that transforms the search engine marketing overview into a compelling, engaging set of ads. ${INSIST_ON_SHORT}`,
      context,
      schema: adCampaignSchema,
    });

    const customer = agents.structuredWorker({
      $metadata: {
        title: "Customer",
      },
      instruction: critic.memoize(),
      context: adWriter.context,
      schema: requirementsSchema,
    });

    const editor = agents.structuredWorker({
      $metadata: {
        title: "Ad Editor",
      },
      instruction: `Given the customer critique, update the ad campaign. Make sure to conform to the requirements in the Search Engine Marketing document. ${INSIST_ON_SHORT}`,
      context: customer,
      schema: adCampaignSchema,
    });

    const qualityAssurance = discardByLength({
      $metadata: { title: "Discard Ads That Don't Fit" },
      context: editor.context,
    });

    qualityAssurance.context.to(adWriter);

    return { item: qualityAssurance.adCampaign };
  });

  const promptExtractor = extractPrompt({
    $metadata: {
      title: "Prompt Extractor",
    },
    json: customerPromptMaker.json,
  });

  const generateN = core.map({
    $metadata: { title: `Delegate to ${NUMBER_OF_WORKERS} writing sub-teams` },
    board: writingSubteam.in({
      critic: promptExtractor.prompt,
      context,
    }),
    list: listMaker.list,
  });

  // const customer = agents.structuredWorker({
  //   $metadata: {
  //     title: "Customer",
  //   },
  //   instruction: promptExtractor.prompt,
  //   context: adWriter.context,
  //   schema: requirementsSchema,
  // });

  return { list: generateN.list };

  // const editor = agents.structuredWorker({
  //   $metadata: {
  //     title: "Ad Editor",
  //   },
  //   instruction: `Given the customer critique, update the ad campaign. Make sure to conform to the requirements in the Search Engine Marketing document. Remove any uses of the word "free".`,
  //   context: customer,
  //   schema: adCampaignSchema,
  // });

  // const adRefinery = agents.repeater({
  //   $metadata: {
  //     title: "Ad refinery",
  //   },
  //   context: editor.context,
  //   worker: refineAd,
  //   max: 4,
  // });

  // const jsonExtractor = extractJson({
  //   $metadata: {
  //     title: "JSON Extractor",
  //   },
  //   context: adRefinery.context,
  // });

  // return { context: adRefinery.context, json: jsonExtractor.json };
}).serialize({
  title: "Ad Writer (Best of N)",
  description: "An example of a team of workers writing an ad",
  version: "0.0.2",
});
