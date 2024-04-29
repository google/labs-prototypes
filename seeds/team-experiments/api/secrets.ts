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

export default async function handler() {
  return new Response(JSON.stringify({ secret: "SECRET" }), {
    status: 200,
  });
}
