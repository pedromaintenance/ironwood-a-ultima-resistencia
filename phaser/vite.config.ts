import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Serve source-only engine modules from the project root while migrating.
  server: { fs: { allow: ['..'] } },
  build: { outDir: 'dist', emptyOutDir: true, assetsInlineLimit: 4096 },
});
