/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MINUTE } from "../constants/constants.js";
import {
  AssetItem,
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
} from "../types/types.js";

export const jobDescription: ConversationItem = {
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
};

export const assetItems: AssetItem[] = [
  {
    datetime: new Date(Date.now() - MINUTE * 10),
    who: Participant.USER,
    name: "FremontFC-Logo.png",
    mime_type: "image/png",
    url: "#",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 4),
    who: Participant.USER,
    name: "2024 FFC Schedule.pdf",
    mime_type: "application/pdf",
    url: "#",
  },
  {
    datetime: new Date(Date.now() - MINUTE * 2),
    who: Participant.USER,
    name: "2024 Campaign Playbook (March 11, 2024)",
    mime_type: "application/pdf",
    url: "#",
  },
];
