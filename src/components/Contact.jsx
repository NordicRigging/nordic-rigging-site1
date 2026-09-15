import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Globe from './Globe'
import { CONTACT } from '../lib/content'
import { useLang } from '../lib/LanguageContext'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
  </svg>
)

export default function Contact() {
  const { t } = useLang()
  const [who, setWho] = useState('private')
  const [active, setActive] = useState('call')
  const sectionRef = useRef(null)

  // Was ['start end', 'start 0.4'] - only ~0.6 of a viewport height of
  // scroll, over almost instantly at normal scroll speed. Stretched to
  // ~0.95 of a viewport height so the zoom actually reads as motion.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 0.05'],
  })
  const globeProgress = useTransform(scrollYProgress, [0, 1], [0, 1])

  const subject = who === 'yard' ? t.contact.subjectYard : t.contact.subjectPrivate
  const body = who === 'yard' ? t.contact.bodyYard : t.contact.bodyPrivate

  const channels = useMemo(
    () => [
      {
        id: 'call',
        label: t.contact.channels.call.label,
        value: CONTACT.phoneIntl,
        href: CONTACT.phoneHref,
        action: t.contact.channels.call.action,
        cta: t.contact.channels.call.cta,
        external: false,
      },
      {
        id: 'email',
        label: t.contact.channels.email.label,
        value: CONTACT.email,
        href: `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        action: t.contact.channels.email.action,
        cta: t.contact.channels.email.cta,
        external: false,
      },
      {
        id: 'whatsapp',
        label: t.contact.channels.whatsapp.label,
        value: CONTACT.phoneIntl,
        href: `${CONTACT.whatsapp}?text=${encodeURIComponent(who === 'yard' ? t.contact.waYard : t.contact.waPrivate)}`,
        action: t.contact.channels.whatsapp.action,
        cta: t.contact.channels.whatsapp.cta,
        external: true,
      },
    ],
    [t, who, subject, body]
  )

  const channel = channels.find((item) => item.id === active) ?? channels[0]

  return (
    <section ref={sectionRef} id="contact" className="edge relative pt-16 pb-28 md:pt-24 md:pb-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[170%] max-w-[76rem] -translate-x-1/2 -translate-y-1/2 opacity-60 sm:left-0 sm:w-[80rem] sm:-translate-x-[28%] sm:-translate-y-[54%] sm:opacity-80 lg:w-[104rem] lg:-translate-x-[24%]"
      >
        <Globe progress={globeProgress} />
      </div>

      {/* Readability scrim: the globe is meant to read as a bold backdrop, but
          the text sitting over it (headings, legend, tab labels) has no
          background of its own to mask pin labels/graticule lines showing
          through - fades in from the left, where the globe should stay
          clearest, to fully opaque under the text column. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(90deg,transparent_0%,rgba(4,7,11,0.55)_38%,rgba(4,7,11,0.86)_60%,rgba(4,7,11,0.86)_100%)] sm:bg-[linear-gradient(90deg,transparent_0%,rgba(4,7,11,0.15)_22%,rgba(4,7,11,0.82)_46%,rgba(4,7,11,0.9)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="display text-ice text-[clamp(2.2rem,6vw,4.4rem)]">{t.contact.title}</h2>

        <fieldset className="mt-10 md:mt-14">
          <legend className="tech text-fog/40 text-[10px]">{t.contact.who.legend}</legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {['private', 'yard'].map((id) => {
              const selected = who === id
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setWho(id)}
                  className={`tech border px-5 py-2.5 text-[10px] transition-colors duration-300 ${
                    selected
                      ? 'border-cyan/60 text-ice bg-cyan/10'
                      : 'border-slate-line text-fog/55 hover:border-fog/40 hover:text-fog/85'
                  }`}
                >
                  {t.contact.who[id]}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div role="tablist" aria-label={t.contact.title} className="mt-10 flex gap-8 md:mt-12">
          {channels.map((item) => {
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
                className="display-md text-ice hover:text-cyan inline-flex items-center gap-4 text-[clamp(1.6rem,4.4vw,3rem)] transition-colors duration-300"
              >
                {channel.id === 'whatsapp' && <span className="h-[0.7em] w-[0.7em]"><WhatsAppIcon /></span>}
                {channel.value}
              </a>
              <p className="tech text-fog/40 mt-5 text-[10px]">{channel.action}</p>
              <a
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss mt-7 inline-block border px-7 py-3.5 text-[10px] transition-colors duration-400 hover:border-cyan"
              >
                {channel.cta}
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        <address className="text-fog/70 mt-16 text-sm leading-relaxed not-italic md:mt-24">
          {CONTACT.street}
          <br />
          {CONTACT.postal}
        </address>
      </div>
    </section>
  )
}
