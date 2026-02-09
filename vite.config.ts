import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Cloudflare Pages: use base "/" (set VITE_BASE_PATH=/ in Cloudflare env vars)
  // GitHub Pages: use base "/LordsGym/" (default for production)
  const base = process.env.VITE_BASE_PATH
    ? process.env.VITE_BASE_PATH
    : mode === "production"
      ? "/LordsGym/"
      : "/";

  return {
    plugins: [react()],
    base,
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js'],
    },
  };
});
