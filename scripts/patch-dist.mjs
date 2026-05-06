/**
 * patch-dist.mjs
 * Surgically patches dist/server/index.js to match the current source:
 *   1. Update CSS asset hash (app-DQHxXcTB → app-QregyKT3)
 *   2. Update manifest hash (2122f95b → d45a30d5)
 *   3. Update index-chunk hash (cE1lOOvS → DVuKUOOv)
 *   4. Update root-chunk hash (DnU8Eu7h → c6y4_4V3)
 *   5. Fix hero section: lum-hero-img outside container → lum-hero-visual inside container
 *   6. Fix price CTA: plain div/lum-btn large → lum-price-cta with tag+note
 *   7. Copy updated client assets (CSS + changed JS chunks) from build/ to dist/
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = join(__dirname, '..');

const distServerPath = join(BASE, 'dist/server/index.js');
let content = readFileSync(distServerPath, 'utf8');
const originalLength = content.length;

// ── 1. CSS hash ────────────────────────────────────────────────────────────
content = content.replaceAll('app-DQHxXcTB.css', 'app-QregyKT3.css');

// ── 2. Manifest hash ───────────────────────────────────────────────────────
content = content.replaceAll('manifest-2122f95b', 'manifest-d45a30d5');

// ── 3. Index chunk hash ───────────────────────────────────────────────────
content = content.replaceAll('_index-cE1lOOvS.js', '_index-DVuKUOOv.js');

// ── 4. Root chunk hash ────────────────────────────────────────────────────
content = content.replaceAll('root-DnU8Eu7h.js', 'root-c6y4_4V3.js');

// ── 5. Hero section: lum-hero-img (outside) → lum-hero-visual (inside) ───
//
// OLD structure (lum-hero-img div comes BEFORE the container div):
//   section.lum-hero
//     div.lum-hero-img  ← photo + laurel outside grid
//       img.lum-hero-photo
//       div.lum-hero-laurel
//     div.container
//       div.lum-hero-inner
//         div.lum-hero-text  ← text only, no visual column
//
// NEW structure (lum-hero-visual is INSIDE lum-hero-inner as 2nd column):
//   section.lum-hero
//     div.container
//       div.lum-hero-inner
//         div.lum-hero-text
//         div.lum-hero-visual  ← photo + laurel inside grid
//           img.lum-hero-photo
//           div.lum-hero-laurel

const G = 'G'; // just for readability in string construction

// The laurel badge markup is the same in both versions — reuse it
const laurelBadge =
  `(0,G.jsx)(\`svg\`,{className:\`lum-laurel-svg\`,"aria-hidden":\`true\`,children:(0,G.jsx)(\`use\`,{href:\`#i-laurel-l\`})})` +
  `,(0,G.jsxs)(\`div\`,{className:\`lum-laurel-text-wrap\`,children:[(0,G.jsx)(\`span\`,{className:\`lum-laurel-text\`,children:\`累計販売数\`}),(0,G.jsx)(\`span\`,{className:\`lum-laurel-num\`,children:\`50万袋\`}),(0,G.jsx)(\`span\`,{className:\`lum-laurel-text\`,children:\`突破！\`}),(0,G.jsx)(\`span\`,{className:\`lum-laurel-stars\`,children:\`★★★\`})]})` +
  `,(0,G.jsx)(\`svg\`,{className:\`lum-laurel-svg\`,"aria-hidden":\`true\`,children:(0,G.jsx)(\`use\`,{href:\`#i-laurel-r\`})})`;

const heroText =
  `(0,G.jsx)(\`p\`,{className:\`lum-hero-lead\`,children:\`内側から、キレイをつくる。\`})` +
  `,(0,G.jsxs)(\`h1\`,{className:\`lum-hero-title\`,children:[\`飲む美容液\`,(0,G.jsx)(\`br\`,{}),(0,G.jsx)(\`span\`,{children:\`美容プロテイン\`})]})` +
  `,(0,G.jsxs)(\`ul\`,{className:\`lum-hero-badges\`,children:[(0,G.jsxs)(\`li\`,{children:[(0,G.jsx)(\`span\`,{className:\`lum-bcheck\`,"aria-hidden":\`true\`,children:\`✓\`}),\`美容成分\`,(0,G.jsx)(\`br\`,{}),\`たっぷり配合\`]}),(0,G.jsxs)(\`li\`,{children:[(0,G.jsx)(\`span\`,{className:\`lum-bcheck\`,"aria-hidden":\`true\`,children:\`✓\`}),\`低カロリー\`,(0,G.jsx)(\`br\`,{}),\`低糖質\`]}),(0,G.jsxs)(\`li\`,{children:[(0,G.jsx)(\`span\`,{className:\`lum-bcheck\`,"aria-hidden":\`true\`,children:\`✓\`}),\`国内製造\`,(0,G.jsx)(\`br\`,{}),\`無添加処方\`]})]})` +
  `,(0,G.jsxs)(\`div\`,{className:\`lum-hero-cta\`,children:[(0,G.jsx)(\`a\`,{href:\`#price\`,className:\`lum-btn\`,children:\`今すぐ試してみる\`}),(0,G.jsx)(\`p\`,{className:\`lum-hero-note\`,children:\`初回限定 40%OFF\`})]})`;

// Build OLD hero function string
const oldHeroFn =
  `function Hv(){return(0,G.jsxs)(\`section\`,{className:\`lum-hero\`,id:\`hero\`,children:` +
  `[(0,G.jsxs)(\`div\`,{className:\`lum-hero-img\`,"aria-hidden":\`true\`,children:` +
    `[(0,G.jsx)(\`img\`,{className:\`lum-hero-photo\`,src:\`/images/hero.png\`,alt:\`\`})` +
    `,(0,G.jsxs)(\`div\`,{className:\`lum-hero-laurel\`,children:[${laurelBadge}]})]})` +
  `,(0,G.jsx)(\`div\`,{className:\`container\`,children:` +
    `(0,G.jsx)(\`div\`,{className:\`lum-hero-inner\`,children:` +
      `(0,G.jsxs)(\`div\`,{className:\`lum-hero-text\`,children:[${heroText}]})})})]})` +
  `}`;

// Build NEW hero function string
const newHeroFn =
  `function Hv(){return(0,G.jsx)(\`section\`,{className:\`lum-hero\`,id:\`hero\`,children:` +
  `(0,G.jsx)(\`div\`,{className:\`container\`,children:` +
    `(0,G.jsxs)(\`div\`,{className:\`lum-hero-inner\`,children:` +
      `[(0,G.jsxs)(\`div\`,{className:\`lum-hero-text\`,children:[${heroText}]})` +
      `,(0,G.jsxs)(\`div\`,{className:\`lum-hero-visual\`,"aria-hidden":\`true\`,children:` +
        `[(0,G.jsx)(\`img\`,{className:\`lum-hero-photo\`,src:\`/images/hero.png\`,alt:\`\`})` +
        `,(0,G.jsxs)(\`div\`,{className:\`lum-hero-laurel\`,children:[${laurelBadge}]})]})` +
      `]})})}` +
  `}`;

if (content.includes(oldHeroFn)) {
  content = content.replace(oldHeroFn, newHeroFn);
  console.log('✅ Hero section patched');
} else {
  console.error('❌ Hero section: old string NOT FOUND — check the patch script');
  process.exit(1);
}

// ── 6. Price CTA ──────────────────────────────────────────────────────────
//
// OLD: plain centered div with lum-btn large
// NEW: lum-price-cta div with cta-tag span + note paragraph

const oldPriceCta =
  `(0,G.jsx)(\`div\`,{style:{textAlign:\`center\`,marginTop:\`40px\`},children:` +
  `(0,G.jsx)(\`a\`,{href:\`/products\`,className:\`lum-btn large\`,children:\`今すぐ試してみる\`})})`;

const newPriceCta =
  `(0,G.jsxs)(\`div\`,{className:\`lum-price-cta\`,children:` +
  `[(0,G.jsxs)(\`a\`,{href:\`/products\`,className:\`lum-btn\`,children:` +
    `[(0,G.jsx)(\`span\`,{className:\`lum-price-cta-tag\`,children:\`初回 40%OFF\`}),\`今すぐ試してみる\`]})` +
  `,(0,G.jsx)(\`p\`,{className:\`lum-price-cta-note\`,children:\`30日間全額返金保証付き ・ 送料無料\`})]})`;

if (content.includes(oldPriceCta)) {
  content = content.replace(oldPriceCta, newPriceCta);
  console.log('✅ Price CTA patched');
} else {
  console.error('❌ Price CTA: old string NOT FOUND — check the patch script');
  process.exit(1);
}

// ── Write patched server bundle ────────────────────────────────────────────
writeFileSync(distServerPath, content, 'utf8');
console.log(`✅ dist/server/index.js written (${originalLength} → ${content.length} bytes)`);

// ── 7. Copy updated client assets ─────────────────────────────────────────
const filesToCopy = [
  'app-QregyKT3.css',
  '(_locale)._index-DVuKUOOv.js',
  'root-c6y4_4V3.js',
  'manifest-d45a30d5.js',
];

for (const file of filesToCopy) {
  const src = join(BASE, 'build/client/assets', file);
  const dst = join(BASE, 'dist/client/assets', file);
  if (!existsSync(src)) {
    console.error(`❌ Source file not found: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, dst);
  console.log(`✅ Copied ${file} → dist/client/assets/`);
}

console.log('\n🎉 All patches applied successfully.');
