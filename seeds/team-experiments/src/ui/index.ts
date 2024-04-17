/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, TemplateResult, css, html, nothing } from "lit";
import * as BreadboardUI from "@google-labs/breadboard-ui";
import { customElement, property, state } from "lit/decorators.js";
import "./elements/elements.js";

import { teamListItems } from "../mock/team-list.js";
import {
  StateChangeEvent,
  TeamSectionSelectEvent,
  TeamSelectEvent,
} from "../events/events.js";
import { SECTION, TeamListItem } from "../types/types.js";
import { Router } from "../router/router.js";

BreadboardUI.register();

@customElement("at-main")
export class Main extends LitElement {
  @property()
  team: TeamListItem | null = null;

  @property()
  teamSection = 0;

  @state()
  section = SECTION.TEAM_LIST;

  #router = Router.instance();

  static styles = css`
    :host {
      display: grid;
      grid-template-rows: var(--grid-size-12) auto;
      width: 100%;
      max-width: var(--max-width);
      margin: 0 auto;
      background: var(--neutral-white);
    }

    header {
      background: var(--output-500);
      display: flex;
      align-items: center;
      padding: 0 var(--grid-size-3);
      overflow: auto;
    }

    header h1 {
      color: var(--neutral-white);
      font-size: var(--title-large);
      font-weight: normal;
      display: flex;
      align-items: center;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    #back {
      display: block;
      width: 24px;
      height: 24px;
      font-size: 0;
      border: none;
      background: var(--icon-arrow-back-white) center center / 20px 20px
        no-repeat;
      flex: 0 0 auto;
      margin-right: var(--grid-size-2);
      cursor: pointer;
    }
  `;

  constructor() {
    super();

    this.#router.addEventListener("statechange", (evt: Event) => {
      const stateEvent = evt as StateChangeEvent;
      const { state } = stateEvent;
      if (state.section) {
        this.section = state.section;
      }

      if (state.teamId) {
        this.team = teamListItems.get(state.teamId) || null;
      } else {
        this.team = null;
      }

      this.teamSection = state.teamSection || 0;
    });

    this.#router.emitState();
  }

  render() {
    let tmpl: TemplateResult | symbol = nothing;
    switch (this.section) {
      case SECTION.TEAM_LIST: {
        tmpl = html`<at-team-list
          @teamselect=${(evt: TeamSelectEvent) => {
            this.#router.set({
              teamId: evt.id,
              section: SECTION.TEAM_JOB,
            });
          }}
          .items=${teamListItems}
        ></at-team-list>`;
        break;
      }

      case SECTION.TEAM_JOB: {
        tmpl = html`<at-team-job
          @teamsectionselect=${(evt: TeamSectionSelectEvent) => {
            this.#router.set({
              teamSection: evt.id,
            });
          }}
          .team=${this.team}
          .teamSection=${this.teamSection}
        ></at-team-job>`;
        break;
      }

      default: {
        tmpl = html`404 - Section not found`;
        break;
      }
    }

    return html`<header>
        <h1>
          ${this.team
            ? html`<button
                  id="back"
                  @click=${() => {
                    this.#router.set({
                      teamId: null,
                      section: SECTION.TEAM_LIST,
                    });
                  }}
                >
                  Back</button
                >${this.team.teamName}`
            : "Your Teams"}
        </h1>
      </header>
      ${tmpl}`;
  }
}
