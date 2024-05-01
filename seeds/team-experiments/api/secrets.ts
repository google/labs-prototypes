/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export function GET() {
  const model = process.env.model;
  let result;
  if (!model) {
    result = JSON.stringify({ error: "Could not retrieve secrets" });
  } else {
    result = JSON.stringify({ parsed: { model } });
  }
  return new Response(result, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
