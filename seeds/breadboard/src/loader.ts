/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GraphDescriptor, SubGraphs } from "./types.js";

export type BoardLoaderArguments = {
  base?: string;
  graphs?: SubGraphs;
};

export type BoardLoaderType = "file" | "fetch" | "hash" | "unknown";

export type BoardLoaders = Record<
  BoardLoaderType,
  (path: string) => Promise<GraphDescriptor>
>;

export type ResolverResult = {
  type: BoardLoaderType;
  location: string;
  href: string;
};

export const resolveURL = (
  base: URL,
  urlString: string,
  results: ResolverResult[]
): boolean => {
  // Create a new URL object from the urlString and base URL.
  const url = new URL(urlString, base);
  // Get the hash and href from the URL.
  const hash = url.hash;
  const href = url.href;
  // If the URL protocol is file, get the pathname.
  const path = url.protocol === "file:" ? url.pathname : undefined;
  // Get the base URL without the hash.
  const baseWithoutHash = base.href.replace(base.hash, "");
  // Get the href without the hash.
  const hrefWithoutHash = href.replace(hash, "");
  // If the URL has a hash, add it to the results array and return true.
  if (baseWithoutHash == hrefWithoutHash && hash) {
    results.push({ type: "hash", location: hash.substring(1), href });
    return true;
  }
  // Otherwise, create a new ResolverResult object based on the URL type.
  const result: ResolverResult = path
    ? { type: "file", location: path, href }
    : href
      ? { type: "fetch", location: hrefWithoutHash, href }
      : { type: "unknown", location: "", href };
  // Add the result to the results array.
  results.push(result);
  // Return whether the URL has a hash.
  return !hash;
};

export const loadFromFile = async (path: string) => {
  if (typeof globalThis.process === "undefined")
    throw new Error("Unable to use `path` when not running in node");
  const { readFile } = await import(/* @vite-ignore */ "node:fs/promises");
  return JSON.parse(await readFile(path, "utf-8"));
};

export const loadWithFetch = async (url: string) => {
  const response = await fetch(url);
  return await response.json();
};

export class BoardLoadingStep {
  loaders: BoardLoaders;
  graphs?: SubGraphs;

  constructor(graphs?: SubGraphs) {
    this.loaders = {
      file: loadFromFile,
      fetch: loadWithFetch,
      hash: async (hash: string) => {
        if (!graphs) throw new Error("No sub-graphs to load from");
        return graphs[hash];
      },
      unknown: async () => {
        throw new Error("Unable to determine Board loader type");
      },
    };
  }

  async load(result: ResolverResult): Promise<GraphDescriptor> {
    const graph = await this.loaders[result.type](result.location);
    graph.url = result.href;
    return graph;
  }
}

export type BoardLoaderResult = {
  graph: GraphDescriptor;
  isSubgraph: boolean;
};

export class BoardLoader {
  #base: URL;
  #graphs?: SubGraphs;

  constructor({ base, graphs }: BoardLoaderArguments) {
    // Set the #base property to a new URL object based on the base argument or the import.meta.url.
    this.#base = new URL(base ?? import.meta.url);
    this.#graphs = graphs;
  }

  async load(urlString: string): Promise<BoardLoaderResult> {
    // Declare an empty array called results.
    const results: ResolverResult[] = [];
    // Set the base variable to the #base property.
    let base = this.#base;
    // While the URL cannot be resolved, add the result to the results array and update the base variable.
    while (!resolveURL(base, urlString, results)) {
      base = new URL(results[results.length - 1].href);
    }
    // Declare the graph and subgraphs variables.
    let graph: GraphDescriptor | undefined;
    let subgraphs = this.#graphs;
    // Declare the isSubgraph variable and set it to true.
    let isSubgraph = true;
    // For each result in the results array, load the graph using the BoardLoadingStep class and update the subgraphs variable.
    for (const result of results) {
      // If the result type is file or fetch, set the isSubgraph variable to false.
      if (result.type === "file" || result.type === "fetch") isSubgraph = false;
      const step = new BoardLoadingStep(subgraphs);
      graph = await step.load(result);
      subgraphs = graph.graphs;
    }
    // If the graph is undefined, throw an error.
    if (!graph)
      throw new Error(
        "BoardLoader failed to load a graph. This error likely indicates a bug in the BoardLoader."
      );
    // Return an object with the graph and isSubgraph properties.
    return { graph, isSubgraph };
  }
}
