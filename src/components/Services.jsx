import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import ScrubVideo from './ScrubVideo'
import AccordionGallery from './AccordionGallery'
import ScrollExpand from './ScrollExpand'
import { useLang } from '../lib/LanguageContext'

// Each kinetic word's own scroll window within the pinned section - paired
// positionally with content.js's services.kinetic (language-independent).
const WINDOWS = [
  { from: 0.04, to: 0.34 },
  { from: 0.36, to: 0.65 },
  { from: 0.67, to: 0.97 },
]

// Positionally paired with t.services.kinetic (language-independent).
const WORD_IMAGES = ['/images/services/kinetic-1.jpg', '/images/services/kinetic-2.jpg', '/images/services/kinetic-3.jpg']

/**
 * One word's own background: expands in lockstep with that word's reveal,
 * using the SAME from/hit/release/to window KineticWord already computes
 * for its text, so the two are synced by construction rather than by two
 * independently-tuned timings drifting apart.
 */
function WordBackground({ progress, from, to, src }) {
  const hit = from + 0.03
  const release = to - 0.07

  // Ranges span the full timeline — see the note in Hero.jsx.
  const expand = useTransform(progress, [0, from, hit, release, to, 1], [0, 0, 1, 1, 0, 0])

  return (
    <ScrollExpand
      progress={expand}
      src={src}
      startWidth={38}
      startHeight={38}
      startRadius={28}
      endRadius={0}
      mediaZoom={1.2}
      overlayScrim={0.55}
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}

// Paired positionally with content.js's servicePage.items (language-independent).
const SERVICE_IMAGES = {
  'mast-work': '/images/services/mast-work.jpg',
  'rope-stock': '/images/services/rope-stock.jpg',
  maintenance: '/images/services/maintenance.jpg',
}

/** One word, slammed on and taken off again inside its own scroll window. */
function KineticWord({ progress, from, to, children }) {
  const hit = from + 0.03
  const release = to - 0.07

  // Ranges span the full timeline — see the note in Hero.jsx.
  const opacity = useTransform(progress, [0, from, hit, release, to, 1], [0, 0, 1, 1, 0, 0])
  const scale = useTransform(progress, [0, from, hit, to, 1], [1.24, 1.24, 1, 0.98, 0.98])
  const blur = useTransform(progress, [0, from, hit, 1], [12, 12, 0, 0])
  const filter = useTransform(blur, (value) => `blur(${value}px)`)

  return (
    <motion.span
      style={{ opacity, scale, filter }}
      className="display text-ice absolute text-center text-[clamp(3rem,15vw,13rem)] will-change-transform"
    >
      {children}
    </motion.span>
  )
}

export default function Services() {
  const kineticRef = useRef(null)
  const { t } = useLang()
  const { scrollYProgress } = useScroll({
    target: kineticRef,
    offset: ['start start', 'end end'],
  })

  // Stacking more than one clip-path'd ScrollExpand at once breaks
  // compositing here (inactive layers' "hidden" area blocks the active
  // one's content instead of staying transparent), so only ever mount the
  // one whose window we're actually in.
  const [activeWord, setActiveWord] = useState(-1)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = WINDOWS.findIndex((w) => v >= w.from && v <= w.to)
    setActiveWord(i)
  })

  const galleryItems = Object.entries(t.servicePage.items).map(([slug, item]) => ({
    image: SERVICE_IMAGES[slug],
    label: item.name,
    link: `/services/${slug}`,
  }))

  return (
    <section id="services" className="relative">
      <div ref={kineticRef} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <ScrubVideo src="/video/archipelago.mp4" progress={scrollYProgress} />
          {activeWord >= 0 && (
            <WordBackground
              key={activeWord}
              progress={scrollYProgress}
              from={WINDOWS[activeWord].from}
              to={WINDOWS[activeWord].to}
              src={WORD_IMAGES[activeWord]}
            />
          )}
          <div className="edge relative flex h-full items-center justify-center">
            {t.services.kinetic.map((word, i) => (
              <KineticWord
                key={word}
                progress={scrollYProgress}
                from={WINDOWS[i].from}
                to={WINDOWS[i].to}
              >
                {word}
              </KineticWord>
            ))}
          </div>
        </div>
      </div>

      <div className="edge relative py-24 md:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="tech text-fog/40 mb-12 text-[10px] md:mb-16">{t.services.eyebrow}</p>
          <AccordionGallery
            items={galleryItems}
            defaultIndex={0}
            accentColor="#06b6d4"
            overlayColor="#04070b"
            textColor="#e6edf3"
            height={520}
            radius={20}
          />
        </div>
      </div>
    </section>
  )
}
