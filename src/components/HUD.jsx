import { useEffect, useRef } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { useLang } from '../lib/LanguageContext'

// Itäinen Rantakatu 74, Turku. The readout drifts from here as the page runs,
// as though the boat were working its way out through the archipelago.
const LAT_0 = 60.4382
const LON_0 = 22.2794
const HDG_0 = 198

const format = (progress) => {
  const heading = (HDG_0 + progress * 84) % 360
  return {
    hdg: `${String(Math.round(heading)).padStart(3, '0')}°`,
    lat: `${(LAT_0 - progress * 0.0416).toFixed(4)}° N`,
    lon: `${(LON_0 + progress * 0.0731).toFixed(4)}° E`,
    pct: progress,
  }
}

/**
 * Fixed instrumentation. Values are written straight to the DOM from the scroll
 * MotionValue so a 60fps readout never re-renders the React tree.
 */
export default function HUD() {
  const { t } = useLang()
  const { scrollYProgress } = useScroll()
  const hdgRef = useRef(null)
  const latRef = useRef(null)
  const lonRef = useRef(null)
  const barRef = useRef(null)

  const write = (progress) => {
    const { hdg, lat, lon, pct } = format(progress)
    if (hdgRef.current) hdgRef.current.textContent = hdg
    if (latRef.current) latRef.current.textContent = lat
    if (lonRef.current) lonRef.current.textContent = lon
    if (barRef.current) barRef.current.style.transform = `scaleY(${0.06 + pct * 0.94})`
  }

  useEffect(() => {
    write(scrollYProgress.get())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', write)

  return (
    <div
      aria-hidden="true"
      className="edge pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-4 md:inset-x-auto md:right-10 md:bottom-10 md:p-0"
    >
      <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2.5">
        {/* Desktop only: a travelled-distance tick beside the stack. */}
        <span className="absolute -left-4 hidden h-full w-px origin-top bg-slate-line md:block">
          <span ref={barRef} className="block h-full w-px origin-top bg-cyan/40" />
        </span>

        <span className="tech text-[10px] text-fog/55">
          <span className="text-fog/35">{t.hud.headingLabel} </span>
          <span ref={hdgRef}>198°</span>
        </span>
        <span className="hidden h-px w-4 bg-slate-line md:hidden" />
        <span className="tech text-[10px] text-fog/55">
          <span ref={latRef}>60.4382° N</span>
        </span>
        <span className="tech text-[10px] text-fog/55">
          <span ref={lonRef}>22.2794° E</span>
        </span>
      </div>
    </div>
  )
}
