import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrubVideo from './ScrubVideo'
import AccordionGallery from './AccordionGallery'
import { useLang } from '../lib/LanguageContext'

// Each kinetic word's own scroll window within the pinned section - paired
// positionally with content.js's services.kinetic (language-independent).
const WINDOWS = [
  { from: 0.04, to: 0.34 },
  { from: 0.36, to: 0.65 },
  { from: 0.67, to: 0.97 },
]

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
