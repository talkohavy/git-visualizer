import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'electron-vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode);

  return {
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
      server: {
        port: Number(env.VITE_PORT ?? 7000),
      },
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
  };
});
