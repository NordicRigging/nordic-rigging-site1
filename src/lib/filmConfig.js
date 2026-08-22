/**
 * ────────────────────────────────────────────────────────────────────────
 *  CALIBRATION FILE — every number you may want to nudge against the real
 *  footage lives here. Nothing else needs editing.
 * ────────────────────────────────────────────────────────────────────────
 *
 * All `p` values are overall sequence progress in [0, 1]:
 * 0 = top of page, 1 = the sticky stage releases into the next section.
 */
export const SEQ = {
  /** Total scroll length of the sequence, in viewport-heights. */
  SCROLL_VH: 640,

  /** Hero type is fully gone by here. */
  HERO_FADE_START: 0.03,
  HERO_FADE_END: 0.16,

  /** Climb scrub maps [0, CLIMB_END] → [0, climb duration]. */
  CLIMB_END: 0.6,

  /** Orbit fades in from here (both clips are in cloud across this window). */
  ORBIT_START: 0.52,

  /** Progress at which orbit.mp4 starts loading ("as its section approaches"). */
  ORBIT_PRELOAD_AT: 0.3,

  /**
   * A near-white veil peaking mid-crossfade. Both clips are in cloud there;
   * the veil absorbs any residual tonal mismatch so the seam cannot read.
   */
  VEIL_COLOR: '#edf1f3',
  VEIL_MAX: 0.55,

  ORBIT: {
    /**
     * The one landmark that drives the whole territory beat: the moment in
     * orbit.mp4 at which the cloud has mostly cleared.
     *
     * The clip scrubs from its first frame to this mark and then STOPS — it
     * never plays past it, so the terrain under the markers is a fixed frame.
     * The leftward drift is driven by the playhead's progress toward this same
     * mark, so the movement begins as the footage emerges from cloud and ends
     * exactly when the cloud has cleared.
     *
     * Set CLOUD_CLEAR_SECONDS once you can watch the real clip (seconds into
     * orbit.mp4). While it is null, the fraction below is used instead.
     */
    CLOUD_CLEAR_SECONDS: null,
    CLOUD_CLEAR_FRACTION: 0.6,

    /** Scroll progress at which the playhead reaches the cloud-clear mark. */
    SETTLE_AT: 0.72,

    /**
     * Leftward travel of the orbit stage while the cloud clears, in vw.
     * The footage starts aligned with the climb (offset 0) at the seam and
     * moves left to -DRIFT_VW, so nothing shifts during the crossfade.
     */
    DRIFT_VW: 8,

    /**
     * Both film layers are scaled up so the drift can never expose page
     * background at an edge. The minimum needed is 1 + 2 * DRIFT_VW / 100
     * (the stage scales from its centre, so each side gains half the growth);
     * COVER_MARGIN is the extra safety on top. The scale is DERIVED from the
     * drift — change DRIFT_VW and the crop follows automatically.
     */
    COVER_MARGIN: 0.03
  },

  /**
   * Territory overlay staging. Every value must sit AFTER ORBIT.SETTLE_AT —
   * the overlays are only allowed to appear once the footage has stopped.
   */
  TERRITORY: {
    GLOW_IN: 0.74, // radial weight + region labels
    BASE_IN: 0.77, // Turku
    SECOND_IN: 0.82, // Helsinki
    CARD_IN: 0.85, // Turku card — opens itself, then stays open
    LEGEND_IN: 0.9
  }
};

/**
 * ── MARKER COORDINATES ──────────────────────────────────────────────────
 * Percentages of the STOPPED video frame (the frame at the cloud-clear mark),
 * measured from its top-left corner. They are converted to screen space
 * through the same object-fit: cover box the video uses, so they stay glued
 * to the terrain at any viewport shape.
 *
 * To calibrate: scroll until the footage stops, then adjust x/y here.
 */
export const TERRITORY_MARKS = {
  turku: {
    x: 38,
    y: 54,
    label: 'Turku',
    coords: '60°27′N 22°16′E'
  },
  helsinki: {
    x: 63,
    y: 61,
    label: 'Helsinki'
  }
};

/**
 * Region labels — these belong on LAND, i.e. inland (north) of the two coastal
 * cities, not out on the water to the south.
 */
export const TERRITORY_REGIONS = {
  varsinaisSuomi: { x: 27, y: 37 },
  uusimaa: { x: 70, y: 45 }
};

/**
 * The soft radial weight: strongest over Turku, falling away eastward toward
 * Helsinki. Sizes are percentages of the video frame.
 */
export const TERRITORY_GLOW = {
  x: 42,
  y: 55,
  width: 78,
  height: 46,
  rotate: -6
};

/** Radar rings emanating from Turku. */
export const TERRITORY_RADAR = {
  rings: 3,
  duration: 6, // seconds for one ring to travel out and fade
  maxScale: 13
};

/**
 * ── SPINLOCK GAUGE ──────────────────────────────────────────────────────
 * Position and size of the floating Rig-Sense gauge in the Spinlock section.
 * The image is deliberately larger than its frame and bleeds past the section
 * edges, which is what makes it read as embedded in the page rather than
 * placed on top of it.
 */
export const SPINLOCK_GAUGE = {
  /** Gauge height as a multiple of its frame's height. >1 clips top/bottom. */
  SCALE: 1.12,

  /** Nudge within the frame. Percentages of the frame: +x right, +y down. */
  OFFSET_X: 0,
  OFFSET_Y: 0,

  /** How far the frame bleeds past the section's right edge, in rem. */
  BLEED_RIGHT: 3,

  /** How far it bleeds past the section's top and bottom edges, in rem. */
  BLEED_Y: 3.5,

  /** Vertical travel as the section passes, in % of the gauge's height. */
  PARALLAX: 12
};

/**
 * Fallback clip metadata, used until /video/manifest.json (written by
 * `npm run video`) or the media element's own metadata provides real values.
 */
export const DEFAULT_MANIFEST = {
  clips: {
    climb: {
      src: '/video/climb.mp4',
      poster: '/video/climb-poster.jpg',
      duration: 32,
      width: 1920,
      height: 1080
    },
    orbit: {
      src: '/video/orbit.mp4',
      poster: '/video/orbit-poster.jpg',
      duration: 8,
      width: 1920,
      height: 1080
    }
  }
};

let manifestPromise = null;

/** A positive finite number, or the fallback. Guards against nulls in the
 *  manifest: `ffmpeg -i` output varies between builds, so a dimension or
 *  duration can come through as null and would otherwise poison the overlay
 *  geometry (NaN aspect ratio → collapsed marker layer → no markers at all). */
const num = (value, fallback) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;

function sanitiseClip(clip, defaults) {
  const merged = { ...defaults, ...(clip || {}) };
  return {
    ...merged,
    src: merged.src || defaults.src,
    poster: merged.poster || defaults.poster,
    duration: num(merged.duration, defaults.duration),
    width: num(merged.width, defaults.width),
    height: num(merged.height, defaults.height)
  };
}

/** Runtime metadata: fetch the pipeline-written manifest, fall back to defaults. */
export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch('/video/manifest.json')
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null)
      .then(json => {
        if (!json || !json.clips) return DEFAULT_MANIFEST;
        return {
          clips: {
            climb: sanitiseClip(json.clips.climb, DEFAULT_MANIFEST.clips.climb),
            orbit: sanitiseClip(json.clips.orbit, DEFAULT_MANIFEST.clips.orbit)
          }
        };
      });
  }
  return manifestPromise;
}
