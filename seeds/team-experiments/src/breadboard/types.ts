/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputResponse, OutputResponse } from "@google-labs/breadboard";
import { SecretResult } from "@google-labs/breadboard/harness";
import { InputResolveRequest } from "@google-labs/breadboard/remote";

type RunEventMap = {
  input: RunInputEvent;
  output: RunOutputEvent;
  secret: RunSecretEvent;
  pending: RunPendingEvent;
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
