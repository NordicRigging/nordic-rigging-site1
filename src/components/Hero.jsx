import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrubVideo from './ScrubVideo'

const WORDS = ['Nordic', 'Rigging']

const letterIn = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
  show: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.3 + i * 0.045, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  }),
}

/** The wordmark tracks in a letter at a time and the tracking settles with it. */
function Wordmark() {
  let index = -1

  return (
    <motion.h1
      initial={{ letterSpacing: '0.3em' }}
      animate={{ letterSpacing: '0.012em' }}
      transition={{ duration: 1.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="display text-ice text-[clamp(3.1rem,13.2vw,14.5rem)]"
    >
      <span className="sr-only">Nordic Rigging</span>
      {WORDS.map((word) => (
        <span key={word} aria-hidden="true" className="block md:mr-[0.14em] md:inline-block">
          {[...word].map((char, i) => {
            index += 1
            return (
              <motion.span
                key={`${word}-${i}`}
                custom={index}
                variants={letterIn}
                initial="hidden"
                animate="show"
                className="inline-block"
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </motion.h1>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // Every scroll-linked transform states its value across the whole 0-1
  // timeline. Framer Motion promotes scroll-linked opacity to a compositor
  // animation, and a range that stops short leaves the tail undefined — which
  // Chromium resolves by ramping the value back up instead of holding it.
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [1, 0, 0])
  const titleY = useTransform(scrollYProgress, [0, 0.32, 1], [0, -110, -110])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.07, 1], [1, 0, 0])

  return (
    <section ref={ref} className="relative h-[320vh]" aria-label="Nordic Rigging">
      <div className="sticky top-0 h-screen overflow-hidden">
        <ScrubVideo src="/video/hero.mp4" progress={scrollYProgress} />

        {/* Vignette keeps the type off the brightest water. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_35%,rgba(4,7,11,0.6)_100%)]"
        />

        <div className="edge relative flex h-full flex-col justify-center">
          <motion.div style={{ opacity: titleOpacity, y: titleY }}>
            <Wordmark />
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-fog mt-7 max-w-xl text-base leading-relaxed sm:text-lg"
            >
              Your Sailboat&rsquo;s Best Crew on Land.
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: cueOpacity }}
          aria-hidden="true"
          className="edge absolute bottom-10 left-0 hidden md:block"
        >
          <span className="tech text-fog/40 text-[10px]">Scroll</span>
          <span className="mt-3 block h-10 w-px bg-[linear-gradient(180deg,rgba(6,182,212,0.5),transparent)]" />
        </motion.div>
      </div>
    </section>
  )
}
