/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ActivityItem } from "../../../types/types.js";

@customElement("team-activity")
export class TeamActivity extends LitElement {
  @property()
  items: ActivityItem[] | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: scroll;
      height: 100%;
      position: relative;
    }

    #activity {
      margin: var(--grid-size-6) 0 0 0;
      padding: 0 var(--grid-size-6);
      font: var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      width: 80%;
      animation: slideIn 0.4s var(--easing) forwards;
    }

    h1 {
      font: normal var(--title-medium) / var(--title-line-height-medium)
        var(--font-family);
      margin: 0 0 var(--grid-size-2) 0;
      border-bottom: 1px solid var(--neutral-300);
    }
  `;

  #renderItems(_items: ActivityItem[]) {
    return html`Items`;
  }

  render() {
    return html`<section id="activity">
      <h1>AI Team Activity</h1>
      ${this.items && this.items.length
        ? this.#renderItems(this.items)
        : nothing}
    </section>`;
  }
}
