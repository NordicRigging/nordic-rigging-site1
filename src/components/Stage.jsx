import { useEffect, useRef, useState } from 'react';

import './Stage.css';

/**
 * The stage is the hero and the services section sharing one background.
 *
 * The photo / clip is a sticky full-viewport layer. Scrolling down darkens it
 * and, once the reader is a third of the way through the hero, the looping
 * clip plays on to the fully exploded blueprint frame and pauses there, so
 * the exploded mast stays as the services section's background. Scrolling
 * back up resumes the loop. Nothing is scrubbed: the clip only ever plays
 * forward at its own speed, and holds on one frame.
 */
export const HERO_IMAGE = '/images/hero.webp';
export const HERO_IMAGE_SET = '/images/hero-1200.webp 1200w, /images/hero.webp 2000w';
export const HERO_STILL = '/images/hero-blueprint.webp';
export const HERO_VIDEO = {
  lg: { webm: '/video/hero-lg.webm', mp4: '/video/hero-lg.mp4' },
  sm: { webm: '/video/hero-sm.webm', mp4: '/video/hero-sm.mp4' }
};
/** Seconds into the clip where the blueprint is fully exploded (stable 2.8–4.8 s). */
export const HOLD_AT = 3.6;
/** Scroll progress through the hero (0–1) at which the clip is sent to the hold frame. */
const HOLD_FROM = 0.35;
const LG_MIN_WIDTH = 900;

/**
 * How the full-bleed photo is framed: 'center' keeps the mast mid-frame,
 * 'offset' pushes it right of centre so the copy sits on clean sky.
 * `?crop=center` in the URL previews the other one.
 */
export const HERO_CROP = 'offset';

function heroCrop() {
  if (typeof window === 'undefined') return HERO_CROP;
  const q = new URLSearchParams(window.location.search).get('crop');
  return q === 'offset' || q === 'center' ? q : HERO_CROP;
}

/** Skip the clip for people who asked for less motion or are saving data. */
function wantsVideo() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|\b)2g/.test(conn.effectiveType || ''))) return false;
  return true;
}

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export default function Stage({ children }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const shadeRef = useRef(null);
  const stillRef = useRef(null);
  const holdRef = useRef(false);
  const useVideoRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [useVideo, setUseVideo] = useState(false);
  const [size, setSize] = useState('sm');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSize(window.innerWidth >= LG_MIN_WIDTH ? 'lg' : 'sm');
    const v = wantsVideo();
    setUseVideo(v);
    useVideoRef.current = v;
    setReady(true);
  }, []);

  // The clip: loop while the hero is in view, hold on the blueprint frame otherwise.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !useVideo) return undefined;
    const onPlaying = () => setPlaying(true);
    const onError = () => {
      setUseVideo(false);
      useVideoRef.current = false;
    };
    const onTime = () => {
      if (holdRef.current && !v.paused && v.currentTime >= HOLD_AT && v.currentTime < HOLD_AT + 0.7) v.pause();
    };
    v.addEventListener('playing', onPlaying);
    v.addEventListener('error', onError);
    v.addEventListener('timeupdate', onTime);
    const p = v.play?.();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('error', onError);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [useVideo]);

  // Scroll: darken the stage and flip between looping and holding.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const p = clamp(window.scrollY / (vh * 0.9), 0, 1);
      const hold = p >= HOLD_FROM;
      if (hold !== holdRef.current) {
        holdRef.current = hold;
        const v = videoRef.current;
        // leaving hold: resume the loop (the timeupdate handler pauses it again on
        // the next pass through the peak once hold is back on)
        if (v && !hold && v.paused && useVideoRef.current) {
          const pr = v.play?.();
          if (pr && typeof pr.catch === 'function') pr.catch(() => {});
        }
      }
      if (shadeRef.current) shadeRef.current.style.opacity = String(0.1 + 0.52 * p);
      if (stillRef.current) stillRef.current.style.opacity = String(p);
      root.style.setProperty('--stage-p', p.toFixed(3));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="stage" ref={rootRef} data-crop={heroCrop()}>
      <div className="stage__bg" aria-hidden="true">
        <div className="stage__media">
          <img className="stage__poster" src={HERO_IMAGE} srcSet={HERO_IMAGE_SET} sizes="100vw" alt="" fetchpriority="high" decoding="async" />
          {useVideo && (
            <video
              ref={videoRef}
              className={`stage__video${playing ? ' is-playing' : ''}`}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              poster={HERO_IMAGE}
            >
              {/* mp4 first: at these settings H.264 comes out smaller than VP9 */}
              <source src={HERO_VIDEO[size].mp4} type="video/mp4" />
              <source src={HERO_VIDEO[size].webm} type="video/webm" />
            </video>
          )}
          {ready && !useVideo && (
            /* no clip (reduced motion, data saver, or a failed load): the blueprint still fades in instead */
            <img className="stage__still" ref={stillRef} src={HERO_STILL} alt="" decoding="async" />
          )}
        </div>
        <div className="stage__vignette" />
        <div className="stage__shade" ref={shadeRef} />
      </div>

      {children}

      <div className="stage__fade" aria-hidden="true" />
    </div>
  );
}
