/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFile } from "fs/promises";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});

const serveApi = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
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

const serveIndex = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const url = req.url;
  if (!url) {
    // Don't know how to serve this, let's bail.
    return;
  }

  if (url !== "/" && url !== "/index.html") {
    res.writeHead(404, "Page not found");
    res.end("Page Not Found. Are you looking for '/index.html' maybe?");
    return;
  }

  const index = await readFile(
    path.resolve(__dirname, "../../index.html"),
    "utf-8"
  );
  const transformed = await vite.transformIndexHtml("/index.html", index, url);
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(transformed);
};

const server = http.createServer(async (req, res) => {
  vite.middlewares(req, res, async () => {
    serveApi(req, res, async () => {
      await serveIndex(req, res);
    });
  });
});

server.listen(3000, () => {
  console.info("Serving from port 3000...");
});
