import { fileURLToPath } from 'url'
import { dirname } from 'path';

import handler from 'serve-handler';
import http from 'http';

const debug = async (file: string) => {
  // We are assuming that this package will be published.
  // @ts-ignore
  const distPath = await import("@google-labs/breadboard-web/dist");

  const distDir = dirname(fileURLToPath(distPath.path));
  const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/vercel/serve-handler#options
    return handler(request, response, { public: distDir });
  });

  server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
  });
};

export { debug }