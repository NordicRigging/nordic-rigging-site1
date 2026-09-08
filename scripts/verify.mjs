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

/**
 * `scroll-behavior: smooth` means a nav click keeps moving for a bit after
 * it fires — how long depends on the distance, which depends on the page's
 * height, which changes as the site grows. Rather than guess a fixed delay,
 * or try to detect when the animation has "settled" (unreliable: near the
 * end of a long eased scroll the position barely changes frame to frame
 * anyway, which can look identical to "finished" while it's still moving),
 * poll the actual thing each check cares about — is the target now near the
 * top of the viewport — until it's true or a generous timeout runs out.
 */
async function scrolledNearTop(page, id, { min = -5, max = 200, timeout = 4000 } = {}) {
  const start = Date.now();
  let top = null;
  while (Date.now() - start < timeout) {
    top = await page.evaluate(sel => document.getElementById(sel)?.getBoundingClientRect().top, id);
    if (top != null && top >= min && top < max) return top;
    await page.waitForTimeout(50);
  }
  return top;
}

/**
 * The tab panel now crossfades (gsap) instead of swapping instantly, and how
 * long that takes for a browser to actually get through depends on the
 * machine — polling for the real end state beats guessing a fixed wait here
 * too.
 */
async function panelEventuallyShows(page, tabId, text, { timeout = 4000 } = {}) {
  const start = Date.now();
  let content = '';
  while (Date.now() - start < timeout) {
    content = (await page.locator(`#panel-${tabId}`).textContent().catch(() => '')) || '';
    if (content.includes(text)) return true;
    await page.waitForTimeout(50);
  }
  return false;
}

/**
 * The hero now runs a timed intro (~2s settle, then a border trace +
 * blueprint scrub + percent counter driven off one shared progress value)
 * before the title and contact card are meaningfully present. The timeout
 * here is generous well beyond the nominal ~4.8s because a slow/throttled
 * environment can push real elapsed time well past the component's own
 * internal clock — poll for the actual reveal rather than guess a wait.
 */
async function heroRevealed(page, { timeout = 20000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await page.evaluate(() => document.querySelector('.hero__wordmark-heading')?.classList.contains('is-revealed'))) return true;
    await page.waitForTimeout(50);
  }
  return false;
}

/** Same idea, for any polled condition not tied to a specific locator/tab. */
async function eventually(fn, { timeout = 4000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await fn()) return true;
    await new Promise(r => setTimeout(r, 50));
  }
  return false;
}

const browser = await launch();

