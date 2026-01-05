import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // GitHub Pages project site: https://thill1.github.io/LordsGym/
  const repoBase = "/LordsGym/";

  return {
    plugins: [react()],
    base: mode === "production" ? repoBase : "/",
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
