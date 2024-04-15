/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { base, board, code } from "@google-labs/breadboard";
import { agents } from "@google-labs/agent-kit";

const collectorSchema = {
  type: "object",
  properties: {
    reflect: {
      type: "string",
    },
    action: {
      type: "string",
    },
    updated_state: {
      type: "object",
      properties: {
        send_date: {
          type: "string",
          description:
            "The date that the post will be sent. Leave as empty string when the value is not available.",
        },
        send_time: {
          type: "string",
          description:
            "The time that the post will be sent. Leave as empty string when the value is not available",
        },
        title: {
          type: "string",
          description:
            "A short text string, typically 50 characters or less. Leave as empty string when the value is not available",
        },
        caption: {
          type: "string",
          description: "Up to 2,200 characters of text, hashtags, and emojis",
        },
        images: {
          type: "array",
          description: "photos, logos, animated GIFs, Boomerangs, etc.",
          items: {
            type: "string",
          },
        },
        videos: {
          type: "array",
          description: "Reels, videos",
          items: {
            type: "string",
          },
        },
        sponsors: {
          type: "array",
          description: "sponsor information",
          items: {
            type: "string",
          },
        },
      },
    },
    response: {
      type: "string",
    },
  },
};

const exitToken = "~EXIT~";

const collectorInstruction = `You are part of a team that works together to create and send instagram posts for small business owners.
But you are only responsible for the first step, which is to find out what kinds of things will be part of the post, title, send time, send date, etc.
You  do this by having a multi turn conversation with the author.

Conversation-wise, you will take specific steps to ensure you are responding appropriately. Those steps are explained below.
1. reflect:  think about what the author said in the current turn and consider the context of previous turns to inform what you will say and do
2. action: explain what you will say in your response and what you need to update in the conversation state.
3. updated_state: this is the set of key, value pairs that describe what the author wants in the instagram post they are setting up.
4. response: this is the conversational utterance that is appropriate at this stage of the conversation given (1-3)

Make sure the 'updated_state' values for the post are maintained as the conversation progresses. Never erase them unless told to by the author.
If a value is never given, leave it as an empty string.

For images and videos, you do NOT need to ask for filenames. Just get a reasonably detailed description. If the author knows and gives you the actual file name, you can use it.

Ask the author questions until you believe you and the author understand and agree on what they want in the post.
Always ask if the author wants to include anything else in the post before you finish.

To finish: If the author communicates that they are finished specifying what is in the post, check that they have included the three required fields of 'send_date', 'send_time' and 'title'. If so, you should
respond with "${exitToken}".
Make sure the json object is populated with all the information you've gotten from the author, as shown in the example below.

Below is an example of what you'll do  responding to the author's input turns.

Study this example conversation so you are clear what to do.
Remember that it's a multi turn conversation, so if the author replies 'no' it needs to be taken in context of the previous turn. So, it might mean "nothing more" or "that is all".`;

type ContextItem = { parts: { text: string } };

const detectExit = code(({ context }) => {
  const c = context as ContextItem[];
  const last = c[c.length - 1];
  if (last.parts.text.includes("~EXIT~")) {
    return { exit: context };
  }
  return { context };
});

export default await board(({ context }) => {
  const author = agents.human({
    $metadata: { title: "Ask User" },
    description: "Reply here",
    context,
  });

  const collector = agents.structuredWorker({
    $metadata: { title: "Collect Media" },
    schema: collectorSchema,
    instruction: collectorInstruction,
    context: author.context,
  });

  const exitDetector = detectExit({
    $metadata: { title: "Check for Exit Condition" },
    context: collector.context,
  });

  base.output({
    $metadata: { title: "Exit" },
    exit: exitDetector.exit,
  });

  return { context: exitDetector.context };
}).serialize({
  title: "Media Collector",
  description:
    "A worker that knows how collect materials for the social media.",
  version: "0.0.1",
});
