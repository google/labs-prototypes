/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const cliPath = path.resolve(path.join(__dirname, "../src/index.js"));

function execCli(args = ""): Promise<unknown> {
  return new Promise((resolve) => {
    exec(`node "${cliPath}" ${args}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        resolve(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

test("calling CLI with no parameters shows usage text", async (t) => {
  const output = (await execCli()) as string;
  console.debug(output);
  const expected = "Usage: index [options] [command]";
  t.true(output.includes(expected));
});
