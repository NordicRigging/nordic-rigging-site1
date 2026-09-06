import { useCallback, useEffect, useRef, useState } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import GradientWaves from './GradientWaves.jsx';
import MaskedHeading from './MaskedHeading.jsx';
import './Hero.css';

/**
 * The hero is a contained section, not full-bleed: an animated wave
 * background (GradientWaves) fills it, a video-filled "NORDIC RIGGING"
 * wordmark sits centred above the copy, and the mast photo/clip sits in its
 * own enlarged, centred card below. The card's aspect ratio (3:4) matches
 * the source media exactly, so `object-fit: cover` shows the whole frame —
 * mast and boat both — rather than a tight crop.
 */
export const HERO_IMAGE = '/images/hero.webp';
export const HERO_IMAGE_SET = '/images/hero-1200.webp 1200w, /images/hero.webp 2000w';
export const HERO_VIDEO = {
  lg: { webm: '/video/hero-lg.webm', mp4: '/video/hero-lg.mp4' },
  sm: { webm: '/video/hero-sm.webm', mp4: '/video/hero-sm.mp4' }
};
const WORDMARK_VIDEO = { mp4: '/video/masthead-fill.mp4', webm: '/video/masthead-fill.webm' };
const LG_MIN_WIDTH = 900;

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

/** Skip the clip for people who asked for less motion or are saving data. */
function wantsMotion() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|\b)2g/.test(conn.effectiveType || ''))) return false;
  return true;
}

export default function Hero() {
  const { t } = useLang();
  const h = t.hero;
  const videoRef = useRef(null);
  const [motion, setMotion] = useState(false);
  const [size, setSize] = useState('sm');
  const [playing, setPlaying] = useState(false);
  const [wavesFailed, setWavesFailed] = useState(false);

  useEffect(() => {
    setMotion(wantsMotion());
    setSize(window.innerWidth >= LG_MIN_WIDTH ? 'lg' : 'sm');
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !motion) return undefined;
    const onPlaying = () => setPlaying(true);
    const onError = () => setMotion(false);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('error', onError);
    const p = v.play?.();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('error', onError);
    };
  }, [motion]);

  const onWavesError = useCallback(err => {
    console.error('GradientWaves failed to start, falling back to a static gradient:', err);
    setWavesFailed(true);
  }, []);

  const toContact = e => {
    e.preventDefault();
    scrollToId('yhteystiedot');
  };

  const showWaves = motion && !wavesFailed;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__waves" aria-hidden="true">
        {showWaves ? (
          <GradientWaves
            horizonColor="#050b16"
            waveColor="#123a6b"
            crestColor="#4fa8db"
            speed={0.25}
            amplitude={2.6}
            waveScale={0.5}
            turbulence={16}
            swell={26}
            zoom={0.85}
            brightness={1.05}
            opacity={0.95}
            grain
            grainIntensity={0.03}
            mouseInteraction
            parallaxStrength={0.35}
            onError={onWavesError}
          />
        ) : (
          <div className="hero__waves-fallback" />
        )}
        {/* The wave shader's own bottom edge is wave/crest-coloured, not flat
            navy — fade it to navy-900 so the seam with the tabs section
            below (which starts at navy-900) never shows a hard edge. */}
        <div className="hero__fade" />
      </div>

      <p className="hero__badge">{h.eyebrow}</p>

      <div className="hero__inner">
        <div className="hero__wordmark" aria-hidden="true">
          <MaskedHeading text="Nordic" mediaType="video" videoSrc={WORDMARK_VIDEO} weight={800} />
          <MaskedHeading text="Rigging" mediaType="video" videoSrc={WORDMARK_VIDEO} weight={800} />
        </div>

        <div className="hero__copy">
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

        <div className="hero__media">
          <img className="hero__poster" src={HERO_IMAGE} srcSet={HERO_IMAGE_SET} sizes="(min-width: 900px) 34rem, 100vw" alt="" fetchpriority="high" decoding="async" />
          {motion && (
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
              <source src={HERO_VIDEO[size].mp4} type="video/mp4" />
              <source src={HERO_VIDEO[size].webm} type="video/webm" />
            </video>
          )}
        </div>
      </div>
    </section>
  );
}
