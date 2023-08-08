import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import GraphPlugin from './build/graph-plugin.js'


// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.graph'],
  optimizeDeps: {
    include: ["@google-labs/llm-starter"]
  },
  plugins: [preact(), GraphPlugin()]
})
