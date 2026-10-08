import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../js",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "app-[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css") ? "css/app.css" : "assets/[name][extname]",
      },
    },
    cssCodeSplit: false,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
});
