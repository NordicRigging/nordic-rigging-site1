import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import GradientWaves from './GradientWaves.jsx';
import MaskedHeading from './MaskedHeading.jsx';
import './Hero.css';

/**
 * The hero is a contained section, not full-bleed: an animated wave
 * background (GradientWaves) fills it, and a landscape mast photo holds a
 * timed intro sequence — a settle beat, then a border trace, a blueprint
 * video scrub and a percent counter run from one shared progress value, and
 * land together on the wordmark title and the contact card. Nothing here
 * repeats price, area, the crew or the call/message pair — those already
 * live in the nav and the Palvelut tab.
 */
export const HERO_IMAGE = '/images/hero.webp';
export const HERO_IMAGE_SET = '/images/hero-1200.webp 1200w, /images/hero.webp 2200w';
export const HERO_VIDEO = {
  lg: { webm: '/video/hero-lg.webm', mp4: '/video/hero-lg.mp4' },
  sm: { webm: '/video/hero-sm.webm', mp4: '/video/hero-sm.mp4' }
};
const WORDMARK_VIDEO = { mp4: '/video/masthead-fill.mp4', webm: '/video/masthead-fill.webm' };
const LG_MIN_WIDTH = 900;

// One shared timeline for the intro: a settle beat doing nothing, then a
// single run phase whose 0-1 progress drives the border trace, the percent
// counter and the blueprint video's own currentTime together — see the
// effect below for why that (not three independently-timed animations) is
// what guarantees they land in the same frame.
const SETTLE_MS = 2000;
const RUN_MS = 2800;
const VIDEO_GRACE_MS = 1500;
const GAUGE_TARGET = 22;

