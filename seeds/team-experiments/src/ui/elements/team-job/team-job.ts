/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ConversationItemCreateEvent,
  TeamSectionSelectEvent,
} from "../../../events/events.js";

// Mock data - to replace.
import { assetItems, jobDescription } from "../../../mock/assets.js";
import { activityItems } from "../../../mock/activity.js";
import {
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
  TeamListItem,
} from "../../../types/types.js";
import { clamp } from "../../utils/clamp.js";
import { Switcher } from "../elements.js";
import { Runner } from "../../../breadboard/index.js";
import { asRuntimeKit } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import JSONKit from "@google-labs/json-kit";
import TemplateKit from "@google-labs/template-kit";
import GeminiKit from "@google-labs/gemini-kit";
import { SecretsManager } from "../../secrets.js";
import { load } from "@google-labs/breadboard/kits";

@customElement("at-team-job")
export class TeamJob extends LitElement {
  // TODO: Make use of this. Currently it's not used in the run.
  @property()
  team: TeamListItem | null = null;

  @property()
  teamSection = 0;

  @state()
  conversation: ConversationItem[] = [];

  static styles = css`
    :host {
      display: grid;
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      background: var(--neutral-white);
    }
  `;

  #run: Runner | null = null;
  #secrets = new SecretsManager();

  #addConversationItem(item: ConversationItem) {
    this.conversation = [...this.conversation, item];
  }

  async #startRun() {
    if (!(await this.#secrets.load("/api/secrets"))) {
      console.warn(
        "Please add `.env` file to the root of this package and place secrets there."
      );
    }
    this.#run = new Runner();
    this.#run.addEventListener("output", (e) => {
      const { outputs, timestamp } = e.data;
      const role = "Team Lead";
      if (outputs.output) {
        this.#addConversationItem({
          datetime: new Date(performance.timeOrigin + timestamp),
          who: Participant.TEAM_MEMBER,
          role,
          type: ItemType.TEXT_CONVERSATION,
          format: ItemFormat.TEXT,
          message: outputs.output as string,
        });
      }
      if (outputs.data) {
        this.#addConversationItem({
          datetime: new Date(performance.timeOrigin + timestamp),
          who: Participant.TEAM_MEMBER,
          role,
          type: ItemType.DATA,
          format: ItemFormat.MARKDOWN,
          message: (outputs.data as string).split("\n"),
        });
      }
    });
    this.#run.addEventListener("secret", (e) => {
      e.reply({
        inputs: Object.fromEntries(
          e.data.keys.map((key) => {
            return [key, this.#secrets.get(key)];
          })
        ),
      });
    });
    this.#run.start({
      url: "/bgl/insta/simple-chat.bgl.json",
      kits: [
        asRuntimeKit(Core),
        asRuntimeKit(JSONKit),
        asRuntimeKit(TemplateKit),
        asRuntimeKit(GeminiKit),
        await load(
          new URL(
            "https://raw.githubusercontent.com/breadboard-ai/breadboard/f9b210cd9f1770464154eb160b1127ef01a85d65/packages/agent-kit/agent.kit.json"
          )
        ),
      ],
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Is this the right place to start the run?
    this.#startRun();
  }

  render() {
    return html` <at-switcher
      slots="3"
      @click=${(evt: Event) => {
        if (!(evt.target instanceof Switcher)) {
          return;
        }

        this.dispatchEvent(new TeamSectionSelectEvent(evt.target.selected));
      }}
      .selected=${clamp(this.teamSection, 0, 2)}
    >
      <at-conversation
        slot="slot-0"
        name="Chat"
        .items=${this.conversation}
        @conversationitemcreate=${(evt: ConversationItemCreateEvent) => {
          this.#addConversationItem({
            datetime: new Date(Date.now()),
            who: Participant.USER,
            type: ItemType.TEXT_CONVERSATION,
            format: ItemFormat.TEXT,
            message: evt.message as string,
          });

          if (!this.#run) return;

          if (!this.#run.waitingForInputs()) return;

          this.#run.provideInputs({ text: evt.message });
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
