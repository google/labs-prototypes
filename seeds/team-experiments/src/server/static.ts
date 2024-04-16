/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFile } from "fs/promises";
import { dirname, extname, resolve } from "path";
import { fileURLToPath } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { notFound } from "./errors";

const CONTENT_TYPE = new Map([
  [".html", "text/html"],
  [".json", "application/json"],
]);
const DEFAULT_CONTENT_TYPE = "text/plain";

const MODULE_PATH = dirname(fileURLToPath(import.meta.url));
const ROOT_PATH = resolve(MODULE_PATH, "../../");

/**
 * Serve a static file
 */
export const serveFile = async (
  res: ServerResponse,
  path: string,
  transformer?: (contents: string) => Promise<string>
) => {
  const contentType = CONTENT_TYPE.get(extname(path)) || DEFAULT_CONTENT_TYPE;
  try {
    const resolvedPath = resolve(ROOT_PATH, path);
    let contents = await readFile(resolvedPath, "utf-8");
    if (transformer) contents = await transformer(contents);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(contents);
  } catch {
    notFound(res, "Static file not found");
  }
};

export const serveIndex = async (
  req: IncomingMessage,
  res: ServerResponse,
  transformer: (contents: string) => Promise<string>
) => {
  const url = req.url;
  if (!url) {
    // Don't know how to serve this, let's bail.
    return;
  }

  if (url === "/" || url === "/index.html") {
    serveFile(res, "index.html", transformer);
    return;
  }

  notFound(res, "Page Not Found. Are you looking for '/index.html' maybe?");
};
