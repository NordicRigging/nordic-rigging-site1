import { useEffect, useRef, useState } from 'react';

import { SEQ, DEFAULT_MANIFEST, loadManifest } from '../lib/filmConfig.js';
import TerritoryOverlay from './TerritoryOverlay.jsx';
import './FilmSequence.css';

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = v => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/**
 * One outstanding seek per element, always retargeted to the latest value —
 * scroll events collapse into at most one currentTime write per 'seeked'.
 */
function makeScrubber(video) {
  const state = { target: 0, pending: false };
  const onSeeked = () => {
    state.pending = false;
    apply();
  };
  function apply() {
    if (state.pending || video.readyState < 1) return;
    const dur = video.duration;
    if (!Number.isFinite(dur)) return;
    const t = Math.min(state.target, Math.max(dur - 0.05, 0));
    if (Math.abs(video.currentTime - t) < 0.02) return;
    state.pending = true;
    try {
      video.currentTime = t;
    } catch {
      state.pending = false;
    }
  }
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('loadedmetadata', apply);
  return {
    scrub(t) {
      state.target = t;
      apply();
    },
    destroy() {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadedmetadata', apply);
    }
  };
}

export default function FilmSequence() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const climbRef = useRef(null);
  const orbitRef = useRef(null);
  const climbPosterRef = useRef(null);
  const orbitLayerRef = useRef(null);
  const veilRef = useRef(null);
  const heroRef = useRef(null);
  const overlayApiRef = useRef(null);
  const hintRef = useRef(null);

  const [manifest, setManifest] = useState(DEFAULT_MANIFEST);
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    let alive = true;
    loadManifest().then(m => {
      if (alive) setManifest(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (reduced) return undefined;

    const wrap = wrapRef.current;
    const climb = climbRef.current;
    const orbit = orbitRef.current;
    if (!wrap || !climb || !orbit) return undefined;

    const climbMeta = manifest.clips.climb;
    const orbitMeta = manifest.clips.orbit;

    const climbScrub = makeScrubber(climb);
    const orbitScrub = makeScrubber(orbit);

    let wrapTop = 0;
    let travel = 1;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      wrapTop = rect.top + window.scrollY;
      travel = Math.max(rect.height - window.innerHeight, 1);
    };
    measure();

    // The climb is the one eagerly loaded asset; orbit waits for approach.
    let orbitRequested = false;
    const requestOrbit = () => {
      if (orbitRequested) return;
      orbitRequested = true;
      orbit.preload = 'auto';
      orbit.load();
    };

    // Sentinel enters the viewport exactly when sequence progress reaches
    // ORBIT_PRELOAD_AT, so orbit starts loading as its section approaches.
    const sentinelPct =
      ((SEQ.ORBIT_PRELOAD_AT * (SEQ.SCROLL_VH - 100) + 100) / SEQ.SCROLL_VH) * 100;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = `position:absolute;top:${sentinelPct}%;height:1px;width:1px;pointer-events:none;`;
    wrap.appendChild(sentinel);
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) requestOrbit();
      },
      { threshold: 0 }
    );
    io.observe(sentinel);

    const durOf = (video, fallback) =>
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallback;

    let raf = 0;
    let lastP = -1;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const p = clamp01((window.scrollY - wrapTop) / travel);
      if (p === lastP) return; // draw coalescing: idle scroll costs nothing
      lastP = p;

      if (p > SEQ.ORBIT_PRELOAD_AT) requestOrbit();

      // — climb scrub —
      const climbDur = durOf(climb, climbMeta.duration);
      climbScrub.scrub(clamp01(p / SEQ.CLIMB_END) * climbDur);

      // — orbit scrub + crossfade —
      const zone = clamp01((p - SEQ.ORBIT_START) / (SEQ.CLIMB_END - SEQ.ORBIT_START));
      const orbitDur = durOf(orbit, orbitMeta.duration);
      if (p >= SEQ.ORBIT_START - 0.05) {
        orbitScrub.scrub(clamp01((p - SEQ.ORBIT_START) / (1 - SEQ.ORBIT_START)) * orbitDur);
      }
      const orbitLayer = orbitLayerRef.current;
      if (orbitLayer) {
        orbitLayer.style.opacity = smooth(zone).toFixed(3);
        orbitLayer.style.visibility = zone > 0 ? 'visible' : 'hidden';
      }

      // near-white veil peaking mid-crossfade — absorbs any tonal mismatch
      const veil = veilRef.current;
      if (veil) {
        const bell = Math.sin(Math.PI * zone);
        veil.style.opacity = (SEQ.VEIL_MAX * bell).toFixed(3);
      }

      // — hero type —
      const hero = heroRef.current;
      if (hero) {
        const fade =
          1 - smooth((p - SEQ.HERO_FADE_START) / (SEQ.HERO_FADE_END - SEQ.HERO_FADE_START));
        hero.style.opacity = fade.toFixed(3);
        hero.style.transform = `translateY(${(-38 * (1 - fade)).toFixed(1)}px)`;
        hero.style.visibility = fade <= 0.001 ? 'hidden' : 'visible';
      }

      const hint = hintRef.current;
      if (hint) hint.style.opacity = (1 - smooth(p / 0.06)).toFixed(3);

      overlayApiRef.current?.update(p);
    };
    raf = requestAnimationFrame(frame);

    const onResize = () => {
      measure();
      lastP = -1;
      overlayApiRef.current?.resize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      io.disconnect();
      sentinel.remove();
      climbScrub.destroy();
      orbitScrub.destroy();
    };
  }, [manifest, reduced]);

  // Poster-first paint: the video layer only fades up once it can draw frames.
  const markReady = e => {
    e.currentTarget.dataset.ready = 'true';
    e.currentTarget.style.display = ''; // recover from an earlier failed source
  };

  const climbMeta = manifest.clips.climb;
  const orbitMeta = manifest.clips.orbit;

  return (
    <section
      ref={wrapRef}
      className={`film${reduced ? ' film--static' : ''}`}
      style={reduced ? undefined : { height: `${SEQ.SCROLL_VH}vh` }}
      aria-label="Nordic Rigging — from the deck to the archipelago"
    >
      <div className="film__stage" ref={stageRef}>
        {/* designed ground: even with zero media the stage reads as sky→cloud */}
        <div className="film__ground" aria-hidden="true" />

        <img
          ref={climbPosterRef}
          className="film__poster"
          src={climbMeta.poster}
          alt=""
          aria-hidden="true"
          onError={e => (e.currentTarget.style.display = 'none')}
        />
        <video
          ref={climbRef}
          className="film__video"
          src={climbMeta.src}
          preload={reduced ? 'metadata' : 'auto'}
          muted
          playsInline
          onLoadedData={markReady}
          onError={e => (e.currentTarget.style.display = 'none')}
        />

        <div className="film__orbit" ref={orbitLayerRef}>
          <img
            className="film__poster"
            src={orbitMeta.poster}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <video
            ref={orbitRef}
            className="film__video"
            src={orbitMeta.src}
            preload="none"
            muted
            playsInline
            onLoadedData={markReady}
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <TerritoryOverlay
            apiRef={overlayApiRef}
            frameAspect={orbitMeta.width / orbitMeta.height}
            staticMode={reduced}
          />
        </div>

        <div className="film__veil" ref={veilRef} aria-hidden="true" />

        <header className="film__hero" ref={heroRef}>
          <h1 className="display film__title">
            Nordic
            <br />
            Rigging
          </h1>
          <p className="film__tag">Your Sailboat’s Best Crew on Land.</p>
        </header>

        <div className="film__hint" ref={hintRef} aria-hidden="true">
          <span className="film__hint-line" />
          Scroll
        </div>
      </div>
    </section>
  );
}
