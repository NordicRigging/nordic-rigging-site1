import { useEffect, useMemo, useState } from 'react';

import AccordionGallery from './AccordionGallery.jsx';
import { SERVICES } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';

export default function Services() {
  const { lang, t } = useLang();
  const [vertical, setVertical] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const onChange = e => setVertical(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const items = useMemo(
    () =>
      SERVICES.map((s, i) => ({
        slug: s.slug,
        label: s[lang].tag,
        sub: `0${i + 1} · ${s[lang].title}`,
        image: s.image,
        fallback: s.fallback,
        link: `/services/${s.slug}`,
        cta: t.services.readMore,
        alt: `${s[lang].tag} — Nordic Rigging`
      })),
    [lang, t.services.readMore]
  );

  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="section__head">
        <p className="eyebrow">{t.services.eyebrow}</p>
        <h2 className="display section__title" id="services-title">
          {t.services.title}
        </h2>
        <p className="section__lede">{t.services.lede}</p>
      </div>
      <AccordionGallery
        key={lang}
        items={items}
        defaultIndex={0}
        orientation={vertical ? 'vertical' : 'horizontal'}
        height={vertical ? 340 : 500}
        gap={12}
        radius={18}
        expandRatio={0.55}
        tilt={6}
        accentColor="var(--accent)"
        overlayColor="#06090d"
        textColor="var(--fog)"
      />
    </section>
  );
}
