import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { AskButton } from '../components/Services.jsx';
import { CrewLine } from '../components/Team.jsx';
import { CONTACT, SERVICES, serviceBySlug } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './ServicePage.css';

export default function ServicePage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const service = serviceBySlug(slug);

  useEffect(() => {
    if (!service) return;
    document.title = `${service[lang].name} | ${CONTACT.shortName}`;
  }, [service, lang]);

  if (!service) return <Navigate to="/" replace />;

  const s = service[lang];
  const c = t.services;
  const others = SERVICES.filter(x => x.slug !== slug);

  return (
    <>
      <Header />
      <main id="sisalto">
        <section className="svc-hero on-dark">
          <div className="wrap svc-hero__grid">
            <div className="svc-hero__copy">
              <Link className="svc-hero__back" to="/">
                ← {c.backHome}
              </Link>
              <p className="eyebrow">{c.eyebrow}</p>
              <h1>{s.name}</h1>
              <p className="lede">{s.lead}</p>
              <div className="btn-row">
                <a className="btn btn--accent" href={CONTACT.phoneHref}>
                  {c.callCta} {CONTACT.phoneDisplay}
                </a>
                <AskButton slug={service.slug} className="btn btn--ghost" onHome={false}>
                  {c.askCta}
                </AskButton>
              </div>
            </div>
            <div className="svc-hero__media">
              <img src={service.image} alt="" fetchpriority="high" decoding="async" width="1200" height="900" />
            </div>
          </div>
        </section>

        <section className="section svc-body">
          <div className="wrap svc-body__grid">
            <div className="svc-body__main">
              <h2 className="svc-body__h">{c.includesTitle}</h2>
              <ul className="checks svc-body__checks">
                {s.includes.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className="service__outcome">
                <strong>{c.outcomeTitle}:</strong> {s.outcome}
              </p>

              <h2 className="svc-body__h">{c.processTitle}</h2>
              <ol className="steps">
                {s.process.map((step, i) => (
                  <li key={step.title} className="step">
                    <span className="step__n" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="step__title">{step.title}</h3>
                      <p className="step__text">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="svc-aside">
              <div className="svc-card">
                <span className="svc-card__label">{c.pricingTitle}</span>
                <strong className="svc-card__price">{CONTACT.hourly} / h</strong>
                <p className="svc-card__text">{s.pricing}</p>
                <div className="svc-card__actions">
                  <a className="btn btn--accent" href={CONTACT.phoneHref}>
                    {c.callCta} {CONTACT.phoneDisplay}
                  </a>
                  <a className="btn btn--ghost" href={`mailto:${CONTACT.email}`}>
                    {CONTACT.email}
                  </a>
                  <a className="btn btn--ghost" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </div>
                <CrewLine />
              </div>

              <div className="svc-others">
                <h3 className="svc-others__h">{c.otherServices}</h3>
                <ul>
                  {others.map(o => (
                    <li key={o.slug}>
                      <Link to={`/palvelut/${o.slug}`}>{o[lang].name} →</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
