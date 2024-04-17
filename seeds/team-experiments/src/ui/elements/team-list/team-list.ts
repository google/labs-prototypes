/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ItemStatus, Participant, TeamListItem } from "../../../types/types";
import { map } from "lit/directives/map.js";
import { TeamSelectEvent } from "../../../events/events";
import { classMap } from "lit/directives/class-map.js";

@customElement("at-team-list")
export class TeamList extends LitElement {
  @property()
  items: Map<string, TeamListItem> | null = null;

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      display: block;
      width: 100%;
      overflow: auto;
    }

    .team-list {
      padding: var(--grid-size-6);
      display: flex;
      flex-direction: column;
    }

    .team {
      display: block;
      width: 100%;
      border-radius: var(--grid-size-2);
      border: 1px solid var(--neutral-300);
      background: none;
      text-align: left;
      padding: var(--grid-size-3) var(--grid-size-4);
      cursor: pointer;
      margin-bottom: var(--grid-size-4);
    }

    .team:hover {
      border: 1px solid var(--output-600);
      outline: 1px solid var(--output-600);
    }

    .team h1 {
      font: 500 var(--title-medium) / var(--title-line-height-medium)
        var(--font-family);
      margin: 0;
    }

    .team .description {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      margin: var(--grid-size-3) 0;
    }

    .team.active .status {
      color: var(--boards-500);
    }

    .team.complete .status {
      color: var(--inputs-600);
    }

    .team .status-description {
      margin-left: var(--grid-size-3);
    }

    .team .status {
      display: flex;
      align-items: center;
      font: 500 var(--label-medium) / var(--label-line-height-medium)
        var(--font-family);
    }

    .team .role {
      font-weight: 600;
    }

    .team .role:not(.user)::before {
      content: "";
      width: var(--grid-size-7);
      height: var(--grid-size-7);
      border: 1px solid var(--neutral-300);
      display: block;
      border-radius: 50%;
      margin-right: var(--grid-size);
      background: var(--neutral-white);
    }

    .team .role.media-coordinator::before {
      background: var(--neutral-white) var(--role-team-lead) center center /
        20px 20px no-repeat;
    }
  `;

  render() {
    return html`<div class="team-list">
      ${this.items && this.items.size
        ? map(this.items, ([id, item]) => {
            const roleClass = (item.role || "user")
              .toLocaleLowerCase()
              .replace(/\s/g, "-");
            const who = html`<span
              class="${classMap({
                status: true,
                role: true,
                [roleClass]: true,
                [item.who]: true,
              })}"
              >${item.who === Participant.USER
                ? "You"
                : item.role ?? "Team Member"}</span
            >`;

            const statusDescription = html`<span class="status-description"
              >${item.status === ItemStatus.COMPLETE
                ? "Job Completed"
                : item.statusDescription ?? "No status"}</span
            >`;

            return html`<button
              @click=${() => {
                this.dispatchEvent(new TeamSelectEvent(id));
              }}
              class="${classMap({ team: true, [item.status]: true })}"
            >
              <h1 class="team-name">${item.teamName}</h1>
              <p class="description">${item.description}</p>
              <div class="status">${who} ${statusDescription}</div>
            </button>`;
          })
        : html`You have no teams`}
    </div>`;
  }
}
