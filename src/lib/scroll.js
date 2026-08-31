/**
 * Smooth scrolling that cooperates with Lenis instead of fighting it.
 *
 * Native anchor jumps and `scrollIntoView` both fight a smooth-scroll library:
 * the browser sets scroll position directly while Lenis is mid-tween, and the
 * page snaps. So every nav click calls preventDefault and comes through here.
 *
 * If a Lenis instance is exposed as `window.lenis`, we hand the scroll to it.
 * Otherwise we fall back to native smooth scrolling. Wiring Lenis later needs
 * exactly one line at the point where it is created:
 *
 *     const lenis = new Lenis();
 *     window.lenis = lenis;          // <- nav picks it up automatically
 */

/** Height of the fixed navigation bar, so targets don't hide behind it. */
export const NAV_OFFSET = 76;

const getLenis = () => (typeof window !== 'undefined' ? window.lenis : null);

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll to an element by id. Returns true if the target existed. */
export function scrollToId(id, { offset = NAV_OFFSET } = {}) {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;

  const lenis = getLenis();
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(el, { offset: -offset, immediate: prefersReduced() });
    return true;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });
  return true;
}

/** Scroll back to the very top of the page. */
export function scrollToTop() {
  const lenis = getLenis();
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(0, { immediate: prefersReduced() });
    return;
  }
  window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
}
