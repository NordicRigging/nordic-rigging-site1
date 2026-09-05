import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CONTACT, LANGS } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId, scrollToTop } from '../lib/scroll.js';
import './Header.css';

/**
 * Top navigation. Structure and look carried over from the v2 PillNav:
 * a fixed, translucent pill bar with the logo, link pills with a colour sweep
 * on hover, the FI/EN toggle folded into the bar, and a popover menu on
 * phones. The GSAP timelines are gone; the sweep and the label swap are CSS
 * transitions. New in v3: the phone number never leaves the bar.
 */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export function LangToggle({ className = '' }) {
  const { lang, changeLanguage, t } = useLang();
  return (
    <div className={`pill-lang ${className}`} role="group" aria-label={t.nav.language}>
      {LANGS.map(code => (
        <button
          key={code}
          type="button"
          className={`pill-lang__btn${code === lang ? ' is-active' : ''}`}
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
    <div className="pill-nav-container">
      <a className="skip" href="#sisalto">
        {t.skip}
      </a>
      <nav className="pill-nav" aria-label="Primary">
        <a className="pill-logo" href="/" onClick={home} aria-label={`${CONTACT.shortName}, ${t.nav.home}`}>
          <span className="pill-logo__mark" aria-hidden="true" />
          <span className="pill-logo__name">Nordic Rigging</span>
        </a>

        <div className="pill-nav-items desktop-only">
          <ul className="pill-list" role="menubar">
            {items.map(item => (
              <li key={item.key} role="none">
                <a role="menuitem" href={`/#${item.target}`} className="pill" onClick={e => go(item.target, e)}>
                  <span className="hover-circle" aria-hidden="true" />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a className="pill-call" href={CONTACT.phoneHref}>
          <PhoneIcon />
          <span className="pill-call__long">{CONTACT.phoneDisplay}</span>
          <span className="pill-call__short">{t.nav.call}</span>
        </a>

        <LangToggle className="desktop-only" />

        <button
          type="button"
          className={`mobile-menu-button mobile-only${open ? ' is-open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? t.nav.close : t.nav.menu}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div id="mobile-menu" className={`mobile-menu-popover mobile-only${open ? ' is-open' : ''}`} hidden={!open}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.key}>
              <a href={`/#${item.target}`} className="mobile-menu-link" onClick={e => go(item.target, e)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-foot">
          <a className="btn btn--accent" href={CONTACT.phoneHref}>
            <PhoneIcon />
            {t.nav.call} {CONTACT.phoneDisplay}
          </a>
          <LangToggle className="pill-lang--mobile" />
        </div>
      </div>
    </div>
  );
}
