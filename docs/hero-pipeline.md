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
  `public/images/hero-blueprint.webp` is its frame at 3.6 s, the fully
  exploded blueprint, used as the services background when the clip is not
  playing (reduced motion, data saver).

## 5. Compress and wire in

Download the upscaled clip to `public/video/raw/hero.mp4` and run
`npm run video` (ffmpeg on PATH). It writes four files into `public/video/`:
`hero-lg.mp4` / `hero-lg.webm` at 1440 px for screens 900 px and wider, where
the clip covers the whole viewport, and `hero-sm.mp4` / `hero-sm.webm` at
960 px for phones, and prints the size reduction. `HERO_VIDEO` in
`src/components/Stage.jsx` lists the four files and the component picks the
size at mount. `HOLD_AT` there (3.6 s) is the frame the clip pauses on once
the reader has scrolled a third of the way through the hero; the services
section sits on that frame.

## 6. Framing

The hero is full-bleed at every size. `HERO_CROP` in `Stage.jsx` picks between
`center` (mast mid-frame) and `offset` (mast right of centre, copy on clean
sky); the numbers for both live at the top of `Stage.css`. `?crop=center` in
the URL previews the other one.
