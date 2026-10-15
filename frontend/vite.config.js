import { defineConfig } from 'vite';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  server: { proxy: { '/user': 'http://127.0.0.1:3142', '/model': 'http://127.0.0.1:3142' } },
});
