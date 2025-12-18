// vite.config.ts
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // IMPORTANT:
  // If deploying to GitHub Pages as a "project site", your URL is:
  // https://<username>.github.io/<repoName>/
  // So base MUST be "/<repoName>/"
  //
  // If deploying to Cloudflare Pages or a custom domain, base should be "/"
  const repoName = "lords-gym-auburn"; // <-- CHANGE THIS to your GitHub repo name EXACTLY

  return {
    plugins: [react()],

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    // GitHub Pages base path fix (project sites)
    base: mode === "production" ? `/${repoName}/` : "/",

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  };
});
