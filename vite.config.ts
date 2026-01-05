import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo: https://thill1.github.io/LordsGym/
// ✅ GitHub Pages project site base MUST be "/LordsGym/"
export default defineConfig({
  plugins: [react()],
  base: '/LordsGym/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
