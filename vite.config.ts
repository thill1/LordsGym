import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Works on GitHub Pages project sites AND local/dev
  // because assets resolve relatively.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
