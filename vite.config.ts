import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo site URL: https://thill1.github.io/LordsGym/
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/LordsGym/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
