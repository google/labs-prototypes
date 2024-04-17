/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  ConversationItem,
  ItemFormat,
  ItemType,
  Participant,
} from "../../../types/types";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { markdown } from "../../directives/markdown.js";
import { toRelativeTime } from "../../utils/toRelativeTime.js";
import { cache } from "lit/directives/cache.js";
import { ConversationItemCreateEvent } from "../../../events/events";

@customElement("at-conversation")
export class Conversation extends LitElement {
  @property()
  items: ConversationItem[] | null = null;

  @property()
  inputValue = "";

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: scroll;
      height: 100%;
      position: relative;
    }

    p {
      margin: 0.5em 0;
    }

    ul {
      margin: 0.5em 0;
      padding: var(--grid-size-2) var(--grid-size-6);
    }

    .conversation-item {
      margin: var(--grid-size-6) 0 0 0;
      padding: 0 var(--grid-size-6);
      font: var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      width: 80%;
      animation: slideIn 0.4s var(--easing) forwards;
    }

    .conversation-item .content {
      padding: var(--grid-size) var(--grid-size-4);
      font: normal var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
    }

    .conversation-item .content h1 {
      font: normal var(--label-large) / var(--label-line-height-large)
        var(--font-family);
    }

    .conversation-item.team-member {
      --x: -10px;
    }

    .conversation-item.team-member .content {
      background: var(--neutral-100);
      border-radius: 0 10px 10px 10px;
    }

    .conversation-item.user {
      --x: 10px;
      align-self: flex-end;
    }

    .conversation-item.user .content {
      background: var(--output-100);
      border-radius: 10px 0 10px 10px;
    }

    .conversation-item.data {
      width: 100%;
      margin: var(--grid-size-2) 0 0 0;
    }

    .conversation-item.data .content {
      background: var(--neutral-white);
      border: 1px solid var(--neutral-300);
      border-radius: var(--grid-size-2);
    }

    .conversation-item .sender {
      font: bold var(--label-medium) / var(--label-line-height-medium)
        var(--font-family);
      display: flex;
      align-items: center;
    }

    .conversation-item .sender .when {
      font: normal var(--label-medium) / var(--label-line-height-medium)
        var(--font-family);
      margin-left: var(--grid-size-5);
    }

    .conversation-item .sender::before {
      content: "";
      width: var(--grid-size-7);
      height: var(--grid-size-7);
      border: 1px solid var(--neutral-300);
      display: block;
      border-radius: 50%;
      margin-right: var(--grid-size);
      background: var(--neutral-white);
    }

    .conversation-item .sender.team-lead::before {
      background: var(--neutral-white) var(--role-team-lead) center center /
        20px 20px no-repeat;
    }

    .conversation-item.data .sender {
      display: none;
    }

    #user-input {
      position: sticky;
      bottom: 0;
      width: 100%;
      padding: var(--grid-size-12) var(--grid-size-6) 0;
    }

    #user-input fieldset {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--neutral-white);
      height: calc(var(--grid-size) * 17);
      border: none;
      margin: 0;
      padding: 0;
    }

    #user-input input[type="text"],
    #user-input textarea {
      font: normal var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      resize: none;
      display: block;
      box-sizing: border-box;
      width: 100%;
      field-sizing: content;
      max-height: 300px;
      border-radius: 100px;
      padding: var(--grid-size-3);
      border: 1px solid var(--output-600);
    }

    #user-input input[type="submit"] {
      position: absolute;
      right: var(--grid-size-9);
      width: 24px;
      height: 24px;
      background: var(--icon-send-blue) center center / 20px 20px no-repeat;
      font-size: 0;
      border: none;
    }

    @keyframes slideIn {
      from {
        translate: var(--x, 0) var(--y, 0);
        opacity: 0;
      }

      to {
        translate: 0 0;
        opacity: 1;
      }
    }
  `;

  #onConversationSubmit(evt: Event) {
    evt.preventDefault();

    if (!(evt.target instanceof HTMLFormElement)) {
      return;
    }

    const data = new FormData(evt.target);
    const message = data.get("message") as string;
    if (!message) {
      return;
    }

    this.dispatchEvent(new ConversationItemCreateEvent(message));
  }

  render() {
    if (!this.items) {
      return nothing;
    }

    const tmpl = html`${map(this.items, (item) => {
        switch (item.type) {
          case ItemType.DATA:
          case ItemType.TEXT_CONVERSATION: {
            let content: TemplateResult | symbol = nothing;

            if (Array.isArray(item.message)) {
              if (item.format === ItemFormat.MARKDOWN) {
                content = html`${markdown(item.message.join("\n"))}`;
              } else {
                content = html`${map(
                  item.message,
                  (section) => html`<p>${section}</p>`
                )}`;
              }
            } else {
              if (item.format === ItemFormat.MARKDOWN) {
                content = html`${markdown(item.message)}`;
              }

              content = html`<p>${item.message}</p>`;
            }

            let sender: TemplateResult | symbol = nothing;
            switch (item.who) {
              case Participant.TEAM_MEMBER: {
                const senderClass = (item.role || "Team Member")
                  .toLocaleLowerCase()
                  .replace(/\s/g, "-");
                sender = html`<h1
                  class="${classMap({ sender: true, [senderClass]: true })}"
                >
                  ${item.role || "Team Member"}
                  <span class="when">${toRelativeTime(item.datetime)}</span>
                </h1>`;
                break;
              }
            }

            return html`<section
              class=${classMap({
                "conversation-item": true,
                [item.type]: true,
                [item.who]: true,
              })}
            >
              ${sender ? html`${sender}` : nothing}
              <div class="content">${content}</div>
            </section>`;
          }

          case ItemType.INPUT: {
            return html`Input`;
          }
        }
      })}

      <form id="user-input" @submit=${this.#onConversationSubmit}>
        <fieldset>
          <input
            type="text"
            required
            name="message"
            id="message"
            value=${this.inputValue}
            placeholder="Talk to the team"
          />
          <input type="submit" />
        </fieldset>
      </form>`;

    return html`${cache(tmpl)}`;
  }
}
