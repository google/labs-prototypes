/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, PropertyValueMap, css, html } from "lit";
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
    if (this.conversation.length) {
      const lastItem = this.conversation[this.conversation.length - 1];

      const lastItemIsPending = lastItem.type === ItemType.PENDING;
      const lastItemIsInput = lastItem.type === ItemType.INPUT;

      if (lastItemIsPending || lastItemIsInput) {
        this.conversation.pop();
      }
    }

    this.conversation = [...this.conversation, item];
  }

  protected willUpdate(
    changedProperties:
      | PropertyValueMap<{ team: TeamListItem }>
      | Map<PropertyKey, unknown>
  ) {
    if (changedProperties.has("team")) {
      this.#startRun();
    }
  }

  async #startRun() {
    const url = this.team?.graph;
    if (!url) {
      console.warn("no graph, bailing");
      return;
    }
    if (!(await this.#secrets.load("/api/secrets"))) {
      console.warn(
        "Please add `.env` file to the root of this package and place secrets there."
      );
    }
    this.#run = new Runner();
    this.#run.addEventListener("pending", (e) => {
      const { timestamp } = e.data;
      const role = "Team Lead";
      this.#addConversationItem({
        datetime: new Date(performance.timeOrigin + timestamp),
        who: Participant.TEAM_MEMBER,
        role,
        type: ItemType.PENDING,
      });
    });
    this.#run.addEventListener("output", (e) => {
      const { outputs, timestamp } = e.data;
      const role = "Team Lead";
      if (outputs.output) {
        this.#addConversationItem({
          datetime: new Date(performance.timeOrigin + timestamp),
          who: Participant.TEAM_MEMBER,
          role,
          type: ItemType.TEXT_CONVERSATION,
          format: ItemFormat.MARKDOWN,
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
    this.#run.start({
      url,
      kits: [
        asRuntimeKit(Core),
        asRuntimeKit(JSONKit),
        asRuntimeKit(TemplateKit),
        asRuntimeKit(GeminiKit),
        await load(
          new URL(
            "https://raw.githubusercontent.com/breadboard-ai/breadboard/18b9f34b92398632928f4897c2b53b3a2ccac4c1/packages/agent-kit/agent.kit.json"
          )
        ),
      ],
      proxy: [
        { location: "http", url: "/api/proxy", nodes: ["fetch", "secrets"] },
      ],
      inputs: { model: this.#secrets.get("model") },
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
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
          if (Array.isArray(evt.message)) {
            this.#addConversationItem({
              datetime: new Date(Date.now()),
              who: Participant.USER,
              type: ItemType.MULTIPART,
              parts: evt.message,
              format: ItemFormat.MULTIPART,
            });
          } else {
            this.#addConversationItem({
              datetime: new Date(Date.now()),
              who: Participant.USER,
              type: ItemType.TEXT_CONVERSATION,
              format: ItemFormat.TEXT,
              message: evt.message as string,
            });
          }

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
