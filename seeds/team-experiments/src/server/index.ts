/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse, createServer } from "http";
import { createServer as createViteServer } from "vite";
import { serveIndex } from "./static";
import { serverError } from "./errors";
import { api, browseApi } from "./api";

const PORT = 3000;
const HOST = "localhost";
const HOSTNAME = `http://${HOST}:${PORT}`;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

const serveApi = async (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => {
  const url = req.url;
  if (!url) {
    return;
  }
  const resolvedURL = URL.canParse(url, HOSTNAME)
    ? new URL(url, HOSTNAME)
    : null;
  if (!resolvedURL) {
    serverError(res, `Invalid URL: ${url}`);
    return;
  }

  if (await api(resolvedURL, res, "/api/browse", browseApi)) return;

  next();
};

const server = createServer(async (req, res) => {
  vite.middlewares(req, res, async () => {
    serveApi(req, res, async () => {
      await serveIndex(req, res, async (contents: string) => {
        return await vite.transformIndexHtml("/index.html", contents);
      });
    });
  });
});

server.listen(PORT, HOST, () => {
  console.info(`Running on "http://${HOST}:${PORT}"...`);
});
