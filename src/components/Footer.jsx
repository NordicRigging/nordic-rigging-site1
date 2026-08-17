import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <h3 className="display footer__name">{CONTACT.company}</h3>
          <p className="footer__tagline">{f.tagline}</p>
        </div>

        <nav className="footer__col" aria-label={f.navHeading}>
          <h4 className="footer__heading">{f.navHeading}</h4>
          <ul className="footer__list">
            {f.nav.map(item => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h4 className="footer__heading">{f.contactHeading}</h4>
          <ul className="footer__list">
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
            </li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{f.detailsHeading}</h4>
          <ul className="footer__list">
            <li>{CONTACT.company}</li>
            <li>
              {f.businessIdLabel}: {CONTACT.businessId}
            </li>
            <li>{t.contact.area}</li>
          </ul>
        </div>
      </div>

      <div className="footer__base">
        <span>
          © {new Date().getFullYear()} {CONTACT.company}
        </span>
        <span>{f.rights}</span>
      </div>
    </footer>
  );
}
