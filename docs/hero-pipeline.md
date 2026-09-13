# Hero pipeline (Higgsfield)

Reproducible steps for the hero image and clip. Credits at the time of
writing: image ≈ 8.5, clip 1080p 6 s ≈ 54 (720p 4 s ≈ 26).

## 1. Reference photo

`public/images/header.webp` (1920×2560, 3:4): the customer's own photo, mast
standing, dark evening sky, yard crane and travel lift behind. Uploaded to
Higgsfield as media `57da8740-e50e-4dc9-b89c-64045101d435` with
`media_upload` + `media_confirm`.

The earlier round (before the file was available) used the marina photo of
the Beneteau First 30 instead; that image, its clip and the raw download are
kept in `assets/source/hero-beneteau-*`.

## 2. Cleaned hero image — `gpt_image_2`, 3:4, 2k, quality high

Reference role `image`, media id above.

> Photo edit of the reference photograph. Keep everything exactly as it is:
> the same sailboat, its standing mast with spreaders, radar and shrouds, the
> furled sail, the pontoon, the neighbouring boats, the forest line, the
> yellow crane boom at the top right and the blue boat travel lift in the
> background, same camera position, same wide-angle perspective, same
> framing, portrait 3:4. Change only these things: remove all readable text,
> lettering, logos and brand marks anywhere in the image, above all the white
> website address printed on the crossbeam of the blue boat lift, plus any
> lettering on the crane boom and any logos on the sail cover or on the
> boats, replacing them with the plain surface and colour of the object
> underneath. Deepen the sky slightly into a richer dark evening blue at the
> top while keeping the natural light gradient toward the horizon.
> Photorealistic, high detail, no illustration look, no added objects, no
> people.

Result job: `1ade72a1-d359-4446-a9b1-982356dad7f1` (1744×2336). Converted
with Pillow to `public/images/hero.webp` (1195×1600, q82) and
`public/images/og.jpg` (1200×630 crop).

## 3. Blueprint clip — `seedance_2_5`, omni_reference, 3:4, 1080p, 6 s, no audio, standard bitrate

Medias: `start_image` and `end_image` both set to the cleaned image's job id,
so the clip starts and ends on the photo and loops cleanly. Same prompt as
the first round, adapted to this scene:

> Locked-off static camera, absolutely no camera movement, no zoom, no pan,
> identical framing to the reference photo for the whole clip. The scene is
> the reference photograph: a sailboat at a marina pontoon at dusk, mast
> standing against a deep evening-blue sky, a yard crane boom and a boat lift
> behind it. Animation: thin glowing white-cyan technical drawing lines trace
> along the mast, spreaders, shrouds, forestay and the diagonal furled sail,
> and the photographed mast and rigging turn into an exploded engineering
> blueprint: clean white line art on the dark blue sky, masthead, spreaders,
> radar, shroud terminals and mast sections separate slightly and hover apart
> as schematic parts with dimension lines, small measurement ticks and callout
> leader lines, like a CAD drawing overlay. The crane, the lift, the boats,
> pontoon, water and forest stay photographic and completely still. Hold the
> blueprint briefly, then the parts glide back into place and the line drawing
> fades back into the original photograph, ending exactly on the reference
> frame. Precise, smooth, minimal motion, no people, no readable text, no
> letters, no extra objects, dark evening-blue palette with white-cyan lines.

If Higgsfield answers with a preset recommendation instead of a job, resubmit
with `declined_preset_id` set to the offered preset id.

## 4. Upscale

Result job: `b4075919-dcf2-4ce7-a7d8-457c2a6c6ef6` (HEVC 1248×1664, 6.04 s,
2.5 MB). Both the image and the clip were then upscaled with Higgsfield's
ByteDance upscalers (≈ 2 credits for the image, ≈ 0.2 for the clip):

- `upscale_image` on job `1ade72a1…`, 4k → job
  `3fb4df99-63b1-4627-962e-e0e7f38c4e3a`, 3072×4096. Converted with Pillow to
  `public/images/hero.webp` (2000×2667, q84), `hero-1200.webp` (phones, via
  `srcset`) and `og.jpg`.
- `upscale_video` on job `b4075919…`, provider bytedance, preset aigc, 2k, 24
  fps → job `58e27349-5e21-4c42-ac06-d28eea3c4cc2`, H.264 1440×1920, 6.4 MB.

## 5. Compress and wire in

