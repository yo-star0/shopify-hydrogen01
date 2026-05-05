import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), hydrogen(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    /**
     * Bundle react-dom (and react) into the SSR output instead of
     * externalising them.  When externalised, Node.js resolves
     * `react-dom/server` with the "node" condition, which does NOT export
     * `renderToReadableStream`.  Bundling forces Vite to use the
     * browser/worker variant (set by `resolve.conditions` below) which
     * does export `renderToReadableStream`, compatible with the Web Streams
     * API available in Node.js 18+ and Cloudflare Workers.
     */
    /**
     * Bundle ONLY react-dom (not react itself).  Bundling react-dom forces
     * Vite to use the browser variant which exports `renderToReadableStream`.
     * Keeping react external ensures a single React instance is shared by
     * both the SSR bundle and @shopify/hydrogen — a dual-instance React
     * breaks Hydrogen's internal context, leaving `context.storefront` as
     * undefined in route loaders.
     */
    noExternal: ['react-dom'],
    resolve: {
      /**
       * Prefer browser/worker exports so that `react-dom/server` resolves to
       * the browser variant which exports `renderToReadableStream`.
       */
      conditions: ['worker', 'browser', 'module', 'import', 'default'],
    },
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
