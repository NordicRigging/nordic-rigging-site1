import { useState } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './Contact.css';

const TABS = ['call', 'email', 'whatsapp'];

export default function Contact() {
  const { t } = useLang();
  const c = t.contact;
  const [tab, setTab] = useState('call');

  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(c.mailSubject)}`;

  const panels = {
    call: {
      label: c.callLabel,
      value: CONTACT.phoneDisplay,
      href: CONTACT.phoneHref,
      button: c.callButton,
      external: false
    },
    email: {
      label: c.emailLabel,
      value: CONTACT.email,
      href: mailto,
      button: c.emailButton,
      external: false
    },
    whatsapp: {
      label: c.whatsappLabel,
      value: CONTACT.phoneDisplay,
      note: c.whatsappValue,
      href: CONTACT.whatsapp,
      button: c.whatsappButton,
      external: true
    }
  };

  const active = panels[tab];

  const onKeyDown = e => {
    const i = TABS.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setTab(TABS[(i + 1) % TABS.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setTab(TABS[(i - 1 + TABS.length) % TABS.length]);
    }
  };

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="section__head">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 className="display section__title" id="contact-title">
          {c.heading}
        </h2>
        <p className="section__lede">{c.lede}</p>
      </div>

      <div className="contact__card">
        <div className="contact__tabs" role="tablist" aria-label={c.eyebrow} onKeyDown={onKeyDown}>
          {TABS.map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`contact-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`contact-panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              className={`contact__tab${tab === key ? ' contact__tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {c.tabs[key]}
            </button>
          ))}
        </div>

        <div
          className="contact__panel"
          role="tabpanel"
          id={`contact-panel-${tab}`}
          aria-labelledby={`contact-tab-${tab}`}
        >
          <div className="contact__detail">
            <span className="contact__detail-label">{active.label}</span>
            <a
              className="display contact__detail-value"
              href={active.href}
              {...(active.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {active.value}
            </a>
            {active.note && <span className="contact__detail-note">{active.note}</span>}
          </div>

          <a
            className={`btn btn--solid contact__action${tab === 'whatsapp' ? ' contact__action--whatsapp' : ''}`}
            href={active.href}
            {...(active.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {active.button}
          </a>
        </div>
      </div>

      <dl className="contact__meta">
        <div>
          <dt>{c.addressLabel}</dt>
          <dd>{CONTACT.address}</dd>
        </div>
        <div>
          <dt>{c.areaLabel}</dt>
          <dd>{c.area}</dd>
        </div>
        <div>
          <dt>{c.emailLabel}</dt>
          <dd>
            <a href={mailto}>{CONTACT.email}</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