Download the upscaled clip to `public/video/raw/hero.mp4` and run
`npm run video` (ffmpeg on PATH). It writes four files into `public/video/`:
`hero-lg.mp4` / `hero-lg.webm` at 1440 px for screens 900 px and wider, and
`hero-sm.mp4` / `hero-sm.webm` at 960 px for phones, and prints the size
reduction. `HERO_VIDEO` in `src/components/Hero.jsx` lists the four files and
the component picks the size at mount. The clip just loops in its card for as
long as the hero is on screen — nothing pauses it or hands its frame to
another section.

## 6. Framing

The photo/clip sits in its own enlarged, centred card, not full-bleed and not
beside the copy any more — `.hero__media` in `Hero.css`, `aspect-ratio: 3 / 4`
(matching the source media exactly, so the whole frame shows) with the top
two corners rounded. It's the last thing in the hero's single centred column,
below the video-filled "Nordic Rigging" wordmark (`MaskedHeading.jsx`) and
the sales copy.

## 7. Round 7/9 update — wider photo, regenerated clip

Round 7 outpainted the photo to 16:9 (Higgsfield outpaint job `92c6b486`,
from the same 4K upscale as step 4 — see `assets/source/hero-beneteau-outpaint-16x9.webp`,
2752×1536). The blueprint clip was *not* regenerated at the time; it kept
the original step-3 footage, sized down to a centred strip in `Hero.css` so
it wouldn't zoom against the wider box. That strip's own edges read as a
hard seam against the surrounding (newly wider) photo once the schematic
overlay was on screen — round 9 item 1.

Fixed by regenerating the clip from the *current* wide photo instead of
patching the sizing again: same `seedance_2_5` / `omni_reference` model and
prompt as step 3, `start_image`/`end_image` both the outpainted photo
(uploaded fresh as media `3b23a910-69de-4673-9c38-01c2227c487c`), `16:9`,
4 s (not 6 — this is the credit-budget tier; still ample for the hold), no
audio. Result job `60d55ad8-0ee4-4c48-9f9e-cbbcdf87d9a6`, 1280×720 H.264,
queued through the media relay as `hero-blueprint-16x9-raw.mp4` and copied
to `public/video/raw/hero.mp4`. `npm run video` (unchanged pipeline/settings
from round 8) re-encoded it into the usual four files.

Being genuinely full-width footage now, `.hero__video` in `Hero.css` went
back to a plain `inset: 0` — the same box as the poster, no left/width
strip. `VIDEO_FREEZE_TIME` in `Hero.jsx` (and the copy in `scripts/verify.mjs`)
changed to `2.6` — this clip's own hold timing, found the same way as
before (extracting frames and checking directly), unrelated to the previous
clip's `5.08`.

## 8. Round 10 — aligning the clip to the photo's own framing

Even generated from the current photo, `omni_reference` doesn't reproduce
it pixel-exact: round 10 item 1 was the crossfade from the (sharp, exact)
photo to the (AI-regenerated) video reading as a small but real "zoom" the
instant the video faded in. Measured directly rather than guessed at —
feature-matched the video's own frame 0 against `hero.webp` (OpenCV ORB +
`findHomography`, RANSAC) and got a highly confident fit (249/250 inliers):
roughly a 1-3% non-uniform scale plus an ~10-18px offset, no meaningful
perspective/rotation component. Small enough to miss glancing at a still,
large enough to read as a jump once the two crossfade.

Fixed by warping the raw clip to the photo's framing before re-encoding,
not by patching the crossfade timing or trying to prompt the model into
better fidelity:

1. Extracted frame 0 from `public/video/raw/hero.mp4` (`cv2.VideoCapture`)
   and `public/images/hero.webp`, ORB-matched keypoints between them, and
   fit a homography (`cv2.findHomography`, RANSAC) mapping the video's own
   pixel space onto the photo's.
2. Composed that with the native-resolution → photo-resolution scale to
   get one `native video pixel → photo pixel` matrix, then pre-multiplied
   a small extra centred zoom (`k = 1.04`) so the warp's own out-of-frame
   borders (the video's edges no longer land exactly on the photo's once
   corrected — checked directly: a few percent of black border at
   `k = 1.0`) fall fully outside the output canvas at every edge.
3. Applied that one fixed matrix to every frame with
   `cv2.warpPerspective` (the prompt's "locked-off static camera, no camera
   movement" held up — checked frame 0 and the last frame both against the
   photo, alignment is equally tight at both ends) into a 1600-wide
   intermediate, re-encoded through `libx264 -crf 16` as the new
   `public/video/raw/hero.mp4`, then the normal `npm run video` pass.

