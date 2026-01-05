import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  // Use relative base so assets work on GitHub Pages project sites AND locally
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
