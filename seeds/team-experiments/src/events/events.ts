/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
