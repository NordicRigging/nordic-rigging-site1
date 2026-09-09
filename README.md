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
npm run video       # re-encode public/video/raw/hero.mp4 → hero-{lg,sm}.{mp4,webm}
npm run preview:file   # one self-contained preview/nordic-rigging.html
```

`npm run video` also needs `python3` with Pillow on PATH (`pip install pillow`) —
it renders the intro's baked-in counter overlay (`scripts/render_counter_frames.py`).

## Checking a change

```bash
npm run dev                    # in one terminal
npm run verify                 # in another: end-to-end checks, non-zero exit on failure
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
CSS transitions. It's promoted to its own compositor layer
(`transform: translateZ(0)`) — without that, a fixed + `backdrop-filter` bar
sitting directly above the hero's live WebGL canvas can visibly flicker or
lag during scroll in Chromium/WebKit. The nav only links to Palvelut, Ota
Yhteyttä and Meistä; Telakoille and Tehdyt työt are reachable from the tab
bar itself, and the phone number lives in the hero, the tab panels and the
footer instead of the nav bar. The service cards (inside the "Palvelut" tab)
keep the v2 accordion-gallery look the same way, trimmed to a short
description, the outcome line and a single "Lue lisää palvelusta" button —
price, crew and full detail live on the service's own page.

## Page structure

| Section | Component | Anchor |
| --- | --- | --- |
| Hero: wave background behind a landscape mast photo that runs a timed intro (border trace + blueprint playback, its own baked-in percent counter), landing on a shine-swept "Nordic Rigging" wordmark and a glass contact card | `Hero.jsx`, `GradientWaves.jsx`, `ShinyText.jsx` | top |
| Everything below the hero, wrapped in the tracing beam that detaches from the hero card on scroll | `TracingBeam.jsx` | |
| Four tabs — Palvelut, Telakoille, Tehdyt työt, Meistä — one panel below a tab bar, a quiet radar-sweep animation behind it | `Tabs.jsx`, `TabPanelFX.jsx` | `#ratkaisut` |
| ↳ Palvelut: the three services (short card, "Lue lisää" through to the full page), a Spinlock Rig-Sense Pro highlight, pricing/area, contact CTA | `ServicesTab.jsx`, `RigSenseHighlight.jsx` (uses `Services.jsx`'s `ServicePanel`) | |
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
in `Tabs.jsx`. Only Palvelut and Meistä have a top-nav pill of their own —
Telakoille and Tehdyt työt are reachable only by clicking the tab bar itself,
which is why `Tabs.jsx` always renders all four tab buttons regardless of
what's in the nav.

`TabPanelFX.jsx` draws a quiet, slow-rotating radar sweep (canvas 2D, not the
WebGL weight of GradientWaves) behind whichever panel is open, tucked into
one corner so it reads as an instrument rather than a bullseye over the
text. Its size is capped in pixels, not derived from the panel's full
height, so on a tall panel (Palvelut, with three cards plus Rig-Sense plus
the pricing footer) it stays a small corner accent instead of sweeping down
across the card grid. It pauses off-screen and skips its motion under
`prefers-reduced-motion`.

Switching tabs crossfades (gsap) instead of hard-cutting: `Tabs.jsx` fades
the outgoing panel out, swaps it once that finishes, then fades the new one
in while animating the panel's height from the old panel's height to the
new one's, so a short panel (Meistä) settling in under a tall one
(Palvelut) doesn't jump the page below it. `displayedTab` (what's actually
mounted) lags one crossfade behind `activeTab` (what the tab buttons show
as selected) for exactly this reason — clicking a tab is instant feedback,
the content swap is the animated part. Skips straight to the swap under
`prefers-reduced-motion`.

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

## Hero: wave background, the intro sequence and the glass contact card

The hero is a normal section, not full-bleed: a wave background behind one
landscape photo (`.hero__stage` > `.hero__media`), which carries a timed
intro before it settles into its final state — the video-filled "Nordic
Rigging" wordmark and a glass contact card, both overlaid on the photo
(stacked below it instead on narrow screens, see below). Price, area, the
crew and the call/message pair already live in the nav and the Palvelut
tab, so the hero doesn't repeat them.

