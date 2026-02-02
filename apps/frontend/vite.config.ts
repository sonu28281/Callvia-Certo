import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@callvia-certo/types': path.resolve(__dirname, '../../packages/types/src'),
      '@callvia-certo/constants': path.resolve(__dirname, '../../packages/constants/src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external access (needed for Codespaces)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
