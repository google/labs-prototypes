import { Board } from '@google-labs/breadboard';
import { watch } from 'fs';
import path from 'path';

const loadBoard = async (file: string) => {
  const board = await Board.load(file);
  return board;
}

const resolveFilePath = (file: string) => {
  return path.resolve(process.cwd(), path.join(path.dirname(file), path.basename(file)));
}

export const mermaid = async (file: string, options: {}) => {
  let filePath = resolveFilePath(file);

  if (file != undefined) {
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
}