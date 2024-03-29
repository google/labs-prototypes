/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This script generates a nice list of Types currently available from PaLM API.
 */

import { config } from "dotenv";
import { writeFile } from "fs/promises";
import process from "process";

config();

const MODELS_URL = "https://generativelanguage.googleapis.com/v1beta2/models";

const { PALM_KEY } = process.env;
if (!PALM_KEY) throw new Error("PALM_KEY is not defined");

const response = await fetch(`${MODELS_URL}?key=${PALM_KEY}`);
const { models } = await response.json();

const modelsByMethod = {};
models.forEach((model) => {
  const supportedMethods = model.supportedGenerationMethods;
  supportedMethods.forEach((method) => {
    const bag = modelsByMethod[method];
    if (!bag) modelsByMethod[method] = [model];
    else bag.push(model);
  });
  delete model.supportedGenerationMethods;
  model.name = model.name.replace("models/", "");
});

const preamble = `/**
* This file was generated by scripts/make-models.js on ${new Date().toISOString()}
* Do not edit this file manually.
*/

`;

const template = (models) =>
  `export const models = ${JSON.stringify(models, null, 2)};`;

await writeFile("./src/models.ts", `${preamble}${template(modelsByMethod)}`);
