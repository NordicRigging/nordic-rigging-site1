import { useEffect, useRef, useState } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import './Hero.css';

export const HERO_IMAGE = '/images/hero.webp';
/**
 * Two encodes of the same clip (see scripts/process-video.mjs): `lg` at full
 * width for screens where the clip covers the whole viewport, `sm` for phones.
 * Set to null while no clip matches the photo; the still then carries the hero.
 */
export const HERO_VIDEO = {
  lg: { webm: '/video/hero-lg.webm', mp4: '/video/hero-lg.mp4' },
  sm: { webm: '/video/hero-sm.webm', mp4: '/video/hero-sm.mp4' }
};
const LG_MIN_WIDTH = 900;

/**
 * How the full-bleed photo is framed: 'center' keeps the mast mid-frame,
 * 'offset' pushes it right of centre so the copy sits on clean sky. The CSS
 * for both lives in Hero.css. `?crop=offset` in the URL overrides it, which is
 * how the two were compared side by side.
 */
export const HERO_CROP = 'offset';

function heroCrop() {
  if (typeof window === 'undefined') return HERO_CROP;
  const q = new URLSearchParams(window.location.search).get('crop');
  return q === 'offset' || q === 'center' ? q : HERO_CROP;
}

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

/** Skip the clip for people who asked for less motion or are saving data. */
function wantsVideo() {
  if (!HERO_VIDEO || typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|\b)2g/.test(conn.effectiveType || ''))) return false;
  return true;
}

export default function Hero() {
  const { t } = useLang();
  const h = t.hero;
  const videoRef = useRef(null);
  const [useVideo, setUseVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [size, setSize] = useState('sm');

  useEffect(() => {
    // Picked once at mount; a resize across the breakpoint keeps the loaded clip.
    setSize(window.innerWidth >= LG_MIN_WIDTH ? 'lg' : 'sm');
    setUseVideo(wantsVideo());
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo) return undefined;
    const onPlaying = () => setPlaying(true);
    const onError = () => setUseVideo(false);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('error', onError);
    // Some browsers need an explicit nudge even with autoplay + muted.
    const p = v.play?.();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('error', onError);
    };
  }, [useVideo]);

  const toContact = e => {
    e.preventDefault();
    scrollToId('yhteystiedot');
  };

  return (
    <section className="hero on-dark" data-crop={heroCrop()} aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">{h.eyebrow}</p>
          <h1 id="hero-title" className="hero__title">
            {h.title}
          </h1>
          <p className="hero__lead">{h.lead}</p>

          <div className="btn-row hero__actions">
            <a className="btn btn--accent" href={CONTACT.phoneHref}>
              <PhoneIcon />
              {h.callCta}
            </a>
            <a className="btn btn--ghost" href="#yhteystiedot" onClick={toContact}>
              {h.messageCta}
            </a>
          </div>

          <dl className="hero__facts">
            {h.facts.map(f => (
              <div key={f.label} className="hero__fact">
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

      </div>

      <div className="hero__media" aria-hidden="true">
        <img className="hero__poster" src={HERO_IMAGE} alt="" fetchpriority="high" decoding="async" />
        {useVideo && (
          <video
            ref={videoRef}
            className={`hero__video${playing ? ' is-playing' : ''}`}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            poster={HERO_IMAGE}
            aria-label={h.videoLabel}
          >
            {/* mp4 first: at these settings H.264 comes out smaller than VP9 */}
            <source src={HERO_VIDEO[size].mp4} type="video/mp4" />
            <source src={HERO_VIDEO[size].webm} type="video/webm" />
          </video>
        )}
      </div>
      <div className="hero__shade" aria-hidden="true" />
    </section>
  );
}
