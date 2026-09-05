#!/usr/bin/env node
/**
 * Nordic Rigging — single-file preview build.
 *
 *   npm run preview:file
 *
 * Builds the site with `vite.preview.config.js` (one JS chunk, one CSS file,
 * hash routing) and inlines everything into `preview/nordic-rigging.html`:
 * styles, fonts, photos and the hero clip all become data URIs, so the file
 * opens straight from disk, over email or on a phone with no server.
 *
 * It is a snapshot for review, not the deployment artefact — deploy `dist/`
 * from `npm run build`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = join(ROOT, 'dist-preview');
const PUBLIC = join(ROOT, 'public');
const OUT_DIR = join(ROOT, 'preview');
const OUT = join(OUT_DIR, 'nordic-rigging.html');

const MIME = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const dataUri = file => `data:${MIME[extname(file)] || 'application/octet-stream'};base64,${readFileSync(file).toString('base64')}`;

const walk = dir =>
  readdirSync(dir).flatMap(name => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

// —— build ————————————————————————————————————————————————————————————————
console.log('Building preview bundle…');
execFileSync('npx', ['vite', 'build', '--config', 'vite.preview.config.js'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, VITE_HASH_ROUTER: '1' }
});

// —— collect the built pieces ————————————————————————————————————————————
const built = walk(BUILD);
const ref = file => '/' + relative(BUILD, file).split('\\').join('/');
const jsFile = built.find(f => f.endsWith('.js'));
const cssFile = built.find(f => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('Expected one JS and one CSS file in dist-preview/');

let js = readFileSync(jsFile, 'utf8');
let css = readFileSync(cssFile, 'utf8');

// —— inline the font files the CSS points at ——————————————————————————————
let fonts = 0;
for (const font of built.filter(f => /\.woff2?$/.test(f))) {
  if (!css.includes(ref(font))) continue;
  css = css.split(ref(font)).join(dataUri(font));
  fonts++;
}

// —— inline everything under public/ (paths appear as string literals) ————
// public/video/raw/ holds the untouched Higgsfield download; it is not shipped.
const publicFiles = walk(PUBLIC).filter(f => !f.includes(`${join('video', 'raw')}`));
let inlined = 0;
let bytes = 0;
for (const file of publicFiles) {
  const path = '/' + relative(PUBLIC, file).split('\\').join('/');
  const inJs = js.includes(path);
  const inCss = css.includes(path);
  if (!inJs && !inCss) continue;
  const uri = dataUri(file);
  if (inJs) js = js.split(path).join(uri);
  if (inCss) css = css.split(path).join(uri);
  inlined++;
  bytes += statSync(file).size;
  console.log(`  inlined ${path} (${(statSync(file).size / 1024).toFixed(0)} kB)`);
}

// —— compose the one file ————————————————————————————————————————————————
const html = readFileSync(built.find(f => f.endsWith('index.html')), 'utf8');
const description = html.match(/name="description"\s+content="([^"]*)"/s)?.[1] ?? '';
// The deployed page keeps the long search-engine title from index.html; this
// snapshot is named for a person browsing tabs, not for Google.
const title = 'Nordic Rigging';

// A literal </script> inside the bundle would close the inline tag early.
const safeJs = js.split('</script').join('<\\/script');

const page = `<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="theme-color" content="#0b1a2e" />
<style>
${css}
</style>
<div id="root"></div>
<script>
${safeJs}
</script>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, page);

const size = statSync(OUT).size;
console.log(
  `\n${relative(ROOT, OUT)} — ${(size / 1024 / 1024).toFixed(2)} MB ` +
    `(${inlined} assets, ${(bytes / 1024 / 1024).toFixed(2)} MB of media, ${fonts} font files)`
);
if (!existsSync(join(PUBLIC, 'video', 'hero.mp4'))) {
  console.log('Note: public/video/hero.mp4 is missing — run `npm run video` first.');
}
