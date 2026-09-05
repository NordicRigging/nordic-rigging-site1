#!/usr/bin/env node
/**
 * Nordic Rigging — screenshot helper, for reviewing a change without a browser
 * at hand. Needs `npm run dev` (or `npm run preview`) running.
 *
 *   npm run shot -- hero.png
 *   npm run shot -- page.png --target=full
 *   npm run shot -- cards.png --to=#palvelut --wait=6000
 *   npm run shot -- hero-mobile.png --size=390x844 --lang=en
 *   npm run shot -- hero-still.png --still        # as reduced-motion visitors see it
 *
 * Options
 *   --url=<url>        default http://localhost:5173/
 *   --target=viewport  what to capture: viewport | full | <css selector>
 *   --to=<selector>    scroll that section under the nav bar first
 *   --scroll=<px>      scroll to an exact offset instead
 *   --size=WxH         default 1440x900
 *   --lang=fi|en       default fi
 *   --wait=<ms>        settle time before the shot, default 1200
 *   --still            emulate prefers-reduced-motion (no clip, blueprint still)
 */
import { contextOptions, launch, presetLanguage, NAV_OFFSET } from './browser.mjs';

const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--'));
if (!out) {
  console.error('Usage: npm run shot -- <out.png> [--target=full] [--to=#palvelut] [--size=1440x900] [--lang=fi] [--wait=1200] [--still]');
  process.exit(1);
}

const flag = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = name => args.includes(`--${name}`);

const url = flag('url', 'http://localhost:5173/');
const target = flag('target', 'viewport');
const to = flag('to', '');
const scroll = flag('scroll', '');
const lang = flag('lang', 'fi');
const wait = Number(flag('wait', '1200'));
const [width, height] = flag('size', '1440x900').split('x').map(Number);

const browser = await launch();
const ctx = await browser.newContext(contextOptions({ width, height, lang, still: has('still') }));
await presetLanguage(ctx, lang);

const page = await ctx.newPage();
page.on('pageerror', e => console.error('PAGEERROR', e.message));
page.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
await page.goto(url, { waitUntil: 'networkidle' });

if (to) {
  await page.evaluate(
    ([sel, offset]) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' });
    },
    [to, NAV_OFFSET]
  );
} else if (scroll) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Number(scroll));
}

// The stage clip and the globe both animate on a timer; give them the wait.
await page.waitForTimeout(wait);

if (target === 'viewport') {
  await page.screenshot({ path: out });
} else if (target === 'full') {
  await page.screenshot({ path: out, fullPage: true });
} else {
  const el = page.locator(target).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({ path: out });
}

await browser.close();
console.log('saved', out);
