import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    // Gọi /api/* sẽ được chuyển sang backend FastAPI, không cần lo CORS
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
});
