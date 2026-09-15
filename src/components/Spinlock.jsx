import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrubVideo from './ScrubVideo'

export default function Spinlock() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // Ranges span the full timeline — see the note in Hero.jsx.
  const opacity = useTransform(scrollYProgress, [0, 0.04, 0.2, 0.82, 0.96, 1], [0, 0, 1, 1, 0, 0])
  const y = useTransform(scrollYProgress, [0, 0.04, 0.2, 1], [40, 40, 0, 0])
  const ruleScale = useTransform(scrollYProgress, [0, 0.12, 0.4, 1], [0, 0, 1, 1])

  return (
    <section ref={ref} className="relative h-[300vh]" aria-label="Spinlock Rig-Sense Pro">
      <div className="sticky top-0 h-screen overflow-hidden">
        <ScrubVideo src="/video/craft.mp4" progress={scrollYProgress} grade="heavy" />

        <div className="edge relative flex h-full items-center">
          <motion.div style={{ opacity, y }} className="max-w-3xl">
            <p className="tech text-cyan/70 text-[10px]">Measured, not estimated</p>

            <motion.span
              aria-hidden="true"
              style={{ scaleX: ruleScale }}
              className="bg-slate-line mt-8 block h-px w-24 origin-left"
            />

            <h2 className="display text-ice mt-8 text-[clamp(2.5rem,7.2vw,6.2rem)]">
              Spinlock Rig-Sense Pro
            </h2>

            <p className="text-fog mt-10 max-w-xl text-base leading-relaxed sm:text-lg">
              We measure rig tension to the newton instead of estimating it by feel.
            </p>

            <div className="mt-12 flex flex-wrap gap-3 sm:gap-4">
              {/* Placeholder destinations — swap for the real URLs. */}
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss border px-7 py-3.5 text-[10px] transition-colors duration-400 hover:border-cyan"
              >
                Read more
              </a>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="border-slate-line text-fog tech hover:border-fog/40 hover:text-ice border px-7 py-3.5 text-[10px] transition-colors duration-400"
              >
                Watch video
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
