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
import { Runner } from "../../../breadboard/runner.js";
import { RunInputEvent, RunOutputEvent } from "../../../breadboard/events.js";

@customElement("at-team-job")
export class TeamJob extends LitElement {
  // TODO: Make use of this. Currently it's not used in the run.
  @property()
  team: TeamListItem | null = null;

  @property()
  teamSection = 0;

  @state()
  conversation: ConversationItem[] = [];

  // This is kind of gross. I only need it to shuttle sample input over.
  @state()
  inputValue = "";

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

  #addConversationItem(item: ConversationItem) {
    this.conversation = [...this.conversation, item];
  }

  async #startRun() {
    this.#run = new Runner();
    this.#run.addEventListener(RunOutputEvent.eventName, (evt) => {
      const e = evt as RunOutputEvent;
      const { outputs, timestamp } = e.data;
      const role = "Team Lead";
      if (outputs.text) {
        this.#addConversationItem({
          datetime: new Date(performance.timeOrigin + timestamp),
          who: Participant.TEAM_MEMBER,
          role,
          type: ItemType.TEXT_CONVERSATION,
          format: ItemFormat.TEXT,
          message: outputs.text as string,
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
    this.#run.addEventListener(RunInputEvent.eventName, (evt) => {
      const e = evt as RunInputEvent;
      // Nasty stuff. Should I use like, inspector API here?
      // Note, this diving into schema and the whole
      // this.inputValue is only needed to grab sample
      // input text, so that I can just click "Enter" without
      // typing anything in.
      const schema = e.data.inputArguments.schema;
      this.inputValue = schema?.properties?.text.examples?.[0] || "";
    });
    this.#run.start({
      url: "/bgl/insta/mock-conversation.bgl.json",
      kits: [],
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
          this.inputValue = "";
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
        .inputValue=${this.inputValue}
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
