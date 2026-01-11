import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
   site: 'https://seed118.com',
   integrations: [sitemap()],
   output: 'static',
   devToolbar: {
      enabled: false,
   },
   build: {
      inlineStylesheets: 'auto',
   },
   vite: {
      plugins: [tailwindcss()],
      build: {
         cssMinify: true,
         minify: 'esbuild',
         rollupOptions: {
            output: {
               chunkFileNames: 'chunks/[name].[hash].js',
               assetFileNames: 'assets/[name].[hash][extname]',
            },
         },
      },
   },
});
