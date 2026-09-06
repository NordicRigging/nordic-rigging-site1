import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './MaskedHeading.css';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A heading whose letterforms are filled by a moving video (or image)
 * instead of a flat colour. Structure: a hidden "measure" span sets the
 * row's box in real layout pixels (so the word can be any font/size and the
 * row still sizes itself correctly); a "reveal" layer, clipped to an SVG
 * <clipPath> built from that same box, fills the row; the media inside sits
 * larger than the row and gsap moves it with a transform, so the fill drifts
 * instead of sitting static behind the glyphs.
 */
export default function MaskedHeading({
  text,
  as: Tag = 'span',
  mediaType = 'video',
  videoSrc,
  imageSrc,
  weight = 800,
  className = ''
}) {
  const rawId = useId();
  const clipId = `mh-clip-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const rowRef = useRef(null);
  const mediaRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: Math.ceil(width), h: Math.ceil(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !box.w) return undefined;
    if (prefersReduced()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        media,
        { xPercent: -6, yPercent: 4, scale: 1.16 },
        { xPercent: 0, yPercent: 0, scale: 1, duration: 1.8, ease: 'power3.out' }
      );
      gsap.to(media, {
        xPercent: 3,
        yPercent: -2,
        duration: 9,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.8
      });
    });
    return () => ctx.revert();
  }, [box.w, box.h]);

  const fontSize = box.h ? box.h * 1.08 : 0;

  return (
    <Tag className={`masked-heading ${className}`.trim()} style={{ '--mh-weight': weight }} aria-hidden="true">
      <span className="masked-heading__row" ref={rowRef}>
        <span className="masked-heading__measure">{text}</span>

        {box.w > 0 && (
          <span className="masked-heading__reveal" style={{ clipPath: `url(#${clipId})` }}>
            {mediaType === 'video' ? (
              <video ref={mediaRef} className="masked-heading__media" autoPlay muted loop playsInline preload="auto">
                {videoSrc?.webm && <source src={videoSrc.webm} type="video/webm" />}
                {videoSrc?.mp4 && <source src={videoSrc.mp4} type="video/mp4" />}
              </video>
            ) : (
              <img ref={mediaRef} className="masked-heading__media" src={imageSrc} alt="" />
            )}
          </span>
        )}

        <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text x="0" y={box.h / 2} dominantBaseline="central" fontSize={fontSize} className="masked-heading__clip-text">
                {text}
              </text>
            </clipPath>
          </defs>
        </svg>
      </span>
    </Tag>
  );
}
