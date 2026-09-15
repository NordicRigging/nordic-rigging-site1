import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import ScrubVideo from './ScrubVideo'

const WORDS = [
  { text: 'Measured', from: 0.04, to: 0.34 },
  { text: 'Tuned', from: 0.36, to: 0.65 },
  { text: 'Trusted', from: 0.67, to: 0.97 },
]

const CARDS = [
  {
    title: 'Mast Work',
    copy: 'Professional rigging and mast services',
    to: '/services/mast-work',
  },
  {
    title: 'Rope Stock',
    copy: 'High-quality rope and splicing',
    to: '/services/rope-stock',
  },
  {
    title: 'Maintenance',
    copy: 'Seasonal service and docking',
    to: '/services/maintenance',
  },
]

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

function Card({ title, copy, to }) {
  return (
    <Link
      to={to}
      className="group border-slate-line relative flex min-w-[80%] snap-start flex-col justify-between border bg-[rgba(10,24,38,0.32)] p-7 transition-[transform,border-color,background-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-cyan/40 hover:bg-[rgba(10,24,38,0.55)] md:min-w-0 md:p-9"
    >
      <span
        aria-hidden="true"
        className="bg-cyan absolute top-0 left-0 h-px w-0 transition-[width] duration-500 ease-out group-hover:w-full"
      />
      <h3 className="display-md text-ice text-[clamp(1.5rem,2.6vw,2.1rem)]">{title}</h3>
      <p className="text-fog/80 mt-14 text-sm leading-relaxed md:mt-20">{copy}</p>
      <span className="tech text-fog/35 group-hover:text-cyan mt-7 text-[10px] transition-colors duration-500">
        View
      </span>
    </Link>
  )
}

export default function Services() {
  const kineticRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: kineticRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section id="services" className="relative">
      <div ref={kineticRef} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <ScrubVideo src="/video/archipelago.mp4" progress={scrollYProgress} />
          <div className="edge relative flex h-full items-center justify-center">
            {WORDS.map((word) => (
              <KineticWord
                key={word.text}
                progress={scrollYProgress}
                from={word.from}
                to={word.to}
              >
                {word.text}
              </KineticWord>
            ))}
          </div>
        </div>
      </div>

      <div className="edge relative py-24 md:py-36">
        <div className="mx-auto max-w-6xl">
          <p className="tech text-fog/40 mb-12 text-[10px] md:mb-16">Services</p>
          {/* Swipeable on phones, a fixed grid from md up. */}
          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {CARDS.map((card) => (
              <Card key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
