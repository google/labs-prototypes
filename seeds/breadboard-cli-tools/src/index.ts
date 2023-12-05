#! /usr/bin/env node

/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/*
This is a CLI for the breadboard project. 

Commands:

+ breadboard debug <file> - Starts a simple HTTP server that serves the breadboard-web app, and outputs a URL that contains a link to a breadboard file that the user provided.
*/

import { debug } from "./commands/debug.js";
import { mermaid } from "./commands/mermaid.js";

import { program } from "commander";

program
  .version("0.0.1")
  .command("debug [file]")
    .description("Starts a simple HTTP server that serves the breadboard-web app, and outputs a URL that contains a link to a breadboard file that the user provided.")
    .action(debug);

    program.command("mermaid [file]")
    .description("Watch a breadboard file and output the mermaid diagram when it changes.")
    .option("-w, --watch", "Watch the file for changes.")
    .action(mermaid)

program.parse();