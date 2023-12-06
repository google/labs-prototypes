import { BoardRunner } from '@google-labs/breadboard';
import { watch } from 'fs';
import { loadBoard, parseStdin, resolveFilePath } from './lib/utils.js';
import { Command } from 'commander';

export const mermaid = async (file: string, options: Record<string, string>, command: Command) => {

  if (file != undefined) {
    let filePath = resolveFilePath(file);

    const controller = new AbortController();

    let board = await loadBoard(filePath);
    console.log(board.mermaid());

    if ('watch' in options) {
      watch(file, { signal: controller.signal }, async (eventType: string, filename: string | Buffer | null) => {
        if (typeof (filename) != 'string') return;

        if (eventType === 'change') {

          let board = await loadBoard(filePath);
          console.log(board.mermaid());
        }
        else if (eventType === 'rename') {
          console.error(`File ${filename} has been renamed. We can't manage this yet. Sorry!`);
          controller.abort();
        }
      });
    }
  }
  else {
    const stdin = await parseStdin();
    const url = URL.createObjectURL(new Blob([stdin], { type: 'application/json' }));

    // We should validate it looks like a board...
    const board = await BoardRunner.fromGraphDescriptor(JSON.parse(stdin));

    console.log(board.mermaid());

    URL.revokeObjectURL(url);
  }
}