/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const edge = true;
export const headers = {
  "Content-Type": "application/json",
};
export const streaming = true;

import { config } from "dotenv";

export default async function handler() {
  const { parsed, error } = config();
  let result;
  if (error) {
    result = JSON.stringify({ error: "Could not retrieve secrets" });
  } else {
    result = JSON.stringify({ parsed });
  }
  return new Response(result, { status: 200 });
}
