import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

import { useLang } from '../lib/LanguageContext.jsx';
import { LANGS } from '../lib/content.js';
import { scrollToId, scrollToTop } from '../lib/scroll.js';
import './PillNav.css';

/**
 * Top navigation. Adapted from the supplied PillNav:
 *  - fixed to the top of the viewport rather than the bottom
 *  - translucent + backdrop-blurred so it stays legible over the film
 *  - the logo scrolls to the top instead of following items[0].href
 *  - items are scroll targets, routed through the Lenis-aware helper so a
 *    native anchor jump can never fight the smooth scroll
 *  - the FI/EN toggle lives inside the bar
 */
const PillNav = ({ ease = 'power3.easeOut', initialLoadAnimation = true }) => {
  const { t, lang, changeLanguage } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  const items = [
    { key: 'services', label: t.nav.services, target: 'services' },
    { key: 'projects', label: t.nav.projects, target: 'projects' },
    { key: 'contact', label: t.nav.contact, target: 'contact' }
  ];

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (!w || !h) return;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector('.pill-label');
        const hover = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0 });

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;
      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, { scale: 1, duration: 0.6, ease });
      }
      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [ease, initialLoadAnimation, lang]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: 'auto' });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.6, ease, overwrite: 'auto' });
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) toggleMobileMenu();
  };

  /** Sections live on the home page; from a service page, go there first. */
  const goToSection = (target, e) => {
    e?.preventDefault();
    closeMobileMenu();
    if (!target) return; // Projects: nowhere to go yet
    if (onHome) {
      scrollToId(target);
    } else {
      navigate('/', { state: { scrollTo: target } });
    }
  };

  const goHome = e => {
    e?.preventDefault();
    closeMobileMenu();
    if (onHome) scrollToTop();
    else navigate('/');
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 4, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -4, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: 'top center' }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => gsap.set(menu, { visibility: 'hidden' })
        });
      }
    }
  };

  const LangToggle = ({ className = '' }) => (
    <div className={`pill-lang ${className}`} role="group" aria-label={t.nav.language}>
      {LANGS.map(code => (
        <button
          key={code}
          type="button"
          className={`pill-lang__btn${code === lang ? ' is-active' : ''}`}
          onClick={() => changeLanguage(code)}
          aria-pressed={code === lang}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pill-nav-container">
      <nav className="pill-nav" aria-label="Primary">
        <a
          className="pill-logo"
          href="/"
          aria-label={t.nav.home}
          onClick={goHome}
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          {logoFailed ? (
            <span className="pill-logo__fallback">NR</span>
          ) : (
            <img
              src="/images/logo.svg"
              alt="Nordic Rigging"
              ref={logoImgRef}
              onError={() => setLogoFailed(true)}
            />
          )}
        </a>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.key} role="none">
                <a
                  role="menuitem"
                  href={item.target ? `#${item.target}` : '#'}
                  className="pill"
                  aria-label={item.label}
                  onClick={e => goToSection(item.target, e)}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span className="hover-circle" aria-hidden="true" ref={el => (circleRefs.current[i] = el)} />
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
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label={t.nav.menu}
          aria-expanded={isMobileMenuOpen}
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef}>
        <ul className="mobile-menu-list">
          {items.map(item => (
            <li key={item.key}>
              <a
                href={item.target ? `#${item.target}` : '#'}
                className="mobile-menu-link"
                onClick={e => goToSection(item.target, e)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <LangToggle className="pill-lang--mobile" />
      </div>
    </div>
  );
};

export default PillNav;
