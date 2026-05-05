/**
 * Vercel Build Output API script for Shopify Hydrogen
 *
 * Vercel's `framework: "react-router"` preset bypasses our custom server.ts
 * and creates its own handler without the Hydrogen context (getLoadContext).
 * This script uses Vercel's Build Output API directly to deploy our
 * Cloudflare Workers-compatible server bundle as a Vercel Edge Function.
 *
 * Architecture:
 *   dist/server/index.js  (Hydrogen Oxygen bundle, exports { default: { fetch } })
 *       ↓ wrapped by esbuild
 *   .vercel/output/functions/index.func/index.js  (Vercel Edge Function)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ── 1. Build the Hydrogen app ──────────────────────────────────────────────
console.log('▶ Building Hydrogen app...');
execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

// ── 2. Prepare Vercel output directories ──────────────────────────────────
const vercelOutput = path.join(rootDir, '.vercel', 'output');
const functionsDir = path.join(vercelOutput, 'functions', 'index.func');
const staticDir    = path.join(vercelOutput, 'static');

console.log('▶ Preparing .vercel/output/ ...');
fs.rmSync(vercelOutput, { recursive: true, force: true });
fs.mkdirSync(functionsDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// ── 3. Copy client assets to static ───────────────────────────────────────
console.log('▶ Copying static assets from dist/client/ ...');
copyDir(path.join(rootDir, 'dist', 'client'), staticDir);

// ── 4. Create Edge Function entry point ────────────────────────────────────
// The server bundle exports `{ default: { fetch(req, env, ctx) } }`.
// Vercel Edge Runtime expects `export default function(request): Response`.
// We create a thin wrapper and bundle it with esbuild.

const entryPath = path.join(rootDir, '.vercel', '_edge-entry.mjs');
fs.writeFileSync(entryPath, `
// Auto-generated Vercel Edge Function wrapper for Hydrogen Oxygen bundle
import server from ${JSON.stringify(path.join(rootDir, 'dist', 'server', 'index.js'))};

export default function handler(request) {
  const env = {
    PUBLIC_STORE_DOMAIN:                  (typeof process !== 'undefined' && process.env.PUBLIC_STORE_DOMAIN)                  || '',
    PUBLIC_STOREFRONT_API_TOKEN:          (typeof process !== 'undefined' && process.env.PUBLIC_STOREFRONT_API_TOKEN)          || '',
    SESSION_SECRET:                       (typeof process !== 'undefined' && process.env.SESSION_SECRET)                       || '',
    PRIVATE_STOREFRONT_API_TOKEN:         (typeof process !== 'undefined' && process.env.PRIVATE_STOREFRONT_API_TOKEN)         || '',
    PUBLIC_STOREFRONT_ID:                 (typeof process !== 'undefined' && process.env.PUBLIC_STOREFRONT_ID)                 || '',
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:(typeof process !== 'undefined' && process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID)|| '',
    SHOP_ID:                              (typeof process !== 'undefined' && process.env.SHOP_ID)                              || '',
  };
  return server.fetch(request, env);
}
`.trim());

// ── 5. Bundle with esbuild ─────────────────────────────────────────────────
console.log('▶ Bundling Edge Function with esbuild ...');
const esbuildBin = path.join(rootDir, 'node_modules', '.bin', 'esbuild');
const outFile = path.join(functionsDir, 'index.js');

execSync(
  `"${esbuildBin}" "${entryPath}" --bundle --outfile="${outFile}" --format=esm --platform=browser --target=es2022`,
  { stdio: 'inherit', cwd: rootDir },
);

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
    // Cache immutable asset files served from static/
    {
      src: '^/assets/(.+)$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    // Serve static files (images, fonts, etc.) directly
    { handle: 'filesystem' },
    // All other requests → Edge Function
    { src: '/(.*)', dest: '/index' },
  ],
};

fs.writeFileSync(
  path.join(vercelOutput, 'config.json'),
  JSON.stringify(config, null, 2),
);

console.log('✓ Vercel build output ready at .vercel/output/');
console.log(`  Edge function: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`);
console.log(`  Static files:  ${countFiles(staticDir)} files`);

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
