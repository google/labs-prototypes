/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";
import { ConversationInputPart } from "../types/types.js";

const opts = {
  composed: true,
  bubbles: true,
  cancelable: true,
};

export class ConversationItemCreateEvent extends Event {
  static readonly eventName = "conversationitemcreate";

  constructor(public message: ConversationInputPart) {
    super(ConversationItemCreateEvent.eventName, { ...opts });
  }
}

export class RunInputRequest extends Event {
  static readonly eventName = "runinputrequest";

  constructor(public data: InputResponse) {
    super(RunInputRequest.eventName, { ...opts });
  }
}

export class RunOutputProvide extends Event {
  static readonly eventName = "runoutputprovide";

  constructor(public data: OutputResponse) {
    super(RunOutputProvide.eventName, { ...opts });
  }
}
