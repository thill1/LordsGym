import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Repo name for GitHub Pages project site: https://thill1.github.io/LordsGym/
  const repoBase = "/LordsGym/";

  return {
    plugins: [react()],
    root: ".",
    // In dev we want "/", in production (Pages) we want "/LordsGym/"
    base: mode === "production" ? repoBase : "/",
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
