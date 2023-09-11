/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";
import { Nursery } from "@google-labs/node-nursery";

import { PromptMaker } from "./template.js";
import { NodeValue } from "@google-labs/graph-runner";

const BASE = "v2-multi-agent";

const maker = new PromptMaker(BASE);

const board = new Board({
  title: "Schemish Generator",
  description:
    "A wrapper for PaLM API `generateText` to ensure that its output conforms to a given schema. The wrapper utilizes [Schemish](https://glazkov.com/2023/05/06/schemish/), which is a compact JSON dialect that is used express JSON Schemas.",
  version: "0.0.1",
});
const kit = board.addKit(Starter);
const nursery = board.addKit(Nursery);

// Inputs
const prologue = board.passthrough({ $id: "prologue" });
const epilogue = board.passthrough({ $id: "epilogue" });
const schema = board.passthrough({ $id: "schema" });

function gate({ allow, value }: { allow: boolean; value: NodeValue }) {
  if (allow) return { value };
  return { error: value };
}

const shouldRecover = kit.runJavascript("gate", {
  $id: "shouldRecover",
  code: gate.toString(),
  raw: true,
});

const willRecover = board.passthrough({ $id: "willRecover" });

// Outputs
const $error = board.output({
  $id: "error",
  schema: {
    type: "object",
    properties: {
      error: {
        type: "object",
        title: "Error",
        description: "The error reported during generation",
      },
    },
  },
});
const $completion = board.output({
  $id: "completion",
  schema: {
    type: "object",
    properties: {
      completion: {
        type: "string",
        title: "Completion",
        description:
          "Generated text that conforms to the specified output schema",
      },
    },
  },
});

// Wire all useful parts of the input.
board
  .input({
    $id: "input",
    schema: {
      type: "object",
      properties: {
        prologue: {
          type: "string",
          title: "Template prologue",
          description:
            "The part of the template that preceeds the place where output schema is mentioned",
        },
        epilogue: {
          type: "string",
          title: "Template epilogue",
          description:
            "The part of the template that follows the place where output schema is mentioned",
        },
        schema: {
          type: "object",
          title: "Output schema",
          description: "The JSON schema object that describes desired output",
        },
        recover: {
          type: "boolean",
          title: "Error recovery",
          description:
            "Whether to try to recover from errors or just report failure",
        },
      },
      required: ["prologue", "epilogue", "schema", "recover"],
      additionalProperties: false,
    },
  })
  .wire("prologue->.", prologue)
  .wire("epilogue->.", epilogue)
  .wire("schema->.", schema)
  .wire("recover->allow.", shouldRecover);

shouldRecover.wire("value->", willRecover).wire("error->", $error);

willRecover.wire("->", prologue).wire("->", epilogue).wire("->", schema);

const convertToSchemish = nursery
  .schemish({ $id: "schemish" })
  .wire("<-schema", schema);

const validateJson = nursery
  .validateJson({ $id: "validate-json" })
  .wire("<-schema", schema)
  .wire("json->completion", $completion)
  .wire("error->value", shouldRecover);

const generator = kit
  .generateText({
    $id: "generator",
    stopSequences: ["Tool:", "Customer:", "\n\n"],
    safetySettings: [
      {
        category: "HARM_CATEGORY_DEROGATORY",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  })
  .wire("<-PALM_KEY.", kit.secrets(["PALM_KEY"]))
  .wire("completion->json", validateJson)
  .wire("filters->value", shouldRecover);

// Template
const template = await maker.prompt("schemish-generator", "schemishGenerator");
kit
  .promptTemplate(...template)
  .wire("<-prologue", prologue)
  .wire("<-epilogue", epilogue)
  .wire("<-schemish", convertToSchemish)
  .wire("prompt->text", generator);

export const schemishGenerator = board;
