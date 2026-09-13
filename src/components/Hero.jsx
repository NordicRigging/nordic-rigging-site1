import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import heroTiming from '../lib/hero-timing.json';
import { useLang } from '../lib/LanguageContext.jsx';
import { scrollToId } from '../lib/scroll.js';
import { useTabs } from '../lib/tabs.jsx';
import GradientWaves from './GradientWaves.jsx';
import ShinyText from './ShinyText.jsx';
import './Hero.css';

/**
 * The hero is a contained section, not full-bleed: an animated wave
 * background (GradientWaves) fills it, and a landscape mast photo holds a
 * timed intro sequence — a settle beat, then the blueprint video plays and
 * a border trace reads its progress straight off that video's own
 * currentTime (its 0-100 counter is baked into its own pixels — see
 * process-video.mjs — not a separate DOM element), landing on the wordmark
 * title and the contact card together when the video reaches its hold
 * frame. Nothing here repeats price, area, the crew or the call/message
 * pair — those already live in the nav and the Palvelut tab.
 */
// Round 13: a user report of the blueprint clip's round-10-era bug (unit-
// suffixed dimension text, no exploded-hologram numbers) turned out to be a
// stale browser cache, not a regression — every regeneration since round 9
// has shipped under this exact same URL, so nothing ever told a browser (or
// any cache in front of it) that the file underneath had changed. `?v=` from
// hero-timing.json's own assetVersion (bumped whenever the clip or poster is
// regenerated, right alongside freezeTimeSeconds) forces a fresh fetch each
// time without renaming the files themselves, which both the dev server and
// build-preview.mjs's literal-path inliner still need to find.
const ASSET_VERSION = heroTiming.assetVersion;
export const HERO_IMAGE = `/images/hero.webp?v=${ASSET_VERSION}`;
export const HERO_VIDEO = {
  lg: { mp4: `/video/hero-lg.mp4?v=${ASSET_VERSION}`, webm: `/video/hero-lg.webm?v=${ASSET_VERSION}` },
  sm: { mp4: `/video/hero-sm.mp4?v=${ASSET_VERSION}`, webm: `/video/hero-sm.webm?v=${ASSET_VERSION}` }
};
const LG_MIN_WIDTH = 900;

// The intro: a settle beat doing nothing, then the blueprint clip actually
// plays (round 11 item 4 — see the effect below) and the border trace reads
// its own progress straight off the video's currentTime, so there is only
// ever one clock. VIDEO_GRACE_MS is how long to wait for the video's
// metadata beyond the settle beat before giving up on it and revealing
// immediately (a slow/broken source shouldn't leave the intro stuck).
const SETTLE_MS = 2000;
const VIDEO_GRACE_MS = 1500;
// The clip's own last frame is the plain photo again — it was authored to
// loop ("the line drawing fades back into the original photograph, ending
// exactly on the reference frame", per docs/hero-pipeline.md), not to be
// played through and held. Pausing at its literal duration would always
// land back on the photo, which is the opposite of what the intro needs.
// The actual value lives in hero-timing.json (freezeTimeSeconds) — this
// clip's own full-hold window, found the same way each regeneration: extract
// frames, find where the schematic is stable vs. still drawing in or
// dissolving back out. It's specific to whichever clip is currently wired
// in (docs/hero-pipeline.md has each regeneration's own figure) and shared
// with process-video.mjs/render_counter_frames.py via that one JSON file so
// the video's pause point and the counter baked into its pixels can't drift
// apart from each other.
const VIDEO_FREEZE_TIME = heroTiming.freezeTimeSeconds;

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

