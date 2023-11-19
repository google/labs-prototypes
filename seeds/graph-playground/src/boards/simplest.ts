/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";
import { PaLMKit } from "@google-labs/palm-kit";

const simplest = new Board({
  title: "The simplest LLM-based recipe",
  description:
    "This is as simple as it gets: the recipe takes a prompt as input and generates a response as output.",
  version: "0.0.1",
});
const kit = simplest.addKit(Starter);
const palm = simplest.addKit(PaLMKit);

const completion = palm.generateText();
kit.secrets({ keys: ["PALM_KEY"] }).wire("PALM_KEY", completion);
simplest
  .input({
    $id: "prompt",
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Prompt",
          description: "The prompt to generate a completion for",
        },
      },
      required: ["text"],
    },
  })
  .wire(
    "text",
    completion.wire(
      "completion->text",
      simplest.output({
        $id: "completion",
        schema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              title: "Response",
              description: "The completion generated by the LLM",
            },
          },
          required: ["text"],
        },
      })
    )
  );

export default simplest;
