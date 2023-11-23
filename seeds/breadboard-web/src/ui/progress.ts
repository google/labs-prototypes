/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export class Progress extends HTMLElement {
  constructor(message: string) {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }
      </style>
      <span>${message}</span>
    `;
  }
}
