import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'

/**
 * Lenis drives the real window scroll position, so framer-motion's useScroll
 * and native position:sticky both keep working untouched.
 */
export default function SmoothScroll({ children }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
    })

    let raf = 0
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [reduced])

  return children
}
