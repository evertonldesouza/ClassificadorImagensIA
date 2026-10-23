import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

/**
 * Copia arquivos estáticos (service-worker, manifest) para a raiz do dist
 * após o build. O Service Worker precisa estar na raiz para ser registrado
 * no escopo correto ('/').
 */
const copyStaticPlugin = {
  name: 'copy-static-files',
  closeBundle() {
    const outDir = 'dist';
    const files = ['service-worker.js', 'manifest.json'];
    mkdirSync(outDir, { recursive: true });
    for (const file of files) {
      if (existsSync(file)) {
        copyFileSync(file, resolve(outDir, file));
      }
    }
  },
};

export default defineConfig({
  root: '.',
  base: './',
  publicDir: false,
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [copyStaticPlugin],
});
