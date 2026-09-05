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

`public/images/hero.webp` is the reference photo re-lit to blue hour with
Higgsfield `gpt_image_2` (job `fe020c01-47c1-400a-beaf-f89cca4c0d77`).
`public/video/hero.{mp4,webm}` is one Seedance 2.5 clip (job
`c9f59f13-8f59-411b-8284-b3dd300dfc3c`): static camera, the mast turns into an
exploded blueprint and back, start and end frame pinned to the hero image so it
loops. The prompts are in `docs/hero-pipeline.md`.

To swap the photo: replace `public/images/hero.webp` (3:4), regenerate the clip
with the same prompt, download it to `public/video/raw/hero.mp4` and run
`npm run video`. The raw clip stays untracked.

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
