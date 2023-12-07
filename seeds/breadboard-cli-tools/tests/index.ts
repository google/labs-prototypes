/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";

const packageDir = process.cwd();
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const cliPath = path.resolve(path.join(__dirname, "../src/index.js"));

function execCli(args = ""): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`node "${cliPath}" ${args}`, (error, stdout, stderr) => {
      if (error) {
        // reject({ error, stdout, stderr });
        resolve(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

const testDataDir = path.resolve(path.join(packageDir, "tests/data"));
const originalBoardPath = path.join(testDataDir, "echo.json");

const relativeBoardPath = path.relative(packageDir, originalBoardPath);
const absoluteBoardPath = path.resolve(relativeBoardPath);

test("board json exists", (t) => {
  t.true(absoluteBoardPath == path.resolve(relativeBoardPath));
  t.true(fs.existsSync(absoluteBoardPath));
});

test("relative path is relative and valid", (t) => {
  t.false(relativeBoardPath == path.resolve(relativeBoardPath));
  t.true(fs.existsSync(relativeBoardPath));
});

test("calling CLI with no parameters shows usage text", async (t) => {
  const expected = "Usage: index [options] [command]";
  const output = await execCli();
  t.true(output.length > expected.length);
  t.true(output.includes(expected));
});

test("'memraid' command produces mermaid diagram from relative path to board.json", async (t) => {
  const commandString = ["mermaid", `"${relativeBoardPath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

test("'memraid' command produces mermaid diagram from absolute path to board.json", async (t) => {
  t.false(absoluteBoardPath.startsWith("tests"));
  t.true(fs.existsSync(absoluteBoardPath));

  const commandString = ["mermaid", `"${absoluteBoardPath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});
