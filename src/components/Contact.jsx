import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHANNELS = [
  {
    id: 'call',
    label: 'Call',
    value: '+358 50 548 7766',
    href: 'tel:+358505487766',
    action: 'Direct line',
    external: false,
  },
  {
    id: 'email',
    label: 'Email',
    value: 'sales@nordicrigging.fi',
    href: 'mailto:sales@nordicrigging.fi',
    action: 'Sales and service',
    external: false,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: '+358 50 548 7766',
    href: 'https://wa.me/358505487766',
    action: 'Message',
    external: true,
  },
]

export default function Contact() {
  const [active, setActive] = useState('call')
  const channel = CHANNELS.find((item) => item.id === active) ?? CHANNELS[0]

  return (
    <section id="contact" className="edge relative pt-16 pb-28 md:pt-24 md:pb-40">
      <div className="mx-auto max-w-4xl">
        <h2 className="display text-ice text-[clamp(2.2rem,6vw,4.4rem)]">Contact</h2>

        <div role="tablist" aria-label="Contact method" className="mt-14 flex gap-8 md:mt-20">
          {CHANNELS.map((item) => {
            const selected = item.id === active
            return (
              <button
                key={item.id}
                role="tab"
                type="button"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls="contact-panel"
                onClick={() => setActive(item.id)}
                className={`tech relative -mb-px pb-4 text-[10px] transition-colors duration-300 ${
                  selected ? 'text-ice' : 'text-fog/45 hover:text-fog/80'
                }`}
              >
                {item.label}
                {selected && (
                  <motion.span
                    layoutId="contact-tab"
                    className="bg-cyan absolute inset-x-0 bottom-0 h-px"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <div className="rule" />

        <div
          role="tabpanel"
          id="contact-panel"
          aria-labelledby={`tab-${channel.id}`}
          className="min-h-[9rem] pt-10 md:min-h-[11rem] md:pt-14"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <a
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="display-md text-ice hover:text-cyan inline-block text-[clamp(1.6rem,4.4vw,3rem)] transition-colors duration-300"
              >
                {channel.value}
              </a>
              <p className="tech text-fog/40 mt-5 text-[10px]">{channel.action}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <address className="text-fog/70 mt-16 text-sm leading-relaxed not-italic md:mt-24">
          Itäinen Rantakatu 74
          <br />
          20810 Turku
        </address>
      </div>
    </section>
  )
}
