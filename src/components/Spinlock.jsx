import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './Spinlock.css';

gsap.registerPlugin(ScrollTrigger);

// The original targets were lost with the previous build — swap these for the
// exact product page / film when known.
const READ_MORE_URL = 'https://www.spinlock.co.uk';
const WATCH_VIDEO_URL = 'https://www.youtube.com/results?search_query=spinlock+rig-sense';

export default function Spinlock() {
  const sectionRef = useRef(null);
  const gaugeRef = useRef(null);
  const gaugeInnerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        // drift in from the side…
        gsap.fromTo(
          gaugeRef.current,
          { x: 160, opacity: 0, rotate: 5 },
          {
            x: 0,
            opacity: 1,
            rotate: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 30%',
              scrub: true
            }
          }
        );
        // …then follow scroll with a slow parallax
        gsap.fromTo(
          gaugeInnerRef.current,
          { yPercent: -8 },
          {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
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
          <p className="eyebrow">Partner gear</p>
          <h2 className="display section__title" id="spinlock-title">
            Spinlock
            <br />
            Rig-Sense Pro
          </h2>
          <p className="section__lede">
            Rig tune you can repeat. We set shrouds by numbers, not by feel — measured with
            Spinlock&rsquo;s Rig-Sense tension gauge, logged, and the same after every re-step.
          </p>
          <div className="spinlock__actions">
            <a className="btn btn--solid" href={READ_MORE_URL} target="_blank" rel="noreferrer">
              Read more
            </a>
            <a className="btn" href={WATCH_VIDEO_URL} target="_blank" rel="noreferrer">
              Watch video
            </a>
          </div>
        </div>

        <figure className="spinlock__gauge" ref={gaugeRef} aria-hidden="true">
          <div className="spinlock__gauge-inner" ref={gaugeInnerRef}>
            <img
              src="/images/spinlock-rig-sense.png"
              alt=""
              loading="lazy"
              decoding="async"
              onError={e => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.classList.add('spinlock__gauge-inner--fallback');
              }}
            />
            {/* Designed stand-in until the product photo lands at
                public/images/spinlock-rig-sense.png */}
            <svg
              className="spinlock__dial"
              viewBox="0 0 220 300"
              role="img"
              aria-label="Rig tension gauge"
            >
              <rect x="10" y="10" width="200" height="280" rx="26" fill="#101922" stroke="rgba(242,245,246,0.16)" />
              <rect x="26" y="26" width="168" height="150" rx="16" fill="#06090d" stroke="rgba(242,245,246,0.1)" />
              {Array.from({ length: 21 }, (_, i) => {
                const a = (-210 + i * (240 / 20)) * (Math.PI / 180);
                const cx = 110;
                const cy = 118;
                const r1 = 62;
                const r2 = i % 5 === 0 ? 48 : 55;
                return (
                  <line
                    key={i}
                    x1={cx + r1 * Math.cos(a)}
                    y1={cy + r1 * Math.sin(a)}
                    x2={cx + r2 * Math.cos(a)}
                    y2={cy + r2 * Math.sin(a)}
                    stroke={i % 5 === 0 ? '#c7d1d6' : '#7c8b94'}
                    strokeWidth={i % 5 === 0 ? 2.4 : 1.2}
                  />
                );
              })}
              <line
                x1="110"
                y1="118"
                x2={110 + 56 * Math.cos((-210 + 0.62 * 240) * (Math.PI / 180))}
                y2={118 + 56 * Math.sin((-210 + 0.62 * 240) * (Math.PI / 180))}
                stroke="#ff5a28"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="110" cy="118" r="6" fill="#ff5a28" />
              <text x="110" y="205" textAnchor="middle" fill="#f2f5f6" fontFamily="JetBrains Mono, monospace" fontSize="20">
                412 kg
              </text>
              <text x="110" y="238" textAnchor="middle" fill="#7c8b94" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="3">
                RIG-SENSE PRO
              </text>
              <rect x="58" y="254" width="104" height="14" rx="7" fill="#06090d" stroke="rgba(242,245,246,0.1)" />
              <circle cx="70" cy="261" r="3" fill="#ff5a28" />
            </svg>
          </div>
        </figure>
      </div>
    </section>
  );
}
