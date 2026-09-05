# Nordic Rigging — website v3

Bilingual (FI/EN) one-page site plus three service pages for Nordic Rigging
Company Oy. Built as a tool, not an experience: services, price and contact
details are visible without clicks, type is large and high-contrast, and the
page scrolls statically from section to section.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/
npm run video      # re-encode public/video/raw/hero.mp4 → hero.mp4 + hero.webm
npm run preview:file   # one self-contained preview/nordic-rigging.html
```

`preview:file` inlines the whole site — code, styles, fonts, photos and the
hero clip — into a single HTML file that opens from disk, over email or on a
phone with no server. It routes on the hash (`#/palvelut/mastotyot`) because
there is no server to fall back to `index.html`. It is a snapshot for review;
deploy `dist/` from `npm run build`.

Deploy note: routes like `/palvelut/mastotyot` need an SPA fallback to
`index.html` on the host (Netlify `_redirects`, Vercel rewrites, etc.).

## Page structure

| Section | Component | Anchor |
| --- | --- | --- |
| Hero: headline, call + message buttons, price / area / crew facts, blueprint clip | `Hero.jsx` | top |
| Three services, each with what is included, result, price, buttons and the crew line | `Services.jsx` | `#palvelut` |
| Crew card (Tuomas and Lukas Eloranta) | `Team.jsx` | `#tekijat` |
| Spinlock Rig-Sense Pro: why measured tension matters | `RigSense.jsx` | `#rig-sense` |
| For boatyards and marinas (B2B) | `Partners.jsx` | `#telakoille` |
| Globe + contact details + the one contact form | `Location.jsx`, `Globe.jsx`, `ContactForm.jsx` | `#yhteystiedot` |
| Footer | `Footer.jsx` | |

Service pages live at `/palvelut/mastotyot`, `/palvelut/koysivarasto` and
`/palvelut/huolto` (the v2 `/services/...` URLs redirect there).

## Content and languages

All copy and company facts live in `src/lib/content.js`:

- `CONTACT` — company name, business ID, address, phone, email, WhatsApp, yard.
- `TEAM` — the two riggers. Drop portrait photos at
  `public/images/team/tuomas.webp` and `public/images/team/lukas.webp` and set
  the `photo` paths there; until then the site shows initials.
- `SERVICES` — the three service lines (FI + EN).
- `CONTENT.fi` / `CONTENT.en` — every other visible string.

Finnish is the default; a browser set to another language gets English; the
FI/EN toggle in the header and footer saves the choice in `localStorage`.

## Contact form

One form for both private owners and yards ("Kuka olet?" switches the
wording). Two delivery modes:

- **With `VITE_FORM_ENDPOINT`** (see `.env.example`, e.g. a Formspree URL) the
  form posts JSON (`who, name, phone, email, boat, needs, message, lang, text,
  _subject`) and shows a thank-you.
- **Without it** the form opens the visitor's email app with the whole message
  pre-filled (`mailto:` to sales@nordicrigging.fi). Nothing to host.

Phone, email and WhatsApp are always shown next to the form, in the header and
in the footer.

## Hero image and clip

The hero is full-bleed: the photo (and the clip, once wired in) covers the
whole viewport at every size, with the copy on a gradient over it.
`HERO_CROP` in `src/components/Hero.jsx` picks the framing, `center` or
`offset`; `?crop=offset` in the URL previews the other one.

`public/images/hero.webp` is the customer's `header.webp` cleaned with
Higgsfield `gpt_image_2` (brand marks removed, sky deepened; job
`1ade72a1-d359-4446-a9b1-982356dad7f1`). `public/video/hero-{lg,sm}.{mp4,webm}`
is one Seedance 2.5 clip (job `b4075919-dcf2-4ce7-a7d8-457c2a6c6ef6`): static
camera, the mast turns into an exploded blueprint and back, first and last
frame pinned to the photo so it loops. `lg` (1248 px wide) is served from
900 px up, `sm` (720 px) on phones. Prompts and settings are in
`docs/hero-pipeline.md`.

To regenerate: download the clip to `public/video/raw/hero.mp4` and run
`npm run video`. The raw clip stays untracked. Setting `HERO_VIDEO` in
`Hero.jsx` to `null` shows the still alone.

The clip is skipped for `prefers-reduced-motion` and data-saver visitors; the
still image shows instead.

## Globe

`Globe.jsx` draws an orthographic canvas globe with `d3-geo` and the
Natural Earth 110m countries from `world-atlas`, lazy-loaded when the contact
section is near. It turns from the Atlantic to Finland, highlights Finland and
the Varsinais-Suomi/Uusimaa coast, and pins Turku and Helsinki. Reduced motion
draws the final frame directly.

## Images

| File | Used by |
| --- | --- |
| `hero.webp`, `og.jpg` | hero frame / poster, social share |
| `mastotyot.webp`, `koysivarasto.webp`, `huolto.webp` | service blocks and pages |
| `rig-sense.webp` | Rig-Sense section (transparent background) |
| `telakka.webp` | B2B section |
| `logo.svg`, `favicon.svg` | header, footer, browser tab |

The original photos the site images were cut from (and the Spinlock PNG with
transparency) are kept in `assets/source/`, outside `public/`, so they are
versioned but not deployed.

## Media relay (dev only)

`.github/workflows/fetch-media.yml` downloads the URLs listed in
`.github/media-request.txt` into the orphan `media-inbox` branch. It exists
because the build environment used for v3 could not reach Higgsfield's CDN
directly. It never touches the site branches and can be deleted.
