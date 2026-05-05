/**
 * Vercel Build Output API post-build script for Shopify Hydrogen
 *
 * Runs AFTER `npm run build` (which produces dist/client/ and dist/server/).
 * Packages the Hydrogen Oxygen server bundle as a Vercel Edge Function using
 * the Build Output API so the custom server.ts fetch handler is preserved.
 *
 * Architecture:
 *   dist/server/index.js  (Hydrogen Oxygen bundle, exports { default: { fetch } })
 *       ↓ wrapped by esbuild JS API
 *   .vercel/output/functions/index.func/index.js  (Vercel Edge Function)
 */

import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ── 1. Validate that the Hydrogen build succeeded ─────────────────────────
const serverBundle = path.join(rootDir, 'dist', 'server', 'index.js');
const clientDir    = path.join(rootDir, 'dist', 'client');

if (!fs.existsSync(serverBundle)) {
  console.error(`✗ Server bundle not found: ${serverBundle}`);
  console.error('  Make sure "npm run build" completed successfully.');
  process.exit(1);
}

// ── 2. Prepare Vercel output directories ──────────────────────────────────
const vercelOutput = path.join(rootDir, '.vercel', 'output');
const functionsDir = path.join(vercelOutput, 'functions', 'index.func');
const staticDir    = path.join(vercelOutput, 'static');

console.log('▶ Preparing .vercel/output/ ...');
fs.rmSync(vercelOutput, { recursive: true, force: true });
fs.mkdirSync(functionsDir, { recursive: true });
fs.mkdirSync(staticDir,    { recursive: true });

// ── 3. Copy client assets to static ───────────────────────────────────────
console.log('▶ Copying static assets from dist/client/ ...');
copyDir(clientDir, staticDir);

// ── 4. Create Edge Function entry point ────────────────────────────────────
// The Hydrogen Oxygen bundle exports `{ default: { fetch(req, env, ctx) } }`.
// Vercel Edge Runtime expects `export default function(request): Response`.
const entryPath = path.join(rootDir, '.vercel', '_edge-entry.mjs');

const envKeys = [
  'PUBLIC_STORE_DOMAIN',
  'PUBLIC_STOREFRONT_API_TOKEN',
  'SESSION_SECRET',
  'PRIVATE_STOREFRONT_API_TOKEN',
  'PUBLIC_STOREFRONT_ID',
  'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
  'SHOP_ID',
];

const envObject = envKeys
  .map((k) => `    ${k}: (typeof process !== 'undefined' && process.env.${k}) || '',`)
  .join('\n');

fs.writeFileSync(
  entryPath,
  `// Auto-generated Vercel Edge Function wrapper for Hydrogen Oxygen bundle
import server from ${JSON.stringify(serverBundle)};

export default function handler(request) {
  const env = {
${envObject}
  };
  return server.fetch(request, env);
}`,
);

// ── 5. Bundle with esbuild JS API ─────────────────────────────────────────
console.log('▶ Bundling Edge Function with esbuild ...');
const outFile = path.join(functionsDir, 'index.js');

await esbuild.build({
  entryPoints: [entryPath],
  bundle: true,
  outfile: outFile,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  logLevel: 'info',
});

// Clean up temp entry file
fs.rmSync(entryPath, { force: true });

// ── 6. Write .vc-config.json (Edge Runtime) ───────────────────────────────
fs.writeFileSync(
  path.join(functionsDir, '.vc-config.json'),
  JSON.stringify({ runtime: 'edge', entrypoint: 'index.js' }, null, 2),
);

// ── 7. Write Vercel output config ─────────────────────────────────────────
const config = {
  version: 3,
  routes: [
    // Cache immutable asset files
    {
      src: '^/assets/(.+)$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    // Serve static files directly (images, fonts, etc.)
    { handle: 'filesystem' },
    // All other requests → Edge Function
    { src: '/(.*)', dest: '/index' },
  ],
};

fs.writeFileSync(
  path.join(vercelOutput, 'config.json'),
  JSON.stringify(config, null, 2),
);

const bundleSize = (fs.statSync(outFile).size / 1024).toFixed(1);
const staticCount = countFiles(staticDir);
console.log('✓ Vercel build output ready at .vercel/output/');
console.log(`  Edge function: ${bundleSize} KB`);
console.log(`  Static files:  ${staticCount} files`);

// ── helpers ───────────────────────────────────────────────────────────────

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function countFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    count += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return count;
}
