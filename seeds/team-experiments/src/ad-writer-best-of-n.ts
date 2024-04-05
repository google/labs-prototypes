/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Schema, board, code } from "@google-labs/breadboard";
import { agents } from "@google-labs/agent-kit";
import { core } from "@google-labs/core-kit";
import { templates } from "@google-labs/template-kit";

const NUMBER_OF_WORKERS = 3;
const NUMBER_OF_HEADLINES = 10;
const NUMBER_OF_DESCRIPTIONS = 10;

const INSIST_ON_SHORT =
  "The headlines must be very short to fit into 30 character limit, and descriptions must fit into 90 characters. Pack the punch few words. Follow the best practices for Google Ads.";

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

const rankerSchema = {
  type: "object",
  properties: {
    ranked: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: {
            type: "string",
            description: "The item in the order of their relevance.",
          },
          reasoning: {
            type: "string",
            description: "The reason why this rank is the appropriate.",
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
  return { item: { adCampaign } };
});

type ContextItem = {
  role: string;
  parts: { text: string };
};

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

const arrangeForRanking = code(({ list }) => {
  const campaigns = list as { item: AdCampaign }[];
  const headlines: string[] = [];
  const descriptions: string[] = [];
  for (const campaign of campaigns) {
    const c = campaign.item.adCampaign;
    headlines.push(...c.headlines);
    descriptions.push(...c.descriptions);
  }
  return { headlines, descriptions };
});

const formatOutput = code(({ headlines, descriptions }) => {
  type Item = { item: string };
  type Ranked = { ranked: Item[] };
  const formatItems = (ranked: unknown) => {
    const items = (ranked as Ranked).ranked;
    return items.map((item) => `- ${item.item}`).join("\n");
  };
  const h = formatItems(headlines);
  const d = formatItems(descriptions);
  const text = `# Headlines\n${h}\n\n# Descriptions\n${d}`;
  return { text };
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
        description: "Writing a draft of the ad",
        logLevel: "info",
      },
      instruction: `You are a professional Google Ads writer. Write an ad campaign of ${NUMBER_OF_HEADLINES} headlines and ${NUMBER_OF_DESCRIPTIONS} descriptions that transforms the search engine marketing overview into a compelling, engaging set of ads. ${INSIST_ON_SHORT}`,
      context,
      schema: adCampaignSchema,
    });

    const customer = agents.structuredWorker({
      $metadata: {
        title: "Customer",
        description: "Critiquing the ads from customer's perspective",
        logLevel: "info",
      },
      instruction: critic.memoize(),
      context: adWriter.context,
      schema: requirementsSchema,
    });

    const editor = agents.structuredWorker({
      $metadata: {
        title: "Ad Editor",
        description: "Editing the ads to incorporate customer feedback",
        logLevel: "info",
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

    return { item: qualityAssurance.item };
  });

  const promptExtractor = extractPrompt({
    $metadata: {
      title: "Prompt Extractor",
    },
    json: customerPromptMaker.json,
  });

  const generateN = core.map({
    $metadata: {
      title: `Run ${NUMBER_OF_WORKERS} writing sub-teams`,
      description: `Delegating to ${NUMBER_OF_WORKERS} ad-writing sub-teams`,
      logLevel: "info",
    },
    board: writingSubteam.in({
      critic: promptExtractor.prompt,
      context,
    }),
    list: listMaker.list,
  });

  const rankingListMaker = arrangeForRanking({
    $metadata: { title: `Prepare Ads For Ranking` },
    list: generateN.list,
  });

  const headlinesRanker = agents.structuredWorker({
    $metadata: {
      title: "Rank Headlines",
      description: "Ranking the ad headlines",
      logLevel: "info",
    },
    instruction: templates.promptTemplate({
      $metadata: { title: "Create Headline Ranker Template", logLevel: "info" },
      template: `The following ad headlines were written for the provided Search Engine marketing document. Order these passages based on how well they follow the guidelines in the document\n\n{{headlines}}`,
      headlines: rankingListMaker.headlines,
    }).prompt,
    context,
    schema: rankerSchema,
  });

  const descriptionsRanker = agents.structuredWorker({
    $metadata: {
      title: "Rank Descriptions",
      description: "Ranking the ad descriptions",
      logLevel: "info",
    },
    instruction: templates.promptTemplate({
      $metadata: { title: "Create Descriptions Ranker Template" },
      template: `The following ad descriptions were written for the provided Search Engine marketing document. Order these passages based on how well they follow the guidelines in the document\n\n{{headlines}}`,
      headlines: rankingListMaker.descriptions,
    }).prompt,
    context,
    schema: rankerSchema,
  });

  const outputFormatter = formatOutput({
    $metadata: { title: "Format Output" },
    headlines: headlinesRanker.json,
    descriptions: descriptionsRanker.json,
  });

  return { text: outputFormatter.text.isString().format("markdown") };
}).serialize({
  title: "Ad Writer (Best of N)",
  description: "An example of a team of workers writing an ad",
  version: "0.0.2",
});
