#!/usr/bin/env node
/**
 * Screenshot helper, for reviewing a change without a browser at hand.
 * Needs `npm run dev` (or a preview server) running.
 *
 *   npm run shot -- hero.png
 *   npm run shot -- page.png --target=full
 *   npm run shot -- spinlock.png --scroll=3200 --wait=600
 *   npm run shot -- hero-mobile.png --size=390x844
 *
 * Options
 *   --url=<url>        default http://localhost:5174/
 *   --target=viewport  what to capture: viewport | full | <css selector>
 *   --scroll=<px>       scroll to an exact offset first
 *   --size=WxH          default 1440x900
 *   --wait=<ms>         settle time before the shot, default 900
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--'));
if (!out) {
  console.error('Usage: npm run shot -- <out.png> [--target=full] [--scroll=1200] [--size=1440x900] [--wait=900]');
  process.exit(1);
}

const flag = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const url = flag('url', 'http://localhost:5174/');
const target = flag('target', 'viewport');
const scroll = flag('scroll', '');
const wait = Number(flag('wait', '900'));
const [width, height] = flag('size', '1440x900').split('x').map(Number);

const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('pageerror', e => console.error('PAGEERROR', e.message));
page.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
await page.goto(url, { waitUntil: 'networkidle' });

if (scroll) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Number(scroll));
}

await page.waitForTimeout(wait);

if (target === 'viewport') {
  await page.screenshot({ path: out });
} else if (target === 'full') {
  await page.screenshot({ path: out, fullPage: true });
} else {
  const el = page.locator(target).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: out });
}

await browser.close();
console.log('saved', out);
