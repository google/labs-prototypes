/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AnyProxyRequestMessage,
  HTTPServerTransport,
  ProxyServer,
  ProxyServerConfig,
  ServerResponse,
  hasOrigin,
} from "@google-labs/breadboard/remote";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import Core from "@google-labs/core-kit";
import { asRuntimeKit } from "@google-labs/breadboard";
import { IncomingMessage } from "http";

const config: ProxyServerConfig = {
  kits: [asRuntimeKit(Core)],
  proxy: [
    "fetch",
    {
      node: "secrets",
      tunnel: {
        GEMINI_KEY: {
          to: "fetch",
          when: {
            url: hasOrigin("https://generativelanguage.googleapis.com"),
          },
        },
        SCRAPING_BEE_KEY: {
          to: "fetch",
          when: {
            url: hasOrigin("https://app.scrapingbee.com/"),
          },
        },
      },
    },
  ],
};

class ResponseAdapter implements ServerResponse {
  #response: VercelResponse;

  constructor(response: VercelResponse) {
    this.#response = response;
  }

  header(field: string, value: string): unknown {
    this.#response.setHeader(field, value);
    return this;
  }

  write(chunk: unknown): boolean {
    return this.#response.write(chunk);
  }

  end(): unknown {
    this.#response.end();
    return this;
  }
}

const extractRequestBody = async (request: IncomingMessage) => {
  return new Promise<AnyProxyRequestMessage>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      resolve(JSON.parse(body) as AnyProxyRequestMessage);
    });
    request.on("error", reject);
  });
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "GET") {
    response.setHeader("Content-Type", "text/html");
    response.write("<H1>USE POST</H1>");
    response.end();
    return;
  }
  const body = await extractRequestBody(request);
  const server = new ProxyServer(
    new HTTPServerTransport({ body }, new ResponseAdapter(response))
  );
  try {
    await server.serve(config);
  } catch (e) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "text/html");
    response.write(`<H1>Server Error: ${(e as Error).message}</H1>`);
    response.end();
  }
  return;
}
