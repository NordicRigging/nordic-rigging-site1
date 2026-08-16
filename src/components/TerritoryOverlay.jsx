import { useCallback, useEffect, useRef } from 'react';

import { SEQ, TERRITORY_MARKS } from '../lib/filmConfig.js';

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = v => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/**
 * Markers, service-area arc and legend over the orbital footage — all
 * rendered in code, none baked into video.
 *
 * Positions are percentages of the video frame; a JS-sized "cover box"
 * replicates the object-fit: cover crop so labels stay glued to the footage
 * at any viewport shape.
 */
export default function TerritoryOverlay({ apiRef, frameAspect = 16 / 9, staticMode = false }) {
  const rootRef = useRef(null);
  const coverRef = useRef(null);
  const baseRef = useRef(null);
  const secondRef = useRef(null);
  const areaRef = useRef(null);
  const legendRef = useRef(null);

  const resize = useCallback(() => {
    const root = rootRef.current;
    const cover = coverRef.current;
    if (!root || !cover) return;
    const { clientWidth: w, clientHeight: h } = root;
    if (!w || !h) return;
    const coverW = Math.max(w, h * frameAspect);
    const coverH = coverW / frameAspect;
    cover.style.width = `${coverW}px`;
    cover.style.height = `${coverH}px`;
    cover.style.left = `${(w - coverW) / 2}px`;
    cover.style.top = `${(h - coverH) / 2}px`;
  }, [frameAspect]);

  const update = useCallback(
    p => {
      const T = SEQ.TERRITORY;
      const stages = [
        [baseRef, T.BASE_IN],
        [secondRef, T.SECOND_IN],
        [areaRef, T.AREA_IN],
        [legendRef, T.LEGEND_IN]
      ];
      for (const [ref, at] of stages) {
        const el = ref.current;
        if (!el) continue;
        const o = staticMode ? 1 : smooth((p - at) / 0.06);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
      }
    },
    [staticMode]
  );

  useEffect(() => {
    if (apiRef) apiRef.current = { update, resize };
    resize();
    update(staticMode ? 1 : 0);
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, update, resize, staticMode]);

  const turku = TERRITORY_MARKS.turku;
  const helsinki = TERRITORY_MARKS.helsinki;

  // Quadratic arc between the two ports, bowed gently through the archipelago.
  const midX = (turku.x + helsinki.x) / 2;
  const midY = (turku.y + helsinki.y) / 2 + 7;
  const arcPath = `M ${turku.x} ${turku.y} Q ${midX} ${midY} ${helsinki.x} ${helsinki.y}`;

  return (
    <div className="territory" ref={rootRef}>
      <div className="territory__cover" ref={coverRef}>
        <div className="territory__area" ref={areaRef}>
          <svg
            className="territory__svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="territory__band" d={arcPath} vectorEffect="non-scaling-stroke" />
            <path className="territory__route" d={arcPath} vectorEffect="non-scaling-stroke" />
          </svg>
          <span
            className="territory__region"
            style={{ left: `${turku.x + (midX - turku.x) * 0.45}%`, top: `${turku.y + 11}%` }}
          >
            Varsinais-Suomi
          </span>
          <span
            className="territory__region"
            style={{ left: `${helsinki.x - (helsinki.x - midX) * 0.35}%`, top: `${helsinki.y + 9}%` }}
          >
            Uusimaa
          </span>
        </div>

        <div
          className="territory__mark territory__mark--base"
          ref={baseRef}
          style={{ left: `${turku.x}%`, top: `${turku.y}%` }}
        >
          <span className="territory__ring" aria-hidden="true" />
          <span className="territory__dot" aria-hidden="true" />
          <span className="territory__tag">
            <strong>{turku.label}</strong>
            <em>{turku.role}</em>
            <code>{turku.coords}</code>
          </span>
        </div>

        <div
          className="territory__mark"
          ref={secondRef}
          style={{ left: `${helsinki.x}%`, top: `${helsinki.y}%` }}
        >
          <span className="territory__dot" aria-hidden="true" />
          <span className="territory__tag">
            <strong>{helsinki.label}</strong>
            <code>{helsinki.coords}</code>
          </span>
        </div>
      </div>

      <p className="territory__legend" ref={legendRef}>
        <span className="territory__legend-key" aria-hidden="true" />
        Service area — Varsinais-Suomi &amp; Uusimaa
      </p>
    </div>
  );
}
