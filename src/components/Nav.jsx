import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../lib/LanguageContext'
import { scrollToId, scrollToTop } from '../lib/scroll'
import './Nav.css'

const ITEMS = [
  { key: 'services', target: 'services' },
  { key: 'contact', target: 'contact' },
  { key: 'about', target: 'story' },
]

/**
 * Fixed top bar, structure carried over from the reference site's PillNav
 * (logo, link pills, FI/EN folded in, mobile popover) but restyled to this
 * site's own tech/mono language instead of the reference's bold-sans pills,
 * and with a scroll-direction shrink the reference doesn't have: compact
 * going down, back to full size going up, so it stays out of the way while
 * reading but is never more than a scroll-up away.
 */
export default function Nav() {
  const { lang, t, changeLanguage } = useLang()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setCompact(y > 80 && y > lastY.current)
        lastY.current = y
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKey = e => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (target, e) => {
    e?.preventDefault()
    setOpen(false)
    if (!onHome) {
      navigate('/', { state: { scrollTo: target } })
      return
    }
    scrollToId(target)
  }

  const home = e => {
    e?.preventDefault()
    setOpen(false)
    if (onHome) scrollToTop()
    else navigate('/')
  }

  return (
    <div className={`nav-bar${compact ? ' is-compact' : ''}`}>
      <nav className="nav-pill" aria-label="Primary">
        <a className="nav-logo" href="/" onClick={home} aria-label={`Nordic Rigging, ${t.nav.home}`}>
          <span className="nav-logo__mark" aria-hidden="true" />
          <span className="nav-logo__name">Nordic Rigging</span>
        </a>

        <ul className="nav-list desktop-only" role="menubar">
          {ITEMS.map(item => (
            <li key={item.key} role="none">
              <a role="menuitem" href={`/#${item.target}`} className="nav-link" onClick={e => go(item.target, e)}>
                {t.nav[item.key]}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-lang desktop-only" role="group" aria-label={t.nav.language}>
          {['fi', 'en'].map(code => (
            <button
              key={code}
              type="button"
              className={`nav-lang__btn${code === lang ? ' is-active' : ''}`}
              onClick={() => changeLanguage(code)}
              aria-pressed={code === lang}
              lang={code}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`nav-burger mobile-only${open ? ' is-open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? t.nav.close : t.nav.menu}
          aria-expanded={open}
          aria-controls="nav-mobile-menu"
        >
          <span className="nav-burger__line" />
          <span className="nav-burger__line" />
        </button>
      </nav>

      <div id="nav-mobile-menu" className={`nav-mobile mobile-only${open ? ' is-open' : ''}`} hidden={!open}>
        <ul className="nav-mobile__list">
          {ITEMS.map(item => (
            <li key={item.key}>
              <a href={`/#${item.target}`} className="nav-mobile__link" onClick={e => go(item.target, e)}>
                {t.nav[item.key]}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-mobile__lang" role="group" aria-label={t.nav.language}>
          {['fi', 'en'].map(code => (
            <button
              key={code}
              type="button"
              className={`nav-lang__btn${code === lang ? ' is-active' : ''}`}
              onClick={() => changeLanguage(code)}
              aria-pressed={code === lang}
              lang={code}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
