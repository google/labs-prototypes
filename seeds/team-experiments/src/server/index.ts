/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse, createServer } from "http";
import { createServer as createViteServer } from "vite";
import { serveIndex } from "./static.js";
import { serverError } from "./errors.js";
import { getAPIs } from "./api.js";

const PORT = 3000;
const HOST = "localhost";
const HOSTNAME = `http://${HOST}:${PORT}`;

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
});

const apis = await getAPIs();

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

  const pathname = resolvedURL.pathname;
  if (pathname.startsWith("/api/")) {
    const api = apis.get(pathname.slice(5));
    if (api) {
      if (await api(resolvedURL, res)) return true;
    }
  }

  next();
};

const server = createServer(async (req, res) => {
  serveApi(req, res, async () => {
    vite.middlewares(req, res, async () => {
      serveIndex(req, res, async (contents: string) => {
        return await vite.transformIndexHtml("/index.html", contents);
      });
    });
  });
});

server.listen(PORT, HOST, () => {
  console.info(`Running on "http://${HOST}:${PORT}"...`);
});
