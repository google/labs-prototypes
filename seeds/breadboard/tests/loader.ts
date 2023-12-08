/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";
import fs from "fs";
import os from "os";
import path from "path";
import { Board } from "../src/board.js";
import { ResolverResult, resolveURL } from "../src/loader.js";
import { pathToFileURL, fileURLToPath } from "url";

test("resolveURL resolves file URLs", (t) => {
  const url = new URL("file:///foo/bar");
  const results: ResolverResult[] = [];
  const resolved = resolveURL(url, "baz", results);
  t.true(resolved);
  t.deepEqual(results, [
    {
      href: "file:///foo/baz",
      location: "/foo/baz",
      type: "file",
    },
  ]);
});

test("resolveURL resolves https URLs", (t) => {
  const url = new URL("https://example.com/foo/bar");
  const results: ResolverResult[] = [];
  const resolved = resolveURL(url, "baz", results);
  t.true(resolved);
  t.deepEqual(results, [
    {
      href: "https://example.com/foo/baz",
      location: "https://example.com/foo/baz",
      type: "fetch",
    },
  ]);
});

test("resolveURL resolves URLs with hashes", (t) => {
  {
    const url = new URL("https://example.com/foo/bar");
    const results: ResolverResult[] = [];
    t.false(resolveURL(url, "baz#qux", results));
    t.deepEqual(results, [
      {
        href: "https://example.com/foo/baz#qux",
        location: "https://example.com/foo/baz",
        type: "fetch",
      },
    ]);
    t.true(resolveURL(new URL(results[0].href), "baz#qux", results));
    t.deepEqual(results, [
      {
        href: "https://example.com/foo/baz#qux",
        location: "https://example.com/foo/baz",
        type: "fetch",
      },
      {
        href: "https://example.com/foo/baz#qux",
        location: "qux",
        type: "hash",
      },
    ]);
  }

  {
    const url = new URL("file:///foo/bar");
    const results: ResolverResult[] = [];
    t.false(resolveURL(url, "baz#qux", results));
    t.deepEqual(results, [
      {
        href: "file:///foo/baz#qux",
        location: "/foo/baz",
        type: "file",
      },
    ]);
    t.true(resolveURL(new URL(results[0].href), "baz#qux", results));
    t.deepEqual(results, [
      {
        href: "file:///foo/baz#qux",
        location: "/foo/baz",
        type: "file",
      },
      {
        href: "file:///foo/baz#qux",
        location: "qux",
        type: "hash",
      },
    ]);
  }

  {
    const base = new URL("file:///foo/bar");
    const urlString = "https://example.com/baz#qux";
    const results: ResolverResult[] = [];
    t.false(resolveURL(base, urlString, results));
    t.deepEqual(results, [
      {
        href: "https://example.com/baz#qux",
        location: "https://example.com/baz",
        type: "fetch",
      },
    ]);
    t.true(resolveURL(new URL(results[0].href), urlString, results));
    t.deepEqual(results, [
      {
        href: "https://example.com/baz#qux",
        location: "https://example.com/baz",
        type: "fetch",
      },
      {
        href: "https://example.com/baz#qux",
        location: "qux",
        type: "hash",
      },
    ]);
  }

  {
    const url = new URL("https://example.com/foo/baz");
    const results: ResolverResult[] = [];
    t.true(resolveURL(url, "#qux", results));
    t.deepEqual(results, [
      {
        href: "https://example.com/foo/baz#qux",
        location: "qux",
        type: "hash",
      },
    ]);
  }
});

function generateBoard(title = "Hello, world!") {
  const board = new Board({
    title,
  });
  const input = board.input();
  const ouput = board.output({
    message: "Hello, world!",
  });
  input.wire("*", ouput);
  return board;
}

function writeBoard(
  board: Board,
  filename = board.title,
  directory: string = os.tmpdir()
): string {
  if (!filename) {
    throw new Error(
      "The board must have a title or a filename must be provided"
    );
  }

  filename = filename.trim();

  // replace multiple spaces with with a single space
  filename = filename.replace(/\s+/g, " ");

  // replace spaces with underscores
  filename = filename.replace(/\s/g, "_");

  // remove punctuation
  filename = filename.replace(/[^\w\s]/gi, "");

  if (!filename.endsWith(".json")) {
    filename += ".json";
  }

  const json = JSON.stringify(board, null, 2);
  fs.mkdirSync(directory, { recursive: true });

  filename = path.resolve(directory, filename);
  fs.writeFileSync(filename, json);
  return filename;
}

test("new Board.load() loads a file correctly", async (t) => {
  const testBoard = generateBoard();
  const boardPath = writeBoard(testBoard, "board");

  t.false(boardPath.startsWith("file://"));
  t.true(fs.existsSync(boardPath));

  const board = await Board.load(boardPath);

  t.deepEqual(board.title, testBoard.title);
  t.deepEqual(board.edges, testBoard.edges);
  t.deepEqual(board.nodes, testBoard.nodes);
  t.deepEqual(board.kits, testBoard.kits);
});

test("board can be loaded while using a file:// URL", async (t) => {
  const testBoard = generateBoard();
  const boardPath = writeBoard(testBoard, "board");

  const url = pathToFileURL(boardPath);
  t.true(url.href.startsWith("file://"));
  t.true(fs.existsSync(url));
  t.deepEqual(fileURLToPath(url), boardPath);

  const board = await Board.load(url.href);

  t.deepEqual(board.title, testBoard.title);
  t.deepEqual(board.edges, testBoard.edges);
  t.deepEqual(board.nodes, testBoard.nodes);
  t.deepEqual(board.kits, testBoard.kits);
});
