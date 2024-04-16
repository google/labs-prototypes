/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from "http";
import { serverError } from "./errors";
import { getPageContent } from "./browse";

export const api = async (
  url: URL,
  res: ServerResponse,
  endpointPath: string,
  handler: (url: URL, res: ServerResponse) => Promise<boolean>
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