export default function Hero({ dimBoxRef, launched, restartKey }) {
  const { t } = useLang();
  const h = t.hero;
  const { setActiveTab } = useTabs();
  const videoRef = useRef(null);
  const videoReadyRef = useRef(false);
  const borderRef = useRef(null);
  const borderLenRef = useRef(0);
  const borderHeadRef = useRef(null);
  const mediaRef = useRef(null);
  const gaugeRef = useRef(null);
  const spinlockRef = useRef(null);
  const [linkLine, setLinkLine] = useState(null);

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
  // "running": the sequence is past the settle beat, the video is playing
  // and the border is tracing along with it. "revealed": the video reached
  // its hold frame and paused there for good — title and contact card
  // shown. `launched` (a prop, not state here — see Home.jsx) is the same
  // signal the tracing beam launches on: past that point the whole stage
  // (photo, title, box, border) fades out together, so the border doesn't
  // need its own separate fade-out trigger any more.
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

  // Round 12 item 5: the Spinlock hint sits to the left of the contact card
  // (see Hero.css — its own `right` is the card's own `right` + the card's
  // own width formula, so it's a fixed short gap from the card's left edge,
  // no measurement needed for that part) and this draws the connecting line
  // the rest of the way, from the hint's own right edge to the gauge row's
  // left edge inside the card — not just "the card", so the line visibly
  // points at the measurement section itself. Both boxes size themselves off
  // translated copy (FI/EN differ) and viewport width, so this is measured,
  // not a guessed offset like the CSS-only gap above.
  useLayoutEffect(() => {
    const media = mediaRef.current;
    const gauge = gaugeRef.current;
    const hint = spinlockRef.current;
    const card = dimBoxRef?.current;
    if (!media || !gauge || !hint || !card) return undefined;

    const measure = () => {
      const mediaRect = media.getBoundingClientRect();
      const gaugeRect = gauge.getBoundingClientRect();
      const hintRect = hint.getBoundingClientRect();
      const startX = hintRect.right - mediaRect.left;
      const startY = hintRect.top + hintRect.height / 2 - mediaRect.top;
      const endX = gaugeRect.left - mediaRect.left;
      const endY = gaugeRect.top + gaugeRect.height / 2 - mediaRect.top;
      const width = endX - startX;
      // The hint and the gauge row rarely land at exactly the same height
      // (independent boxes, translated copy of different lengths), so this
      // is drawn as a real diagonal between their two measured centres
      // rather than assumed to be a flat horizontal line.
      const top = Math.min(startY, endY);
      const height = Math.abs(endY - startY) || 2;
      // Below 640px the card drops out of the photo overlay into normal
      // flow (.hero__dimbox's own max-width:640px override) — the gauge
      // then sits well outside .hero__media's own box, which clips its
      // overflow, so a line drawn there would just be cut off invisible.
      // Only draw the connector while the gauge still measures back inside
      // the media box's height, i.e. the two are still visually overlaid.
      if (width > 0 && endY >= 0 && endY <= mediaRect.height) {
        setLinkLine({ left: startX, top, width, height, y1: startY - top, y2: endY - top });
      } else {
        setLinkLine(null);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(media);
    ro.observe(gauge);
    ro.observe(hint);
    // The reveal transition slides the card and hint into their resting
    // spot via `transform` (opacity/transform, 650ms — see Hero.css),
    // which ResizeObserver won't fire for since neither box's own size
    // changes, only its position. Without this, the very first measure()
    // above (taken right as `revealed` flips true, before that transition
    // has run) stays pinned to the pre-transition position for good.
    card.addEventListener('transitionend', measure);
    hint.addEventListener('transitionend', measure);
    return () => {
      ro.disconnect();
      card.removeEventListener('transitionend', measure);
      hint.removeEventListener('transitionend', measure);
    };
  }, [revealed]);

  // restartKey is bumped by Home.jsx once the user scrolls all the way back
  // to the top after the hero has launched (see .hero__stage--launched
  // below) — putting it in this effect's own dependency array is what
  // replays the whole sequence. The reset below runs unconditionally at the
  // top so the same code path covers both the first mount (a no-op: nothing
  // has run yet) and a restart (undoes wherever the previous run left off —
  // the video paused mid-clip or held on its last frame, the border drawn
  // in) before either falls through to skip-motion or starts the sequence
  // fresh.
  useEffect(() => {
    if (motionOk === null) return undefined;

    setRunning(false);
    setRevealed(false);
    const resetVideo = videoRef.current;
    if (resetVideo) {
      resetVideo.pause();
      resetVideo.currentTime = 0;
    }
    if (borderRef.current && borderLenRef.current) {
      borderRef.current.style.strokeDashoffset = String(borderLenRef.current);
      if (borderHeadRef.current) {
        const pt = borderRef.current.getPointAtLength(0);
        borderHeadRef.current.setAttribute('cx', String(pt.x));
        borderHeadRef.current.setAttribute('cy', String(pt.y));
      }
    }

    if (!motionOk || prefersReduced()) {
      setRunning(true);
      setRevealed(true);
      return undefined;
    }

    let raf = 0;
    let cancelled = false;
    let graceTimer = 0;
    let settleTimer = 0;

    // Border progress is a pure read of the video's own currentTime every
    // frame — timeupdate fires too coarsely for a smooth trace, but nothing
    // here ever writes currentTime while this loop runs, so it's still just
    // sampling the one clock, not competing with it.
    const tick = () => {
      if (cancelled) return;
      const v = videoRef.current;
      if (!v) return;
      const p = Math.min(1, v.currentTime / VIDEO_FREEZE_TIME);

      if (borderRef.current && borderLenRef.current) {
        const len = borderLenRef.current;
        borderRef.current.style.strokeDashoffset = String(len * (1 - p));
        if (borderHeadRef.current) {
          const pt = borderRef.current.getPointAtLength(p * len);
          borderHeadRef.current.setAttribute('cx', String(pt.x));
          borderHeadRef.current.setAttribute('cy', String(pt.y));
        }
      }

      if (v.currentTime >= VIDEO_FREEZE_TIME) {
        v.pause();
        // A single corrective seek, not a rapid scrub loop, so there's no
        // decoder-staleness risk here the way there was when this used to
        // scrub currentTime every animation frame — this just guards against
        // playback overshooting slightly past the target between ticks.
        v.currentTime = VIDEO_FREEZE_TIME;
        // The proof the closing gate asks for: this is the video's own
        // currentTime, read back after the loop above drove the border from
        // nothing else — there's no second timer left to have drifted from it.
        console.log('[hero-intro] video-driven completion', {
          videoCurrentTime: v.currentTime,
          videoFreezeTarget: VIDEO_FREEZE_TIME,
          borderDashoffset: 0
        });
        setRevealed(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const startPlayback = () => {
      if (cancelled) return;
      const v = videoRef.current;
      if (!v) return;
      setRunning(true);
      v.play()
        .then(() => {
          if (!cancelled) raf = requestAnimationFrame(tick);
        })
        .catch(() => {
          // muted + playsInline should satisfy every major browser's
          // autoplay policy, but if playback still can't start there's
          // nothing left to sync the border/reveal to — skip cleanly.
          if (!cancelled) setRevealed(true);
        });
    };

    // Waits out VIDEO_GRACE_MS for the video's metadata beyond the settle
    // beat; a source that never becomes ready has nothing for the intro to
    // play or read currentTime from, so it reveals immediately instead of
    // hanging on a border that can never reach 100%.
    const waitForVideo = () => {
      if (cancelled) return;
      if (videoReadyRef.current) {
        startPlayback();
        return;
      }
      graceTimer += 50;
      if (graceTimer >= VIDEO_GRACE_MS) {
        setRevealed(true);
        return;
      }
      settleTimer = setTimeout(waitForVideo, 50);
    };

    settleTimer = setTimeout(waitForVideo, SETTLE_MS);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
    };
  }, [motionOk, restartKey]);

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
        <div className={`hero__stage${launched ? ' hero__stage--launched' : ''}`}>
          {/* A sibling of .hero__media, not a child: that box clips its own
              overflow to the photo's aspect ratio, and the title needs to
              spill out above it (empty space) with the rest overlapping
              down onto the photo, which only works outside that clip. */}
          <h1
            id="hero-title"
            className={`hero__wordmark-heading${revealed ? ' is-revealed' : ''}`}
            aria-label={`Nordic Rigging — ${h.eyebrow}`}
          >
            <div className="hero__wordmark" aria-hidden="true">
              <span className="hero__wordmark-row">
                <ShinyText
                  text="Nordic"
                  className="hero__wordmark-shiny"
                  disabled={!motionOk}
                  speed={5}
                  spread={110}
                  color="#9aa4ad"
                  shineColor="#dbe9ff"
                />
              </span>
              <span className="hero__wordmark-row">
                <ShinyText
                  text="Rigging"
                  className="hero__wordmark-shiny"
                  disabled={!motionOk}
                  speed={5}
                  spread={110}
                  color="#9aa4ad"
                  shineColor="#dbe9ff"
                />
              </span>
            </div>
          </h1>

          <div className="hero__media" ref={mediaRef}>
            <img
              className={`hero__poster${motionOk && !videoFailed ? ' hero__poster--matched' : ''}`}
              src={HERO_IMAGE}
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
              className={`hero__border${launched ? ' is-handed-off' : ''}`}
              aria-hidden="true"
              preserveAspectRatio="none"
              viewBox="0 0 100 56.25"
            >
              <rect ref={borderRef} className="hero__border-rect" x="1.4" y="1.4" width="97.2" height="53.45" rx="3" />
              <circle ref={borderHeadRef} className={`hero__border-head${running && !revealed ? ' is-visible' : ''}`} r="1.9" />
            </svg>

            <div className={`hero__spinlock-hint${revealed ? ' is-revealed' : ''}`} ref={spinlockRef}>
              <span className="hero__spinlock-beam" aria-hidden="true" />
              <span className="hero__spinlock-text">{h.spinlockHint}</span>
              <button type="button" className="hero__scroll-arrow" onClick={toRigSense} aria-label={h.scrollHint}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 4v14M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Round 12 item 5: draws the "this hint is about that card"
                relationship explicitly — from the hint's own right edge to
                the gauge row's left edge, both measured (see the effect
                above), since the exact gap depends on translated copy
                length and viewport width. */}
            {linkLine && (
              <svg
                className={`hero__spinlock-link${revealed ? ' is-revealed' : ''}`}
                aria-hidden="true"
                style={{ top: linkLine.top, left: linkLine.left, width: linkLine.width, height: linkLine.height }}
                preserveAspectRatio="none"
              >
                <line x1="0" y1={linkLine.y1} x2={linkLine.width} y2={linkLine.y2} />
              </svg>
            )}
          </div>

          <div className={`hero__dimbox card${revealed ? ' is-revealed' : ''}`} ref={dimBoxRef}>
            <p className="hero__dimbox-tagline">{h.eyebrow}</p>

            <div className="hero__gauge" ref={gaugeRef}>
              <span className="hero__gauge-title">{h.cardTitle}</span>
              <span className="hero__gauge-spec">{h.cardSpec}</span>
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
