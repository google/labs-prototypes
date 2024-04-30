/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from "dotenv";

export function GET() {
  const { parsed, error } = config();
  let result;
  if (error) {
    result = JSON.stringify({ error: "Could not retrieve secrets" });
  } else {
    result = JSON.stringify({ parsed });
  }
  return new Response(result, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
