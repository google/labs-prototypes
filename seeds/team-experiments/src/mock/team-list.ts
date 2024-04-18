/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MINUTE } from "../constants/constants.js";
import { ItemStatus, Participant, TeamListItem } from "../types/types.js";

export const teamListItems: Map<string, TeamListItem> = new Map([
  [
    "team-1",
    {
      datetime: new Date(Date.now() - 20 * MINUTE),
      teamName: "Social Campaign",
      description: "Uses simple chat (just makes up stuff)",
      status: ItemStatus.ACTIVE,
      statusDescription: "Brand input needed",
      who: Participant.TEAM_MEMBER,
      role: "Media Coordinator",
      graph: "/bgl/insta/simple-chat.bgl.json",
    },
  ],
  [
    "team-2",
    {
      datetime: new Date(Date.now() - 20 * MINUTE),
      teamName: "Multimedia Campaign Manager Team",
      description:
        "Uses 'get page' tool: ask it about various URLs and it will scrape them and summarize them",
      status: ItemStatus.COMPLETE,
      who: Participant.TEAM_MEMBER,
      role: "Media Coordinator",
      graph: "/bgl/insta/chat-with-tools.bgl.json",
    },
  ],
  [
    "team-3",
    {
      datetime: new Date(Date.now() - 45 * MINUTE),
      teamName: "Customer Service Curator Team",
      description:
        "It's a super long title that needs to be truncated because it's so long",
      status: ItemStatus.INERT,
      who: Participant.USER,
    },
  ],
]);
