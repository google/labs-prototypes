/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse, createServer } from "http";
import { createServer as createViteServer } from "vite";
import { serveIndex } from "./static";
import { getPageContent } from "./browse";
import { serverError } from "./errors";

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

  if (url && url.startsWith("/api/browse")) {
    if (!URL.canParse(url, HOSTNAME)) {
      serverError(res, `Invalid URL: ${url}`);
      return;
    }
    const resolvedUrl = new URL(url, HOSTNAME);
    const urlParam = resolvedUrl.searchParams.get("url");
    if (!urlParam) {
      serverError(res, `URL parameter not supplied`);
      return;
    }
    const content = await getPageContent(urlParam);
    res.writeHead(200, { "Content-Type": "application/json" });
    const response = { url: urlParam, content };
    res.end(JSON.stringify(response));
    return;
  }

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
