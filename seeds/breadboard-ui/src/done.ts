/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export class Done extends HTMLElement {
  constructor(message = "Done.") {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
          padding-top: calc(var(--bb-grid-size) * 3);
        }
      </style>
      <span>${message}</span>
    `;
  }
}
