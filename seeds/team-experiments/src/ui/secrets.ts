/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type ParsedSecrets = {
  parsed: Record<string, string>;
};

type SecretsPayload =
  | ParsedSecrets
  | {
      error: string;
    };

export const hasSecrets = (data: SecretsPayload): data is ParsedSecrets => {
  return "parsed" in data;
};

export class SecretsManager {
  #error: string | null = null;
  #secrets: Record<string, string> | null = null;

  async load(path: string) {
    const data = (await (await fetch(path)).json()) as SecretsPayload;
    if (hasSecrets(data)) {
      this.#secrets = data.parsed;
      return true;
    } else {
      this.#error = data.error;
      return false;
    }
  }

  get(key: string): string {
    if (this.#error) {
      throw new Error(this.#error);
    }
    if (!this.#secrets) {
      throw new Error("Secrets haven't yet been loaded");
    }
    return this.#secrets[key];
  }
}
