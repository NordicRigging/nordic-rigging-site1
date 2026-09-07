import { useEffect, useRef } from 'react';
import './TabPanelFX.css';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A quiet radar sweep behind the active tab panel — canvas 2D, not the
 * WebGL weight of GradientWaves. A faint grid plus a slow rotating wedge,
 * tucked into one corner so it reads as an instrument, not a bullseye
 * stamped over the text. Pauses off-screen and respects reduced motion.
 */
export default function TabPanelFX() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = prefersReduced();
    let w = 0;
    let h = 0;
    let dpr = 1;

    const size = () => {
      const rect = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(parent);

    let angle = 0;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Fixed pixel size, not proportional to the panel's full height: some
      // panels run very tall (three service cards, the Rig-Sense highlight,
      // the footer), and a size derived from that height would sweep the
      // effect down across the card grid instead of staying a small corner
      // accent for the whole panel. Kept small enough to clear the Palvelut
      // panel's own card row (starts ~159px down, measured directly) too —
      // this canvas is one shared, ever-present element behind whichever
      // tab is showing, so its footprint has to stay clear of every panel's
      // top content, not just the three shorter ones.
      const cx = w - 85;
      const cy = 50;
      const r = Math.min(90, w * 0.32);

      ctx.strokeStyle = 'rgba(80, 230, 160, 0.22)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 3) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      if (ctx.createConicGradient) {
        const sweep = ctx.createConicGradient(angle, cx, cy);
        sweep.addColorStop(0, 'rgba(100, 250, 170, 0.34)');
        sweep.addColorStop(0.09, 'rgba(100, 250, 170, 0.1)');
        sweep.addColorStop(0.18, 'rgba(100, 250, 170, 0)');
        sweep.addColorStop(1, 'rgba(100, 250, 170, 0)');
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = sweep;
        ctx.fill();
        ctx.restore();
      }
    };
    draw();

    let raf = 0;
    let isVisible = true;
    const tryStart = () => {
      if (reduced || !isVisible || raf !== 0) return;
      const loop = () => {
        angle += 0.005;
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(parent);
    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas className="tab-fx" ref={canvasRef} aria-hidden="true" />;
}
