/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, html, css, nothing, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  AssetItem,
  ConversationData,
  ItemFormat,
} from "../../../types/types.js";
import { map } from "lit/directives/map.js";
import { markdown } from "../../directives/markdown";
import { classMap } from "lit/directives/class-map.js";

@customElement("assets-list")
export class AssetsList extends LitElement {
  @property()
  jobDescription: ConversationData | null = null;

  @property()
  items: AssetItem[] | null = null;

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

    .files ul {
      padding: var(--grid-size-2) 0;
      list-style: none;
    }

    .files ul li {
      display: block;
      height: 24px;
      margin-bottom: var(--grid-size-2);
    }

    .files ul li a {
      display: flex;
      align-items: center;
    }

    .files ul li a:before {
      content: "";
      background: #fff;
      width: 20px;
      height: 20px;
      margin-right: var(--grid-size-2);
    }

    .files ul li.image-png a:before {
      background: var(--asset-image-png) center center / 20px 20px no-repeat;
    }

    .files ul li.application-pdf a:before {
      background: var(--asset-application-pdf) center center / 20px 20px
        no-repeat;
    }

    a {
      color: var(--output-600);
    }

    .files,
    .job-description {
      margin: var(--grid-size-6) 0 0 0;
      padding: 0 var(--grid-size-6) var(--grid-size-3) var(--grid-size-6);
      font: var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
      width: 100%;
      margin: var(--grid-size-2) 0 0 0;
    }

    .files .content,
    .job-description .content {
      font: normal var(--body-medium) / var(--body-line-height-medium)
        var(--font-family);
    }

    .files .content h1,
    .job-description .content h1 {
      font: bold var(--title-medium) / var(--title-line-height-medium)
        var(--font-family);
      margin: var(--grid-size-2) 0;
    }

    section {
      border-bottom: 1px solid var(--neutral-300);
    }
  `;

  render() {
    if (!this.jobDescription) {
      return nothing;
    }

    let jobDescriptionTmpl: TemplateResult | symbol = nothing;
    if (this.jobDescription) {
      let content: TemplateResult | symbol = nothing;
      if (Array.isArray(this.jobDescription.message)) {
        if (this.jobDescription.format === ItemFormat.MARKDOWN) {
          content = html`${markdown(this.jobDescription.message.join("\n"))}`;
        } else {
          content = html`${map(
            this.jobDescription.message,
            (section) => html`<p>${section}</p>`
          )}`;
        }
      } else {
        if (this.jobDescription.format === ItemFormat.MARKDOWN) {
          content = html`${markdown(this.jobDescription.message)}`;
        }

        content = html`<p>${this.jobDescription.message}</p>`;
      }

      jobDescriptionTmpl = html`<section
        class=${classMap({
          "job-description": true,
          [this.jobDescription.type]: true,
          [this.jobDescription.who]: true,
        })}
      >
        <div class="content">${content}</div>
      </section>`;
    }

    const assetListTmpl = html` <section class="files">
      <div class="content">
        <h1>Files</h1>
        ${this.items && this.items.length
          ? html`<ul>
              ${map(this.items, (file) => {
                const mimeTypeClass = file.mime_type
                  .toLocaleLowerCase()
                  .replace(/\W/gi, "-");
                return html`<li class=${classMap({ [mimeTypeClass]: true })}>
                  <a href="${file.url}">${file.name}</a>
                </li>`;
              })}
            </ul>`
          : html`No files provided`}
      </div>
    </section>`;

    return html`${jobDescriptionTmpl} ${assetListTmpl}`;
  }
}
