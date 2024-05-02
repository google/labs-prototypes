/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputValues } from "@google-labs/breadboard";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import {
  EndEvent,
  GraphEndEvent,
  GraphStartEvent,
  InputEvent,
  NodeEndEvent,
  NodeStartEvent,
  OutputEvent,
  PendingEvent,
  RunnerErrorEvent,
  SecretEvent,
  SkipEvent,
} from "./events.js";
import { RunEventTarget } from "./types.js";

// TODO: Decide if this interaction model is better.
export class Runner extends (EventTarget as RunEventTarget) implements Runner {
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
    this.dispatchEvent(new PendingEvent({ timestamp: 0 }));
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
          if (!this.dispatchEvent(new InputEvent(data, reply))) {
            break;
          } else {
            this.#pendingInput = reply;
          }
          return true;
        }
        case "error": {
          this.dispatchEvent(new RunnerErrorEvent(data));
          break;
        }
        case "end": {
          this.dispatchEvent(new EndEvent(data));
          break;
        }
        case "skip": {
          this.dispatchEvent(new SkipEvent(data));
          break;
        }
        case "graphstart": {
          this.dispatchEvent(new GraphStartEvent(data));
          break;
        }
        case "graphend": {
          this.dispatchEvent(new GraphEndEvent(data));
          break;
        }
        case "nodestart": {
          this.dispatchEvent(new NodeStartEvent(data));
          break;
        }
        case "nodeend": {
          this.dispatchEvent(new NodeEndEvent(data));
          break;
        }
        case "output": {
          this.dispatchEvent(new OutputEvent(data));
          break;
        }
        case "secret": {
          this.dispatchEvent(new SecretEvent(data, reply));
          break;
        }
      }
    }
  }
}
