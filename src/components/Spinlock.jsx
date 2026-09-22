import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { Card } from './ContainerScroll'
import { useLang } from '../lib/LanguageContext'

const TILT_RANGE = 22 // degrees at the window's own edge

/**
 * The gauge photo (462x1600, near-white background already cut out) is much
 * taller than the window it sits in - centered and scaled to the window's
 * width, its top and bottom run past the window's edges and disappear behind
 * them, rather than the whole device floating free in open space. The window
 * itself never rotates, only the photo inside it, so the bezel reads as a
 * fixed porthole onto an instrument that tilts to face the visitor's own
 * cursor rather than spinning on its own - springs back to resting flat once
 * the pointer leaves.
 */
function GaugeWindow({ className = '' }) {
  const boxRef = useRef(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 220, damping: 22, mass: 0.6 }
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-TILT_RANGE, TILT_RANGE]), spring)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [TILT_RANGE * 0.6, -TILT_RANGE * 0.6]), spring)

  const onPointerMove = (event) => {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }
  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      className={`relative w-[min(68vw,15rem)] shrink-0 sm:w-[min(34vw,17rem)] lg:w-[min(20vw,19rem)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[2.25rem] bg-[linear-gradient(155deg,rgba(154,201,245,0.22),rgba(6,182,212,0.05)_40%,rgba(4,7,11,0.4)_100%)] blur-[2px]"
      />
      <div
        ref={boxRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="border-slate-line/80 shadow-[0_30px_70px_rgba(3,9,20,0.65)] relative aspect-[3/4] overflow-hidden rounded-[2rem] border bg-[radial-gradient(120%_120%_at_30%_10%,#12314a_0%,#0a1826_55%,#050c13_100%)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(230,237,243,0.14),inset_0_18px_40px_rgba(0,0,0,0.55),inset_0_-18px_40px_rgba(0,0,0,0.55)]"
        />
        <span
          aria-hidden="true"
          className="bg-cyan/50 absolute top-0 left-0 z-20 h-px w-full"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:1400px]">
          <motion.div
            style={{ rotateY, rotateX }}
            className="relative h-[142%] w-[78%] [transform-style:preserve-3d]"
          >
            <img
              src="/images/rig-sense.webp"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover brightness-90 contrast-[1.08] saturate-[0.82]"
            />
            <div
              aria-hidden="true"
              className="bg-navy-900 absolute inset-0 mix-blend-color opacity-45"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.16)_0%,transparent_28%,transparent_72%,rgba(255,255,255,0.08)_100%)] mix-blend-overlay"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function Spinlock() {
  const ref = useRef(null)
  const { t } = useLang()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // Entry = tilted/closed, fully scrolled through = flat/open - the device
  // is a receded background element, not the focal point, so it settles
  // rather than dominating.
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  // Card itself is sized for a foreground hero (max-w-5xl, h-40rem) - scaled
  // way down since here it's a receded backdrop, not the focal point.
  const scale = useTransform(scrollYProgress, [0, 1], [0.58, 0.55])

  // Ranges span the full timeline — see the note in Hero.jsx.
  const opacity = useTransform(scrollYProgress, [0, 0.06, 0.22, 0.82, 0.96, 1], [0, 0, 1, 1, 0, 0])
  const y = useTransform(scrollYProgress, [0, 0.06, 0.22, 1], [40, 40, 0, 0])
  const ruleScale = useTransform(scrollYProgress, [0, 0.14, 0.4, 1], [0, 0, 1, 1])

  return (
    <section ref={ref} className="relative h-[230vh]" aria-label="Spinlock Rig-Sense Pro">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* iPad: a receded background element, left of center, behind
            everything else - not the focal point, just a moody 3D presence.
            Sits off-center within a full-width perspective context so it
            reads as angled toward the middle rather than front-on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 hidden sm:block [perspective:1600px]"
        >
          {/* preserve-3d has to carry all the way from the perspective div to
              Card's own rotateX - an extra plain (flat) wrapper in between
              flattens the 3D context, which is what was collapsing the tilt
              to a flat rotation and letting the layer's clip go wrong. */}
          <div
            style={{ transformStyle: 'preserve-3d' }}
            className="absolute top-0 left-0 flex h-full w-[58%] items-center justify-center opacity-30"
          >
            <Card rotate={rotate} scale={scale}>
              {null}
            </Card>
          </div>
        </div>

        <div className="edge relative z-10 flex h-full items-center">
          <motion.div style={{ opacity, y }} className="mx-auto max-w-4xl">
            <p className="tech text-cyan/70 text-[10px]">{t.spinlock.eyebrow}</p>

            <motion.span
              aria-hidden="true"
              style={{ scaleX: ruleScale }}
              className="bg-slate-line mt-8 block h-px w-24 origin-left"
            />

            <h2 className="display text-ice mt-6 text-[clamp(2.2rem,5.6vw,4.6rem)]">
              {t.spinlock.title}
            </h2>

            <div className="mt-8 flex flex-wrap items-center gap-8 sm:gap-10">
              <p className="text-fog max-w-xs text-base leading-relaxed sm:text-lg">
                {t.spinlock.body}
              </p>
              <GaugeWindow className="ml-auto" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              {/* Placeholder destinations — swap for the real URLs. */}
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss border px-7 py-3.5 text-[10px] transition-colors duration-400 hover:border-cyan"
              >
                {t.spinlock.readMore}
              </a>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="border-slate-line text-fog tech hover:border-fog/40 hover:text-ice border px-7 py-3.5 text-[10px] transition-colors duration-400"
              >
                {t.spinlock.watchVideo}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
