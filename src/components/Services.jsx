import { useEffect, useState } from 'react';

import AccordionGallery from './AccordionGallery.jsx';
import { SERVICES } from '../lib/services.js';

const ITEMS = SERVICES.map(s => ({
  slug: s.slug,
  label: s.label,
  sub: s.sub,
  image: s.image,
  fallback: s.fallback,
  link: `/services/${s.slug}`,
  alt: `${s.label} — Nordic Rigging`
}));

export default function Services() {
  const [vertical, setVertical] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const onChange = e => setVertical(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="section__head">
        <p className="eyebrow">Services</p>
        <h2 className="display section__title" id="services-title">
          What we do
        </h2>
        <p className="section__lede">
          Three lines of work, one standard: your rig leaves our hands ready for weather. Open a
          panel to read more.
        </p>
      </div>
      <AccordionGallery
        items={ITEMS}
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
