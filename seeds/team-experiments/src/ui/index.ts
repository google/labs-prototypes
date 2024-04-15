/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("at-main")
export class Main extends LitElement {
  render() {
    return html`HELLO`;
  }
}
