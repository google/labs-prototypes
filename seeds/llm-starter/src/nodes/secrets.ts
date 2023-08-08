/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A kind of input node that provides secret values, such as API keys.
 * Currently, it simply reads them from environment.
 */

import type { InputValues, OutputValues } from "@google-labs/graph-runner";

type SecretInputs = {
  keys: string[];
  callback: (key: string) => [string, string | undefined];
};

export default async (inputs: InputValues) => {
  const { keys = [], callback = (key) => [key, undefined] } = inputs as SecretInputs;
  return keys
    .map((key) => callback(key))
    .reduce((acc, [key, value]) => {
      if (value) acc[key as string] = value;
      return acc;
    }, {} as OutputValues);
};
