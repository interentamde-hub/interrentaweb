import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Necesario para que import.meta.glob con query:'?url' funcione correctamente
  // con archivos de imagen en src/assets/
  assetsInclude: ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.webp"],

  build: {
    // Frames WebP en /public no pasan por el bundle; este límite cubre el JS
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        // Vendors en chunks separados: se descargan en paralelo y el navegador
        // los cachea entre deploys (solo cambia el chunk del código propio)
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion", "gsap", "lenis"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
