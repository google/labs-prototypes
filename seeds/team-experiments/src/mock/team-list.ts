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
      description: "It's a social campaign",
      status: ItemStatus.ACTIVE,
      statusDescription: "Brand input needed",
      who: Participant.TEAM_MEMBER,
      role: "Media Coordinator",
    },
  ],
  [
    "team-2",
    {
      datetime: new Date(Date.now() - 20 * MINUTE),
      teamName: "Multimedia Campaign Manager Team",
      description:
        "It's a super long title that needs to be truncated because it's so long and it contains more information than can be fit on a single line",
      status: ItemStatus.COMPLETE,
      who: Participant.TEAM_MEMBER,
      role: "Media Coordinator",
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
