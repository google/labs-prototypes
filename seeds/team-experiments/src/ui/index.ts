/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { LitElement, css, html } from "lit";
import * as BreadboardUI from "@google-labs/breadboard-ui";
import { customElement, property, state } from "lit/decorators.js";
import { ConversationItemCreateEvent } from "../events/events.js";
import "./elements/elements.js";

// Mock data - to replace.
import { assetItems, jobDescription } from "../mock/assets.js";
import { activityItems } from "../mock/activity.js";
import { run } from "@google-labs/breadboard/harness";
import {
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
} from "../types/types.js";
import { InputResponse } from "@google-labs/breadboard";
import { InputResolveRequest } from "@google-labs/breadboard/remote";

BreadboardUI.register();

@customElement("at-main")
export class Main extends LitElement {
  @property()
  teamName = "Team Name";

  @state()
  conversation: ConversationItem[] = [];

  // This is kind of gross. I only need it to shuttle sample input over.
  @state()
  inputValue = "";

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

  constructor() {
    super();
  }

  #pendingInput: ((data: InputResolveRequest) => Promise<void>) | null = null;

  async #waitForInput(
    data: InputResponse,
    reply: (chunk: InputResolveRequest) => Promise<void>
  ): Promise<void> {
    // Nasty stuff. Should I use like, inspector API here?
    // Note, this diving into schema and the whole
    // this.inputValue is only needed to grab sample
    // input text, so that I can just click "Enter" without
    // typing anything in.
    const schema = data.inputArguments.schema;
    this.inputValue = schema?.properties?.text.examples?.[0] || "";
    return new Promise((resolve) => {
      this.#pendingInput = async (data: InputResolveRequest) => {
        await reply(data);
        this.#pendingInput = null;
        this.inputValue = "";
        this.#addConversationItem({
          datetime: new Date(Date.now()),
          who: Participant.USER,
          type: ItemType.TEXT_CONVERSATION,
          format: ItemFormat.TEXT,
          message: data.inputs.text as string,
        });
        resolve();
      };
    });
  }

  #addConversationItem(item: ConversationItem) {
    this.conversation = [...this.conversation, item];
  }

  async #startRun() {
    const runner = run({
      url: "/bgl/insta/mock-conversation.bgl.json",
      kits: [],
    });
    for await (const result of runner) {
      const { type, data, reply } = result;
      switch (type) {
        case "input": {
          await this.#waitForInput(data, reply);
          break;
        }
        case "output": {
          const { outputs, timestamp } = data;
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
          break;
        }
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Is this the right place to start the run?
    this.#startRun();
  }

  render() {
    return html`<header><h1>${this.teamName}</h1></header>
      <at-switcher slots="3" .selected=${0}>
        <at-conversation
          slot="slot-0"
          name="Chat"
          .items=${this.conversation}
          @conversationitemcreate=${(evt: ConversationItemCreateEvent) => {
            // TODO: Send this to the server.
            this.#pendingInput?.({ inputs: { text: evt.message } });
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
