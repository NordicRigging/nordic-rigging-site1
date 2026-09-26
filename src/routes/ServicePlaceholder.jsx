import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CONTACT } from '../lib/content'
import { useLang } from '../lib/LanguageContext'
import { useMediaQuery } from '../hooks/use-media-query'

const SERVICE_BACKGROUNDS = {
  'mast-work': '/images/services/mast-work-bg.jpg',
  'rope-stock': '/images/services/rope-stock-bg.jpg',
  maintenance: '/images/services/maintenance-bg.jpg',
}

const SERVICE_BACKGROUNDS_MOBILE = {
  'mast-work': '/images/services/mast-work-bg-mobile.jpg',
  'rope-stock': '/images/services/rope-stock-bg-mobile.jpg',
  maintenance: '/images/services/maintenance-bg-mobile.jpg',
}

export default function ServicePage() {
  const { slug } = useParams()
  const { t } = useLang()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const c = t.servicePage
  const s = c.items[slug]

  if (!s) return <NotFound />

  const others = Object.entries(c.items).filter(([key]) => key !== slug)
  const bg = isMobile ? SERVICE_BACKGROUNDS_MOBILE[slug] : SERVICE_BACKGROUNDS[slug]

  return (
    <main className="relative z-0 overflow-hidden py-32 md:py-40">
      {bg && (
        <>
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,16,26,0.4)_0%,rgba(6,13,21,0.55)_50%,rgba(4,9,15,0.7)_100%)]" />
        </>
      )}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="edge relative mx-auto w-full max-w-6xl"
      >
        <Link to="/" className="tech text-fog/50 hover:text-cyan text-[10px] transition-colors duration-300">
          &larr; {c.back}
        </Link>

        <p className="tech text-fog/40 mt-10 text-[10px]">{c.eyebrow}</p>
        <h1 className="display text-ice mt-4 text-[clamp(2.6rem,7vw,5.5rem)]">{s.name}</h1>
        <p className="text-fog mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">{s.lead}</p>

        <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
          <a
            href={CONTACT.phoneHref}
            className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss border px-7 py-3.5 text-[10px] transition-colors duration-400 hover:border-cyan"
          >
            {c.callCta} {CONTACT.phoneIntl}
          </a>
          <a
            href="/#contact"
            className="border-slate-line text-fog tech hover:border-fog/40 hover:text-ice border px-7 py-3.5 text-[10px] transition-colors duration-400"
          >
            {c.askCta}
          </a>
        </div>

        <div className="mt-20 grid gap-16 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <div>
            <h2 className="display-md text-ice text-[clamp(1.4rem,2.6vw,2rem)]">{c.includesTitle}</h2>
            <ul className="mt-6 space-y-3">
              {s.includes.map((item) => (
                <li key={item} className="border-slate-line text-fog/90 flex gap-3 border-b pb-3 text-sm leading-relaxed sm:text-base">
                  <span className="text-cyan mt-0.5" aria-hidden="true">
                    &bull;
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-fog/90 mt-8 text-sm leading-relaxed sm:text-base">
              <strong className="text-ice">{c.outcomeTitle}:</strong> {s.outcome}
            </p>

            <h2 className="display-md text-ice mt-16 text-[clamp(1.4rem,2.6vw,2rem)]">{c.processTitle}</h2>
            <ol className="mt-6 space-y-8">
              {s.process.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="tech text-cyan/70 text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-ice text-base font-semibold sm:text-lg">{step.title}</h3>
                    <p className="text-fog/80 mt-1.5 text-sm leading-relaxed sm:text-base">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="border-slate-line h-fit border bg-[rgba(10,24,38,0.32)] p-7">
            <span className="tech text-fog/40 text-[10px]">{c.pricingTitle}</span>
            <strong className="display-md text-ice mt-2 block text-[clamp(1.6rem,3vw,2.1rem)]">100 &euro; / h</strong>
            <p className="text-fog/80 mt-3 text-sm leading-relaxed">{s.pricing}</p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={CONTACT.phoneHref}
                className="border-cyan/50 text-ice tech hover:bg-cyan hover:text-abyss border px-5 py-3 text-center text-[10px] transition-colors duration-400 hover:border-cyan"
              >
                {c.callCta} {CONTACT.phoneIntl}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="border-slate-line text-fog tech hover:border-fog/40 hover:text-ice border px-5 py-3 text-center text-[10px] transition-colors duration-400"
              >
                {CONTACT.email}
              </a>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="border-slate-line text-fog tech hover:border-fog/40 hover:text-ice border px-5 py-3 text-center text-[10px] transition-colors duration-400"
              >
                WhatsApp
              </a>
            </div>

            <div className="border-slate-line mt-10 border-t pt-6">
              <h3 className="tech text-fog/40 text-[10px]">{c.otherServices}</h3>
              <ul className="mt-4 space-y-3">
                {others.map(([key, item]) => (
                  <li key={key}>
                    <Link to={`/services/${key}`} className="text-ice hover:text-cyan text-sm transition-colors duration-300">
                      {item.name} &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </motion.div>
    </main>
  )
}

function NotFound() {
  const { t } = useLang()
  const c = t.servicePage
  return (
    <main className="edge flex min-h-screen flex-col justify-center py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-4xl"
      >
        <p className="tech text-fog/40 text-[10px]">{c.notFoundEyebrow}</p>
        <h1 className="display text-ice mt-8 text-[clamp(2.6rem,9vw,7rem)]">{c.notFoundTitle}</h1>
        <p className="text-fog mt-10 max-w-md text-base leading-relaxed">{c.notFoundBody}</p>
        <Link to="/" className="tech text-fog/50 hover:text-cyan mt-14 inline-block text-[10px] transition-colors duration-300">
          &larr; {c.back}
        </Link>
      </motion.div>
    </main>
  )
}
