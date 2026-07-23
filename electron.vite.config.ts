import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        /**
         * input defaults to src/main/index.ts
         */
        // input: resolve(__dirname, 'src', 'main', 'index.ts')
      },
    },
    resolve: {
      alias: {
        '@root': resolve(__dirname, 'src'),
        '@main': resolve(__dirname, 'src/main'),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        /**
         * input defaults to src/preload/index.ts
         */
        // input: resolve(__dirname, 'src', 'preload', 'index.ts')
      },
    },
    resolve: {
      alias: {
        '@root': resolve(__dirname, 'src'),
        '@preload': resolve(__dirname, 'src/preload'),
      },
    },
  },
  renderer: {
    /**
     * root defaults to src/renderer.
     */
    root: 'src/renderer',
    resolve: {
      alias: {
        '@root': resolve(__dirname, 'src'),
        '@renderer': resolve('src/renderer/src'),
      },
    },
    clearScreen: false,
    // @ts-ignore
    plugins: [tailwindcss(), react()],
  },
});
