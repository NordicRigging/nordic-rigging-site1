import { useEffect, useRef } from 'react'
import { useMotionValueEvent } from 'framer-motion'
import { CONTACT } from '../lib/content'
import { useLang } from '../lib/LanguageContext'

/**
 * A canvas globe driven by an external scroll-linked progress (not its own
 * timer): it turns from the mid-Atlantic to Finland and zooms in as the
 * Contact section scrolls into view, ending tight enough that Turku and
 * Helsinki read as two distinct points rather than one blur. Map data and
 * d3-geo load lazily since this is well below the fold.
 */
const START = [-38, 10] // lon, lat the globe faces at first
const END = [23.5, 46] // Finland high in the frame: the sphere's lower part is cropped away
const AREA_CENTER = [23.6, 60.3] // Varsinais-Suomi + Uusimaa coast
const AREA_RADIUS = 1.35 // degrees of arc
const ZOOM = 2.6 // how much larger the projection scale gets by progress=1 - Turku
// and Helsinki are only ~75km apart, so this needs to be aggressive enough
// that they read as two separate points rather than one blur

export default function Globe({ progress }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const turkuRef = useRef(null)
  const helsinkiRef = useRef(null)
  const drawRef = useRef(() => {})
  const { t } = useLang()

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return undefined

    let cancelled = false
    let ro = null

    const boot = async () => {
      const [d3, topo, worldMod] = await Promise.all([
        import('d3-geo'),
        import('topojson-client'),
        import('world-atlas/countries-110m.json'),
      ])
      if (cancelled) return

      const world = worldMod.default ?? worldMod
      const countries = topo.feature(world, world.objects.countries)
      const finland = countries.features.find((f) => String(f.id) === '246')
      const graticule = d3.geoGraticule10()
      const area = d3.geoCircle().center(AREA_CENTER).radius(AREA_RADIUS)()
      const interp = d3.geoInterpolate(START, END)

      const ctx = canvas.getContext('2d')
      const projection = d3.geoOrthographic().clipAngle(90)
      const path = d3.geoPath(projection, ctx)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let size = 0
      let dpr = 1
      let baseScale = 0

      const resize = () => {
        const r = wrap.getBoundingClientRect()
        size = Math.max(220, Math.floor(Math.min(r.width, r.height || r.width)))
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`
        baseScale = size / 2 - 6
        projection.translate([size / 2, size / 2])
      }

      const place = (el, coords, center, alpha) => {
        if (!el) return
        const visible = d3.geoDistance(coords, center) < Math.PI / 2 - 0.05
        const p = projection(coords)
        if (!p || !visible) {
          el.style.opacity = '0'
          return
        }
        el.style.opacity = String(alpha)
        el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px)`
      }

      const draw = (rawProgress) => {
        const progress = reduced ? 1 : Math.max(0, Math.min(1, rawProgress))
        const c = interp(progress)
        projection.rotate([-c[0], -c[1], 0])
        projection.scale(baseScale * (1 + progress * (ZOOM - 1)))

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, size, size)

        const g = ctx.createRadialGradient(size * 0.36, size * 0.3, size * 0.04, size / 2, size / 2, size / 2)
        g.addColorStop(0, '#1b3f6e')
        g.addColorStop(0.65, '#0d2547')
        g.addColorStop(1, '#050f24')
        ctx.beginPath()
        path({ type: 'Sphere' })
        ctx.fillStyle = g
        ctx.fill()

        ctx.beginPath()
        path(graticule)
        ctx.strokeStyle = 'rgba(154, 201, 245, 0.14)'
        ctx.lineWidth = 0.7
        ctx.stroke()

        ctx.beginPath()
        path(countries)
        ctx.fillStyle = '#1f3d61'
        ctx.fill()
        ctx.strokeStyle = 'rgba(190, 212, 240, 0.3)'
        ctx.lineWidth = 0.6
        ctx.stroke()

        if (finland) {
          ctx.beginPath()
          path(finland)
          ctx.fillStyle = '#1c6fa8'
          ctx.fill()
          ctx.strokeStyle = '#9ccbf5'
          ctx.lineWidth = 1
          ctx.stroke()
        }

        const a = Math.max(0, Math.min(1, (progress - 0.72) / 0.28))
        if (a > 0) {
          ctx.beginPath()
          path(area)
          ctx.fillStyle = `rgba(6, 182, 212, ${0.22 * a})`
          ctx.fill()
          ctx.strokeStyle = `rgba(142, 224, 255, ${0.95 * a})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        ctx.beginPath()
        path({ type: 'Sphere' })
        ctx.strokeStyle = 'rgba(160, 200, 255, 0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        place(turkuRef.current, CONTACT.turku, c, a)
        place(helsinkiRef.current, CONTACT.helsinki, c, a)
        if (a >= 1) wrap.classList.add('is-settled')
        else wrap.classList.remove('is-settled')
      }

      drawRef.current = draw

      resize()
      draw(progress.get())
      ro = new ResizeObserver(() => {
        resize()
        draw(progress.get())
      })
      ro.observe(wrap)
    }

    boot().catch(() => {
      /* the section still reads fine without the globe */
    })

    return () => {
      cancelled = true
      ro?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMotionValueEvent(progress, 'change', (v) => drawRef.current(v))

  return (
    <div className="globe-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={t.contact.globeAria} />
      <div className="globe-pin globe-pin--turku" ref={turkuRef} aria-hidden="true">
        <span className="globe-dot" />
        <span className="globe-label">{t.contact.globeLabel}</span>
      </div>
      <div className="globe-pin globe-pin--helsinki" ref={helsinkiRef} aria-hidden="true">
        <span className="globe-dot globe-dot--small" />
        <span className="globe-label globe-label--small">{t.contact.globeSecondary}</span>
      </div>
    </div>
  )
}
