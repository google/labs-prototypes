/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MINUTE } from "../constants/constants.js";
import { ActivityItem, ItemFormat, Participant } from "../types/types.js";

export const activityItems: ActivityItem[] = [
  {
    datetime: new Date(Date.now() - MINUTE * 25),
    who: Participant.TEAM_MEMBER,
    role: "Media Coordinator",
    headline: "Defining Campaign",
    active: false,
    subItems: [
      {
        datetime: new Date(Date.now() - MINUTE * 25),
        who: Participant.TEAM_MEMBER,
        headline: "Considering Brief",
        active: false,
      },
      {
        datetime: new Date(Date.now() - MINUTE * 24),
        who: Participant.TEAM_MEMBER,
        headline: "Critiquing Brief",
        active: false,
      },
      {
        datetime: new Date(Date.now() - MINUTE * 23),
        who: Participant.TEAM_MEMBER,
        headline: "Formatting information",
        active: false,
      },
    ],
  },
  {
    datetime: new Date(Date.now() - MINUTE * 24),
    who: Participant.TEAM_MEMBER,
    headline: "Updated job description",
    format: ItemFormat.MARKDOWN,
    content: [
      `Create an Instagram campaign to promote soccer club Fremont FC.`,
      ` * Use brand assets to create campaign schedule`,
      ` * Generate images for the campaign`,
      ` * Write campaign messages`,
      ` * Critique ad campaigns`,
      ` * Ask you for campaign preferences`,
      ` * Generate posts for each scheduled game`,
    ],
    active: false,
  },
  {
    datetime: new Date(Date.now() - MINUTE * 20),
    who: Participant.TEAM_MEMBER,
    role: "Historian",
    headline: "Check past work items",
    active: false,
  },
  {
    datetime: new Date(Date.now() - MINUTE * 18),
    who: Participant.TEAM_MEMBER,
    headline: "Summarized past work",
    format: ItemFormat.MARKDOWN,
    active: false,
    subItems: [
      {
        datetime: new Date(Date.now() - MINUTE * 25),
        who: Participant.TEAM_MEMBER,
        headline: "Considering Past Workd",
        active: false,
      },
      {
        datetime: new Date(Date.now() - MINUTE * 24),
        who: Participant.TEAM_MEMBER,
        headline: "Critiquing Past Work",
        active: false,
      },
      {
        datetime: new Date(Date.now() - MINUTE * 23),
        who: Participant.TEAM_MEMBER,
        headline: "Formatting Past Work",
        active: false,
      },
    ],
  },
  {
    datetime: new Date(Date.now() - MINUTE * 16),
    who: Participant.TEAM_MEMBER,
    role: "Team Lead",
    headline: "Checked assets",
    active: false,
  },
];
