# Nordic Rigging — landing page

Scroll-scrubbed landing page for Nordic Rigging: one continuous 32-second camera
climb from the deck into cloud, an invisible handoff into orbital footage over
the Finnish coast, then services, Spinlock Rig-Sense Pro, and contact.

## Develop

```bash
npm install
npm run dev        # localhost:5173
npm run build      # production build in dist/
```

Deploy note: routes like `/services/mast-work` need an SPA fallback to
`index.html` on the host.

## Video assets

The five source clips are Higgsfield generations (IDs → filenames):

| Generation | File |
| --- | --- |
| `c4104572-a8c0-4124-a163-569a77d81b22` | `climb-1.mp4` |
| `4315b9c6-6f29-46c1-a851-64bcc5cb4a3c` | `climb-2.mp4` |
| `eecfb6ce-f9ab-4cb1-b3ab-a748394c38d9` | `climb-3.mp4` |
| `9c9b186c-76db-42a2-bb98-b4e2ad4d0ae9` | `climb-4.mp4` |
| `ea0fffb4-9355-4d4a-a9a5-12ca188f954d` | `orbit.mp4` |

Download them into `public/video/raw/` with those names, then:

```bash
npm run video      # needs ffmpeg on PATH (or FFMPEG_PATH=/path/to/ffmpeg)
```

The pipeline concatenates the four climb clips **in a single encode pass** (so
they scrub as one unbroken stream), re-encodes everything scrub-friendly
(H.264, 8-bit yuv420p, keyframe every 12 frames, faststart, < 3 MB each),
extracts first-frame posters, and writes `public/video/manifest.json` — the
runtime metadata the page uses to map scroll to time before any video loads.
Commit the processed outputs in `public/video/` (raw files stay untracked).

## Images

All of these live in `public/images/`:

| File | Used by |
| --- | --- |
| `mast-work.webp`, `rope-stock.webp`, `maintenance.webp` | accordion panels (cover-fit, wide crops to tall) |
| `mast-work-hero.webp`, `rope-stock-hero.webp`, `maintenance-hero.webp` | full-bleed hero on each service page |
| `spinlock-rig-sense.png` | the floating gauge in the Spinlock section |
| `logo.svg` | the Turku card on the territory map |

Paths are declared in `src/lib/content.js`. If a file is missing the section
degrades to a designed solid colour rather than breaking.

## Open items from the port

- **Spinlock "Watch video".** The old site had CSS for a "Katso video" link but
  no markup and no URL anywhere in its source. Set `WATCH_VIDEO_URL` in
  `src/components/Spinlock.jsx` and the button renders automatically.
- **Newsletter strings.** `footerJoin` / `footerNews` / `footerJoinBtn` existed
  in the old translations but were never rendered, and there was no signup
  backend — not carried over. Say the word and it goes in.

## Content & languages

All copy lives in `src/lib/content.js`, ported from the previous build
(`translations.js` + `App.jsx`) — nothing is hard-coded in components:

- `CONTACT` — company name, business ID, email, phone, WhatsApp, address.
  Single-sourced, so the contact section, service pages and footer cannot drift.
- `CONTENT.fi` / `CONTENT.en` — every visible string in both languages.
- `SERVICES` — the three service lines with per-language tag, title, lead,
  process steps and pricing checks. Add a language by extending both objects.

Language handling (`src/lib/LanguageContext.jsx`) follows the old pattern:
Finnish default, a saved choice in `localStorage.userLang` wins, and a visitor
whose browser is not Finnish gets the picker once. The persistent FI/EN toggle
in the corner is new — the old site could only be switched on that overlay.

## Tuning the film sequence

**Everything you may want to nudge lives in `src/lib/filmConfig.js`** — nothing
else needs editing.

- `SEQ.CLIMB_END` / `SEQ.ORBIT_START` — the cloud crossfade window
- `SEQ.VEIL_MAX` — strength of the near-white veil that guarantees a seamless
  handoff
- `SEQ.ORBIT.CLOUD_CLEAR_SECONDS` — **the key one.** The moment in `orbit.mp4`
  at which the cloud has mostly cleared. The clip scrubs to this mark and then
  stops for good, and the leftward drift is driven by the playhead's progress
  toward it, so movement begins as the footage emerges from cloud and ends
  exactly when the cloud clears. While it is `null`, `CLOUD_CLEAR_FRACTION`
  (0.6 of the clip) is used instead.
- `SEQ.ORBIT.SETTLE_AT` / `DRIFT_VW` — where in the scroll the stop happens,
  and how far the footage travels left before it does. The drift is held at
  zero until the crossfade finishes, so the climb and orbit layers are
  identically sized and positioned through the seam.
- `SEQ.ORBIT.COVER_MARGIN` — safety on top of the crop scale. Both film layers
  are enlarged by `1 + 2 * DRIFT_VW / 100 + COVER_MARGIN`, derived from the
  drift, so no drift position can expose page background at an edge. Change
  `DRIFT_VW` and the crop follows automatically.
- `TERRITORY_MARKS` — **Turku/Helsinki marker positions**, in percent of the
  *stopped* frame. Scroll until the footage stops, then adjust x/y here.
- `TERRITORY_REGIONS` — the VARSINAIS-SUOMI / UUSIMAA labels. These belong on
  land, i.e. inland (north) of the two coastal cities.
- `TERRITORY_GLOW` — the soft radial weight over Turku, falling away eastward.
- `TERRITORY_RADAR` — ring count, loop duration and travel.
- `SEQ.TERRITORY.*` — when each overlay appears. All values must stay **after**
  `SEQ.ORBIT.SETTLE_AT`: overlays are only allowed over a stopped frame.

## Tuning the Spinlock gauge

Also in `src/lib/filmConfig.js`, as `SPINLOCK_GAUGE`:

| Constant | What it does |
| --- | --- |
| `SPINLOCK_GAUGE.SCALE` | gauge height as a multiple of its frame's height; >1 is what clips the top and bottom |
| `SPINLOCK_GAUGE.OFFSET_X` | nudge left/right, as a % of the frame (+ moves right) |
| `SPINLOCK_GAUGE.OFFSET_Y` | nudge up/down, as a % of the frame (+ moves down) |
| `SPINLOCK_GAUGE.BLEED_RIGHT` | how far the frame bleeds past the section's right edge, in rem |
| `SPINLOCK_GAUGE.BLEED_Y` | how far it bleeds past the top and bottom edges, in rem |
| `SPINLOCK_GAUGE.PARALLAX` | vertical float as the section passes, in % of gauge height |

## Performance architecture

- **Poster-first paint** — posters render immediately; video layers fade up
  only once they have decodable frames.
- **One eager asset** — only `climb.mp4` loads eagerly; `orbit.mp4` starts
  loading as its half of the sequence approaches (IntersectionObserver plus a
  scroll-progress trigger). Below-the-fold images are `loading="lazy"`.
- **Draw coalescing** — scroll collapses into at most one in-flight seek per
  video (retargeted on `seeked`), and unchanged progress costs nothing.
- **Runtime metadata** — `manifest.json` supplies durations/dimensions up
  front, corrected by `loadedmetadata` when the real media arrives.