`GradientWaves.jsx` (a React Bits component, `ogl` for WebGL2, added as
supplied and left unmodified) fills the section as an absolutely-positioned
background — a slow, calm animated wave field in the same navy family as
the rest of the site (`horizonColor="#050b16"`, `waveColor="#123a6b"`,
`crestColor="#4fa8db"`; tuned down from the defaults: `speed=0.25`,
`mouseInteraction` on but gentle). Its uniforms are seeded from these props
on the very first frame (not the library's default purple/pink), and the
whole setup is wrapped so a failed WebGL2 context calls back into Hero.jsx
instead of leaving a blank layer — either way you get
`.hero__waves-fallback`, a static CSS gradient, which is also what
`prefers-reduced-motion` or data saver gets. `.hero__fade`, a plain gradient
overlay, sits over the bottom of the canvas so the section always ends on
flat `--navy-900` — the shader's own bottom edge is wave-coloured, not flat,
so without it the seam with `.tabs` (which starts on that same navy) would
show a step.

### The intro sequence

At mount, only the nav, the waves and the plain photo show — a ~2s settle
beat (`SETTLE_MS`). Then the blueprint clip actually plays (`video.play()`),
and a `requestAnimationFrame` loop traces an SVG rect around the photo's
edge via `stroke-dashoffset`, reading `video.currentTime / freezeTime`
straight off the video every frame — no separate progress value, because
the video's own playback position already is one.
(`vector-effect="non-scaling-stroke"` looked like the right way to keep the
line a constant width regardless of the box's rendered size, but round 9
found it breaks `stroke-dasharray` into disconnected marks in this
project's Chromium build; stroke-width is instead re-derived from the SVG's
own live rendered size on every resize, in Hero.jsx.)

Round 11 item 4 retired the percent counter this used to also drive as a
DOM element (`textContent`, no React re-render per frame) — a second
JS-timer-driven value racing the video was a repeated source of the two
drifting apart. The counter is baked into the clip's own pixels now
(`scripts/render_counter_frames.py`, composited in during
`scripts/process-video.mjs`'s scale/encode pass — see Images below), so
there's nothing left to keep in sync: the video's `currentTime` is the only
clock, for the border, for what the readout shows, and for completion.

Once `currentTime` reaches `freezeTime` (`src/lib/hero-timing.json`,
3.8s — shared with the two video scripts above so the readout, the pause
point and Hero.jsx's own reveal trigger can't drift apart from each other),
the loop pauses the video and makes one corrective seek back to exactly
that time (playback can overshoot it slightly between animation frames) —
not the rapid-fire scrub the old currentTime-writing version needed a
seeked-event wait to recover from, since nothing here writes currentTime
except that one seek. `console.log('[hero-intro] video-driven completion',
{...})` fires right after, reading the same `currentTime` back as the
proof: there's no second clock left that could have disagreed with it.
`scripts/verify.mjs` waits for `.hero__wordmark-heading.is-revealed`
(`heroRevealed()`) rather than a fixed delay, then asserts the end state
directly.

The wordmark and the contact card are always mounted (for the `<h1>`'s
accessibility and so nothing needs to be timed into existence) but sit at
`opacity: 0` until `.is-revealed` — a CSS transition handles the fade, not a
second animation loop. Reduced motion or data saver (`wantsMotion()`) skips
straight to the revealed state — no border, no playback.

### Wordmark and the glass contact card

"Nordic" / "Rigging" — `ShinyText.jsx`, see below — sits centred over
the photo's upper half once revealed. It's the page's only decorative
element in the `<h1>`: the wordmark itself is `aria-hidden`, and the real
`<h1>` wrapping it carries "Nordic Rigging — <tagline>" as its accessible
name, so the page still has exactly one real, indexable heading even though
there's no visible sales-copy title. Its reveal transition is translate-only
(no scale) — plain enough now that there's no separate reason to give: the
title is ordinary CSS text sized by `clamp()`, not a box fitted against an
independent SVG measurement, so there's nothing a scale could put out of
sync in the first place.

The contact card (`.hero__dimbox`, over the photo's bottom-right corner,
styled with the shared `.card` glass treatment) holds the tagline, a small
Rig-Sense reading, a one-line area+rate fact and the one "Ota Yhteyttä"
button — nothing here repeats the fuller facts block already in the nav and
the Palvelut tab. The reading (`.hero__gauge`) is a real button: it shows
`rigsense.readingLabel` and rises 0→22% on its own short (900ms, eased)
animation once the card reveals, separate from the sequence counter above,
and pressing it re-runs the same rise. Below `~640px` there isn't room to
overlay a full card over a 16:9 photo without it colliding with the
wordmark, so `.hero__dimbox` drops out of the overlay (`position: static`)
and stacks below the photo instead — which is why it's a sibling of
`.hero__media` inside `.hero__stage` rather than a child of it: `.hero__media`
clips its own overflow to the photo's aspect ratio, and an element inside
that box can't escape it to sit in normal flow underneath.

The photo (`.hero__media`, `aspect-ratio: 16/9`) is the outpainted mast
shot — see Images below — all four corners rounded, `object-position: 50%
42%` biased slightly up to keep the mast and crane in frame. With
`prefers-reduced-motion` or data saver there is no clip; the poster photo
carries the card alone, revealed state shown immediately.

## The wordmark: ShinyText

`ShinyText.jsx` (`motion`/`useAnimationFrame` for the sweep, replacing the
earlier `MaskedHeading.jsx` video-fill from round 11 on) fills a heading's
letterforms with a moving metallic shine instead of a flat colour or a
video: a `linear-gradient` (base `color` → `shineColor` → base, at `spread`
degrees) is clipped to the text with `background-clip: text` +
`WebkitTextFillColor: transparent`, and a `motion` value drives
`background-position` across it every frame — no separate clip-path or
letterform measurement, since the gradient rides the browser's own text
layout instead of an SVG box built to match it. Hero.jsx renders it twice,
stacked ("Nordic", "Rigging") inside `.hero__wordmark-row`, each sized off
that row's `font-size: clamp(2.6rem, 10vw, 6.5rem)` — the same clamp the old
`.masked-heading` rule used — with a silver-grey base (`#9aa4ad`) and a light
blue shine (`#dbe9ff`). It's decorative (`aria-hidden` on the wrapping
`.hero__wordmark`); the `<h1>` around it carries "Nordic Rigging —
<tagline>" as its accessible name instead, so the page still has exactly one
real, indexable heading. `disabled={!motionOk}` freezes the sweep (the text
stays visible, just static) under `prefers-reduced-motion` or data saver,
the same gate the rest of the hero's motion respects.

`public/images/hero.webp` (2200 px, one fixed `src` at every breakpoint —
see Hero.css for why a `srcset`/`sizes` variant was dropped in round 11) is
the customer's `header.webp` cleaned with Higgsfield
`gpt_image_2` (brand marks removed, sky deepened), upscaled to 4K, then
outpainted 4K→2752×1536 (`outpaint_image`, `aspect_ratio: "16:9"`) from both
sides so the full mast is visible at the top and the deck/hull at the
bottom instead of getting cropped away — the portrait 4K upscale stayed
narrower than the hero card's landscape display box, so `object-fit: cover`
was cropping into both ends of the mast; widening the source narrows that
mismatch. `public/video/hero-{lg,sm}.{mp4,webm}` is one Seedance 2.5 clip, its raw
source 1920×1072: static camera, the mast turns into an exploded blueprint
and back to itself over ~6s, its own 0-100 counter baked in (see The intro
sequence, above) as part of `scripts/process-video.mjs`'s scale/encode pass.
It's the clip the intro sequence plays through — `lg` (scaled to 1440 px
wide) is served from 900 px up, `sm` (960 px) on phones. Job ids, prompts
and settings are in `docs/hero-pipeline.md`.

