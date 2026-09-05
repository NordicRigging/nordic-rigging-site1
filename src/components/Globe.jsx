import { useEffect, useRef } from 'react';

import { CONTACT } from '../lib/content.js';
import { useLang } from '../lib/LanguageContext.jsx';

/**
 * A canvas globe that turns from the mid-Atlantic to settle on Finland, then
 * lights up Turku and the service area along the south-west coast.
 *
 * The map data and d3-geo load lazily, only when the section is near the
 * viewport, so the rest of the page pays nothing for it. With reduced motion
 * the final frame is drawn straight away.
 */
const START = [-38, 10]; // lon, lat the globe faces at first
const END = [23.5, 43]; // Finland high in the frame: the sphere's lower part is cropped away
const AREA_CENTER = [23.6, 60.3]; // Varsinais-Suomi + Uusimaa coast
const AREA_RADIUS = 1.35; // degrees of arc
const DURATION = 2600;

const easeInOut = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function Globe() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const turkuRef = useRef(null);
  const helsinkiRef = useRef(null);
  const { t } = useLang();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    let cancelled = false;
    let raf = 0;
    let ro = null;
    let io = null;

    const boot = async () => {
      const [d3, topo, worldMod] = await Promise.all([
        import('d3-geo'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json')
      ]);
      if (cancelled) return;

      const world = worldMod.default ?? worldMod;
      const countries = topo.feature(world, world.objects.countries);
      const finland = countries.features.find(f => String(f.id) === '246');
      const graticule = d3.geoGraticule10();
      const area = d3.geoCircle().center(AREA_CENTER).radius(AREA_RADIUS)();
      const interp = d3.geoInterpolate(START, END);

      const ctx = canvas.getContext('2d');
      const projection = d3.geoOrthographic().clipAngle(90);
      const path = d3.geoPath(projection, ctx);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      let size = 0;
      let dpr = 1;
      let progress = reduced ? 1 : 0;

      const resize = () => {
        const r = wrap.getBoundingClientRect();
        size = Math.max(220, Math.floor(Math.min(r.width, r.height || r.width)));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        projection.translate([size / 2, size / 2]).scale(size / 2 - 6);
      };

      const place = (el, coords, alpha) => {
        if (!el) return;
        const center = interp(progress);
        const visible = d3.geoDistance(coords, center) < Math.PI / 2 - 0.05;
        const p = projection(coords);
        if (!p || !visible) {
          el.style.opacity = '0';
          return;
        }
        el.style.opacity = String(alpha);
        el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px)`;
      };

      const draw = () => {
        const c = interp(progress);
        projection.rotate([-c[0], -c[1], 0]);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);

        // ocean
        const g = ctx.createRadialGradient(size * 0.36, size * 0.3, size * 0.04, size / 2, size / 2, size / 2);
        g.addColorStop(0, '#24528c');
        g.addColorStop(0.65, '#122c55');
        g.addColorStop(1, '#08152c');
        ctx.beginPath();
        path({ type: 'Sphere' });
        ctx.fillStyle = g;
        ctx.fill();

        // graticule
        ctx.beginPath();
        path(graticule);
        ctx.strokeStyle = 'rgba(170, 200, 240, 0.12)';
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // land
        ctx.beginPath();
        path(countries);
        ctx.fillStyle = '#27476f';
        ctx.fill();
        ctx.strokeStyle = 'rgba(190, 212, 240, 0.35)';
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Finland
        if (finland) {
          ctx.beginPath();
          path(finland);
          ctx.fillStyle = '#3d80c6';
          ctx.fill();
          ctx.strokeStyle = '#9ccbf5';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // service area, fades in as the globe settles
        const a = Math.max(0, Math.min(1, (progress - 0.8) / 0.2));
        if (a > 0) {
          ctx.beginPath();
          path(area);
          ctx.fillStyle = `rgba(142, 208, 255, ${0.28 * a})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(142, 208, 255, ${0.95 * a})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // rim
        ctx.beginPath();
        path({ type: 'Sphere' });
        ctx.strokeStyle = 'rgba(160, 200, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        place(turkuRef.current, CONTACT.turku, a);
        place(helsinkiRef.current, CONTACT.helsinki, a);
      };

      let t0 = 0;
      const frame = now => {
        if (cancelled) return;
        if (!t0) t0 = now;
        const x = Math.min(1, (now - t0) / DURATION);
        progress = easeInOut(x);
        draw();
        if (x < 1) raf = requestAnimationFrame(frame);
        else wrap.classList.add('is-settled');
      };

      resize();
      draw();
      ro = new ResizeObserver(() => {
        resize();
        draw();
      });
      ro.observe(wrap);

      if (reduced) {
        wrap.classList.add('is-settled');
        return;
      }
      io = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting)) {
            io.disconnect();
            io = null;
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0.3 }
      );
      io.observe(wrap);
    };

    boot().catch(() => {
      /* the section still reads fine without the globe */
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
    };
  }, []);

  return (
    <div className="globe" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={t.location.globeAria} />
      <div className="globe__pin globe__pin--turku" ref={turkuRef} aria-hidden="true">
        <span className="globe__dot" />
        <span className="globe__label">{t.location.globeLabel}</span>
      </div>
      <div className="globe__pin globe__pin--helsinki" ref={helsinkiRef} aria-hidden="true">
        <span className="globe__dot globe__dot--small" />
        <span className="globe__label globe__label--small">{t.location.globeSecondary}</span>
      </div>
    </div>
  );
}
