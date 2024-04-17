/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";

const opts = {
  composed: true,
  bubbles: true,
  cancelable: true,
};

export class RunInputEvent extends Event {
  static readonly eventName = "input";

  constructor(public data: InputResponse) {
    super(RunInputEvent.eventName, { ...opts });
  }
}

export class RunOutputEvent extends Event {
  static readonly eventName = "output";

  constructor(public data: OutputResponse) {
    super(RunOutputEvent.eventName, { ...opts });
  }
}
