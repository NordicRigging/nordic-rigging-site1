import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useCoarsePointer, clamp } from '../lib/hooks'

// How hard the playhead is pulled toward the scroll target each frame. Lower is
// heavier — the boat carries some way, like a hull that does not stop dead.
const SMOOTHING = 0.12

/** Shared <source> children plus the "really failed" check: a <source>
 * firing its own error is normal browser fallback-hunting (e.g. this
 * environment's Chromium has no H.264 decoder, only VP9 - the mp4 source
 * always errors and the webm one is what actually plays), not a real
 * failure. Only NETWORK_NO_SOURCE means every candidate was tried. */
function Sources({ sources }) {
  return sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)
}

function reallyFailed(video) {
  return video?.networkState === HTMLMediaElement.NETWORK_NO_SOURCE
}

/**
 * Scroll-scrubbed video painted to a canvas.
 *
 * Nothing about the clip is assumed. Duration and intrinsic width/height are
 * read from the file's own metadata at runtime, so replacing the source with
 * a longer, shorter, or differently-shaped one needs no code change.
 */
function CanvasScrub({ sources, progress, onStatus }) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Read from the file, never hardcoded.
    let duration = 0
    let videoW = 0
    let videoH = 0

    let ready = false
    let inView = true
    let raf = 0
    let playhead = 0

    const resize = () => {
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    // Cover-fit derived from the clip's real aspect ratio against the canvas.
    const paint = () => {
      if (!videoW || !videoH) return
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / videoW, ch / videoH)
      const dw = videoW * scale
      const dh = videoH * scale
      ctx.drawImage(video, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    const readMetadata = () => {
      duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
      videoW = video.videoWidth || 0
      videoH = video.videoHeight || 0
      ready = duration > 0 && videoW > 0 && videoH > 0
      if (!ready) return
      resize()
      onStatus('ready')
      try {
        video.currentTime = 0
      } catch {
        /* seek before buffer is harmless */
      }
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!ready || !inView) return

      const target = clamp(progress.get(), 0, 1) * duration
      playhead += (target - playhead) * SMOOTHING
      if (Math.abs(target - playhead) < 0.004) playhead = target

      // Hold just short of the final frame; seeking to exactly duration stalls.
      const seekTo = clamp(playhead, 0, Math.max(duration - 0.04, 0))
      if (!video.seeking && Math.abs(video.currentTime - seekTo) > 0.012) {
        try {
          video.currentTime = seekTo
        } catch {
          /* ignore transient seek errors */
        }
      }
      paint()
    }

    const fail = () => {
      if (!reallyFailed(video)) return
      ready = false
      onStatus('error')
    }

    video.addEventListener('loadedmetadata', readMetadata)
    video.addEventListener('seeked', paint)
    video.addEventListener('error', fail)

    // Metadata may already be in hand if the file was cached.
    if (video.readyState >= 1) readMetadata()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Idle the loop while the section is off screen so three clips on one page
    // never all decode at once.
    const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), {
      rootMargin: '15% 0px',
    })
    io.observe(canvas)

    resize()
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      video.removeEventListener('loadedmetadata', readMetadata)
      video.removeEventListener('seeked', paint)
      video.removeEventListener('error', fail)
    }
  }, [sources, progress, onStatus])

  return (
    <>
      {/* Kept in the DOM at 1px rather than display:none — some browsers will
          not decode a detached or hidden video. */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute h-px w-px opacity-0"
      >
        <Sources sources={sources} />
      </video>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </>
  )
}

/** Phones, touch devices and reduced-motion: plain autoplay loop, no scrub. */
function LoopVideo({ sources, onStatus }) {
  const ref = useRef(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const ok = () => onStatus('ready')
    const bad = () => reallyFailed(video) && onStatus('error')
    video.addEventListener('loadeddata', ok)
    video.addEventListener('error', bad)
    const played = video.play?.()
    if (played?.catch) played.catch(() => {})
    return () => {
      video.removeEventListener('loadeddata', ok)
      video.removeEventListener('error', bad)
    }
  }, [sources, onStatus])

  return (
    <video
      ref={ref}
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover"
    >
      <Sources sources={sources} />
    </video>
  )
}

/**
 * Sea-and-horizon ground rendered underneath the footage. It shows through
 * before the clip decodes and stands in entirely if the file is missing, so the
 * page never presents an empty black rectangle.
 */
function SeaGround() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(130%_85%_at_50%_-15%,#12314a_0%,#0a1826_45%,#050c13_100%)]" />
      <div className="absolute inset-x-0 top-[57%] h-px bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.28),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-[43%] bg-[linear-gradient(180deg,rgba(4,7,11,0.15),#04070b)]" />
    </div>
  )
}

/** src accepts either one path (assumed .mp4, matching the existing archipelago/craft
 * clips) or an explicit [{src, type}] list, mp4 first, for a clip like hero.mp4 that
 * also ships a .webm encode. */
export default function ScrubVideo({ src, progress, grade = 'default' }) {
  const [status, setStatus] = useState('loading')
  const onStatus = useCallback((next) => setStatus(next), [])

  const sources = Array.isArray(src) ? src : [{ src, type: 'video/mp4' }]

  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()
  const scrubbable = !reduced && !coarse && Boolean(progress)

  const grades = {
    default:
      'bg-[linear-gradient(180deg,rgba(4,7,11,0.62)_0%,rgba(4,7,11,0.30)_45%,rgba(4,7,11,0.88)_100%)]',
    heavy:
      'bg-[linear-gradient(180deg,rgba(4,7,11,0.80)_0%,rgba(4,7,11,0.62)_50%,rgba(4,7,11,0.94)_100%)]',
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SeaGround />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          status === 'ready' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {scrubbable ? (
          <CanvasScrub key="scrub" sources={sources} progress={progress} onStatus={onStatus} />
        ) : (
          <LoopVideo key="loop" sources={sources} onStatus={onStatus} />
        )}
      </div>
      <div aria-hidden="true" className={`absolute inset-0 ${grades[grade] ?? grades.default}`} />
    </div>
  )
}
