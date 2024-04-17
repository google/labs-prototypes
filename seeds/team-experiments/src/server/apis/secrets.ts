/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from "http";

import { config } from "dotenv";

export const secretsAPI = async (_url: URL, res: ServerResponse) => {
  const { parsed, error } = config();
  res.writeHead(200, { "Content-Type": "application/json" });
  if (error) {
    res.end(JSON.stringify({ error: "Could not retrieve secrets" }));
    return true;
  }
  res.end(JSON.stringify(parsed));
  return true;
};
