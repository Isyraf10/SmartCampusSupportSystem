import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, 
    proxy: {
  
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },

      '/identity': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/identity/, '/api/v1'),
      },
    },
  },
});