/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";
import { RunInputEvent, RunOutputEvent } from "./types.js";

const opts = {
  composed: true,
  bubbles: true,
  cancelable: true,
};

export class InputEvent extends Event implements RunInputEvent {
  static readonly eventName = "input";

  constructor(public data: InputResponse) {
    super(InputEvent.eventName, { ...opts });
  }
}

export class OutputEvent extends Event implements RunOutputEvent {
  static readonly eventName = "output";

  constructor(public data: OutputResponse) {
    super(OutputEvent.eventName, { ...opts });
  }
}
