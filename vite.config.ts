import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ }) => ({
  plugins: [react()],
  base: '/resumetracker',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9850,
    open: true,
  },
  build: {
    sourcemap: true, // local dev — comment this and uncomment below for PROD
    // sourcemap: false,
  },
}));
