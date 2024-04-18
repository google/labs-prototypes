/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import puppeteer from "puppeteer";

export const getPageContent = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });
    // TODO: Do something more elaborate.
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    return content;
  } catch (e) {
    return `Unable to retrieve the page: ${(e as Error).message}`;
  } finally {
    await browser.close();
  }
};
