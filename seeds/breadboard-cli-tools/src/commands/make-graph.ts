import { Board } from '@google-labs/breadboard';
import { watch } from 'fs';
import path from 'path';

const loadBoard = async (file: string) => {
  const board = (await import(file)).default;

  if (board == undefined) throw new Error(`Board ${file} does not have a default export`);

  if (board instanceof Board == false) throw new Error(`Board ${file} does not have a default export of type Board`);

  return board;
}

const resolveFilePath = (file: string) => {
  return path.resolve(process.cwd(), path.join(path.dirname(file), path.basename(file)));
}

export const makeGraph = async (file: string, options: {}) => {
  let filePath = resolveFilePath(file);

  if (file != undefined) {
    if (path.extname(file) != '.js') {
      throw new Error(`File ${file} is not a JavaScript file.`);
    }

    const controller = new AbortController();
    const board = await loadBoard(filePath);

    console.log(JSON.stringify(board, null, 2));

    if ('watch' in options) {
      watch(file, { signal: controller.signal }, async (eventType: string, filename: string | Buffer | null) => {
        if (typeof (filename) != 'string') return;

        if (eventType === 'change') {
          let board = await loadBoard(filePath);
          
          console.log(JSON.stringify(board, null, 2));
        }
        else if (eventType === 'rename') {
          console.error(`File ${filename} has been renamed. We can't manage this yet. Sorry!`);
          controller.abort();
        }
      });
    }
  }
}