/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from "http";
import { serverError } from "./errors";
import { getPageContent } from "./browse";
import { root } from "./common";
import { resolve } from "path";
import { readdir } from "fs/promises";

type Handler = (url: URL, res: ServerResponse) => Promise<boolean>;

export const fromEdgeFunction = (funcImport: unknown): Handler => {
  type EdgeFunction = {
    GET: (request: Request) => Promise<Response>;
    headers: Record<string, string>;
  };
  const edgeFunction = funcImport as EdgeFunction;
  return async (url: URL, res: ServerResponse): Promise<boolean> => {
    const request = new Request(url);
    const response = await edgeFunction.GET(request);
    res.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries())
    );
    res.end(await response.text());
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
    apis.set(apiPath, fromEdgeFunction(funcImport));
  }
  return apis;
};

export const api = async (
  url: URL,
  res: ServerResponse,
  endpointPath: string,
  handler: Handler
) => {
  if (url.pathname === endpointPath) return handler(url, res);
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