To regenerate the photo or clip: download to `public/video/raw/hero.mp4` and
run `npm run video`, or re-run the outpaint job against the same 4K upscale
and re-export `hero.webp`. The raw clip and the outpaint's PNG source stay
untracked outside `assets/source/`.

## Tracing beam

`TracingBeam.jsx` wraps everything below the hero (Tabs, Location, Footer)
in `Home.jsx`. Adapted from the community TracingBeam pattern (`motion`'s
`useScroll`/`useTransform`/`useSpring` driving a gradient that travels down
a path as the wrapped content scrolls by) rather than copied verbatim, for
two reasons beyond the navy/cyan recolour (`#2e8bc0 → #0f3460 →
transparent`, was `#18CCFC → #6344F5 → #AE48FF`):

- No Tailwind anywhere in this project, so the beam's resting horizontal
  position is a CSS expression mirroring the same one `.wrap` itself
  centres on (`max(pad, (100vw - max) / 2)`, minus a small extra inset),
  not a fixed `-left-4 md:-left-20` tuned for a `max-w-4xl` column that
  doesn't exist here.
- The beam stays invisible (`opacity: 0`) until the hero's contact card
  (`Hero`'s `dimBoxRef`, threaded through `Home.jsx` to both components)
  scrolls out of view — an `IntersectionObserver` on that node captures its
  last on-screen position the moment it stops intersecting, and the beam's
  anchor animates from there to its resting spot at the content's left
  edge (a one-time, one-way CSS transition, not scroll-linked). Below that,
  `scrollYProgress`-driven behaviour is unchanged from the original.

`cn()` (`src/lib/utils.js`) is a bare `clsx` wrapper — `tailwind-merge` was
left out of the install; there's no Tailwind class conflicts for it to
resolve here.

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
| `hero.webp`, `og.jpg` | the hero card's poster (outpainted 16:9), social share |
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
