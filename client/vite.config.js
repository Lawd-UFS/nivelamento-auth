import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O Vite roda na porta 5173 e repassa chamadas /api para o Express (3000).
// Assim o frontend e o backend parecem um único servidor durante o desenvolvimento.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
