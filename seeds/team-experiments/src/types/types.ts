/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Participant {
  USER = "user",
  TEAM_MEMBER = "team-member",
}

export enum ItemFormat {
  TEXT,
  MARKDOWN,
  MULTIPART,
}

export enum ItemType {
  TEXT_CONVERSATION = "text-conversation",
  DATA = "data",
  INPUT = "input",
}

export type ConversationInputPart =
  | string
  | { inline_data: string; mime_type: string };

export interface ConversationText {
  datetime: Date;
  type: ItemType.TEXT_CONVERSATION;
  who: Participant;
  role?: string;
  format: ItemFormat;
  message: string | string[];
}

export interface ConversationData {
  datetime: Date;
  type: ItemType.DATA;
  who: Participant;
  role?: string;
  format: ItemFormat;
  message: string | string[];
}

export interface ConversationInput {
  datetime: Date;
  type: ItemType.INPUT;
  role?: string;
  format: ItemFormat;
  parts: ConversationInputPart[];
}

export type ConversationItem =
  | ConversationText
  | ConversationData
  | ConversationInput;

export interface ActivityItem {
  datetime: Date;
  who: Participant;
  role?: string;
  headline: string;
  content?: string | string[];
  subItems?: ActivityItem[];
  active: boolean;
  format?: ItemFormat;
}

export interface AssetItem {
  datetime: Date;
  who: Participant;
  role?: string;
  name: string;
  mime_type: string;
  url: string;
}
