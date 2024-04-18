/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SECTION {
  TEAM_LIST = "team-list",
  TEAM_JOB = "team-job",
}

export interface State {
  teamId: string | null;
  teamSection: number | null;
  section: SECTION | null;
}

export enum Participant {
  USER = "user",
  TEAM_MEMBER = "team-member",
}

export enum ItemFormat {
  TEXT = "text",
  MARKDOWN = "markdown",
  MULTIPART = "multipart",
  ENUM = "enum",
}

export enum ItemType {
  TEXT_CONVERSATION = "text-conversation",
  DATA = "data",
  INPUT = "input",
  PENDING = "pending",
  MULTIPART = "multipart",
}

export enum ItemStatus {
  INERT = "inert",
  ACTIVE = "active",
  COMPLETE = "complete",
}

export type ConversationInputOption = string;

export type ConversationInputPart =
  | string
  | {
      inline_data: { mime_type: string; data: string };
      url: string;
      name: string;
    };

export interface ConversationPending {
  datetime: Date;
  type: ItemType.PENDING;
  who: Participant;
  role?: string;
}

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

export interface ConversationMultipart {
  datetime: Date;
  type: ItemType.MULTIPART;
  who: Participant;
  format: ItemFormat;
  role?: string;
  parts: ConversationInputPart[];
}

export interface ConversationMultipartInput {
  datetime: Date;
  type: ItemType.INPUT;
  who: Participant;
  format: ItemFormat.MULTIPART;
  role?: string;
  title: string;
  parts: ConversationInputPart[];
}

export interface ConversationEnumeratedInput {
  datetime: Date;
  type: ItemType.INPUT;
  who: Participant;
  format: ItemFormat.ENUM;
  role?: string;
  title: string;
  options: ConversationInputOption[];
}

export type ConversationItem =
  | ConversationText
  | ConversationData
  | ConversationPending
  | ConversationMultipart
  | ConversationMultipartInput
  | ConversationEnumeratedInput;

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

export interface TeamListItem {
  datetime: Date;
  teamName: string;
  description?: string | string[];
  format?: ItemFormat;
  status: ItemStatus;
  statusDescription?: string;
  who: Participant;
  role?: string;
  graph?: string;
}
