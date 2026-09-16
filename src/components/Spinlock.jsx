import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ContainerScroll } from './ContainerScroll'
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
function GaugeWindow() {
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
    <div className="relative mx-auto w-[min(78vw,17rem)] shrink-0 sm:w-[min(52vw,19rem)] lg:w-[min(34vw,24rem)]">
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
  const { t } = useLang()

  return (
    <section className="relative" aria-label="Spinlock Rig-Sense Pro">
      <ContainerScroll
        titleComponent={
          <div className="mx-auto max-w-3xl">
            <p className="tech text-cyan/70 text-[10px]">{t.spinlock.eyebrow}</p>

            <span
              aria-hidden="true"
              className="bg-slate-line mx-auto mt-8 block h-px w-24"
            />

            <h2 className="display text-ice mt-8 text-[clamp(2.5rem,7.2vw,6.2rem)]">
              {t.spinlock.title}
            </h2>

            <p className="text-fog mx-auto mt-10 max-w-xl text-base leading-relaxed sm:text-lg">
              {t.spinlock.body}
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-3 sm:gap-4">
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
          </div>
        }
      >
        <div className="flex h-full w-full items-center justify-center">
          <GaugeWindow />
        </div>
      </ContainerScroll>
    </section>
  )
}
