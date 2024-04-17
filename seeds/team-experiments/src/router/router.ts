/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { StateChangeEvent } from "../events/events";
import { SECTION, State } from "../types/types.js";

export class Router extends EventTarget {
  static #instance: Router;
  static instance() {
    if (!this.#instance) {
      this.#instance = new Router();
    }

    return this.#instance;
  }

  // Do not instantiate directly.
  private constructor() {
    super();

    this.#parseURLForState();

    window.addEventListener("popstate", () => {
      this.#parseURLForState();
    });
  }

  #state: State = {
    teamId: null,
    teamSection: 0,
    section: SECTION.TEAM_LIST,
  };

  #parseURLForState() {
    const params = new URLSearchParams(window.location.search);

    this.#state.teamId = params.has("teamId") ? params.get("teamId") : null;
    this.#state.teamSection = params.has("teamSection")
      ? Number.parseInt(params.get("teamSection") as string, 10)
      : null;
    this.#state.section = params.has("section")
      ? (params.get("section") as SECTION)
      : null;

    this.emitState();
  }

  emitState() {
    this.dispatchEvent(new StateChangeEvent(this.#state));
  }

  set(state: Partial<State>) {
    const unifiedState = { ...this.#state, ...state };

    const params = new URLSearchParams(window.location.search);
    for (const [name, value] of Object.entries(unifiedState)) {
      if (value === null) {
        params.delete(name);
        continue;
      }

      const serializedValue = value.toString();
      if (serializedValue === "") {
        continue;
      }

      params.set(name, value.toString());
    }

    const currentSearch = window.location.search.replace(/^\?/, "");
    if (params.toString() !== currentSearch) {
      const url = new URL(window.location.href);
      url.search = params.toString();
      window.history.pushState(null, "", url);
    }

    this.#parseURLForState();
  }
}
