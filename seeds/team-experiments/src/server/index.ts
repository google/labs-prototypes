/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse, createServer } from "http";
import { createServer as createViteServer } from "vite";
import { serveIndex } from "./static";

const PORT = 3000;
const HOST = "localhost";

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

  // TODO: Implement actual APIs here.
  if (url === "/api/test") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("API!");
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
