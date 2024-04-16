/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MINUTE } from "../constants/constants.js";
import {
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
} from "../types/types.js";

export const conversationItems: ConversationItem[] = [
  {
    datetime: new Date(Date.now() - MINUTE * 5),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    type: ItemType.TEXT_CONVERSATION,
    format: ItemFormat.TEXT,
    message: [
      `I'm here to help you find an AI team that meets your needs.`,
      `Describe the task you need to complete`,
    ],
  },
  {
    datetime: new Date(Date.now() - MINUTE * 4),
    who: Participant.USER,
    type: ItemType.TEXT_CONVERSATION,
    format: ItemFormat.TEXT,
    message:
      "I want to create an Instagram campaign to promote my soccer club called Fremont FC",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 3),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    type: ItemType.TEXT_CONVERSATION,
    format: ItemFormat.TEXT,
    message:
      "Here's the job description I have from your previous conversation",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 3),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    type: ItemType.DATA,
    format: ItemFormat.MARKDOWN,
    message: [
      `# Job Description`,
      `Create an Instagram campaign to promote soccer club Fremont FC.`,
      ` * Generate images for the campaign`,
      ` * Write campaign messages`,
      ` * Critique ad campaigns`,
      ` * Ask you for campaign preferences`,
      ` * Generate posts for each scheduled game`,
    ],
  },
  {
    datetime: new Date(Date.now() - MINUTE * 2.5),
    who: Participant.USER,
    type: ItemType.TEXT_CONVERSATION,
    format: ItemFormat.TEXT,
    message:
      "Yeah, but I want to use my team's logo and player photos to create multimedia posts promoting each new game",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 2.3),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    type: ItemType.TEXT_CONVERSATION,
    format: ItemFormat.TEXT,
    message: "Sure, I've updated the job description",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 2),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    type: ItemType.DATA,
    format: ItemFormat.MARKDOWN,
    message: [
      `# Job Description`,
      `Create an Instagram campaign to promote soccer club Fremont FC.`,
      ` * Use brand assets to create campaign schedule`,
      ` * Generate images for the campaign`,
      ` * Write campaign messages`,
      ` * Critique ad campaigns`,
      ` * Ask you for campaign preferences`,
      ` * Generate posts for each scheduled game`,
    ],
  },
];
