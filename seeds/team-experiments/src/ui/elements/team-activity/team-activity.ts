/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ActivityItem, ItemFormat } from "../../../types/types.js";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { markdown } from "../../directives/markdown.js";

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
      user-select: none;
    }

    p {
      margin: 0 0 0.5em 0;
    }

    ul {
      margin: 0 0 0.5em 0;
      padding: var(--grid-size-2) var(--grid-size-6);
    }

    #activity {
      margin: 0;
      padding: var(--grid-size-2) var(--grid-size-6);
      font: var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      width: 80%;
      animation: slideIn 0.4s var(--easing) forwards;
    }

    :host > h1 {
      font: normal var(--title-medium) / var(--title-line-height-medium)
        var(--font-family);
      margin: 0 0 var(--grid-size-2) 0;
      border-bottom: 1px solid var(--neutral-300);
    }

    .activity-item {
      padding-left: var(--grid-size-9);
      position: relative;
    }

    .activity-item.padded {
      padding-bottom: var(--grid-size-3);
    }

    .activity-item::before {
      content: "";
      position: absolute;
      left: calc(var(--grid-size-3) + 1px);
      top: 0;
      width: 2px;
      height: 100%;
      background: var(--neutral-300);
    }

    .activity-item:first-of-type::before {
      height: calc(100% - var(--grid-size-2));
      top: var(--grid-size-2);
    }

    .activity-item:last-of-type::before {
      height: var(--grid-size-2);
    }

    .activity-item::after {
      content: "";
      position: absolute;
      left: var(--grid-size-2);
      top: var(--grid-size-2);
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--inputs-300);
    }

    .activity-item.role {
      min-height: var(--grid-size-12);
    }

    .activity-item.role::after {
      left: 0;
      top: 0;
      width: 28px;
      height: 28px;
      background: #fff;
      border: 1px solid var(--neutral-300);
    }

    .activity-item.role.team-lead::after,
    .activity-item.role.media-coordinator::after {
      background: #fff var(--role-team-lead) center center / 20px 20px no-repeat;
    }

    .activity-item.role.historian::after {
      background: #fff var(--role-historian) center center / 20px 20px no-repeat;
    }

    .activity-item h1 {
      font: 500 var(--title-medium) / var(--title-line-height-medium)
        var(--font-family);
      padding: 2px 0;
      margin: 0;
    }

    .activity-item h1 .headline {
      font: 400 var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
    }

    .activity-item .content {
      border: 1px solid var(--neutral-300);
      padding: var(--grid-size-2);
      border-radius: var(--grid-size);
    }

    .activity-item .sub-items {
      margin: 0;
      padding: var(--grid-size-2) 0;
    }

    .activity-item .sub-items > summary {
      list-style: none;
      display: flex;
      align-items: center;
      height: 16px;
    }

    .activity-item .sub-items > summary::before {
      content: "";
      width: 16px;
      height: 16px;
      background: var(--icon-expand) center center / 16px 16px no-repeat;
      display: inline-block;
      margin-right: var(--grid-size-2);
    }

    .activity-item .sub-items[open] > summary {
      margin-bottom: -22px;
    }

    .activity-item .sub-items[open] > summary::before {
      background: var(--icon-collapse) center center / 16px 16px no-repeat;
    }

    .activity-item .sub-items[open] > summary .sub-item-summary {
      visibility: hidden;
    }

    .activity-item .sub-items[open] .activity-summary {
      display: none;
    }

    .activity-item .sub-items-list {
      padding-left: var(--grid-size-4);
    }
  `;

  #renderItems(items: ActivityItem[]): TemplateResult {
    return html`${map(items, (item) => {
      const classes: Record<string, boolean> = { "activity-item": true };
      if (item.role) {
        const roleClass = item.role.toLocaleLowerCase().replace(/\W/gi, "-");
        classes.role = true;
        classes[roleClass] = true;
      }

      if (item.content) {
        classes.padded = true;
      }

      // TODO: Render active items.
      if (item.active) {
        classes.active = true;
      }

      let content: TemplateResult | symbol = nothing;
      if (item.content) {
        let value: TemplateResult | symbol = nothing;
        if (Array.isArray(item.content)) {
          if (item.format === ItemFormat.MARKDOWN) {
            value = html`${markdown(item.content.join("\n"))}`;
          } else {
            value = html`${map(
              item.content,
              (section) => html`<p>${section}</p>`
            )}`;
          }
        } else {
          if (item.format === ItemFormat.MARKDOWN) {
            value = html`${markdown(item.content)}`;
          } else {
            value = html`<p>${item.content}</p>`;
          }
        }

        content = html`<div class="content">${value}</div>`;
      }

      return html`<section class="${classMap(classes)}">
        <h1>${item.role} <span class="headline">${item.headline}</span></h1>
        ${item.subItems
          ? html`<details class="sub-items">
              <summary>
                <span class="sub-item-summary">Work Items</span>
              </summary>
              <div class="sub-items-list">
                ${this.#renderItems(item.subItems)}
              </div>
            </details>`
          : nothing}
        ${content}
      </section>`;
    })}`;
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
