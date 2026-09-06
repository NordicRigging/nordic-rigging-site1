import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CONTACT, LANGS } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId, scrollToTop } from '../lib/scroll.js';
import { useTabs } from '../lib/tabs.jsx';
import './Header.css';

/**
 * Top navigation. Structure and look carried over from the v2 PillNav:
 * a fixed, translucent pill bar with the logo, link pills with a colour sweep
 * on hover, the FI/EN toggle folded into the bar, and a popover menu on
 * phones. The GSAP timelines are gone; the sweep and the label swap are CSS
 * transitions. Telakoille and Tehdyt työt stay reachable from the tab bar
 * itself, not from here. The phone number lives in the hero, the tab panels
 * and the footer instead of the nav bar.
 */
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
  const { setActiveTab } = useTabs();
  const onHome = pathname === '/';
  const [open, setOpen] = useState(false);

  // Telakoille and Tehdyt työt stay reachable from the tab bar itself under
  // the hero — they just don't need their own top-nav entry. Contact comes
  // before About in the bar (asked for in this order).
  const items = [
    { key: 'services', label: t.nav.services, tab: 'palvelut' },
    { key: 'contact', label: t.nav.contact, target: 'yhteystiedot' },
    { key: 'about', label: t.nav.about, tab: 'meista' }
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

  const go = (item, e) => {
    e?.preventDefault();
    setOpen(false);
    const target = item.target || 'ratkaisut';
    if (item.tab) setActiveTab(item.tab);
    if (!onHome) {
      navigate('/', { state: { scrollTo: target, tab: item.tab } });
      return;
    }
    // let the menu close and the tab render before measuring the target
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
                <a role="menuitem" href={`/#${item.target || 'ratkaisut'}`} className="pill" onClick={e => go(item, e)}>
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
              <a href={`/#${item.target || 'ratkaisut'}`} className="mobile-menu-link" onClick={e => go(item, e)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-foot">
          <LangToggle className="pill-lang--mobile" />
        </div>
      </div>
    </div>
  );
}
