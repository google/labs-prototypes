/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { intro, outro } from "@clack/prompts";
import { readFile } from "fs/promises";

import userInput from "./nodes/user-input.js";
import promptTemplate from "./nodes/prompt-template.js";
import textCompletion from "./nodes/text-completion.js";
import consoleOutput from "./nodes/console-output.js";
import localMemory from "./nodes/local-memory.js";

import { GraphDescriptor, NodeHandlers, follow } from "./graph.js";
import { Logger } from "./logger.js";

const root = new URL("../../", import.meta.url);
const logger = new Logger(`${root.pathname}/experiment.log`);

const handlers: NodeHandlers = {
  "user-input": userInput,
  "prompt-template": promptTemplate,
  "text-completion": textCompletion,
  "console-output": consoleOutput,
  "accumulating-context": localMemory,
};

intro("Let's follow a graph!");
const graph = JSON.parse(
  await readFile(process.argv[2], "utf-8")
) as GraphDescriptor;
await follow(graph, handlers, (s: string) => {
  logger.log(s);
});
outro("Awesome work! Let's do this again sometime");
await logger.save();
