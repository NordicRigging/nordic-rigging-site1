import { chromium } from 'playwright';

/**
 * Launch Chromium for the check and screenshot scripts.
 *
 * Normally this is Playwright's own browser, installed once with
 * `npx playwright install chromium`. Set CHROMIUM_PATH to a binary instead
 * when that download was skipped (CI images, sandboxes).
 */
export async function launch() {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  try {
    return await chromium.launch({ executablePath });
  } catch (err) {
    console.error(
      executablePath
        ? `Could not start Chromium at CHROMIUM_PATH (${executablePath}).`
        : 'Could not start Chromium. Run `npx playwright install chromium` once, or point CHROMIUM_PATH at a browser binary you already have.'
    );
    throw err;
  }
}

/** Keeps a scrolled-to section clear of the fixed nav bar (see NAV_OFFSET in src/lib/scroll.js). */
export const NAV_OFFSET = 88;

/** Browser context options shared by both scripts, so shots match what the checks see. */
export function contextOptions({ width = 1440, height = 900, lang = 'fi', still = false, mobile = false } = {}) {
  return {
    viewport: { width, height },
    deviceScaleFactor: 1,
    locale: lang === 'en' ? 'en-US' : 'fi-FI',
    reducedMotion: still ? 'reduce' : 'no-preference',
    ...(mobile ? { isMobile: true, hasTouch: true } : {})
  };
}

/** Pre-set the language so the page does not open its own picker mid-shot. */
export async function presetLanguage(ctx, lang) {
  await ctx.addInitScript(l => {
    try {
      localStorage.setItem('userLang', l);
    } catch {
      /* private mode */
    }
  }, lang);
}
