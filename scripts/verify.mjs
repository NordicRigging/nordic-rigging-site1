#!/usr/bin/env node
/**
 * Nordic Rigging — end-to-end checks against a running site.
 *
 *   npm run dev                        # in one terminal
 *   npm run verify                     # in another
 *   npm run verify -- http://localhost:4173        # or against `npm run preview`
 *
 * Pass a second URL to also exercise the remote form path: start a second dev
 * server with VITE_FORM_ENDPOINT set to an address this script can intercept,
 * e.g. VITE_FORM_ENDPOINT=http://localhost:5174/__form npx vite --port 5174
 * then `npm run verify -- http://localhost:5173 http://localhost:5174`.
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
import { contextOptions, launch } from './browser.mjs';

const [base = 'http://localhost:5173', endpoint = ''] = process.argv.slice(2);
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await launch();

// ---------- desktop, Finnish ----------
{
  const ctx = await browser.newContext(contextOptions({ width: 1440, height: 900 }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()));
  page.on('response', r => r.status() >= 400 && !r.url().includes('/src/lib/') && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  check('html lang is fi by default', (await page.getAttribute('html', 'lang')) === 'fi');
  check('FI hero title', (await page.locator('h1').textContent()).includes('Purjeveneesi'));

  // the hero's wave background (GradientWaves) and the framed clip, both contained in the hero card
  await page.waitForTimeout(2000);
  const waves = await page.evaluate(() => {
    const c = document.querySelector('.gradient-waves-container canvas');
    if (!c) return { present: false };
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return { present: true, w: c.width, h: c.height, lost: gl ? gl.isContextLost() : null };
  });
  check('GradientWaves canvas renders behind the hero', waves.present && waves.w > 0 && waves.lost === false, JSON.stringify(waves));

  const v = await page.evaluate(() => {
    const el = document.querySelector('.hero__video');
    if (!el) return { present: false };
    return { present: true, playing: !el.paused && el.currentTime > 0, t: el.currentTime, w: el.videoWidth, h: el.videoHeight };
  });
  check('hero clip element present', v.present, JSON.stringify(v));
  check('hero clip is playing', !!v.playing, `t=${v.t?.toFixed?.(2)} ${v.w}x${v.h}`);
  const mediaBox = await page.evaluate(() => {
    const el = document.querySelector('.hero__media');
    const r = el?.getBoundingClientRect();
    const cs = el && getComputedStyle(el);
    return r && cs ? { w: Math.round(r.width), h: Math.round(r.height), radius: cs.borderTopLeftRadius, radiusBottom: cs.borderBottomLeftRadius } : null;
  });
  check(
    'hero media is a contained 3:4 card with rounded top only',
    !!mediaBox && Math.abs(mediaBox.w / mediaBox.h - 0.75) < 0.02 && mediaBox.radius !== '0px' && mediaBox.radiusBottom === '0px',
    JSON.stringify(mediaBox)
  );

  // language toggle
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('EN toggle switches html lang', (await page.getAttribute('html', 'lang')) === 'en');
  check('EN hero title', (await page.locator('h1').textContent()).includes('sorted'));
  check('EN nav label', (await page.locator('.pill .pill-label').first().textContent()) === 'Services');
  check('EN choice persisted', (await page.evaluate(() => localStorage.getItem('userLang'))) === 'en');
  await page.getByRole('button', { name: 'FI', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('back to FI', (await page.getAttribute('html', 'lang')) === 'fi');

  // price, area and crew are readable without scrolling
  const factsVisible = await page.evaluate(() => {
    const r = document.querySelector('.hero__facts')?.getBoundingClientRect();
    return r && r.bottom <= window.innerHeight;
  });
  check('price/area/crew facts visible in first viewport (desktop)', !!factsVisible);

  // the four tabs: default, then each nav link opens the matching one and scrolls to it
  check('Palvelut tab open by default', await page.locator('#tab-palvelut').getAttribute('aria-selected').then(v => v === 'true'));
  check('Palvelut panel shows the three services', (await page.locator('#panel-palvelut').textContent()).includes('Mastotyöt'));

  const navChecks = [
    { label: 'Telakoille', tabId: 'telakat', text: 'Tarvitsetko luotettavan' },
    { label: 'Tehdyt työt', tabId: 'tyot', text: 'Referenssejä' },
    { label: 'Meistä', tabId: 'meista', text: 'Isä ja poika' }
  ];
  for (const { label, tabId, text } of navChecks) {
    await page.locator('.pill', { hasText: label }).click();
    await page.waitForTimeout(700);
    check(`nav "${label}" opens and scrolls to its tab`, await page.locator(`#tab-${tabId}`).getAttribute('aria-selected').then(v => v === 'true'));
    check(`"${label}" panel shows its content`, (await page.locator(`#panel-${tabId}`).textContent()).includes(text));
    const top = await page.evaluate(() => document.getElementById('ratkaisut').getBoundingClientRect().top);
    check(`"${label}" scrolled the tabs section into view`, top >= -5 && top < 200, `top=${top.toFixed(0)}`);
  }

  // clicking a tab button directly also works, and only that tab's content is mounted
  // (we were just on "Tehdyt työt", so its portfolio grid should be gone now)
  await page.click('#tab-palvelut');
  await page.waitForTimeout(200);
  check('clicking a tab button switches back', await page.locator('#tab-palvelut').getAttribute('aria-selected').then(v => v === 'true'));
  check('switching tabs unmounts the previous panel', (await page.locator('.portfolio-grid').count()) === 0);

  // nav scroll to contact (not a tab)
  await page.locator('.pill', { hasText: 'Yhteystiedot' }).click();
  await page.waitForTimeout(1200);
  const contactTop = await page.evaluate(() => document.getElementById('yhteystiedot').getBoundingClientRect().top);
  check('nav link scrolls to contact', contactTop >= 0 && contactTop < 200, `top=${contactTop.toFixed(0)}`);

  // globe
  await page.waitForTimeout(3500);
  const settled = await page.evaluate(() => document.querySelector('.globe')?.classList.contains('is-settled'));
  check('globe animation settled on Finland', !!settled);
  const pinVisible = await page.evaluate(() => Number(document.querySelector('.globe__pin--turku')?.style.opacity) > 0.9);
  check('Turku pin visible', !!pinVisible);

  // the B2B path: open the yards tab via its own button and pre-fill the shared form
  await page.locator('.pill', { hasText: 'Telakoille' }).click();
  await page.waitForTimeout(600);
  await page.locator('#panel-telakat .btn--accent').click();
  await page.waitForTimeout(1200);
  const who = await page.evaluate(() => document.querySelector('input[name="who"]:checked')?.value);
  const partnerChecked = await page.evaluate(() => document.querySelector('input[name="needs"][value="partner"]')?.checked);
  check('B2B button pre-selects "yard"', who === 'yard', `who=${who}`);
  check('B2B button pre-selects partnership need', !!partnerChecked);
  check('org label switches for yards', (await page.locator('label[for$="-boat"]').textContent()).includes('Telakka tai satama'));

  // mailto fallback: validation first, then a real submit
  await page.locator('.cform__submit').click();
  await page.waitForTimeout(200);
  check('empty submit shows validation message', await page.locator('.cform__msg--warn').isVisible());
  await page.fill('input[name="name"]', 'Testi Telakka');
  await page.fill('input[name="phone"]', '0401234567');
  await page.fill('input[name="boat"]', 'Testitelakka Oy');
  await page.fill('textarea[name="message"]', 'Mastonostoja keväälle.');
  const mailtoPromise = page.waitForEvent('request', { predicate: r => r.url().startsWith('mailto:'), timeout: 3000 }).catch(() => null);
  await page.locator('.cform__submit').click();
  await page.waitForTimeout(800);
  check('mailto fallback shows confirmation', await page.locator('.cform__msg--ok').isVisible());
  try {
    const composed = await page.evaluate(async () => {
      const m = await import('/src/lib/message.js');
      const c = await import('/src/lib/content.js');
      const f = c.CONTENT.fi.form;
      const values = { who: 'yard', name: 'Testi Telakka', phone: '0401234567', email: '', boat: 'Testitelakka Oy', message: 'Mastonostoja keväälle.' };
      return m.buildMailto(c.CONTACT.email, m.buildSubject(values, f), m.buildMessage(values, f, ['Yhteistyö telakalle tai satamaan']));
    });
    check('composed mailto targets sales@ with yard subject', composed.startsWith('mailto:sales@nordicrigging.fi?subject=Yhteisty'), decodeURIComponent(composed).slice(0, 120));
  } catch {
    console.log('SKIP  composed mailto check (source modules are only served by the dev server)');
  }
  await mailtoPromise;

  // service page and the legacy v2 URL
  await page.goto(base + '/services/mast-work', { waitUntil: 'networkidle' });
  check('legacy /services/mast-work redirects', page.url().endsWith('/palvelut/mastotyot'), page.url());
  check('service page h1', (await page.locator('h1').textContent()) === 'Mastotyöt');
  check('service page shows crew names', (await page.locator('.crew').textContent()).includes('Tuomas Eloranta'));
  check('service page shows price', (await page.locator('.svc-card__price').textContent()).includes('100'));

  await page.locator('.svc-hero .btn--ghost').click();
  await page.waitForTimeout(1200);
  check('service page ask → home, Palvelut tab open', page.url().endsWith('/'), page.url());
  const mastChecked = await page.evaluate(() => document.querySelector('input[name="needs"][value="mast"]')?.checked);
  check('need "mast" preselected from service page', !!mastChecked);

  check('no page errors (desktop)', errors.length === 0, errors.join(' | ').slice(0, 300));
  await ctx.close();
}

// ---------- mobile ----------
{
  const ctx = await browser.newContext(contextOptions({ width: 390, height: 844, mobile: true }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('no horizontal overflow on mobile', overflow <= 0, `overflow=${overflow}px`);
  check('phone button visible in mobile header', await page.locator('.pill-call').isVisible());

  await page.locator('.mobile-menu-button').click();
  await page.waitForTimeout(300);
  check('mobile menu opens', await page.locator('#mobile-menu').isVisible());
  await page.locator('.mobile-menu-link', { hasText: 'Tehdyt työt' }).click();
  await page.waitForTimeout(900);
  check('mobile menu closes after click', !(await page.locator('#mobile-menu').isVisible()));
  check('mobile nav opened the Tehdyt työt tab', await page.locator('#tab-tyot').getAttribute('aria-selected').then(v => v === 'true'));
  const tabsTop = await page.evaluate(() => document.getElementById('ratkaisut').getBoundingClientRect().top);
  check('mobile nav scrolled to the tabs section', tabsTop >= -5 && tabsTop < 200, `top=${tabsTop.toFixed(0)}`);
  check('portfolio grid has photos', (await page.locator('.portfolio-grid__item').count()) >= 4);

  await page.waitForTimeout(1200);
  const vm = await page.evaluate(() => {
    const el = document.querySelector('.hero__video');
    return el ? { playing: !el.paused && el.currentTime > 0 } : { playing: false, missing: true };
  });
  check('hero clip plays on mobile', !!vm.playing, JSON.stringify(vm));
  check('no page errors (mobile)', errors.length === 0, errors.join(' | ').slice(0, 300));
  await ctx.close();
}

// ---------- the form's remote path, when a second server was given ----------
if (endpoint) {
  const ctx = await browser.newContext(contextOptions({ width: 1200, height: 900 }));
  const page = await ctx.newPage();
  let payload = null;
  await page.route('**/__form', route => {
    payload = JSON.parse(route.request().postData() || 'null');
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(endpoint + '/', { waitUntil: 'networkidle' });
  check('form in remote mode when VITE_FORM_ENDPOINT set', (await page.getAttribute('form.cform', 'data-endpoint')) === 'remote');
  await page.fill('input[name="name"]', 'Matti Meikäläinen');
  await page.fill('input[name="email"]', 'matti@example.com');
  await page.locator('.chip', { hasText: 'Mastotyöt' }).click();
  await page.fill('textarea[name="message"]', 'Masto alas lokakuussa.');
  await page.locator('.cform__submit').click();
  await page.waitForTimeout(800);
  check(
    'remote submit posts JSON payload',
    !!payload && payload.name === 'Matti Meikäläinen' && payload.needs?.includes('Mastotyöt'),
    JSON.stringify(payload)?.slice(0, 200)
  );
  check('remote submit shows thank-you', await page.locator('.cform--done').isVisible());
  await ctx.close();
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
