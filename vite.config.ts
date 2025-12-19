import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const repoName = "LordsGym";

  return {
    plugins: [react()],
    server: { port: 3000, host: "0.0.0.0" },
    base: mode === "production" ? `/${repoName}/` : "/",
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY || ""),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY || ""),
    },
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
  };
});
