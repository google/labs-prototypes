import { defineConfig } from "vite";
import vercel from "vite-plugin-vercel";

export default defineConfig({
  plugins: [vercel()],
  optimizeDeps: { esbuildOptions: { target: "esnext" } },
});