One-off image-registration work, not added as a committed script — this
repo has no other Python step, and it only needs re-running if the photo
or the clip is regenerated again.

## 9. Round 10 items 2-3 — 1080p regeneration, mast and gauge-icon fixes

The round-9 clip's own drawing had two content errors: the mast read as
visually cut in the middle instead of one continuous line, and it carried
two instrument-icon circles instead of one — both on top of being capped
at 720p (the round-9 credit-budget tier), noticeably softer than the
photo once displayed at the card's real size.

Root cause of the mast break: the round-9 prompt's own wording. It asked
for "masthead, spreaders, radar, shroud terminals and mast sections
separate slightly and hover apart as schematic parts" — Seedance took
"mast sections... separate and hover apart" close to literally, drawing a
visible gap where the mast "splits". Not a resolution or seed problem;
re-running the same prompt at a higher resolution would not have fixed
it.

Fixed with one fresh generation (`seedance_2_5`, `omni_reference`, same
start/end image as round 9's, `16:9`, `1080p`, 6 s — job
`8aebdf1f-fa74-47ec-b3df-dbdb4edeee83`, 54 credits) and a revised prompt:
dropped the "mast sections separate and hover apart" line entirely,
replaced it with an explicit instruction that the mast is traced as one
unbroken line for its full height and never appears cut, split, or
gapped, and added an explicit "exactly one small circular instrument
icon... never two, never a duplicated pair" line (the duplicate icon was
never called out at all in the round-9 prompt, which invited exactly the
ambiguity that produced it). Both fixes held on inspection: the mast is
one continuous line start to end, one gauge icon.

Same media relay + alignment-warp process as item 1 above (frame-matched
against `hero.webp` fresh, since a new generation drifts independently —
this one needed less correction, `k = 1.03`, 250/250 ORB inliers).
`VIDEO_FREEZE_TIME` moved again, to `3.8` — this clip's own full-hold
window (checked the same way: extract frames, find where the schematic
is stable vs. fading), unrelated to the two previous clips' freeze
points.

## 10. Round 12 item 3 — true exploded-hologram rewrite

The round-10 clip's drawing was a generic CAD-style overlay: full
dimension lines with unit-suffixed figures ("14 mm", "16 mm", "15 m") and
one stray line running off-frame to the right with no visible endpoint —
neither ever asked for, and explicitly the two things to remove this
round. Rewritten prompt (same `seedance_2_5` / `omni_reference` model,
same start/end image, `16:9`) split the two kinds of part explicitly
instead of one generic "explode" instruction: small parts (the
instrument icon, small hardware fittings) fully detach with one leader
line each and a single bare number beside them — no unit, no other text
— while the mast's own shrouds/stays/ropes only shift slightly aside as
a connected group, never fully separating. Also explicit: every line
begins and ends within frame, nothing trails off-canvas.

First submission defaulted to `720p` (no `resolution` param set) — job
`bc98912d-58f0-4870-8eef-7cb9049b5d39`, 39 credits. Content was right
(no stray line, bare numbers, no unit text) but noticeably softer than
the photo, working against round 12 item 1's own goal of *matching*
photo/video sharpness rather than fighting a bigger gap — re-submitted
with `resolution: "1080p"` explicitly (matching round 10's own precedent
for the same softness complaint), same prompt, `declined_preset_id` for
the same "IN THE DARK" preset recommendation as before. Result job
`04776ad6-b274-4e95-bd9c-e80078582e02`, 1920×1080 HEVC, 54 credits.

Known gap, shipped anyway rather than spending a third generation: the
prompt asks the shrouds/stays to "visibly shift a clear few centimetres"
aside — the model rendered them glowing in their exact resting position
instead, effectively zero offset rather than a slight one. The small
parts and the no-stray-line/no-unit-text fixes (the two things explicitly
flagged as bugs) held; the shroud offset is a softer, unverified nuance
of the fuller spec. Similarly, only one of the five detached small parts
carries a visible number in this generation, not all five — the "bare
number, no unit" rule held for the one that's there. Worth another
prompt pass in a future round if either matters enough to spend the
credits on; not re-attempted a third time this round.

Same media relay + alignment-warp process as item 8 (frame-matched
against the current `hero.webp`, `k = 1.03`, 2357/2451 ORB inliers — the
tightest fit yet). `VIDEO_FREEZE_TIME` moved to `3.4` — this clip's own
hold window sits earlier than round 10's `3.8`, found the same way
(frame-diff scan across the clip, confirmed visually).
