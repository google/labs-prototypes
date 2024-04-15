/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, html } from "lit";
import * as BreadboardUI from "@google-labs/breadboard-ui";
import { customElement } from "lit/decorators.js";

BreadboardUI.register();

@customElement("at-main")
export class Main extends LitElement {
  render() {
    const json = { hello: "world" };
    return html`<bb-json-tree .json=${json}></bb-json-tree>`;
  }
}
