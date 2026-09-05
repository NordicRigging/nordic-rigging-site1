import { Link, useNavigate } from 'react-router-dom';

import { CONTACT, SERVICES } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { usePrefill } from '../lib/prefill.jsx';
import { scrollToId } from '../lib/scroll.js';
import Team, { CrewLine } from './Team.jsx';
import './Services.css';

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

export function ServiceBlock({ service, index, onHome = true }) {
  const { lang, t } = useLang();
  const s = service[lang];
  const c = t.services;
  const num = String(index + 1).padStart(2, '0');

  return (
    <article className={`service${index % 2 ? ' service--flip' : ''}`} id={service.slug} aria-labelledby={`svc-${service.slug}`}>
      <div className="service__media">
        <img src={service.image} alt="" loading="lazy" decoding="async" width="1200" height="900" />
        <span className="service__num" aria-hidden="true">
          {num}
        </span>
      </div>

      <div className="service__body">
        <h3 className="service__title" id={`svc-${service.slug}`}>
          {s.name}
        </h3>
        <p className="service__short">{s.short}</p>

        <h4 className="service__sub">{c.includesTitle}</h4>
        <ul className="checks">
          {s.includes.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <p className="service__outcome">
          <strong>{c.outcomeTitle}:</strong> {s.outcome}
        </p>

        <p className="service__price">
          <span className="service__price-label">{c.pricingTitle}</span>
          {s.pricing}
        </p>

        <div className="btn-row service__actions">
          <AskButton slug={service.slug} className="btn btn--accent" onHome={onHome}>
            {c.askCta}
          </AskButton>
          <a className="btn btn--ghost" href={CONTACT.phoneHref}>
            {c.callCta} {CONTACT.phoneDisplay}
          </a>
          <Link className="service__more" to={`/palvelut/${service.slug}`}>
            {c.readMore} →
          </Link>
        </div>

        <CrewLine />
      </div>
    </article>
  );
}

export default function Services() {
  const { t } = useLang();
  const c = t.services;

  return (
    <section className="section services" id="palvelut" aria-labelledby="services-title">
      <div className="wrap">
        <div className="services__head">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 id="services-title">{c.title}</h2>
          <p className="lede">{c.lede}</p>
        </div>

        <div className="services__list">
          {SERVICES.map((service, i) => (
            <ServiceBlock key={service.slug} service={service} index={i} />
          ))}
        </div>

        <div className="services__team">
          <Team />
        </div>
      </div>
    </section>
  );
}
