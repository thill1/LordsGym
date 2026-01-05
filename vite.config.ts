import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site base path:
  // https://thill1.github.io/LordsGym/
  base: '/LordsGym/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
