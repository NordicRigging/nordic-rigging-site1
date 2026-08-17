import { Link, Navigate, useParams } from 'react-router-dom';

import Footer from '../components/Footer.jsx';
import { LanguageToggle } from '../components/LanguageControl.jsx';
import { CONTACT, serviceBySlug } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './ServicePage.css';

export default function ServicePage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const service = serviceBySlug(slug);

  if (!service) return <Navigate to="/" replace />;

  const s = service[lang];
  const copy = t.services;
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`${s.tag} — ${t.contact.mailSubject}`)}`;

  return (
    <main>
      <LanguageToggle />

      <section className="service-hero" style={{ background: service.fallback }}>
        <img
          className="service-hero__img"
          src={service.image}
          alt=""
          onError={e => (e.currentTarget.style.display = 'none')}
        />
        <div className="service-hero__inner">
          <Link className="service-hero__back" to="/">
            ← {copy.backHome}
          </Link>
          <p className="eyebrow">{s.tag}</p>
          <h1 className="display service-hero__title">{s.title}</h1>
          <p className="service-hero__lead">{s.lead}</p>
        </div>
      </section>

      <section className="section service-body">
        <div className="service-body__top">
          <div className="service-price">
            <span className="service-price__label">{copy.pricingTitle}</span>
            <strong className="display service-price__sum">{copy.price}</strong>
          </div>
          <a className="btn btn--solid" href={mailto}>
            {copy.ctaHeading}
          </a>
        </div>

        <h2 className="display service-section-title">{copy.processTitle}</h2>
        <ol className="service-steps">
          {s.steps.map((step, i) => (
            <li key={step.title} className="service-step">
              <span className="service-step__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="service-step__title">{step.title}</h3>
              <p className="service-step__text">{step.text}</p>
            </li>
          ))}
        </ol>

        {s.checks.length > 0 && (
          <>
            <h2 className="display service-section-title">{copy.pricingTitle}</h2>
            <ul className="service-checks">
              {s.checks.map(check => (
                <li key={check.title}>
                  <h3 className="service-check__title">{check.title}</h3>
                  <p className="service-check__text">{check.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="service-cta">
          <h2 className="display service-cta__title">{copy.ctaHeading}</h2>
          <div className="service-cta__actions">
            <a className="btn btn--solid" href={mailto}>
              {t.contact.emailButton}
            </a>
            <a className="btn" href={CONTACT.phoneHref}>
              {t.contact.callButton} · {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
