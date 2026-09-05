import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Build config for the single-file preview (`npm run preview:file`).
 * Everything lands in one JS and one CSS file so `scripts/build-preview.mjs`
 * can inline the whole site — code, styles, fonts, photos and the hero clip —
 * into one self-contained .html you can email or open offline.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-preview',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    modulePreload: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: '[name][extname]'
      }
    }
  }
});
