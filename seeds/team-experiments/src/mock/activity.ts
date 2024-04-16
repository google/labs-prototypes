/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { MINUTE } from "../constants/constants.js";
import { ActivityItem, Participant } from "../types/types.js";

export const activityItems: ActivityItem[] = [
  {
    datetime: new Date(Date.now() - MINUTE * 5),
    who: Participant.TEAM_MEMBER,
    role: "Media Coordinator",
    headline: "Defining Campaign",
    subItems: [],
  },
];
