/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";
import type { ConversationInputPart, State } from "../types/types.js";

const opts = {
  composed: true,
  bubbles: true,
  cancelable: true,
};

export class StateChangeEvent extends Event {
  static readonly eventName = "statechange";

  constructor(public state: State) {
    super(StateChangeEvent.eventName, { ...opts });
  }
}

export class ConversationItemCreateEvent extends Event {
  static readonly eventName = "conversationitemcreate";

  constructor(public message: ConversationInputPart) {
    super(ConversationItemCreateEvent.eventName, { ...opts });
  }
}

export class RunInputRequestEvent extends Event {
  static readonly eventName = "runinputrequest";

  constructor(public data: InputResponse) {
    super(RunInputRequestEvent.eventName, { ...opts });
  }
}

export class RunOutputProvideEvent extends Event {
  static readonly eventName = "runoutputprovide";

  constructor(public data: OutputResponse) {
    super(RunOutputProvideEvent.eventName, { ...opts });
  }
}

export class TeamSelectEvent extends Event {
  static readonly eventName = "teamselect";

  constructor(public id: string) {
    super(TeamSelectEvent.eventName, { ...opts });
  }
}

export class TeamSectionSelectEvent extends Event {
  static readonly eventName = "teamsectionselect";

  constructor(public id: number) {
    super(TeamSectionSelectEvent.eventName, { ...opts });
  }
}
