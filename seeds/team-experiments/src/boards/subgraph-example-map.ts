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

const main = await board(({ names }) => {
  names
    .isArray()
    .title("Names of people to greet")
    .examples(JSON.stringify(["Paul", "Joe", "Al", "Kevin", "Croissant"]));

  const greeter = core.map({
    $metadata: { title: "Greeter" },
    board: "#mySubgraph",
    list: names,
  });

  return { hello: greeter.list };
}).serialize({
  title: "Subgraph Example with Map",
  description: "An example of using subgraphs within a board using `core.map`.",
  version: "0.0.1",
});

main.graphs = {
  mySubgraph: await board(({ item }) => {
    const helloMaker = hello({
      $metadata: { title: "Hello Maker" },
      text: item,
    });
    return { item: helloMaker.hello };
  }).serialize(),
};

export default main;
