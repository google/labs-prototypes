/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";
import { PaLMKit } from "@google-labs/palm-kit";

const math = new Board({
  title: "The Calculator Recipe",
  description:
    "A simple AI pattern that leans on the power of the LLMs to generate language to solve math problems.",
  version: "0.0.1",
});
const kit = math.addKit(Starter);
const palm = math.addKit(PaLMKit);

math
  .input({
    $id: "math-question",
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Math problem",
          description: "Ask a math question",
        },
      },
      required: ["text"],
    },
  })
  .wire(
    "text->question",
    kit
      .promptTemplate({
        template: "Translate the math problem below into a JavaScript function named `compute` that can be executed to provide the answer to the problem\nMath Problem: {{question}}\nSolution:",
        $id: "math-function",
      })
      .wire(
        "prompt->text",
        palm
          .generateText({ $id: "math-function-generator" })
          .wire(
            "completion->code",
            kit.runJavascript({
              name: "compute",
              $id: "compute",
            }).wire(
              "result->text",
              math.output({
                $id: "print",
                schema: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      title: "Answer",
                      description: "The answer to the math problem",
                    },
                  },
                  required: ["text"],
                },
              })
            )
              .wire("<-PALM_KEY", kit.secrets({ keys: ["PALM_KEY"] })),
      )
  );

export default math;
