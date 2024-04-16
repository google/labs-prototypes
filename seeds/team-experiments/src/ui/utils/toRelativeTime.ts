/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { HOUR, MINUTE, SECOND } from "../../constants/constants";

const formatter = new Intl.RelativeTimeFormat("en", {
  style: "short",
});

export function toRelativeTime(datetime: Date) {
  const now = new Date(Date.now());
  const diffInMilliseconds = now.getTime() - datetime.getTime();

  if (Math.abs(diffInMilliseconds) < MINUTE) {
    return formatter.format(-diffInMilliseconds / SECOND, "second");
  } else if (Math.abs(diffInMilliseconds) < HOUR) {
    return formatter.format(-Math.floor(diffInMilliseconds / MINUTE), "minute");
  }

  return formatter.format(-Math.floor(diffInMilliseconds / HOUR), "hour");
}
