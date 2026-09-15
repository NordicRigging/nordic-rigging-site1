import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useMediaQuery } from '../lib/hooks'

/** A cyan return with a ring chasing it — a contact on a radar sweep. */
export default function Cursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)')

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const spring = { stiffness: 260, damping: 28, mass: 0.7 }
  const ringX = useSpring(x, spring)
  const ringY = useSpring(y, spring)

  const [visible, setVisible] = useState(false)
  const [hot, setHot] = useState(false)

  useEffect(() => {
    if (!fine) return
    const root = document.documentElement
    root.classList.add('has-radar-cursor')

    const move = (event) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)
      // React bails out when the value is unchanged, so this does not re-render
      // on every pointer move.
      setHot(Boolean(event.target?.closest?.('a, button, [data-cursor="hot"]')))
    }
    const hide = () => setVisible(false)

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', hide)

    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', hide)
      root.classList.remove('has-radar-cursor')
    }
  }, [fine, x, y])

  if (!fine) return null

  return (
    <>
      <motion.span
        aria-hidden="true"
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed top-0 left-0 z-[70] -mt-[3px] -ml-[3px] block h-1.5 w-1.5 rounded-full bg-cyan"
      />
      <motion.span
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? (hot ? 0.9 : 0.45) : 0,
          scale: hot ? 1.45 : 1,
        }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none fixed top-0 left-0 z-[70] -mt-4 -ml-4 block h-8 w-8 rounded-full border border-cyan"
      />
    </>
  )
}
