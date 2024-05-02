/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ErrorResponse,
  GraphEndProbeData,
  GraphStartProbeData,
  InputResponse,
  NodeStartProbeMessage,
  OutputResponse,
  SkipProbeMessage,
} from "@google-labs/breadboard";
import { RunInputEvent, RunOutputEvent, RunSecretEvent } from "./types.js";
import { SecretResult } from "@google-labs/breadboard/harness";
import { End, InputResolveRequest } from "@google-labs/breadboard/remote";

const opts = {
  composed: true,
  bubbles: false,
  cancelable: true,
};

export class PendingEvent extends Event {
  static readonly eventName = "pending";

  constructor(public data: { timestamp: number }) {
    super(PendingEvent.eventName, { ...opts });
  }
}

export class InputEvent extends Event implements RunInputEvent {
  static readonly eventName = "input";

  constructor(
    public data: InputResponse,
    public reply: (data: InputResolveRequest) => Promise<void>
  ) {
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

export class RunnerErrorEvent extends Event {
  static readonly eventName = "error";

  constructor(public data: ErrorResponse) {
    super(RunnerErrorEvent.eventName, { ...opts });
  }
}

export class EndEvent extends Event {
  static readonly eventName = "end";

  constructor(public data: End) {
    super(EndEvent.eventName, { ...opts });
  }
}

export class SkipEvent extends Event {
  static readonly eventName = "skip";

  constructor(public data: SkipProbeMessage["data"]) {
    super(SkipEvent.eventName, { ...opts });
  }
}

export class GraphStartEvent extends Event {
  static readonly eventName = "graphstart";

  constructor(public data: GraphStartProbeData) {
    super(GraphStartEvent.eventName, { ...opts });
  }
}

export class GraphEndEvent extends Event {
  static readonly eventName = "graphend";

  constructor(public data: GraphEndProbeData) {
    super(GraphEndEvent.eventName, { ...opts });
  }
}

export class NodeStartEvent extends Event {
  static readonly eventName = "nodestart";

  constructor(public data: NodeStartProbeMessage["data"]) {
    super(NodeStartEvent.eventName, { ...opts });
  }
}

export class NodeEndEvent extends Event {
  static readonly eventName = "nodeend";

  constructor(public data: NodeStartProbeMessage["data"]) {
    super(NodeEndEvent.eventName, { ...opts });
  }
}