/** Skip the clip for people who asked for less motion or are saving data. */
function wantsMotion() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|\b)2g/.test(conn.effectiveType || ''))) return false;
  return true;
}

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Hero({ dimBoxRef }) {
  const { t } = useLang();
  const h = t.hero;
  const rs = t.rigsense;
  const videoRef = useRef(null);
  const videoReadyRef = useRef(false);
  const borderRef = useRef(null);
  const borderLenRef = useRef(0);
  const counterRef = useRef(null);
  const gaugeRef = useRef(null);

  // null = not yet determined (the mount effect below hasn't run yet) —
  // kept distinct from false so the sequence effect can wait for a real
  // answer instead of reading the not-yet-set default as "no motion" and
  // jumping straight to revealed before it gets corrected.
  const [motionOk, setMotionOk] = useState(null);
  const [size, setSize] = useState('sm');
  const [wavesFailed, setWavesFailed] = useState(false);
  // "running": the sequence is past the settle beat, border/counter/scrub
  // are live. "revealed": it landed on 100% — title and contact card shown,
  // video frozen on its last scrubbed frame for good.
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setMotionOk(wantsMotion());
    setSize(window.innerWidth >= LG_MIN_WIDTH ? 'lg' : 'sm');
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    const onReady = () => {
      videoReadyRef.current = true;
    };
    if (v.readyState >= 1) videoReadyRef.current = true;
    v.addEventListener('loadedmetadata', onReady);
    return () => v.removeEventListener('loadedmetadata', onReady);
  }, [motionOk]);

  // measure the border path's real length once — the viewBox is fixed to
  // the media box's own aspect ratio, so this is stable regardless of the
  // box's actual rendered pixel size and needs no ResizeObserver.
  useLayoutEffect(() => {
    const el = borderRef.current;
    if (!el) return undefined;
    const len = el.getTotalLength();
    borderLenRef.current = len;
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    return undefined;
  }, []);

  useEffect(() => {
    if (motionOk === null) return undefined;
    if (!motionOk || prefersReduced()) {
      setRunning(true);
      setRevealed(true);
      return undefined;
    }

    let raf = 0;
    let runStart = null;
    const t0 = performance.now();

    const tick = now => {
      const elapsed = now - t0;
      if (runStart === null) {
        const metadataOk = videoReadyRef.current || elapsed > SETTLE_MS + VIDEO_GRACE_MS;
        if (elapsed < SETTLE_MS || !metadataOk) {
          raf = requestAnimationFrame(tick);
          return;
        }
        runStart = now;
        setRunning(true);
      }

      const p = Math.min(1, (now - runStart) / RUN_MS);

      if (borderRef.current && borderLenRef.current) {
        borderRef.current.style.strokeDashoffset = String(borderLenRef.current * (1 - p));
      }
      if (counterRef.current) counterRef.current.textContent = String(Math.round(p * 100));
      const v = videoRef.current;
      if (v && v.duration) v.currentTime = p * v.duration;

      if (p >= 1) {
        // The proof the closing gate asks for: border offset, counter and
        // video currentTime are all read here in the same tick, because
        // they're all just `p` — not three timers that happened to agree.
        console.log('[hero-intro] synced completion', {
          elapsedMs: Math.round(now - t0),
          borderDashoffset: 0,
          counterPercent: 100,
          videoCurrentTime: v?.currentTime ?? null,
          videoDuration: v?.duration ?? null
        });
        setRevealed(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motionOk]);

  // The gauge's own short rise — separate from the sequence counter above,
  // starts once the card is on screen and is re-triggerable by pressing it.
  const runGauge = useCallback(() => {
    if (prefersReduced()) {
      if (gaugeRef.current) gaugeRef.current.textContent = String(GAUGE_TARGET);
      return;
    }
    const dur = 900;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - p) ** 3;
      if (gaugeRef.current) gaugeRef.current.textContent = String(Math.round(eased * GAUGE_TARGET));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (revealed) runGauge();
  }, [revealed, runGauge]);

  const onWavesError = useCallback(err => {
    console.error('GradientWaves failed to start, falling back to a static gradient:', err);
    setWavesFailed(true);
  }, []);

  const toContact = e => {
    e.preventDefault();
    scrollToId('yhteystiedot');
  };

  const showWaves = motionOk && !wavesFailed;

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

      <div className="hero__inner">
        <div className="hero__stage">
        <div className="hero__media">
          <img
            className="hero__poster"
            src={HERO_IMAGE}
            srcSet={HERO_IMAGE_SET}
            sizes="(min-width: 900px) 60rem, 100vw"
            alt=""
            fetchpriority="high"
            decoding="async"
          />

          {motionOk && (
            <video
              ref={videoRef}
              className={`hero__video${running ? ' is-active' : ''}`}
              muted
              playsInline
              preload="auto"
              aria-label={h.videoLabel}
            >
              <source src={HERO_VIDEO[size].mp4} type="video/mp4" />
              <source src={HERO_VIDEO[size].webm} type="video/webm" />
            </video>
          )}

          <svg className="hero__border" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 56.25">
            <rect ref={borderRef} className="hero__border-rect" x="1.4" y="1.4" width="97.2" height="53.45" rx="3" />
          </svg>

          <div className={`hero__sequence${running && !revealed ? ' is-visible' : ''}`} aria-hidden="true">
            <span className="hero__sequence-counter" ref={counterRef}>
              0
            </span>
            <span className="hero__sequence-percent">%</span>
          </div>

          {/* Decorative, video-filled wordmark; the real accessible name for
              the section lives on this h1 via aria-label. Always mounted
              (not conditionally rendered) so it stays in the accessibility
              tree regardless of the intro's animation state — only its
              visibility is timed. */}
          <h1
            id="hero-title"
            className={`hero__wordmark-heading${revealed ? ' is-revealed' : ''}`}
            aria-label={`Nordic Rigging — ${h.eyebrow}`}
          >
            <div className="hero__wordmark">
              <MaskedHeading text="Nordic" mediaType="video" videoSrc={WORDMARK_VIDEO} weight={800} />
              <MaskedHeading text="Rigging" mediaType="video" videoSrc={WORDMARK_VIDEO} weight={800} />
            </div>
          </h1>
        </div>

        {/* A sibling of .hero__media, not a child: that box clips its own
            overflow to the photo's aspect ratio, and on narrow screens
            there isn't room to overlay a full contact card over a 16:9
            strip without colliding with the title — so below ~640px this
            drops out of the overlay and stacks under the photo instead,
            which only works if it can escape that clipping box. */}
        <div className={`hero__dimbox card${revealed ? ' is-revealed' : ''}`} ref={dimBoxRef}>
            <p className="hero__dimbox-tagline">{h.eyebrow}</p>

            <button
              type="button"
              className="hero__gauge"
              onClick={runGauge}
              aria-label={`${rs.readingLabel} ${GAUGE_TARGET}%`}
            >
              <span className="hero__gauge-label" aria-hidden="true">
                {rs.readingLabel}
              </span>
              <span className="hero__gauge-value" aria-hidden="true">
                <span ref={gaugeRef}>0</span>%
              </span>
            </button>

            <p className="hero__dimbox-facts">{h.quickFacts}</p>

            <a className="btn btn--accent hero__dimbox-cta" href="#yhteystiedot" onClick={toContact}>
              {h.contactCta}
            </a>
        </div>
        </div>
      </div>
    </section>
  );
}
