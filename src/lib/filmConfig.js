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

    /** Leftward travel of the whole orbit stage while the cloud clears, in vw. */
    DRIFT_VW: 8
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
            climb: { ...DEFAULT_MANIFEST.clips.climb, ...json.clips.climb },
            orbit: { ...DEFAULT_MANIFEST.clips.orbit, ...json.clips.orbit }
          }
        };
      });
  }
  return manifestPromise;
}
