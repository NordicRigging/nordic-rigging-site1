// Offset accounts for the fixed nav bar height plus breathing room, so a
// scrolled-to section doesn't end up with its top edge hidden behind it.
const NAV_OFFSET = 96

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top, behavior: 'smooth' })
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
