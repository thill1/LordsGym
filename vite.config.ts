import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  root: ".",
  // Dev at /, build for GitHub Pages project site at /LordsGym/
  base: command === "build" ? "/LordsGym/" : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
