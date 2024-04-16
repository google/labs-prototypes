/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Participant {
  USER = "user",
  TEAM_MEMBER = "team-member",
}

export enum ConversationItemType {
  TEXT_CONVERSATION = "text-conversation",
  DATA = "data",
  INPUT = "input",
}

export enum ConversationItemFormat {
  TEXT,
  MARKDOWN,
  MULTIPART,
}

export type ConversationInputPart =
  | string
  | { inline_data: string; mime_type: string };

export interface ConversationText {
  datetime: Date;
  type: ConversationItemType.TEXT_CONVERSATION;
  who: Participant;
  role?: string;
  format: ConversationItemFormat;
  message: string | string[];
}

export interface ConversationData {
  datetime: Date;
  type: ConversationItemType.DATA;
  who: Participant;
  role?: string;
  format: ConversationItemFormat;
  message: string | string[];
}

export interface ConversationInput {
  datetime: Date;
  type: ConversationItemType.INPUT;
  role?: string;
  format: ConversationItemFormat;
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
  subItems: ActivityItem[];
}

export interface AssetItem {
  datetime: Date;
  who: Participant;
  role?: string;
  name: string;
  mime_type: string;
  url: string;
}
