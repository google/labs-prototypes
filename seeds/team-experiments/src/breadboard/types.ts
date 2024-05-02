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
  NodeEndProbeMessage,
  NodeStartProbeMessage,
  OutputResponse,
  SkipProbeMessage,
} from "@google-labs/breadboard";
import { SecretResult } from "@google-labs/breadboard/harness";
import { End, InputResolveRequest } from "@google-labs/breadboard/remote";

type RunEventMap = {
  input: RunInputEvent;
  output: RunOutputEvent;
  secret: RunSecretEvent;
  pending: RunPendingEvent;
  error: RunErrorEvent;
  end: RunEndEvent;
  skip: RunSkipEvent;
  graphstart: RunGraphStartEvent;
  graphend: RunGraphEndEvent;
  nodestart: RunNodeStartEvent;
  nodeend: RunNodeEndEvent;
};

export type RunPendingEvent = Event & {
  data: { timestamp: number };
};

export type RunInputEvent = Event & {
  data: InputResponse;
  reply: (data: InputResolveRequest) => Promise<void>;
};

export type RunOutputEvent = Event & {
  data: OutputResponse;
};

export type RunSecretEvent = Event & {
  data: SecretResult["data"];
  reply: (data: InputResolveRequest) => Promise<void>;
};

export type RunErrorEvent = Event & {
  data: ErrorResponse;
};

export type RunEndEvent = Event & {
  data: End;
};

export type RunSkipEvent = Event & {
  data: SkipProbeMessage;
};

export type RunGraphStartEvent = Event & {
  data: GraphStartProbeData;
};

export type RunGraphEndEvent = Event & {
  data: GraphEndProbeData;
};

export type RunNodeStartEvent = Event & {
  data: NodeStartProbeMessage["data"];
};

export type RunNodeEndEvent = Event & {
  data: NodeEndProbeMessage["data"];
};

export type TypedEventTarget<EventMap extends object> = {
  new (): IntermediateEventTarget<EventMap>;
};

// TODO: This needs to be a more global helper.
interface IntermediateEventTarget<EventMap> extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    callback: (
      event: EventMap[K] extends Event ? EventMap[K] : never
    ) => EventMap[K] extends Event ? void : never,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
}

export type RunEventTarget = TypedEventTarget<RunEventMap>;
