import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const repoName = "LordsGym"; // MUST match GitHub repo name exactly (case-sensitive)

  return {
    plugins: [react()],
    server: { port: 3000, host: "0.0.0.0" },
    base: mode === "production" ? `/${repoName}/` : "/",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
  };
});
