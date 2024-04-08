/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { board, code } from "@google-labs/breadboard";
import { core } from "@google-labs/core-kit";

const hello = code(({ text }) => {
  return { hello: `HELLO, ${text}` };
});

const main = await board(({ text }) => {
  const subgraphInvoker = core.invoke({
    $metadata: { title: "Subgraph Invoker" },
    $board: "#mySubgraph",
    text,
  });
  return { hello: subgraphInvoker.hello };
}).serialize({
  title: "Subgraph Example",
  description: "An example of using subgraphs within a board",
  version: "0.0.1",
});

main.graphs = {
  mySubgraph: await board(({ text }) => {
    const helloMaker = hello({
      $metadata: { title: "Hello Maker" },
      text,
    });
    return { hello: helloMaker.hello };
  }).serialize(),
};

export default main;
