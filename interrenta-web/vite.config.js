import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 5000, // en KB; los frames son assets, no JS
    rollupOptions: {
      output: {
        // Mueve los assets de imagen a una carpeta separada
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
