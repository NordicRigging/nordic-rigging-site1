import { useLocation, useNavigate } from 'react-router-dom';

import { CONTACT, SERVICES } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import { LangToggle } from './Header.jsx';
import './Footer.css';

export default function Footer() {
  const { t, lang } = useLang();
  const f = t.footer;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (target, e) => {
    e.preventDefault();
    if (pathname === '/') scrollToId(target);
    else navigate('/', { state: { scrollTo: target } });
  };

  const links = [
    { label: t.nav.services, target: 'palvelut' },
    { label: t.nav.rigsense, target: 'rig-sense' },
    { label: t.nav.partners, target: 'telakoille' },
    { label: t.nav.contact, target: 'yhteystiedot' }
  ];

  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <span className="footer__mark" aria-hidden="true" />
          <div>
            <strong className="footer__name">{CONTACT.company}</strong>
            <p className="footer__tagline">{f.tagline}</p>
          </div>
        </div>

        <nav className="footer__col" aria-label={f.navHeading}>
          <h3 className="footer__heading">{f.navHeading}</h3>
          <ul className="footer__list">
            {links.map(l => (
              <li key={l.target}>
                <a href={`/#${l.target}`} onClick={e => go(l.target, e)}>
                  {l.label}
                </a>
              </li>
            ))}
            {SERVICES.map(s => (
              <li key={s.slug}>
                <a href={`/palvelut/${s.slug}`} onClick={e => { e.preventDefault(); navigate(`/palvelut/${s.slug}`); }}>
                  {s[lang].name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h3 className="footer__heading">{f.contactHeading}</h3>
          <ul className="footer__list">
            <li>
              <a href={CONTACT.phoneHref}>{CONTACT.phoneIntl}</a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">{f.companyHeading}</h3>
          <ul className="footer__list">
            <li>{CONTACT.company}</li>
            <li>
              {f.businessId} {CONTACT.businessId}
            </li>
            <li>{f.area}</li>
            <li>{f.base}</li>
          </ul>
        </div>
      </div>

      <div className="wrap footer__base">
        <span>
          © {new Date().getFullYear()} {CONTACT.company}. {f.rights}
        </span>
        <LangToggle />
      </div>
    </footer>
  );
}
