import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

import { cn } from '../lib/utils.js';
import './TracingBeam.css';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Adapted from the community TracingBeam pattern (motion's useScroll/
 * useTransform/useSpring driving a gradient that travels down a path as the
 * wrapped content scrolls by). Changes from the original beyond the
 * navy/cyan recolour:
 *
 * 1. No Tailwind here, so the beam's resting horizontal position is derived
 *    from the same --pad/--max expression .wrap itself centres on, rather
 *    than a fixed -left-4/-left-20 offset tuned for a max-w-4xl column.
 * 2. `launched` (from Home.jsx, one scroll listener shared with Hero's own
 *    fade — see its comment) gates visibility: the beam stays invisible
 *    until the hero's dim box scrolls out of view, then animates in to its
 *    resting spot at the content's left edge. `anchorFromRef` is now only
 *    used for the cosmetic fly-in start point (still captured via
 *    IntersectionObserver, best-effort — if it fires late the beam still
 *    reveals on time via `launched`, just without the exact fly-from
 *    offset, rather than not appearing at all).
 */
export default function TracingBeam({ children, className = '', anchorFromRef, launched }) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const anchorRef = useRef(null);
  const [svgHeight, setSvgHeight] = useState(0);
  const [flyFrom, setFlyFrom] = useState(null);
  const revealed = anchorFromRef ? !!launched : true;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setSvgHeight(Math.ceil(entry.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Best-effort only (see the component doc above): capture the dim box's
  // last on-screen position so the beam's reveal can visibly travel from
  // there. Armed whenever not currently launched — which includes after a
  // restart (Home.jsx resets `launched` to false when the user scrolls back
  // to the top), so the next launch captures a fresh position rather than
  // reusing the previous cycle's.
  useEffect(() => {
    if (launched) return undefined;
    const box = anchorFromRef?.current;
    if (!box) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) return;
        const boxRect = entry.boundingClientRect;
        const anchorRect = anchorRef.current?.getBoundingClientRect();
        if (anchorRect) {
          setFlyFrom({
            x: boxRect.left + boxRect.width / 2 - (anchorRect.left + anchorRect.width / 2),
            y: boxRect.top - anchorRect.top
          });
        }
        io.disconnect();
      },
      { threshold: 0 }
    );
    io.observe(box);
    return () => io.disconnect();
  }, [anchorFromRef, launched]);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), { stiffness: 500, damping: 90 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight]), { stiffness: 500, damping: 90 });

  const anchorStyle =
    !revealed && flyFrom === null
      ? undefined
      : { '--beam-from-x': `${flyFrom?.x ?? 0}px`, '--beam-from-y': `${flyFrom?.y ?? 0}px` };

  return (
    <motion.div ref={ref} className={cn('tracing-beam', className)}>
      <div
        ref={anchorRef}
        className={`tracing-beam__anchor${revealed ? ' is-revealed' : ''}${prefersReduced() ? ' no-fly' : ''}`}
        style={anchorStyle}
      >
        <motion.div
          transition={{ duration: 0.2, delay: 0.5 }}
          animate={{ boxShadow: scrollYProgress.get() > 0 ? 'none' : '0 3px 8px rgba(3, 9, 20, 0.4)' }}
          className="tracing-beam__dot"
        >
          <motion.div
            transition={{ duration: 0.2, delay: 0.5 }}
            animate={{
              backgroundColor: scrollYProgress.get() > 0 ? 'var(--accent)' : 'var(--glass-2)',
              borderColor: scrollYProgress.get() > 0 ? 'var(--accent-2)' : 'var(--line-strong)'
            }}
            className="tracing-beam__dot-inner"
          />
        </motion.div>

        <svg viewBox={`0 0 20 ${svgHeight}`} width="20" height={svgHeight} className="tracing-beam__svg" aria-hidden="true">
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="var(--line-strong)"
            strokeOpacity="0.4"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#tracing-beam-gradient)"
            strokeWidth="1.5"
            className="tracing-beam__svg-glow"
          />
          <defs>
            <motion.linearGradient id="tracing-beam-gradient" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={y1} y2={y2}>
              <stop stopColor="#2e8bc0" stopOpacity="0" />
              <stop stopColor="#2e8bc0" />
              <stop offset="0.325" stopColor="#0f3460" />
              <stop offset="1" stopColor="#0f3460" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>

      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}
