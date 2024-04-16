/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html } from "lit";
import * as BreadboardUI from "@google-labs/breadboard-ui";
import { customElement, property } from "lit/decorators.js";
import { ConversationItemCreateEvent } from "../events/events.js";
import "./elements/elements.js";

// Mock data - to replace.
import { conversationItems } from "../mock/conversation.js";
import { assetItems, jobDescription } from "../mock/assets.js";
import { activityItems } from "../mock/activity.js";

BreadboardUI.register();

@customElement("at-main")
export class Main extends LitElement {
  @property()
  teamName = "Team Name";

  static styles = css`
    :host {
      display: grid;
      grid-template-rows: var(--grid-size-12) auto;
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      background: var(--neutral-white);
    }

    header {
      background: var(--output-500);
      display: flex;
      align-items: center;
      padding: 0 var(--grid-size-3);
    }

    header h1 {
      color: var(--neutral-white);
      font-size: var(--title-large);
      font-weight: normal;
    }
  `;

  render() {
    return html`<header><h1>${this.teamName}</h1></header>
      <at-switcher slots="3" .selected=${1}>
        <at-conversation
          slot="slot-0"
          name="Chat"
          .items=${conversationItems}
          @conversationitemcreate=${(evt: ConversationItemCreateEvent) => {
            // TODO: Send this to the server.
            console.log(evt.message);
          }}
        ></at-conversation>
        <team-activity
          slot="slot-1"
          name="Timeline"
          .items=${activityItems}
        ></team-activity>
        <assets-list
          slot="slot-2"
          name="Assets"
          .jobDescription=${jobDescription}
          .items=${assetItems}
        ></assets-list>
      </at-switcher>`;
  }
}
