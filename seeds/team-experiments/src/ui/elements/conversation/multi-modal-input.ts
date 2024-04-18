/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ConversationInputPart } from "../../../types/types.js";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { asBase64 } from "../../utils/asBase64.js";
import { MultiModalInputEvent } from "../../../events/events.js";

@customElement("at-multi-modal-input")
export class MultiModalInput extends LitElement {
  @property()
  inputTitle: string | null = null;

  static styles = css`
    * {
      box-sizing: border-box;
    }

    :host {
      display: block;
    }

    form {
      width: 100%;
      padding: var(--grid-size-6);
      display: block;
    }

    fieldset {
      width: 100%;
      min-inline-size: 0;
      background: var(--neutral-white);
      border: 1px solid var(--neutral-300);
      border-radius: var(--grid-size-2);
      padding: var(--grid-size-3) var(--grid-size-4);
      overflow: auto;
      display: block;
      margin: 0;
    }

    fieldset h1 {
      margin: 0 0 var(--grid-size) 0;
      font: 500 var(--label-large) / var(--label-line-height-large)
        var(--font-family);
    }

    #controls {
      display: flex;
      align-items: center;
      padding-top: var(--grid-size-2);
    }

    label[for="add-file"],
    input[type="submit"] {
      cursor: pointer;
      height: var(--grid-size-8);
      color: var(--output-700);
      background: var(--output-100);
      border-radius: var(--grid-size-12);
      border: none;
      font: normal var(--label-large) / var(--label-line-height-large)
        var(--font-family);
      display: flex;
      align-items: center;
      padding: var(--grid-size) var(--grid-size-4) var(--grid-size)
        var(--grid-size-8);
    }

    label[for="add-file"] {
      background: var(--output-100) var(--icon-add-blue) 10px center / 16px 16px
        no-repeat;
    }

    input[type="submit"] {
      background: var(--output-100) var(--icon-resume-blue) 8px center / 20px
        20px no-repeat;
    }

    #skip {
      background: none;
      border: none;
      color: var(--output-700);
      font: normal var(--label-large) / var(--label-line-height-large)
        var(--font-family);
      height: var(--grid-size-8);
      margin-right: var(--grid-size-3);
      cursor: pointer;
    }

    input[type="file"] {
      display: none;
    }

    .files {
      display: block;
      margin: 0;
      padding: var(--grid-size-2) 0;
      list-style: none;
      width: 100%;
      overflow: auto;
    }

    .files li {
      display: block;
      height: 24px;
      margin-bottom: var(--grid-size-2);
      width: 100%;
      overflow: auto;
      font: normal var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
    }

    .files li a {
      display: block;
      position: relative;
      padding: 0 var(--grid-size-7);
      align-items: center;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width: 100%;
      line-height: 20px;
      height: 20px;
    }

    .files li a:before {
      content: "";
      display: block;
      background: #fff var(--asset-generic) center center / 20px 20px no-repeat;
      position: absolute;
      top: 50%;
      left: 0;
      width: 20px;
      height: 20px;
      transform: translateY(-50%);
    }

    .files li.image-png a:before {
      background: #fff var(--asset-image-png) center center / 20px 20px
        no-repeat;
    }

    .files li.application-pdf a:before {
      background: #fff var(--asset-application-pdf) center center / 20px 20px
        no-repeat;
    }

    .files li a .delete {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 0;
      font-size: 0;
      background: var(--icon-delete) center center / 20px 20px;
      border: none;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity var(--easing-duration-out) var(--easing);
    }

    .files li a .delete:hover {
      transition-duration: var(--easing-duration-in);
      opacity: 0.8;
    }

    a {
      color: var(--output-600);
    }

    #controls button {
      align-self: flex-end;
    }

    #continuation {
      display: flex;
      justify-content: flex-end;
      flex: 1 0 auto;
    }
  `;

  #items: ConversationInputPart[] = [];

  set value(value: string) {
    this.#items = JSON.parse(value);
  }

  get value() {
    return JSON.stringify(this.#items);
  }

  #onSubmit(evt: SubmitEvent) {
    evt.preventDefault();

    this.dispatchEvent(new MultiModalInputEvent(this.#items));
  }

  render() {
    return html`<form @submit=${this.#onSubmit}>
      <fieldset>
        <h1>${this.inputTitle}</h1>
        ${this.#items && this.#items.length
          ? html`<ul class="files">
              ${map(this.#items, (file, idx) => {
                if (typeof file === "string") {
                  return nothing;
                }

                const mimeTypeClass = file.inline_data.mime_type
                  .toLocaleLowerCase()
                  .replace(/\W/gi, "-");
                return html`<li class=${classMap({ [mimeTypeClass]: true })}>
                  <a
                    href="data:${file.inline_data.mime_type};base64,${file
                      .inline_data.data}"
                    download="${file.name}"
                    >${file.name}
                    <button
                      @click=${(evt: Event) => {
                        evt.stopImmediatePropagation();
                        evt.preventDefault();

                        if (
                          !confirm("Are you sure you want to remove this file?")
                        ) {
                          return;
                        }

                        this.#items.splice(idx, 1);
                        this.requestUpdate();
                      }}
                      class="delete"
                    >
                      Delete
                    </button></a
                  >
                </li>`;
              })}
            </ul>`
          : nothing}

        <div id="controls">
          <label for="add-file">Add</label>
          <input
            type="file"
            id="add-file"
            name="add-file"
            multiple="true"
            @input=${async (evt: InputEvent) => {
              if (!(evt.target instanceof HTMLInputElement)) {
                return;
              }

              if (!evt.target.files) {
                return;
              }

              for (const file of evt.target.files) {
                const data = await asBase64(file);
                this.#items.push({
                  inline_data: {
                    data,
                    mime_type: file.type,
                  },
                  name: file.name,
                  url: "#",
                });
              }

              this.requestUpdate();
            }}
          />
          <div id="continuation">
            <button
              type="button"
              id="skip"
              @click=${() => {
                this.dispatchEvent(new MultiModalInputEvent([]));
              }}
            >
              Skip
            </button>
            <input type="submit" value="Continue" />
          </div>
        </div>
      </fieldset>
    </form>`;
  }
}
