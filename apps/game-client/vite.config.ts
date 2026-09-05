import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@solar-grove/game-types': path.resolve(__dirname, '../../packages/game-types/src'),
      '@solar-grove/infrastructure-model': path.resolve(
        __dirname,
        '../../packages/infrastructure-model/src'
      ),
      '@solar-grove/content': path.resolve(__dirname, '../../packages/content/src'),
      '@solar-grove/command-engine': path.resolve(__dirname, '../../packages/command-engine/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
