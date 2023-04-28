import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'options.html'),
        popup: resolve(__dirname, 'popup.html'),
        serviceWorker: resolve(__dirname, 'src/serviceWorker/serviceWorker.ts'),
        contentScript: resolve(__dirname, 'src/contentScript/contentScript.ts'),
      },
    },
  },
});
