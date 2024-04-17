/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";
import { RunInputEvent, RunOutputEvent, RunSecretEvent } from "./types.js";
import { SecretResult } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";

const opts = {
  composed: true,
  bubbles: false,
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

export class SecretEvent extends Event implements RunSecretEvent {
  static readonly eventName = "secret";

  constructor(
    public data: SecretResult["data"],
    public reply: (data: InputResolveRequest) => Promise<void>
  ) {
    super(SecretEvent.eventName, { ...opts });
  }
}
