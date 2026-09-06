import { Link, useNavigate } from 'react-router-dom';

import { CONTACT, SERVICES } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { usePrefill } from '../lib/prefill.jsx';
import { scrollToId } from '../lib/scroll.js';
import { CrewLine } from './Team.jsx';
import './Services.css';

/**
 * ServicePanel and AskButton are the shared pieces: ServicePanel (the v2
 * accordion-gallery card) is used both here and by ServicesTab, AskButton by
 * both ServicesTab and ServicePage. There is no standalone services section
 * any more — the three services live inside the "Palvelut" tab under the
 * hero (see Tabs.jsx / ServicesTab.jsx).
 */

const NEED_BY_SLUG = { mastotyot: 'mast', koysivarasto: 'rope', huolto: 'service' };

/** Button that pre-selects the need on the contact form and scrolls there. */
export function AskButton({ slug, className = 'btn', children, onHome = true }) {
  const { setPrefill } = usePrefill();
  const navigate = useNavigate();
  const onClick = e => {
    e.preventDefault();
    setPrefill({ who: 'private', needs: [NEED_BY_SLUG[slug]] });
    if (onHome) scrollToId('yhteystiedot');
    else navigate('/', { state: { scrollTo: 'yhteystiedot' } });
  };
  return (
    <a className={className} href="/#yhteystiedot" onClick={onClick}>
      {children}
    </a>
  );
}

/**
 * One service panel. The look is the v2 accordion gallery: tall photo
 * panels in a row, a dark gradient rising from the bottom, an accent bar and
 * a big title, and the row breathing as the pointer moves across it. Unlike
 * v2 nothing waits for a hover: every panel shows what the service includes,
 * the result, the price, the buttons and who does the work.
 */
export function ServicePanel({ service, index, onHome = true }) {
  const { lang, t } = useLang();
  const s = service[lang];
  const c = t.services;

  return (
    <article className="ag-panel" id={service.slug} aria-labelledby={`svc-${service.slug}`}>
      <div className="ag-panel__frame" aria-hidden="true">
        <div className="ag-panel__media">
          <img src={service.image} alt="" loading="lazy" decoding="async" width="1200" height="900" />
        </div>
        <div className="ag-panel__overlay" />
      </div>

      <div className="ag-panel__body">
        <div className="ag-panel__label">
          <span className="ag-panel__bar" />
          <div className="ag-panel__text">
            <small>
              0{index + 1} · {c.eyebrow}
            </small>
            <h3 className="ag-panel__title" id={`svc-${service.slug}`}>
              {s.name}
            </h3>
          </div>
        </div>

        <p className="ag-panel__short">{s.short}</p>

        <ul className="checks ag-panel__checks">
          {s.includes.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="ag-panel__outcome">
          <strong>{c.outcomeTitle}:</strong> {s.outcome}
        </p>

        <p className="ag-panel__price">
          <span>{c.pricingTitle}</span>
          {s.pricing}
        </p>

        <div className="ag-panel__actions">
          <AskButton slug={service.slug} className="btn btn--accent" onHome={onHome}>
            {c.askCta}
          </AskButton>
          <a className="btn btn--ghost" href={CONTACT.phoneHref}>
            {c.callCta} {CONTACT.phoneDisplay}
          </a>
          <Link className="ag-panel__more" to={`/palvelut/${service.slug}`}>
            {c.readMore} →
          </Link>
        </div>

        <CrewLine />
      </div>
    </article>
  );
}
