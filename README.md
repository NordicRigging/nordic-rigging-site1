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

## Checking a change

```bash
npm run dev                    # in one terminal
npm run verify                 # in another: 34 end-to-end checks, non-zero exit on failure
npm run shot -- hero.png       # a screenshot of whatever is on screen
```

`verify` drives a real browser through the things that are easy to break and
slow to test by hand: the FI/EN toggle and what it saves, the hero clip playing
and then holding on the blueprint frame behind the services, the globe settling
on Finland, the nav and the mobile menu scrolling to the right section, the
contact form in both its modes (a pre-filled email and a JSON POST), the
service pages and the old v2 URLs redirecting, plus horizontal overflow and
console errors on a phone viewport. It needs a browser once:
`npx playwright install chromium`, or set `CHROMIUM_PATH` to one you already
have.

`shot` takes a picture of the running site. `--target=full` for the whole page,
`--to=#palvelut` to scroll a section under the nav first, `--size=390x844` for a
phone, `--lang=en`, `--wait=6000` to let the clip and the globe settle, and
`--still` to see the page the way a reduced-motion visitor does.

`preview:file` inlines the whole site — code, styles, fonts, photos and the
hero clip — into a single HTML file that opens from disk, over email or on a
phone with no server. It routes on the hash (`#/palvelut/mastotyot`) because
there is no server to fall back to `index.html`. It is a snapshot for review;
deploy `dist/` from `npm run build`.

Deploy note: routes like `/palvelut/mastotyot` need an SPA fallback to
`index.html` on the host (Netlify `_redirects`, Vercel rewrites, etc.).

## Look

One family of dark blues from top to bottom (`src/styles/global.css`): no
orange, no white. Type is a cool off-white, the accent is the blueprint
cyan-blue, cards are translucent navy glass. Sections have no hard edges —
each one's own gradient starts exactly where the previous one's ended
(`--navy-900` → `--navy-800` → `--navy-700` and back), and `--navy-900`
(`#050b16`) is also the `horizonColor` the hero's wave background renders, so
even that handoff has no seam.

The top bar keeps the structure and styling of the v2 build's PillNav,
recoloured, without GSAP: the hover sweep and the label swap on the pills are
CSS transitions. The service cards (inside the "Palvelut" tab) keep the v2
accordion-gallery look the same way. Unlike v2, every card shows its full
content without a hover.

## Page structure

| Section | Component | Anchor |
| --- | --- | --- |
| Hero: wave background, a framed photo/clip card, headline, call + message buttons, price / area / crew facts | `Hero.jsx`, `GradientWaves.jsx` | top |
| Four tabs — Palvelut, Telakoille, Tehdyt työt, Meistä — one panel below a tab bar | `Tabs.jsx` | `#ratkaisut` |
| ↳ Palvelut: the three services, a Spinlock Rig-Sense Pro highlight, pricing/area, contact CTA | `ServicesTab.jsx`, `RigSenseHighlight.jsx` (uses `Services.jsx`'s `ServicePanel`) | |
| ↳ Telakoille: the B2B pitch for yards and marinas | `YardsTab.jsx` | |
| ↳ Tehdyt työt: a photo grid of finished jobs | `PortfolioTab.jsx` | |
| ↳ Meistä: the company story and the crew | `AboutTab.jsx` (uses `Team.jsx`) | |
| Globe + contact details + the one contact form | `Location.jsx`, `Globe.jsx`, `ContactForm.jsx` | `#yhteystiedot` |
| Footer | `Footer.jsx` | |

Service pages live at `/palvelut/mastotyot`, `/palvelut/koysivarasto` and
`/palvelut/huolto` (the v2 `/services/...` URLs redirect there).

## The tabs

`src/lib/tabs.jsx` holds which of the four tabs is open (`TabsProvider`,
`useTabs()`), the same pattern as `prefill.jsx` for the contact form. A nav
link, or a card's own button (e.g. "Telakoille" in the header, or a service's
"Kysy tästä palvelusta"), can select a tab before scrolling to `#ratkaisut`,
so the reader lands on the right panel already open rather than on whichever
tab happened to be active. Only the active tab's component is mounted — the
other three cost nothing until clicked.

Adding a fifth tab: add its id to `TABS` in `tabs.jsx`, a label in
`CONTENT[lang].nav`, a `<Tab*.jsx>` component, and a line in the `PANELS` map
in `Tabs.jsx`.

