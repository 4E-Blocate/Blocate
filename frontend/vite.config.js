import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  publicDir: '../assets',
  server: {
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, '../assets')
    }
  }
});
