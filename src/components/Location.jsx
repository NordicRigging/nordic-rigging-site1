import { lazy, Suspense } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import ContactForm from './ContactForm.jsx';
import './Location.css';

const Globe = lazy(() => import('./Globe.jsx'));

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
  </svg>
);

/**
 * Location and contact. The globe is the left column's backdrop: zoomed in
 * on the Nordics and let run off the bottom edge of the section, so it reads
 * as a horizon rather than a ball in a box. Details and the form sit beside
 * it.
 */
export default function Location() {
  const { t } = useLang();
  const l = t.location;

  return (
    <section className="section location" id="yhteystiedot" aria-labelledby="location-title">
      <div className="wrap location__grid">
        <div className="location__globe" aria-hidden="true">
          <Suspense fallback={<div className="globe globe--placeholder" />}>
            <Globe />
          </Suspense>
        </div>

        <div className="location__main">
          <div className="location__info">
            <p className="eyebrow">{l.eyebrow}</p>
            <h2 id="location-title">{l.title}</h2>
            <p className="lede">{l.body}</p>

            <dl className="contact-list">
              <div className="contact-list__row contact-list__row--hero">
                <dt>{l.phone}</dt>
                <dd>
                  <a className="contact-list__big" href={CONTACT.phoneHref}>
                    {CONTACT.phoneIntl}
                  </a>
                </dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.email}</dt>
                <dd>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.whatsapp}</dt>
                <dd>
                  <a className="btn btn--ghost contact-list__wa" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    {l.whatsappCta}
                  </a>
                </dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.address}</dt>
                <dd>
                  {CONTACT.street}
                  <br />
                  {CONTACT.postal}
                </dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.base}</dt>
                <dd>{l.baseValue}</dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.area}</dt>
                <dd>{l.areaValue}</dd>
              </div>
              <div className="contact-list__row">
                <dt>{l.businessId}</dt>
                <dd>{CONTACT.businessId}</dd>
              </div>
            </dl>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
