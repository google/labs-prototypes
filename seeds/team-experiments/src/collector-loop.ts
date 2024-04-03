/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { board } from "@google-labs/breadboard";
import worker from "./collector";
import { agents } from "@google-labs/agent-kit";

export default await board(() => {
  const repeater = agents.repeater({
    $metadata: { title: "Media Collector Loop" },
    worker,
  });
  return { context: repeater.context };
}).serialize({
  title: "Media Collection Loop",
  description: "Collect all the media",
  version: "0.0.1",
});
