import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CONTACT, LANGS } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId, scrollToTop } from '../lib/scroll.js';
import './Header.css';

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export function LangToggle({ className = '' }) {
  const { lang, changeLanguage, t } = useLang();
  return (
    <div className={`lang ${className}`} role="group" aria-label={t.nav.language}>
      {LANGS.map(code => (
        <button
          key={code}
          type="button"
          className={`lang__btn${code === lang ? ' is-active' : ''}`}
          onClick={() => changeLanguage(code)}
          aria-pressed={code === lang}
          lang={code}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const [open, setOpen] = useState(false);

  const items = [
    { key: 'services', label: t.nav.services, target: 'palvelut' },
    { key: 'rigsense', label: t.nav.rigsense, target: 'rig-sense' },
    { key: 'partners', label: t.nav.partners, target: 'telakoille' },
    { key: 'contact', label: t.nav.contact, target: 'yhteystiedot' }
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (target, e) => {
    e?.preventDefault();
    setOpen(false);
    if (!onHome) {
      navigate('/', { state: { scrollTo: target } });
      return;
    }
    // let the menu close and the layout settle before measuring the target
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(target)));
  };

  const home = e => {
    e?.preventDefault();
    setOpen(false);
    if (onHome) scrollToTop();
    else navigate('/');
  };

  return (
    <header className="header">
      <a className="skip" href="#sisalto">
        {t.skip}
      </a>
      <div className="header__bar wrap">
        <a className="brand" href="/" onClick={home} aria-label={`${CONTACT.shortName}, ${t.nav.home}`}>
          <img className="brand__mark" src="/images/logo.svg" alt="" width="64" height="48" />
          <span className="brand__name">
            Nordic
            <br />
            Rigging
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          <ul className="nav__list">
            {items.map(item => (
              <li key={item.key}>
                <a className="nav__link" href={`/#${item.target}`} onClick={e => go(item.target, e)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <a className="btn btn--accent header__call" href={CONTACT.phoneHref}>
            <PhoneIcon />
            <span className="header__call-text">{CONTACT.phoneDisplay}</span>
            <span className="header__call-short">{t.nav.call}</span>
          </a>
          <LangToggle className="header__lang" />
          <button
            type="button"
            className={`burger${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen(v => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile" hidden={!open}>
        <ul className="mobile__list">
          {items.map(item => (
            <li key={item.key}>
              <a className="mobile__link" href={`/#${item.target}`} onClick={e => go(item.target, e)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile__foot">
          <a className="btn btn--accent" href={CONTACT.phoneHref}>
            <PhoneIcon />
            {t.nav.call} {CONTACT.phoneDisplay}
          </a>
          <LangToggle className="lang--big" />
        </div>
      </div>
    </header>
  );
}
