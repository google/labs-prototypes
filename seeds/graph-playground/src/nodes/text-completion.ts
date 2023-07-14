/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GraphTraversalContext, InputValues } from "../types.js";
import { GenerateTextResponse, Text, palm } from "@google-labs/palm-lite";
import { config } from "dotenv";
import { log } from "node:console";
import { stringify } from "node:querystring";

config();

function init() {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) throw new Error("API_KEY not set");
  return API_KEY;
}

export default async (_cx: GraphTraversalContext, inputs: InputValues) => {
  // TODO: Call this during a different time for this node, such as a new entry point for initialization.
  const API_KEY = init();
  const prompt = new Text().text(inputs["text"] as string);
  const stopSequences = (inputs["stop-sequences"] as string[]) || [];
  stopSequences.forEach((stopSequence) => prompt.addStopSequence(stopSequence));
  const request = palm(API_KEY).text(prompt);
  const data = await fetch(request);
  const response = (await data.json()) as GenerateTextResponse;
  const completion = response?.candidates?.[0]?.output as string;
  return { completion };
};
