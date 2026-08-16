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

Drop real photos at these exact paths — no code changes needed; until then the
site shows designed solid-colour fallbacks:

- `public/images/mast-work.jpg`
- `public/images/rope-stock.jpg`
- `public/images/maintenance.jpg`
- `public/images/spinlock-rig-sense.png` (floating gauge in the Spinlock
  section; a drawn instrument stands in meanwhile)

## Tuning the film sequence

Everything lives in `src/lib/filmConfig.js`:

- `SEQ.CLIMB_END` / `SEQ.ORBIT_START` — the cloud crossfade window
- `SEQ.VEIL_MAX` — strength of the near-white veil that guarantees a seamless
  handoff
- `TERRITORY_MARKS` — Turku/Helsinki positions in percent of the video frame
  (they track the footage under `object-fit: cover` cropping)

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
