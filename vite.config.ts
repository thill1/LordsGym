
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: './', // Ensures assets are linked relatively (e.g., for GitHub Pages repo paths)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
