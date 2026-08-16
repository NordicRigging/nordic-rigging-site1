/**
 * Single tuning point for the hero→territory film sequence.
 *
 * All `p` values are overall sequence progress in [0, 1]:
 * 0 = top of page, 1 = the sticky stage releases into the contact section.
 *
 * The crossfade window [ORBIT_START, CLIMB_END] is where the climb sits in
 * near-white cloud and the orbit clip (which opens from cloud) fades in on
 * top of it. Tune these two numbers against the real footage.
 */
export const SEQ = {
  /** Total scroll length of the sequence, in viewport-heights. */
  SCROLL_VH: 560,

  /** Hero type is fully gone by here. */
  HERO_FADE_START: 0.03,
  HERO_FADE_END: 0.16,

  /** Climb scrub maps [0, CLIMB_END] → [0, climb duration]. */
  CLIMB_END: 0.6,

  /** Orbit fades in from ORBIT_START and scrubs [ORBIT_START, 1] → [0, orbit duration]. */
  ORBIT_START: 0.52,

  /** Progress at which orbit.mp4 starts loading ("as its section approaches"). */
  ORBIT_PRELOAD_AT: 0.3,

  /**
   * A near-white veil peaking mid-crossfade. Both clips are in cloud there;
   * the veil absorbs any residual tonal mismatch so the seam cannot read.
   */
  VEIL_COLOR: '#edf1f3',
  VEIL_MAX: 0.55,

  /** Territory overlay staging (fade-in points). */
  TERRITORY: {
    BASE_IN: 0.66, // Turku
    SECOND_IN: 0.73, // Helsinki
    AREA_IN: 0.79, // service-area arc + region labels
    LEGEND_IN: 0.85
  }
};

/**
 * Marker positions in percent of the VIDEO FRAME (not the viewport) so they
 * stay glued to the footage under object-fit: cover cropping.
 * Adjust x/y against the real orbital footage.
 */
export const TERRITORY_MARKS = {
  turku: {
    x: 38,
    y: 54,
    label: 'Turku',
    coords: '60°27′N 22°16′E',
    role: 'Home base'
  },
  helsinki: {
    x: 63,
    y: 61,
    label: 'Helsinki',
    coords: '60°10′N 24°56′E',
    role: null
  }
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
