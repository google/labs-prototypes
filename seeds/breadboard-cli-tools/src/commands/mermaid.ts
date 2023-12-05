import { Board, BoardRunner } from '@google-labs/breadboard';
import { watch } from 'fs';
import path from 'path';

const loadBoard = async (file: string) => {
  const board = await Board.load(file);
  return board;
}

const resolveFilePath = (file: string) => {
  return path.resolve(process.cwd(), path.join(path.dirname(file), path.basename(file)));
}

const parseStdin = () : Promise<string> => {
  let resolveStdin: (value: string) => void;
  let rejectStdin: (reason?: any) => void;

  const p = new Promise<string>((resolve, reject) => {
    resolveStdin = resolve;
    rejectStdin = reject;
  });

  let stdin = '';

  process.stdin.on('readable', () => {
    let chunk = process.stdin.read();
    if (chunk !== null) {
       stdin += chunk;
    }
  });
  
  process.stdin.on('end', function() {
    resolveStdin(stdin);
  });

  process.stdin.on('error', (err) => {
    rejectStdin(err);
  });

  return p;
}

export const mermaid = async (file: string, options: {}) => {

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