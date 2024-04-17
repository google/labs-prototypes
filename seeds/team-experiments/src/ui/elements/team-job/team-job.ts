/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  ConversationItemCreateEvent,
  RunInputRequestEvent,
  RunOutputProvideEvent,
  TeamSectionSelectEvent,
} from "../../../events/events.js";

// Mock data - to replace.
import { assetItems, jobDescription } from "../../../mock/assets.js";
import { activityItems } from "../../../mock/activity.js";
import { RunConfig, run } from "@google-labs/breadboard/harness";
import {
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
  TeamListItem,
} from "../../../types/types.js";
import { InputValues } from "@google-labs/breadboard";
import { InputResolveRequest } from "@google-labs/breadboard/remote";
import { clamp } from "../../utils/clamp.js";
import { Switcher } from "../elements.js";

// TODO: Decide if this interaction model is better.
class Run extends EventTarget {
  #run: ReturnType<typeof run> | null;
  #pendingInput: ((data: InputResolveRequest) => Promise<void>) | null;

  constructor(config: RunConfig) {
    super();
    this.#run = run(config);
    this.#pendingInput = null;
  }

  finished() {
    return !this.#run;
  }

  waitingForInputs() {
    return !!this.#pendingInput;
  }

  provideInputs(inputs: InputValues) {
    if (!this.#pendingInput) {
      return false;
    }
    this.#pendingInput({ inputs });
    this.#pendingInput = null;
    this.resume();
  }

  async resume(): Promise<boolean> {
    if (!this.#run) return false;
    if (this.waitingForInputs()) return true;

    for (;;) {
      const result = await this.#run.next();
      if (result.done) {
        this.#run = null;
        return false;
      }
      const { type, data, reply } = result.value;
      switch (type) {
        case "input": {
          this.#pendingInput = reply;
          this.dispatchEvent(new RunInputRequestEvent(data));
          return true;
        }
        case "output": {
          this.dispatchEvent(new RunOutputProvideEvent(data));
          break;
        }
      }
    }
  }
}

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

  #run: Run | null = null;

  #addConversationItem(item: ConversationItem) {
    this.conversation = [...this.conversation, item];
  }

  async #startRun() {
    this.#run = new Run({
      url: "/bgl/insta/mock-conversation.bgl.json",
      kits: [],
    });
    this.#run.addEventListener(RunOutputProvideEvent.eventName, (evt) => {
      const e = evt as RunOutputProvideEvent;
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
    this.#run.addEventListener(RunInputRequestEvent.eventName, (evt) => {
      const e = evt as RunInputRequestEvent;
      // Nasty stuff. Should I use like, inspector API here?
      // Note, this diving into schema and the whole
      // this.inputValue is only needed to grab sample
      // input text, so that I can just click "Enter" without
      // typing anything in.
      const schema = e.data.inputArguments.schema;
      this.inputValue = schema?.properties?.text.examples?.[0] || "";
    });
    this.#run.resume();
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

          if (this.#run.finished()) return;
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
