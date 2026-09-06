import { CONTACT, SERVICES } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { usePrefill } from '../lib/prefill.jsx';
import { scrollToId } from '../lib/scroll.js';
import { ServicePanel } from './Services.jsx';
import RigSenseHighlight from './RigSenseHighlight.jsx';
import './ServicesTab.css';

/**
 * Tab 1, the default. All three services (reusing the v2-styled photo
 * cards), the Spinlock Rig-Sense Pro as its own highlighted paragraph,
 * the pricing principle, service area, and a way to get in touch — all
 * visible at once, nothing further to click to see it.
 */
export default function ServicesTab() {
  const { t } = useLang();
  const c = t.services;
  const st = t.servicesTab;
  const loc = t.location;
  const { setPrefill } = usePrefill();

  const toContact = e => {
    e.preventDefault();
    setPrefill({ who: 'private' });
    scrollToId('yhteystiedot');
  };

  return (
    <div className="services-tab">
      <p className="lede services-tab__lede">{c.lede}</p>

      <div className="accordion-gallery accordion-gallery--tab">
        {SERVICES.map((service, i) => (
          <ServicePanel key={service.slug} service={service} index={i} />
        ))}
      </div>

      <RigSenseHighlight />

      <div className="services-tab__foot">
        <div className="services-tab__fact">
          <span>{st.priceLabel}</span>
          <strong>{st.priceNote}</strong>
        </div>
        <div className="services-tab__fact">
          <span>{st.areaLabel}</span>
          <strong>{loc.areaValue}</strong>
        </div>
        <div className="btn-row services-tab__actions">
          <a className="btn btn--accent" href="/#yhteystiedot" onClick={toContact}>
            {st.contactCta}
          </a>
          <a className="btn btn--ghost" href={CONTACT.phoneHref}>
            {c.callCta} {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
