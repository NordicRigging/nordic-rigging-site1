import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { SPINLOCK_GAUGE } from '../lib/filmConfig.js';
import { useLang } from '../lib/LanguageContext.jsx';
import './Spinlock.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * "Read more" went to the mast-work service page on the old site (the glass
 * card's LUE LISÄÄ opened the mastotyöt view) — kept pointing there.
 *
 * "Watch video": the old site had styling for a "Katso video" link but no
 * markup and no URL anywhere in its source, so there is no original target to
 * restore. Paste the film's URL here and the button appears automatically.
 */
const READ_MORE_TO = '/services/mast-work';
const WATCH_VIDEO_URL = '';

export default function Spinlock() {
  const sectionRef = useRef(null);
  const gaugeRef = useRef(null);
  const gaugeInnerRef = useRef(null);
  const { t } = useLang();
  const s = t.spinlock;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        // drift in from the side…
        gsap.fromTo(
          gaugeRef.current,
          { x: 150, opacity: 0, rotate: 4 },
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 35%', scrub: true }
          }
        );
        // …then float with scroll. yPercent carries the -50% centring as well,
        // since GSAP owns the transform once it animates it.
        const P = SPINLOCK_GAUGE.PARALLAX;
        gsap.fromTo(
          gaugeInnerRef.current,
          { xPercent: -50, yPercent: -50 - P },
          {
            yPercent: -50 + P,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section spinlock" id="spinlock" ref={sectionRef} aria-labelledby="spinlock-title">
      <div className="spinlock__grid">
        <div className="spinlock__copy">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 className="display section__title" id="spinlock-title">
            {s.title}
          </h2>
          <p className="section__lede">{s.body}</p>

          <p className="spinlock__badge">
            <span className="spinlock__badge-dot" aria-hidden="true" />
            {s.badge}
          </p>

          <div className="spinlock__actions">
            <Link className="btn btn--solid" to={READ_MORE_TO}>
              {s.readMore}
            </Link>
            {WATCH_VIDEO_URL && (
              <a className="btn" href={WATCH_VIDEO_URL} target="_blank" rel="noreferrer">
                {s.watchVideo}
              </a>
            )}
          </div>
        </div>

        {/* The frame clips the gauge's top, bottom and right edges, so the
            instrument reads as embedded in the page rather than placed on it. */}
        <div
          className="spinlock__frame"
          ref={gaugeRef}
          style={{
            '--sl-scale': SPINLOCK_GAUGE.SCALE,
            '--sl-offset-x': `${SPINLOCK_GAUGE.OFFSET_X}%`,
            '--sl-offset-y': `${SPINLOCK_GAUGE.OFFSET_Y}%`,
            '--sl-bleed-right': `${SPINLOCK_GAUGE.BLEED_RIGHT}rem`,
            '--sl-bleed-y': `${SPINLOCK_GAUGE.BLEED_Y}rem`
          }}
        >
          <img
            className="spinlock__gauge"
            ref={gaugeInnerRef}
            src="/images/spinlock-rig-sense.png"
            alt={s.gaugeAlt}
            loading="lazy"
            decoding="async"
            onError={e => e.currentTarget.classList.add('spinlock__gauge--missing')}
          />
        </div>
      </div>
    </section>
  );
}
