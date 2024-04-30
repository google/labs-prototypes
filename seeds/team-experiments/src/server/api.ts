/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncomingMessage, ServerResponse } from "http";
import { serverError } from "./errors";
import { getPageContent } from "./browse";
import { root } from "./common";
import { resolve } from "path";
import { readdir } from "fs/promises";
import { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (
  url: URL,
  req: IncomingMessage,
  res: ServerResponse
) => Promise<boolean>;

export const fromVercelFunction = (funcImport: unknown): Handler => {
  type VercelFunction = {
    GET: (request: Request) => Promise<Response>;
    default: (
      request: VercelRequest,
      response: VercelResponse
    ) => VercelResponse;
    headers: Record<string, string>;
  };
  const fun = funcImport as VercelFunction;
  return async (
    url: URL,
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> => {
    const request = new Request(url);
    if (fun.GET) {
      const response = await fun.GET(request);
      res.writeHead(
        response.status,
        Object.fromEntries(response.headers.entries())
      );
      res.end(await response.text());
    } else {
      await fun.default(
        req as unknown as VercelRequest,
        res as unknown as VercelResponse
      );
    }
    return true;
  };
};

export const getAPIs = async () => {
  const path = resolve(root(), "api");
  const names = await readdir(path);
  const apis = new Map<string, Handler>();
  for (const name of names) {
    const funcImport = await import(resolve(path, name));
    const apiPath = name.slice(0, -3);
    apis.set(apiPath, fromVercelFunction(funcImport));
  }
  return apis;
};

export const api = async (
  url: URL,
  req: IncomingMessage,
  res: ServerResponse,
  endpointPath: string,
  handler: Handler
) => {
  if (url.pathname === endpointPath) return handler(url, req, res);
  return false;
};

export const browseApi = async (url: URL, res: ServerResponse) => {
  const urlParam = url.searchParams.get("url");
  if (!urlParam) {
    serverError(res, `URL parameter not supplied`);
    return false;
  }
  const urlToBrowse = URL.canParse(urlParam) ? new URL(urlParam) : null;
  if (!urlToBrowse) {
    serverError(res, `Invalid URL parameter: ${urlParam}`);
    return false;
  }

  if (urlToBrowse.protocol !== "https:") {
    serverError(res, `The URL protocol must be https.`);
    return false;
  }
  const content = await getPageContent(urlParam);
  res.writeHead(200, { "Content-Type": "application/json" });
  const response = { url: urlParam, content };
  res.end(JSON.stringify(response));
  return true;
};
