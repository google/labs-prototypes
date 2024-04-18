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
import { Ref, createRef, ref } from "lit/directives/ref.js";

@customElement("at-conversation")
export class Conversation extends LitElement {
  @property()
  items: ConversationItem[] | null = null;

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: auto;
      height: calc(100svh - calc(var(--grid-size) * 25));
      position: relative;
      padding-bottom: calc(var(--grid-size) * 20);
    }

    p {
      margin: 0.5em 0;
    }

    ul {
      margin: 0.5em 0;
      padding: var(--grid-size-2) var(--grid-size-6);
    }

    .conversation-items {
      overflow-x: hidden;
      overflow-y: scroll;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
    }

    .conversation-item {
      margin: var(--grid-size-6) 0 0 0;
      padding: 0 var(--grid-size-6);
      font: var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      width: 80%;
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
      animation: slideIn 0.4s var(--easing) forwards;
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

    .conversation-item.pending {
      opacity: 0;
      animation: slideIn 0.4s var(--easing) 0.3s forwards;
    }

    .conversation-item.pending .content {
      min-height: var(--grid-size-10);
      width: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .conversation-item.pending .content .dot {
      display: block;
      width: var(--grid-size-2);
      height: var(--grid-size-2);
      background: var(--neutral-500);
      border-radius: 50%;
      margin-right: var(--grid-size);
      flex: 0 0 auto;
      --delay: 0s;
      animation: 1s linear var(--delay, 0s) forwards infinite bounce;
    }

    .conversation-item.pending .content .dot:last-of-type {
      margin-right: var(--grid-size);
    }

    .conversation-item.pending .content .dot:nth-child(2) {
      --delay: 0.05s;
    }

    .conversation-item.pending .content .dot:nth-child(3) {
      --delay: 0.1s;
    }

    #user-input {
      position: fixed;
      bottom: 0;
      width: 100%;
      max-width: var(--max-width);
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
      width: 100%;
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
      max-height: 300px;
      border-radius: 100px;
      padding: var(--grid-size-3) var(--grid-size-10) var(--grid-size-3)
        var(--grid-size-3);
      border: 1px solid var(--output-600);
    }

    #user-input textarea {
      field-sizing: content;
    }

    #user-input input[type="submit"] {
      position: absolute;
      right: var(--grid-size-9);
      width: 24px;
      height: 24px;
      background: var(--icon-send-blue) center center / 20px 20px no-repeat;
      border-radius: 50%;
      font-size: 0;
      border: none;
    }

    @keyframes bounce {
      0% {
        translate: 0 0px;
        opacity: 1;
      }

      17% {
        translate: 0 -5px;
        opacity: 0.7;
      }

      25% {
        translate: 0 -6px;
        opacity: 0.5;
      }

      42% {
        translate: 0 -5px;
        opacity: 0.7;
      }

      60% {
        translate: 0 2px;
        opacity: 1;
      }

      70% {
        translate: 0 0;
        opacity: 1;
      }

      100% {
        translate: 0 0;
        opacity: 1;
      }
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

  #conversationItemsRef: Ref<HTMLDivElement> = createRef();
  #itemCount = 0;

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

    const msg = evt.target.querySelector<HTMLInputElement>("#message");
    if (msg) {
      msg.value = "";
    }

    this.dispatchEvent(new ConversationItemCreateEvent(message));
  }

  protected updated(): void {
    if (
      this.items &&
      this.#conversationItemsRef.value &&
      this.#itemCount !== this.items.length
    ) {
      // Attempt to scroll to the newest.
      const lastItem = this.#conversationItemsRef.value.querySelector(
        ".conversation-item:last-of-type"
      );
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  render() {
    if (!this.items) {
      return nothing;
    }

    const tmpl = html`<div
        class="conversation-items"
        ${ref(this.#conversationItemsRef)}
      >
        ${map(this.items, (item) => {
          let sender: TemplateResult | symbol = nothing;
          if ("who" in item) {
            switch (item.who) {
              case Participant.TEAM_MEMBER: {
                const senderClass = (item.role || "Team Member")
                  .toLocaleLowerCase()
                  .replace(/\s/g, "-");
                sender = html`<h1
                  class="${classMap({ sender: true, [senderClass]: true })}"
                >
                  ${item.role || "Team Member"}
                  <span class="when"
                    >${item.type === ItemType.PENDING
                      ? nothing
                      : toRelativeTime(item.datetime)}</span
                  >
                </h1>`;
                break;
              }
            }
          }

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
                  console.log(item.message);
                  content = html`${markdown(item.message)}`;
                } else {
                  content = html`<p>${item.message}</p>`;
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

            case ItemType.PENDING: {
              return html`<section
                class=${classMap({
                  "conversation-item": true,
                  [item.type]: true,
                  [item.who]: true,
                })}
              >
                ${sender ? html`${sender}` : nothing}
                <div class="content">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </section>`;
            }

            case ItemType.INPUT: {
              return html`Input`;
            }
          }
        })}
      </div>

      <form id="user-input" @submit=${this.#onConversationSubmit}>
        <fieldset>
          <input
            type="text"
            required
            name="message"
            id="message"
            placeholder="Talk to the team"
            autocomplete="off"
          />
          <input type="submit" />
        </fieldset>
      </form>`;

    return html`${cache(tmpl)}`;
  }
}