// ---------- desktop, Finnish ----------
{
  const ctx = await browser.newContext(contextOptions({ width: 1440, height: 900 }));
  const page = await ctx.newPage();
  const errors = [];
  const heroIntroLogs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => {
    if (m.text().includes('hero-intro')) heroIntroLogs.push(m.text());
    if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text());
  });
  page.on('response', r => r.status() >= 400 && !r.url().includes('/src/lib/') && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(base + '/', { waitUntil: 'networkidle' });

  check('html lang is fi by default', (await page.getAttribute('html', 'lang')) === 'fi');
  // the page's one real <h1> wraps the decorative wordmark and carries the
  // brand name + tagline as its accessible name (the wordmark itself is
  // aria-hidden, so a screen reader only ever hears this once)
  check('FI hero h1 accessible name', (await page.locator('h1').getAttribute('aria-label')).includes('Purjeveneesi'));

  // the wordmark: two video-filled rows, centred, not the sales h1
  const wordmarkRows = await page.locator('.masked-heading__row').count();
  check('wordmark has two rows (Nordic / Rigging)', wordmarkRows === 2, `rows=${wordmarkRows}`);
  const wordmarkVideos = await page.evaluate(() =>
    [...document.querySelectorAll('.masked-heading__media')].map(v => ({ playing: !v.paused && v.currentTime > 0 }))
  );
  check('wordmark videos are playing', wordmarkVideos.length === 2 && wordmarkVideos.every(v => v.playing), JSON.stringify(wordmarkVideos));
  // the clip-path text must fit inside its own row — this is the fix for the
  // "RIGGING" clipping bug: the SVG text is measured against the row's own
  // width and shrunk to fit, not just sized from height
  const wordmarkFit = await page.evaluate(() =>
    [...document.querySelectorAll('.masked-heading__row')].map(row => {
      const text = row.querySelector('.masked-heading__clip-text');
      const w = row.getBoundingClientRect().width;
      return { rowWidth: Math.round(w), textWidth: Math.round(text.getComputedTextLength()) };
    })
  );
  check(
    'wordmark text never overflows its row (no clipping)',
    wordmarkFit.every(f => f.textWidth <= f.rowWidth + 1),
    JSON.stringify(wordmarkFit)
  );

  // the intro sequence: a settle beat, then a border trace + blueprint scrub
  // + percent counter driven off one shared progress value, landing on the
  // title and the contact card at the same instant — wait for that landing
  // before checking anything it reveals.
  const revealed = await heroRevealed(page);
  check('hero intro sequence reaches its revealed state', revealed);

  check(
    '[hero-intro] synced-completion log fired (the sync proof)',
    heroIntroLogs.some(l => l.includes('synced completion')),
    heroIntroLogs.join(' | ').slice(0, 200)
  );

  const seqEnd = await page.evaluate(() => {
    const rect = document.querySelector('.hero__border-rect');
    const counter = document.querySelector('.hero__sequence-counter');
    const video = document.querySelector('.hero__video');
    return {
      borderDashoffset: rect ? parseFloat(rect.style.strokeDashoffset) : null,
      counterText: counter?.textContent,
      videoCurrentTime: video?.currentTime,
      videoDuration: video?.duration,
      videoActive: video?.classList.contains('is-active')
    };
  });
  check('border trace fully closed (dashoffset 0) at reveal', seqEnd.borderDashoffset === 0, JSON.stringify(seqEnd));
  // Round 9 root cause: vector-effect:non-scaling-stroke combined with a
  // dashed stroke on this scaled (non 1:1) viewBox rendered as several
  // disconnected marks instead of one growing line, in this exact browser —
  // confirmed by screenshotting the live (slowed-down) animation, not just
  // this end state. Removing it fixed the rendering; stroke-width is set by
  // Hero.jsx instead, from the SVG's own live rendered size, so it still
  // reads as a constant on-screen 1.5px. Guard both halves of that fix here.
  const borderStrokeInfo = await page.evaluate(() => {
    const rect = document.querySelector('.hero__border-rect');
    const cs = getComputedStyle(rect);
    return { vectorEffect: cs.vectorEffect, strokeWidth: parseFloat(rect.style.strokeWidth) };
  });
  check(
    'border stroke does not use vector-effect:non-scaling-stroke (broke dash rendering)',
    borderStrokeInfo.vectorEffect !== 'non-scaling-stroke',
    JSON.stringify(borderStrokeInfo)
  );
  check(
    'border stroke-width is set from the SVG\'s live rendered size (constant on-screen width)',
    Number.isFinite(borderStrokeInfo.strokeWidth) && borderStrokeInfo.strokeWidth > 0,
    JSON.stringify(borderStrokeInfo)
  );
  check('percent counter reached 100 at reveal', seqEnd.counterText === '100', seqEnd.counterText);
  // Must match Hero.jsx's VIDEO_FREEZE_TIME, not videoDuration — the clip's
  // own last frame is the plain photo again (it was authored to loop), so
  // freezing there would show no blueprint at all. 2.6s is this round's
  // regenerated (widescreen) clip's own hold timing, not the previous one's.
  const VIDEO_FREEZE_TIME = 2.6;
  check(
    'blueprint clip is scrubbed to its held peak frame and frozen there, not its own last frame (which is the plain photo again)',
    seqEnd.videoActive === true && Math.abs(seqEnd.videoCurrentTime - VIDEO_FREEZE_TIME) < 0.05,
    JSON.stringify(seqEnd)
  );
  // Round 9 item 1: the clip used to be the original pre-outpaint 3:4
  // footage, sized to a narrow centred strip so it wouldn't zoom — but that
  // strip's own edges were a hard seam against the wider photo once the
  // schematic overlay was on screen. Regenerated full-width from the
  // current photo and simplified to the exact same inset:0 box as the
  // poster (no separate left/width) — guard that they now share one box.
  const videoVsPoster = await page.evaluate(() => {
    const v = document.querySelector('.hero__video').getBoundingClientRect();
    const p = document.querySelector('.hero__poster').getBoundingClientRect();
    return { video: { l: v.left, w: v.width }, poster: { l: p.left, w: p.width } };
  });
  check(
    'blueprint video fills the same box as the photo (no narrow strip, no seam against it)',
    Math.abs(videoVsPoster.video.l - videoVsPoster.poster.l) < 1 && Math.abs(videoVsPoster.video.w - videoVsPoster.poster.w) < 1,
    JSON.stringify(videoVsPoster)
  );

  // the glass contact card: tagline, a static Rig-Sense reading (not the
  // animated percentage from the previous round) and the one "Ota
  // Yhteyttä" button — no toimialue+hinta line (removed this round) and
  // nothing here repeats the old duplicated facts/lead/call-message block
  check('old duplicate hero copy block is gone', (await page.locator('.hero__facts, .hero__lead, .hero__actions, .hero__cta').count()) === 0);
  check('dim box is captioned onto the hero photo', (await page.locator('.hero__dimbox-tagline').textContent()).includes('miehistö'));
  check('area+rate line removed from the dim box', (await page.locator('.hero__dimbox-facts').count()) === 0);
  const dimboxCtaButtons = await page.locator('.hero__dimbox .btn').count();
  check('hero has exactly one compact contact button, inside the dim box', dimboxCtaButtons === 1, `count=${dimboxCtaButtons}`);
  check(
    'Rig-Sense reading is a static kN figure, not an animated percentage',
    (await page.locator('.hero__gauge-value').textContent()).includes('kN'),
    await page.locator('.hero__gauge-value').textContent()
  );

  // item 6: the Spinlock hint in the photo's bottom-left corner, with its
  // own small beam accent and a scroll-down arrow that's a real control
  check('Spinlock hint present in the hero photo', (await page.locator('.hero__spinlock-hint').textContent()).includes('Spinlock'));
  check('Spinlock hint has its own beam accent (not the border trace)', (await page.locator('.hero__spinlock-beam').count()) === 1);
  const scrollArrowVisible = await page.locator('.hero__scroll-arrow').isVisible();
  check('Spinlock hint has a scroll-down arrow', scrollArrowVisible);

  // item 4: the wordmark now spills out above the photo into empty space
  // (a sibling of .hero__media, not clipped inside it) instead of sitting
  // fully inside the card
  const titleOverlap = await page.evaluate(() => {
    const title = document.querySelector('.hero__wordmark-heading');
    const media = document.querySelector('.hero__media');
    const t = title.getBoundingClientRect();
    const m = media.getBoundingClientRect();
    return { titleTop: t.top, mediaTop: m.top, titleBottom: t.bottom, aboveAndOverlapping: t.top < m.top && t.bottom > m.top };
  });
  check('wordmark spills above the photo and overlaps down onto it', titleOverlap.aboveAndOverlapping, JSON.stringify(titleOverlap));

  // the fixed nav bar has a stable compositor layer (the fix for the
  // scroll-flicker bug), and no bottom padding on the hero keeps it flush
  // against the tab row below
  const navLayer = await page.evaluate(() => getComputedStyle(document.querySelector('.pill-nav-container')).willChange);
  check('nav bar has GPU layer promotion (scroll-flicker fix)', navLayer === 'transform', navLayer);
  const heroPadBottom = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.hero')).paddingBottom));
  check('hero has no bottom padding (tabs sit flush under it)', heroPadBottom === 0, `${heroPadBottom}px`);

  // item 4 (round 9): .hero__stage used to cap itself at max-width:64rem
  // while .hero__inner/.tabs .wrap both size off --pad/--max — narrower than
  // the tab row below it. It has no max-width of its own any more, so the
  // photo and the tab row measure the same width, and the gap between them
  // should read as flush, not a visible seam.
  const heroTabsWidth = await page.evaluate(() => {
    const media = document.querySelector('.hero__media').getBoundingClientRect();
    const tabsWrap = document.querySelector('.tabs .wrap').getBoundingClientRect();
    return { mediaLeft: media.left, mediaRight: media.right, tabsLeft: tabsWrap.left, tabsRight: tabsWrap.right, gap: tabsWrap.top - media.bottom };
  });
  check(
    'hero photo width matches the tab row width exactly',
    Math.abs(heroTabsWidth.mediaLeft - heroTabsWidth.tabsLeft) < 1 && Math.abs(heroTabsWidth.mediaRight - heroTabsWidth.tabsRight) < 1,
    JSON.stringify(heroTabsWidth)
  );
  check('gap between hero photo and tab row reads as flush, not a visible seam', heroTabsWidth.gap < 50, `${heroTabsWidth.gap.toFixed(1)}px`);

  // the hero's wave background (GradientWaves) and the framed clip, both contained in the hero card
  await page.waitForTimeout(2000);
  const waves = await page.evaluate(() => {
    const c = document.querySelector('.gradient-waves-container canvas');
    if (!c) return { present: false };
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return { present: true, w: c.width, h: c.height, lost: gl ? gl.isContextLost() : null };
  });
  check('GradientWaves canvas renders behind the hero', waves.present && waves.w > 0 && waves.lost === false, JSON.stringify(waves));

  // hero clip presence/scrub-freeze state is already covered by seqEnd above
  // (it's paused and driven by currentTime, not autoplay-"playing")
  const mediaBox = await page.evaluate(() => {
    const el = document.querySelector('.hero__media');
    const r = el?.getBoundingClientRect();
    const cs = el && getComputedStyle(el);
    return r && cs ? { w: Math.round(r.width), h: Math.round(r.height), radius: cs.borderTopLeftRadius, radiusBottom: cs.borderBottomLeftRadius } : null;
  });
  check(
    'hero media is a wide landscape card (16:9), rounded all round',
    !!mediaBox && mediaBox.w / mediaBox.h > 1.3 && mediaBox.radius !== '0px' && mediaBox.radiusBottom !== '0px',
    JSON.stringify(mediaBox)
  );

  // the outpainted photo is a real landscape source, not stretched from a
  // portrait crop — check the underlying <img>'s natural (file) dimensions
  const naturalRatio = await page.evaluate(() => {
    const img = document.querySelector('.hero__poster');
    return img ? img.naturalWidth / img.naturalHeight : null;
  });
  check('hero photo source itself is landscape (outpainted, not just cropped)', naturalRatio > 1.4, naturalRatio?.toFixed(2));

  // TracingBeam: invisible while the hero's contact card is still on
  // screen, detaches from the card's last position and reveals once it
  // scrolls out of view, then keeps following scroll further down the page
  const beamBeforeScroll = await page.evaluate(() => getComputedStyle(document.querySelector('.tracing-beam__anchor')).opacity);
  check('tracing beam is invisible while the hero contact card is still visible', Number(beamBeforeScroll) < 0.05, beamBeforeScroll);
  const borderColorAtStart = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__border-rect')).stroke);
  const beamColorAtStart = 'rgb(46, 139, 192)'; // #2e8bc0, the gradient's own start stop in TracingBeam.jsx
  check(
    'hero border and tracing beam share one colour (so the handoff reads as one beam)',
    borderColorAtStart === beamColorAtStart,
    borderColorAtStart
  );

  const boxBottom = await page.evaluate(() => document.querySelector('.hero__dimbox').getBoundingClientRect().bottom + window.scrollY);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), boxBottom + 60);
  const beamRevealed = await eventually(async () =>
    page.evaluate(() => document.querySelector('.tracing-beam__anchor')?.classList.contains('is-revealed'))
  );
  check('tracing beam reveals once the hero contact card scrolls out of view', beamRevealed);
  // .hero__border's own fade-out is a 700ms CSS transition, not instant,
  // and this sandbox's scheduling throttling (see README) means even the
  // class flip that starts it can lag — give it real margin.
  await page.waitForTimeout(1500);
  const heroBorderOpacity = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__border')).opacity);
  check(
    'hero border fades out as the tracing beam takes over, not left showing alongside it',
    Number(heroBorderOpacity) < 0.05,
    heroBorderOpacity
  );

  const beamTopAtReveal = await page.evaluate(() => document.querySelector('.tracing-beam__anchor').getBoundingClientRect().top);
  await page.evaluate(() => window.scrollBy({ top: window.innerHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  const beamTopAfterScroll = await page.evaluate(() => document.querySelector('.tracing-beam__anchor').getBoundingClientRect().top);
  check(
    'tracing beam keeps following scroll further down the page',
    beamTopAfterScroll < beamTopAtReveal - 100,
    `${beamTopAtReveal.toFixed(0)} -> ${beamTopAfterScroll.toFixed(0)}`
  );

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(150);

  // language toggle
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('EN toggle switches html lang', (await page.getAttribute('html', 'lang')) === 'en');
  check('EN hero h1 accessible name', (await page.locator('h1').getAttribute('aria-label')).includes('crew on land'));
  check('EN nav label', (await page.locator('.pill .pill-label').first().textContent()) === 'Services');
  check('EN choice persisted', (await page.evaluate(() => localStorage.getItem('userLang'))) === 'en');
  await page.getByRole('button', { name: 'FI', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('back to FI', (await page.getAttribute('html', 'lang')) === 'fi');

  // the four tabs: default, then the nav opens the ones it still links to
  check('Palvelut tab open by default', await page.locator('#tab-palvelut').getAttribute('aria-selected').then(v => v === 'true'));
  check('Palvelut panel shows the three services', (await page.locator('#panel-palvelut').textContent()).includes('Mastotyöt'));

  // Telakoille and Tehdyt työt no longer have their own nav pill — only
  // Palvelut, Ota Yhteyttä (before Meistä) and Meistä remain, no phone pill.
  const pillLabels = await page.locator('.pill-list .pill-label').allTextContents();
  check(
    'nav is Palvelut / Ota Yhteyttä / Meistä, no Telakoille or Tehdyt työt pill',
    JSON.stringify(pillLabels) === JSON.stringify(['Palvelut', 'Ota Yhteyttä', 'Meistä']),
    JSON.stringify(pillLabels)
  );
  check('phone number removed from the nav bar', (await page.locator('.pill-nav .pill-call').count()) === 0);

  await page.locator('.pill', { hasText: 'Meistä' }).click();
  const meistaTop = await scrolledNearTop(page, 'ratkaisut');
  check('"Meistä" scrolled the tabs section into view', meistaTop != null && meistaTop >= -5 && meistaTop < 200, `top=${meistaTop?.toFixed?.(0)}`);
  check('nav "Meistä" opens and scrolls to its tab', await page.locator('#tab-meista').getAttribute('aria-selected').then(v => v === 'true'));
  // the panel now crossfades in (gsap) instead of swapping instantly, so
  // give it a moment rather than asserting the text is there immediately
  check('"Meistä" panel shows its content', await panelEventuallyShows(page, 'meista', 'Isä ja poika'));

  // Telakoille / Tehdyt työt: reachable only from the on-page tab bar now
  for (const { tabId, text } of [
    { tabId: 'telakat', text: 'Tarvitsetko luotettavan' },
    { tabId: 'tyot', text: 'Referenssejä' }
  ]) {
    await page.click(`#tab-${tabId}`);
    check(`tab button "${tabId}" switches and shows its content`, await panelEventuallyShows(page, tabId, text));
  }

  // clicking a tab button directly also works, and only that tab's content is
  // mounted (we were just on "Tehdyt työt", so its portfolio grid should be
  // gone once the crossfade finishes unmounting it)
  await page.click('#tab-palvelut');
  check('clicking a tab button switches back', await panelEventuallyShows(page, 'palvelut', 'Mastotyöt'));
  const portfolioGridGone = await (async () => {
    const start = Date.now();
    while (Date.now() - start < 4000) {
      if ((await page.locator('.portfolio-grid').count()) === 0) return true;
      await page.waitForTimeout(50);
    }
    return false;
  })();
  check('switching tabs unmounts the previous panel', portfolioGridGone);
  check(
    'simplified service card has no checklist/price/crew row, one "Lue lisää" button',
    (await page.locator('.ag-panel__checks').count()) === 0 &&
      (await page.locator('.ag-panel__price').count()) === 0 &&
      (await page.locator('.ag-panel .crew').count()) === 0
  );

  // radar sweep behind the active panel — capped size, so on a tall panel
  // like this one (three cards + Rig-Sense + footer) it stays a small corner
  // accent instead of sweeping down across the card grid. The <canvas>
  // element itself always spans the whole panel (that's just its box); what
  // matters is whether it actually *draws* anything down at card height —
  // sample a pixel there and it should be fully transparent.
  check('tab panel FX canvas is present', (await page.locator('.tab-fx').count()) === 1);
  const fxPixelAtCards = await page.evaluate(() => {
    const canvas = document.querySelector('.tab-fx');
    const card = document.querySelector('.ag-panel');
    if (!canvas || !card) return null;
    const canvasRect = canvas.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = Math.round((cardRect.left + cardRect.width / 2 - canvasRect.left) * dpr);
    const y = Math.round((cardRect.top + 20 - canvasRect.top) * dpr);
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(Math.max(0, x), Math.max(0, y), 1, 1).data;
    return { alpha: data[3] };
  });
  check(
    'radar FX draws nothing down at card-grid height (does not sweep across the cards)',
    !!fxPixelAtCards && fxPixelAtCards.alpha === 0,
    JSON.stringify(fxPixelAtCards)
  );
  // Round 9 item 5: the radar canvas is one shared, ever-present element
  // behind whichever tab is active, so it was already tab-agnostic in the
  // DOM/JS sense — but on Palvelut specifically (by far the tallest panel,
  // three cards starting right under the lead paragraph) its footprint
  // used to land partly under the third card's own photo, which is opaque
  // and sits above the canvas in stacking order, so the sweep read as
  // effectively invisible there while showing clearly on the other three
  // tabs. Confirmed directly by sampling the canvas's own drawn pixels, not
  // just checking the DOM node exists. It was shrunk to clear the card row;
  // guard that a lit pixel still exists near its centre on Palvelut too.
  const radarPixelOnPalvelut = await page.evaluate(() => {
    const canvas = document.querySelector('.tab-fx');
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = Math.round((rect.width - 85) * dpr);
    const y = Math.round(50 * dpr);
    const data = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
    return { alpha: data[3] };
  });
  check(
    'radar FX actually draws a lit pixel near its centre on the (default) Palvelut tab',
    !!radarPixelOnPalvelut && radarPixelOnPalvelut.alpha > 0,
    JSON.stringify(radarPixelOnPalvelut)
  );

  // rapid re-clicking mid-transition must still land correctly, not throw
  await page.click('#tab-telakat');
  await page.click('#tab-meista');
  check('rapid tab re-click settles on the last one clicked', await panelEventuallyShows(page, 'meista', 'Isä ja poika'));
  await page.click('#tab-palvelut');
  check('back on Palvelut after the rapid-click test', await panelEventuallyShows(page, 'palvelut', 'Mastotyöt'));

  // nav scroll to contact (not a tab) — the button is now "Ota Yhteyttä"
  await page.locator('.pill', { hasText: 'Ota Yhteyttä' }).click();
  const contactTop = await scrolledNearTop(page, 'yhteystiedot');
  check('nav link scrolls to contact', contactTop != null && contactTop >= -5 && contactTop < 200, `top=${contactTop?.toFixed?.(0)}`);

  // globe
  await page.waitForTimeout(3500);
  const settled = await page.evaluate(() => document.querySelector('.globe')?.classList.contains('is-settled'));
  check('globe animation settled on Finland', !!settled);
  const pinVisible = await page.evaluate(() => Number(document.querySelector('.globe__pin--turku')?.style.opacity) > 0.9);
  check('Turku pin visible', !!pinVisible);

  // Round 10 item 4: the beam used to paint on top of real content wherever
  // its left-margin column overlapped one — most visibly the globe, which
  // deliberately spills wide into that same margin (see Location.css). A
  // paint-order bug isn't directly queryable, so this proves it two ways:
  // z-index itself (the beam must not out-rank the globe) and an actual
  // hit-test at their overlap point with the beam's pointer-events
  // temporarily forced on, which answers "what's really on top" instead of
  // inferring it from CSS values alone.
  const beamVsGlobe = await page.evaluate(() => {
    const beam = document.querySelector('.tracing-beam__anchor');
    const globe = document.querySelector('.globe');
    if (!beam || !globe) return null;
    const beamZ = Number(getComputedStyle(beam).zIndex) || 0;
    const globeZ = Number(getComputedStyle(globe).zIndex) || 0;
    const gr = globe.getBoundingClientRect();
    const br = beam.getBoundingClientRect();
    const px = (br.left + br.right) / 2;
    const py = Math.max(gr.top + 50, 100);
    const prevPE = beam.style.pointerEvents;
    beam.style.pointerEvents = 'auto';
    const hit = document.elementFromPoint(px, py);
    beam.style.pointerEvents = prevPE;
    return { beamZ, globeZ, hitIsGlobe: hit ? globe.contains(hit) || hit === globe : null, hitTag: hit?.tagName };
  });
  check(
    'tracing beam does not out-rank the globe by z-index',
    !!beamVsGlobe && beamVsGlobe.beamZ <= beamVsGlobe.globeZ,
    JSON.stringify(beamVsGlobe)
  );
  check(
    'the globe actually paints above the beam at their overlap point (hit-test, not just z-index values)',
    !!beamVsGlobe && beamVsGlobe.hitIsGlobe === true,
    JSON.stringify(beamVsGlobe)
  );

  // the B2B path: open the yards tab (from the tab bar, no nav pill any more) and pre-fill the shared form
  await page.click('#tab-telakat');
  await panelEventuallyShows(page, 'telakat', 'Tarvitsetko luotettavan');
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
  check('phone pill removed from mobile header too', (await page.locator('.pill-call').count()) === 0);

  await page.locator('.mobile-menu-button').click();
  await page.waitForTimeout(300);
  check('mobile menu opens', await page.locator('#mobile-menu').isVisible());
  check('mobile menu has no Telakoille/Tehdyt työt link', (await page.locator('.mobile-menu-link', { hasText: 'Telakoille' }).count()) === 0);
  await page.locator('.mobile-menu-link', { hasText: 'Meistä' }).click();
  const tabsTop = await scrolledNearTop(page, 'ratkaisut');
  check('mobile nav scrolled to the tabs section', tabsTop != null && tabsTop >= -5 && tabsTop < 200, `top=${tabsTop?.toFixed?.(0)}`);
  check('mobile menu closes after click', !(await page.locator('#mobile-menu').isVisible()));
  check('mobile nav opened the Meistä tab', await page.locator('#tab-meista').getAttribute('aria-selected').then(v => v === 'true'));

  await page.click('#tab-tyot');
  check('mobile: tab bar itself opens Tehdyt työt', await page.locator('#tab-tyot').getAttribute('aria-selected').then(v => v === 'true'));
  await panelEventuallyShows(page, 'tyot', 'Referenssejä');
  check('portfolio grid has photos', (await page.locator('.portfolio-grid__item').count()) >= 4);

  const mobileRevealed = await heroRevealed(page);
  check('hero intro sequence reaches revealed state on mobile', mobileRevealed);
  const vm = await page.evaluate(() => {
    const el = document.querySelector('.hero__video');
    return el ? { active: el.classList.contains('is-active'), t: el.currentTime } : { missing: true };
  });
  check('hero clip scrubbed and frozen on mobile too', vm.active === true && Math.abs(vm.t - 2.6) < 0.05, JSON.stringify(vm));

  // below the ~640px breakpoint the contact card can't overlay the photo
  // without colliding with the title (not enough vertical room in 16:9 at
  // this width) — it drops into normal flow below the photo instead
  const stackedLayout = await page.evaluate(() => {
    const stage = document.querySelector('.hero__stage');
    const media = document.querySelector('.hero__media');
    const box = document.querySelector('.hero__dimbox');
    const title = document.querySelector('.hero__wordmark-heading');
    const mediaRect = media.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    return {
      position: getComputedStyle(box).position,
      boxBelowMedia: boxRect.top >= mediaRect.bottom - 1,
      noOverlapWithTitle: boxRect.top >= titleRect.bottom - 1 || titleRect.top >= boxRect.bottom - 1,
      widthWithinStage: boxRect.width <= stage.getBoundingClientRect().width + 1
    };
  });
  check(
    'contact card stacks below the photo on mobile, not overlapping the title',
    stackedLayout.position === 'static' && stackedLayout.boxBelowMedia && stackedLayout.noOverlapWithTitle && stackedLayout.widthWithinStage,
    JSON.stringify(stackedLayout)
  );

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
