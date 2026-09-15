import { useEffect, useState } from 'react'

/** Tracks a media query, SSR-safe and cleaned up on unmount. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])

  return matches
}

/** True on phones and touch devices, where scrub is replaced by autoplay. */
export function useCoarsePointer() {
  return useMediaQuery('(max-width: 767px), (pointer: coarse)')
}

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
