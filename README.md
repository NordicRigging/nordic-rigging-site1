# Nordic Rigging

Scroll-driven landing page for Nordic Rigging, Turku.

React 19 · Vite · Tailwind CSS 4 · Framer Motion · Lenis

```sh
npm install
npm run dev      # http://localhost:5173
npm run build
```

## The three clips

The page is built around three videos that are **not in this repository yet**.
See [`public/video/README.md`](public/video/README.md) for the exact paths, the
source jobs and the encoding recipe.

The Higgsfield CDN (`d8j0ntlcm91z4.cloudfront.net`) is blocked by this
environment's egress policy — the proxy answers `403` to `CONNECT` — so the
files have to be downloaded and committed by hand.

Until they land, every video section falls back to a sea-and-horizon gradient.
The page is fully usable in that state: no broken frames, no console errors.

## Scroll scrub

`src/components/ScrubVideo.jsx` paints a video to a canvas and drives
`currentTime` from scroll position instead of playing it.

`duration`, `videoWidth` and `videoHeight` are read from each file's own
metadata on `loadedmetadata`, and the cover-fit is derived from them — no clip
length or aspect ratio is hardcoded, so replacing a clip with a longer or
differently-shaped one needs no code change.

The playhead is eased toward the scroll target rather than snapped to it, which
is what gives the footage its weight. Each instance idles its render loop via
`IntersectionObserver` when off screen, so three clips on one page never decode
at once.

Two things matter when re-encoding: a short keyframe interval (`-g 12`), because
every seek otherwise decodes forward from a distant keyframe, and a server that
answers range requests — without `Accept-Ranges`, a media element reports itself
unseekable and the scrub silently does nothing.

Phones, touch devices and `prefers-reduced-motion` skip the canvas entirely and
get a muted autoplay loop.

## Scroll-linked transforms

Framer Motion promotes scroll-linked `opacity` to a compositor animation on a
`ScrollTimeline`. A `useTransform` range that stops short of the timeline's end
leaves the tail undefined, and Chromium resolves it by ramping the value back up
rather than holding it — a faded-out element reappears further down the section.

Every scroll-linked transform here therefore states its value across the whole
`0…1` range, e.g. `[0, 0.2, 1] → [1, 0, 0]` rather than `[0, 0.2] → [1, 0]`.

## Layout

| Section  | Behaviour                                                            |
| -------- | -------------------------------------------------------------------- |
| Hero     | 320vh, sticky viewport, `hero.mp4` scrubbed; wordmark tracks in       |
| Trust    | Thin band, counters count up once on enter                           |
| Services | 340vh sticky kinetic type over `archipelago.mp4`, then three cards    |
| Spinlock | 300vh pinned over `craft.mp4`                                        |
| Story    | No video, generous whitespace — **placeholder copy**                 |
| Contact  | Call / Email / WhatsApp tabs, Call default                           |

A fixed HUD reads heading and coordinates that drift with scroll progress,
written straight to the DOM from the scroll MotionValue so a 60fps readout never
re-renders React. It collapses to a single row on phones.

Service cards link to `/services/mast-work`, `/services/rope-stock` and
`/services/maintenance`, which render a placeholder route. The two Spinlock
buttons are inert placeholders pending real URLs.

## Copy

The Story section is placeholder text. Everything else is final.
