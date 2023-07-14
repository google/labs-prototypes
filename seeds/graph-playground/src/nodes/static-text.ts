/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GraphTraversalContext, InputValues } from "../types.js";
import * as fs from 'fs';

export default async (context: GraphTraversalContext, inputs: InputValues) => {
  var f = fs.readFileSync(inputs.filename as string,'utf8');
  return await {'text': f};
};
