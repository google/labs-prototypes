/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputValues } from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import { RunInputEvent, RunOutputEvent } from "./events.js";

// TODO: Decide if this interaction model is better.
export class Runner extends EventTarget {
  #run: ReturnType<typeof run> | null = null;
  #pendingInput: ((data: InputResolveRequest) => Promise<void>) | null = null;

  start(config: RunConfig) {
    this.#run = run(config);
    this.#pendingInput = null;
    this.resume();
  }

  waitingForInputs() {
    return !!this.#pendingInput;
  }

  provideInputs(inputs: InputValues) {
    if (!this.#pendingInput) {
      return false;
    }
    this.#pendingInput({ inputs });
    this.#pendingInput = null;
    this.resume();
  }

  async resume(): Promise<boolean> {
    if (!this.#run) return false;
    if (this.waitingForInputs()) return true;

    for (;;) {
      const result = await this.#run.next();
      if (result.done) {
        this.#run = null;
        return false;
      }
      const { type, data, reply } = result.value;
      switch (type) {
        case "input": {
          this.#pendingInput = reply;
          this.dispatchEvent(new RunInputEvent(data));
          return true;
        }
        case "output": {
          this.dispatchEvent(new RunOutputEvent(data));
          break;
        }
      }
    }
  }
}
