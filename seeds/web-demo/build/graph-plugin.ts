import { Plugin } from 'rollup';
let mode; // developement or production

const GraphPlugin = (): Plugin => {
  return {
    name: 'vite-plugin-llm-graph',
    apply(config, { command }) {
      mode = command;
      return true;
    },
    async transform(code, id) {
      if(id.indexOf('.graph') > -1) console.log('transform', id)
      if (id.endsWith('.graph') && false) {
        const json = JSON.parse(code);
        const { kits } = json;

        for (const kitId in kits) {
          const kit = kits[kitId];
          if (kit.url.startsWith('npm:')) {
            console.log('kit.url', kit.url);
            const spec = kit.url.replace('npm:', '');
            const assetId = this.emitFile({
              type: 'chunk',
              id: spec,
              fileName: "assets/llm-graph-kit.js",
              name: "llm-graph-kit",
            });

            console.log('assetId', assetId);

            const fileName = this.getFileName(assetId);
            kits[kitId].url = fileName;
          }
        }

        json.kits = kits;
      
        return {
          code: JSON.stringify(json),
          map: { mappings: '' },
        };
      }
      return;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        console.log(req.url)
        
        // A kit is being requested
        if(req.url.indexOf('/kit/') > -1) {
          console.log('middleware', req.url)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({}))
          return
        }

        next()
      })
    }

  }
};

export default GraphPlugin;