## Content and languages

All copy and company facts live in `src/lib/content.js`:

- `CONTACT` — company name, business ID, address, phone, email, WhatsApp, yard.
- `TEAM` — the two riggers. Drop portrait photos at
  `public/images/team/tuomas.webp` and `public/images/team/lukas.webp` and set
  the `photo` paths there; until then the site shows initials.
- `SERVICES` — the three service lines (FI + EN).
- `PORTFOLIO` — the "Tehdyt työt" photo grid: `{ id, image, fi.caption,
  en.caption }`. Add a photo to `public/images/portfolio/` and an entry here;
  nothing else needs to change for it to show up.
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

## Hero: wave background and the framed clip

The hero is a normal section, not full-bleed. `GradientWaves.jsx` (a React
Bits component, `ogl` for WebGL2, added as supplied and left unmodified) fills
it as an absolutely-positioned background — a slow, calm animated wave field
in the same navy family as the rest of the site (`horizonColor="#050b16"`,
`waveColor="#123a6b"`, `crestColor="#4fa8db"`; tuned down from the defaults:
`speed=0.25`, `mouseInteraction` on but gentle). `prefers-reduced-motion` or
data saver gets a static CSS gradient instead (`.hero__waves-fallback`) —
Hero.jsx's own choice, not something built into the pasted component.

The photo/clip lives in its own card (`.hero__media`) next to the copy —
contained, never full-bleed, and never scroll-linked. Its `aspect-ratio: 3/4`
matches the source media exactly, so `object-fit: cover` shows the whole
frame (mast and boat both) rather than a tight crop; only the top two corners
are rounded (`border-radius: 24px 24px 0 0`). The clip just loops for as long
as it's on screen — nothing pauses it, nothing hands its frame to the section
below. With `prefers-reduced-motion` or data saver there is no clip; the
poster photo carries the card alone.

`public/images/hero.webp` (2000 px, with a 1200 px `srcset` variant for
phones) is the customer's `header.webp` cleaned with Higgsfield `gpt_image_2`
(brand marks removed, sky deepened) and upscaled to 4K.
`public/video/hero-{lg,sm}.{mp4,webm}` is one Seedance 2.5 clip upscaled to
1440×1920: static camera, the mast turns into an exploded blueprint and back,
first and last frame pinned to the photo so it loops. `lg` (1440 px) is served
from 900 px up, `sm` (960 px) on phones. Job ids, prompts and settings are in
`docs/hero-pipeline.md`.

To regenerate: download the clip to `public/video/raw/hero.mp4` and run
`npm run video`. The raw clip stays untracked. Setting `HERO_VIDEO` to `null`
in `Hero.jsx` shows the poster alone.

## Globe

`Globe.jsx` draws an orthographic canvas globe with `d3-geo` and the
Natural Earth 110m countries from `world-atlas`, lazy-loaded when the contact
section is near. It turns from the Atlantic to the Nordics, highlights Finland
and the Varsinais-Suomi/Uusimaa coast, and pins Turku and Helsinki. Reduced
motion draws the final frame directly. It is drawn larger than its column and
runs off the section's left and bottom edges (a horizon band on phones), with
Finland kept high in the frame.

## Images

| File | Used by |
| --- | --- |
| `hero.webp`, `hero-1200.webp`, `og.jpg` | the hero card's poster (two sizes), social share |
| `logo-light.png` | the mark, used as a CSS mask so it takes the text colour |
| `mastotyot.webp`, `koysivarasto.webp`, `huolto.webp` | service cards and pages |
| `rig-sense.webp` | the Rig-Sense highlight in the Palvelut tab (transparent background) |
| `telakka.webp` | the Telakoille tab |
| `portfolio/*.webp` | the Tehdyt työt tab's photo grid — see `PORTFOLIO` in `content.js` |
| `logo.svg`, `favicon.svg` | header, footer, browser tab |

The original photos the site images were cut from (and the Spinlock PNG with
transparency) are kept in `assets/source/`, outside `public/`, so they are
versioned but not deployed.

## Media relay (dev only)

`.github/workflows/fetch-media.yml` downloads the URLs listed in
`.github/media-request.txt` into the orphan `media-inbox` branch. It exists
because the build environment used for v3 could not reach Higgsfield's CDN
directly. It never touches the site branches and can be deleted.
