/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";
import { ResolverResult, resolveURL } from "../src/loader.js";
import path from "path";

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

test("resolveURL resolves relative Windows style file path", async (t) => {
  const relativeWindowssPath = "..\\foo\\bar";

  const results: ResolverResult[] = [];

  const metaUrl = import.meta.url;
  const metaUrlUrl = new URL(metaUrl);

  const resolved = resolveURL(metaUrlUrl, relativeWindowssPath, results);

  const metaUrlPath = path.dirname(metaUrl);

  t.true(resolved);
  t.deepEqual(results, [
    {
      href: new URL(path.join(metaUrlPath, relativeWindowssPath)).toString(),
      location: new URL(path.join(metaUrlPath, relativeWindowssPath)).pathname,
      type: "file",
    },
  ]);
});

test("resolveURL resolves absolute Windows style file path", async (t) => {
  const absoluteWindowssPath = "C:\\foo\\bar";

  const results: ResolverResult[] = [];

  const metaUrlUrl = new URL(import.meta.url);

  const resolved = resolveURL(metaUrlUrl, absoluteWindowssPath, results);

  t.true(resolved);
  t.deepEqual(results, [
    {
      href: new URL(absoluteWindowssPath).toString(),
      location: new URL(absoluteWindowssPath).toString(),
      type: "file",
    },
  ]);
});
