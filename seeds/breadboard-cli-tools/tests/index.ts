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

const testBoardData = {
  title: "Echo",
  description: "Echo cho cho cho ho o",
  version: "0.0.3",
  edges: [
    {
      from: "input",
      to: "output-1",
      out: "text",
      in: "text",
    },
  ],
  nodes: [
    {
      id: "input",
      type: "input",
      configuration: {
        schema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              title: "Echo",
              description: "What shall I say back to you?",
            },
          },
        },
      },
    },
    {
      id: "output-1",
      type: "output",
    },
  ],
  kits: [],
};

const testDataDir = path.resolve(path.join(packageDir, "tests/data"));
const originalBoardPath = path.join(testDataDir, "echo.json");

const relativeBoardPath = path.relative(packageDir, originalBoardPath);
const absoluteBoardPath = path.resolve(relativeBoardPath);

const filenameWithSpaces = path.resolve(
  path.join(testDataDir, "test board.json")
);
const directoryWithSpaces = path.resolve(
  path.join(testDataDir, "test folder", "board.json")
);

const testFiles = [originalBoardPath, filenameWithSpaces, directoryWithSpaces];

//////////////////////////////////////////////////

test.before(() => {
  testFiles.forEach((p) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(testBoardData, null, 2));
  });
});

test.after.always(() => {
  testFiles.forEach((p) => {
    fs.unlinkSync(p);
  });
  testFiles.forEach((p) => {
    if (fs.existsSync(path.dirname(p))) {
      fs.rmdirSync(path.dirname(p), { recursive: true });
    }
  });
});

//////////////////////////////////////////////////
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

test("'mermaid' command produces mermaid diagram from relative path to board.json", async (t) => {
  const commandString = ["mermaid", `"${relativeBoardPath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

test("'mermaid' command produces mermaid diagram from absolute path to board.json", async (t) => {
  t.false(absoluteBoardPath.startsWith("tests"));
  t.true(fs.existsSync(absoluteBoardPath));

  const commandString = ["mermaid", `"${absoluteBoardPath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

//////////////////////////////////////////////////

test("filename does contain spaces", (t) => {
  const directory = path.dirname(filenameWithSpaces);
  const basename = path.basename(filenameWithSpaces);
  t.false(directory.includes(" "));
  t.true(basename.includes(" "));
});

test("file name with spaces exists", (t) => {
  t.true(fs.existsSync(filenameWithSpaces));
});

test("can handle a relative file with spaces in the file name", async (t) => {
  const relativePath = path.relative(packageDir, filenameWithSpaces);
  t.true(relativePath.includes(" "));
  t.true(fs.existsSync(filenameWithSpaces));

  const commandString = ["mermaid", `"${relativePath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

test("can handle an absolute file with spaces in the name", async (t) => {
  const commandString = ["mermaid", `"${filenameWithSpaces}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

//////////////////////////////////////////////////

test("directory name with spaces does contain spaces", (t) => {
  const directory = path.dirname(directoryWithSpaces);
  const basename = path.basename(directoryWithSpaces);
  t.true(directory.includes(" "));
  t.false(basename.includes(" "));
});

test("board file exists in dictory with spaces in the name", (t) => {
  t.true(fs.existsSync(directoryWithSpaces));
});

test("can handle a relative path with spaces in the directory name", async (t) => {
  const relativePath = path.relative(packageDir, directoryWithSpaces);
  t.true(relativePath.includes(" "));
  t.true(fs.existsSync(directoryWithSpaces));

  const commandString = ["mermaid", `"${relativePath}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});

test("can handle an absolute path with spaces in the directory name", async (t) => {
  const commandString = ["mermaid", `"${directoryWithSpaces}"`].join(" ");
  const output = await execCli(commandString);
  t.true(output.length > 0);
  t.true(output.includes("graph TD"));
});
