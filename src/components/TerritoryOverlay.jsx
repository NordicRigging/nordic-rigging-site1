import { useCallback, useEffect, useRef } from 'react';

import {
  SEQ,
  TERRITORY_MARKS,
  TERRITORY_REGIONS,
  TERRITORY_GLOW,
  TERRITORY_RADAR
} from '../lib/filmConfig.js';
import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = v => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/**
 * Territory overlay — everything here is rendered in code, none of it baked
 * into video.
 *
 * Nothing appears until the footage has stopped (`settled`), so every position
 * below refers to the one fixed frame at the cloud-clear mark. Coordinates are
 * percentages of the video frame and live in src/lib/filmConfig.js.
 */
export default function TerritoryOverlay({
  apiRef,
  frameAspect = 16 / 9,
  frameScale = 1,
  staticMode = false
}) {
  const { t } = useLang();
  const rootRef = useRef(null);
  const coverRef = useRef(null);
  const glowRef = useRef(null);
  const regionsRef = useRef(null);
  const baseRef = useRef(null);
  const secondRef = useRef(null);
  const cardRef = useRef(null);
  const legendRef = useRef(null);

  const resize = useCallback(() => {
    const root = rootRef.current;
    const cover = coverRef.current;
    if (!root || !cover) return;
    const { clientWidth: w, clientHeight: h } = root;
    if (!w || !h) return;
    // Replicate the video's object-fit: cover box so overlays track the
    // terrain. A null width/height in the manifest would make this NaN and
    // collapse the whole marker layer, so fall back to the clip's aspect.
    const aspect = Number.isFinite(frameAspect) && frameAspect > 0 ? frameAspect : 16 / 9;
    const scale = Number.isFinite(frameScale) && frameScale > 0 ? frameScale : 1;
    // the video is enlarged by `scale`, so its visible rectangle grows with it
    const coverW = Math.max(w, h * aspect) * scale;
    const coverH = coverW / aspect;
    const coverLeft = (w - coverW) / 2;
    const coverTop = (h - coverH) / 2;
    cover.style.width = `${coverW}px`;
    cover.style.height = `${coverH}px`;
    cover.style.left = `${coverLeft}px`;
    cover.style.top = `${coverTop}px`;

    // The card lives outside the marker (a transformed ancestor would trap it
    // off-screen on narrow viewports). Anchor it to the marker in root space
    // and clamp it into view; transform-origin still points at the marker, so
    // it grows out of it.
    const card = cardRef.current;
    if (!card) return;
    const turkuX = coverLeft + (TERRITORY_MARKS.turku.x / 100) * coverW;
    const turkuY = coverTop + (TERRITORY_MARKS.turku.y / 100) * coverH;
    const pad = 16;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const left = Math.min(Math.max(turkuX + 22, pad), Math.max(w - cw - pad, pad));
    const top = Math.min(Math.max(turkuY + 24, pad), Math.max(h - ch - pad, pad));
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.transformOrigin = `${(turkuX - left).toFixed(1)}px ${(turkuY - top).toFixed(1)}px`;
  }, [frameAspect, frameScale]);

  const update = useCallback(
    (p, settled = false) => {
      const T = SEQ.TERRITORY;
      const stages = [
        [glowRef, T.GLOW_IN],
        [regionsRef, T.GLOW_IN],
        [baseRef, T.BASE_IN],
        [secondRef, T.SECOND_IN],
        [cardRef, T.CARD_IN],
        [legendRef, T.LEGEND_IN]
      ];
      for (const [ref, at] of stages) {
        const el = ref.current;
        if (!el) continue;
        // gated on `settled`: overlays may only exist over a stopped frame
        const o = staticMode ? 1 : settled ? smooth((p - at) / 0.05) : 0;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
        if (ref === cardRef) {
          // grows out of the marker rather than appearing from nowhere
          el.style.transform = `scale(${(0.55 + 0.45 * o).toFixed(3)})`;
          el.style.pointerEvents = o > 0.9 ? 'auto' : 'none';
        }
      }
    },
    [staticMode]
  );

  useEffect(() => {
    if (apiRef) apiRef.current = { update, resize };
    // re-anchor after layout settles (card size depends on the language)
    resize();
    const raf = requestAnimationFrame(resize);
    update(1, staticMode);
    return () => {
      cancelAnimationFrame(raf);
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, update, resize, staticMode, t]);

  const turku = TERRITORY_MARKS.turku;
  const helsinki = TERRITORY_MARKS.helsinki;
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="territory" ref={rootRef}>
      <div className="territory__cover" ref={coverRef}>
        {/* soft radial weight — strongest over Turku, falling away eastward */}
        <div
          className="territory__glow"
          ref={glowRef}
          aria-hidden="true"
          style={{
            left: `${TERRITORY_GLOW.x}%`,
            top: `${TERRITORY_GLOW.y}%`,
            width: `${TERRITORY_GLOW.width}%`,
            height: `${TERRITORY_GLOW.height}%`,
            transform: `translate(-50%, -50%) rotate(${TERRITORY_GLOW.rotate}deg)`
          }}
        />

        <div className="territory__regions" ref={regionsRef} aria-hidden="true">
          <span
            className="territory__region"
            style={{ left: `${TERRITORY_REGIONS.varsinaisSuomi.x}%`, top: `${TERRITORY_REGIONS.varsinaisSuomi.y}%` }}
          >
            {t.territory.regionA}
          </span>
          <span
            className="territory__region"
            style={{ left: `${TERRITORY_REGIONS.uusimaa.x}%`, top: `${TERRITORY_REGIONS.uusimaa.y}%` }}
          >
            {t.territory.regionB}
          </span>
        </div>

        {/* Helsinki — a small dot and a label, nothing more */}
        <div
          className="territory__mark territory__mark--minor"
          ref={secondRef}
          style={{ left: `${helsinki.x}%`, top: `${helsinki.y}%` }}
        >
          <span className="territory__dot" aria-hidden="true" />
          <span className="territory__minor-label">{helsinki.label}</span>
        </div>

        {/* Turku — the base: radar rings, dominant label, and its own card */}
        <div
          className="territory__mark territory__mark--base"
          ref={baseRef}
          style={{ left: `${turku.x}%`, top: `${turku.y}%` }}
        >
          <span className="territory__radar" aria-hidden="true">
            {Array.from({ length: TERRITORY_RADAR.rings }, (_, i) => (
              <span
                key={i}
                className="territory__ring"
                style={{
                  animationDuration: `${TERRITORY_RADAR.duration}s`,
                  animationDelay: `${(i * TERRITORY_RADAR.duration) / TERRITORY_RADAR.rings}s`,
                  '--ring-scale': TERRITORY_RADAR.maxScale
                }}
              />
            ))}
          </span>
          <span className="territory__dot" aria-hidden="true" />
          <span className="territory__tag">
            <strong>{turku.label}</strong>
            <em>{t.territory.base}</em>
            <code>{turku.coords}</code>
          </span>
        </div>
      </div>

      {/* Turku's card: opens itself once the markers are up, and stays open.
          Positioned against the marker by resize() above. */}
      <div className="territory__card" ref={cardRef}>
        <img
          className="territory__card-logo"
          src="/images/logo.svg"
          alt=""
          aria-hidden="true"
          onError={e => (e.currentTarget.style.display = 'none')}
        />
        <p className="territory__card-name">{CONTACT.company}</p>
        <p className="territory__card-address">{CONTACT.address}</p>
        <button type="button" className="territory__card-btn" onClick={scrollToContact}>
          {t.contact.eyebrow}
        </button>
      </div>

      <p className="territory__legend" ref={legendRef}>
        <span className="territory__legend-key" aria-hidden="true" />
        {t.territory.legend}
      </p>
    </div>
  );
}
