/** Height of the sticky header, so a targeted section is not hidden under it. */
export const NAV_OFFSET = 84;

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll to an element by id. Returns true if the target existed. */
export function scrollToId(id, { offset = NAV_OFFSET } = {}) {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced() ? 'auto' : 'smooth' });
  return true;
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
}
