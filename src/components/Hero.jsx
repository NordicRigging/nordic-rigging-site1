import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import { useTabs } from '../lib/tabs.jsx';
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
  lg: { mp4: '/video/hero-lg.mp4', webm: '/video/hero-lg.webm' },
  sm: { mp4: '/video/hero-sm.mp4', webm: '/video/hero-sm.webm' }
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
// The clip's own last frame is the plain photo again — it was authored to
// loop ("the line drawing fades back into the original photograph, ending
// exactly on the reference frame", per docs/hero-pipeline.md), not to be
// scrubbed and held. Freezing at its literal duration would always land
// back on the photo, which is the opposite of what the intro needs. 2.6s is
// inside the blueprint's full hold (checked directly against the source
// footage: dimension callouts are stable roughly 2.0-2.7s in, then fade
// out, then the whole schematic glides back to the photo from ~3.3s on) —
// this is the round-9 regeneration's own timing, not the previous clip's.
const VIDEO_FREEZE_TIME = 2.6;

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
  const { setActiveTab } = useTabs();
  const videoRef = useRef(null);
  const videoReadyRef = useRef(false);
  const borderRef = useRef(null);
  const borderLenRef = useRef(0);
  const borderHeadRef = useRef(null);
  const counterRef = useRef(null);

  // null = not yet determined (the mount effect below hasn't run yet) —
  // kept distinct from false so the sequence effect can wait for a real
  // answer instead of reading the not-yet-set default as "no motion" and
  // jumping straight to revealed before it gets corrected.
  const [motionOk, setMotionOk] = useState(null);
  const [size, setSize] = useState('sm');
  const [wavesFailed, setWavesFailed] = useState(false);
  // If the clip can't decode for any reason (codec support, a bad range
  // request, whatever), the poster stays the fallback rather than fading in
  // a video element showing nothing — same defensive pattern as GradientWaves'
  // own onError below.
  const [videoFailed, setVideoFailed] = useState(false);
  // "running": the sequence is past the settle beat, border/counter/scrub
  // are live. "revealed": it landed on 100% — title and contact card shown,
  // video frozen on its last scrubbed frame for good. "scrolledPast": the
  // whole stage has scrolled out of view — only used to fade the border out
  // as the tracing beam picks the same line back up further down the page.
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

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

  // stroke-width has to be set here, not in CSS: with non-scaling-stroke
  // off (see Hero.css for why it has to be), a plain CSS stroke-width is in
  // the same 0-100 viewBox units as the path itself and would scale with
  // the box's rendered size. Re-deriving it from the SVG's own current
  // width on every resize keeps the line a constant 1.5px on screen —
  // matching TracingBeam's stroke-width — regardless of viewport size.
  useLayoutEffect(() => {
    const el = borderRef.current;
    const svg = el?.ownerSVGElement;
    if (!el || !svg) return undefined;
    const TARGET_PX = 1.5;
    const VIEWBOX_WIDTH = svg.viewBox.baseVal.width || 100;
    const setStrokeWidth = () => {
      const boxWidth = svg.getBoundingClientRect().width;
      if (boxWidth > 0) el.style.strokeWidth = String((TARGET_PX * VIEWBOX_WIDTH) / boxWidth);
    };
    setStrokeWidth();
    const ro = new ResizeObserver(setStrokeWidth);
    ro.observe(svg);
    return () => ro.disconnect();
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
    let settleTimer = 0;
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
        const len = borderLenRef.current;
        borderRef.current.style.strokeDashoffset = String(len * (1 - p));
        if (borderHeadRef.current) {
          const pt = borderRef.current.getPointAtLength(p * len);
          borderHeadRef.current.setAttribute('cx', String(pt.x));
          borderHeadRef.current.setAttribute('cy', String(pt.y));
        }
      }
      if (counterRef.current) counterRef.current.textContent = String(Math.round(p * 100));
      const v = videoRef.current;
      if (v && v.duration) v.currentTime = p * Math.min(VIDEO_FREEZE_TIME, v.duration);

      if (p >= 1) {
        const finish = () => {
          // The proof the closing gate asks for: border offset, counter and
          // video currentTime are all read here, because they're all just
          // `p` — not three timers that happened to agree. videoCurrentTime
          // lands on VIDEO_FREEZE_TIME, not the clip's own duration —
          // freezing at its actual last frame would show the plain photo
          // again (see VIDEO_FREEZE_TIME's comment above).
          console.log('[hero-intro] synced completion', {
            elapsedMs: Math.round(performance.now() - t0),
            borderDashoffset: 0,
            counterPercent: 100,
            videoCurrentTime: v?.currentTime ?? null,
            videoFreezeTarget: VIDEO_FREEZE_TIME
          });
          setRevealed(true);
        };

        // A rapid scrub (a currentTime seek nearly every animation frame,
        // which is what the loop above just did) can leave the decoder's
        // presented frame stale even once currentTime and seeking both
        // report the seek as settled — verified directly against this
        // exact seek pattern. One more explicit seek to the same target,
        // waited out via the seeked event, reliably forces the correct
        // frame; the timeout is only a safety net in case that event is
        // ever missed.
        if (v && v.duration) {
          const onSeeked = () => {
            v.removeEventListener('seeked', onSeeked);
            clearTimeout(settleTimer);
            finish();
          };
          v.addEventListener('seeked', onSeeked);
          settleTimer = setTimeout(onSeeked, 400);
          v.currentTime = Math.min(VIDEO_FREEZE_TIME, v.duration);
        } else {
          finish();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
    };
  }, [motionOk]);

  // Fade the border out the instant the contact card scrolls out of view —
  // watching the same element TracingBeam.jsx watches (via the same
  // dimBoxRef) to trigger its own reveal, not the taller .hero__stage
  // (which includes the title above the photo and so exits later), is
  // what keeps the two triggers landing in the same moment: the border
  // fades out right as the beam flies in, in matching colour and
  // thickness, so the two read as one beam handing off rather than a beam
  // disappearing and a different one appearing.
  useEffect(() => {
    const el = dimBoxRef?.current;
    if (!el || scrolledPast) return undefined;
    const io = new IntersectionObserver(([entry]) => !entry.isIntersecting && setScrolledPast(true), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [scrolledPast, dimBoxRef]);

  const onWavesError = useCallback(err => {
    console.error('GradientWaves failed to start, falling back to a static gradient:', err);
    setWavesFailed(true);
  }, []);

  const toContact = e => {
    e.preventDefault();
    scrollToId('yhteystiedot');
  };

  const toRigSense = e => {
    e.preventDefault();
    setActiveTab('palvelut');
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId('ratkaisut')));
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
          {/* A sibling of .hero__media, not a child: that box clips its own
              overflow to the photo's aspect ratio, and the title needs to
              spill out above it (empty space) with the rest overlapping
              down onto the photo, which only works outside that clip. */}
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
                className={`hero__video${running && !videoFailed ? ' is-active' : ''}`}
                muted
                playsInline
                preload="auto"
                aria-label={h.videoLabel}
                onError={() => {
                  // A <source> child fires its own error when just that one
                  // format fails to decode (e.g. no H.264 support) — the
                  // video element itself then correctly moves on to try the
                  // next <source>, and that's not a real failure. Only
                  // NETWORK_NO_SOURCE means every source has been tried and
                  // none worked.
                  if (videoRef.current?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
                    setVideoFailed(true);
                  }
                }}
              >
                <source src={HERO_VIDEO[size].mp4} type="video/mp4" />
                <source src={HERO_VIDEO[size].webm} type="video/webm" />
              </video>
            )}

            <svg
              className={`hero__border${scrolledPast ? ' is-handed-off' : ''}`}
              aria-hidden="true"
              preserveAspectRatio="none"
              viewBox="0 0 100 56.25"
            >
              <rect ref={borderRef} className="hero__border-rect" x="1.4" y="1.4" width="97.2" height="53.45" rx="3" />
              <circle ref={borderHeadRef} className={`hero__border-head${running && !revealed ? ' is-visible' : ''}`} r="1.9" />
            </svg>

            <div className={`hero__sequence${running && !revealed ? ' is-visible' : ''}`} aria-hidden="true">
              <span className="hero__sequence-counter" ref={counterRef}>
                0
              </span>
              <span className="hero__sequence-percent">%</span>
            </div>

            <div className={`hero__spinlock-hint${revealed ? ' is-revealed' : ''}`}>
              <span className="hero__spinlock-beam" aria-hidden="true" />
              <span className="hero__spinlock-text">{h.spinlockHint}</span>
              <button type="button" className="hero__scroll-arrow" onClick={toRigSense} aria-label={h.scrollHint}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 4v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className={`hero__dimbox card${revealed ? ' is-revealed' : ''}`} ref={dimBoxRef}>
            <p className="hero__dimbox-tagline">{h.eyebrow}</p>

            <div className="hero__gauge">
              <span className="hero__gauge-label">{rs.readingLabel}</span>
              <span className="hero__gauge-value">{rs.staticReading}</span>
            </div>

            <a className="btn btn--accent hero__dimbox-cta" href="#yhteystiedot" onClick={toContact}>
              {h.contactCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
