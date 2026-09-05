# Hero pipeline (Higgsfield)

Reproducible steps for the hero image and clip. Credits at the time of
writing: image ≈ 8.5, clip ≈ 54.

## 1. Reference photo

The intended source is the customer's own `header.webp` (mast standing, dark
evening sky, yard crane silhouette). It was not available in the v3 build
environment, so the customer's marina photo of the Beneteau First 30 with the
mast stepped (Higgsfield media `c1aec72b-d7e0-4b3f-b0d7-bbc84777b4fe`) was
used instead. To use `header.webp`, upload it with `media_upload` and swap the
media id below.

## 2. Cleaned hero image — `gpt_image_2`, 3:4, 2k, quality high

> Photo edit of the reference photograph. Keep the sailboat, its standing mast,
> spreaders, shrouds, deck, pontoon and the surrounding marina exactly as they
> are, same camera position and same composition, reframed to a portrait 3:4
> crop centred on the mast. Change only the lighting and colour: turn the
> bright daytime scene into a moody blue hour at dusk with a deep dark
> evening-blue sky that darkens toward the top, mast and rigging catching the
> last cool light so they stay clearly visible as bright thin lines against
> the sky, water dark and calm with subtle reflections, forest as a dark
> silhouette. Remove any readable brand names, logos, text, flags or signage
> anywhere in the image. Photorealistic, high detail, no illustration look, no
> added objects.

For `header.webp` add: "remove the website address and any brand marks on the
crane".

Result job: `fe020c01-47c1-400a-beaf-f89cca4c0d77`. Converted with Pillow to
`public/images/hero.webp` (1200×1600, q82) and `public/images/og.jpg`.

## 3. Blueprint clip — `seedance_2_5`, omni_reference, 3:4, 1080p, 6 s, no audio, standard bitrate

Medias: `start_image` and `end_image` both set to the hero image job id, so the
clip starts and ends on the photo and loops cleanly.

> Locked-off static camera, absolutely no camera movement, no zoom, no pan,
> identical framing to the reference photo for the whole clip. The scene is
> the reference photograph: a sailboat moored at a marina pontoon at blue
> hour, mast standing against a deep evening-blue sky. Animation: thin glowing
> white-cyan technical drawing lines trace along the mast, spreaders, shrouds
> and forestay, and the photographed mast and rigging turn into an exploded
> engineering blueprint: clean white line art on the dark blue sky, masthead,
> spreaders, shroud terminals and mast sections separate slightly and hover
> apart as schematic parts with dimension lines, small measurement ticks and
> callout leader lines, like a CAD drawing overlay. The hull, pontoon, water
> and forest stay photographic and completely still. Hold the blueprint
> briefly, then the parts glide back into place and the line drawing fades
> back into the original photograph, ending exactly on the reference frame.
> Precise, smooth, minimal motion, no people, no readable text, no letters, no
> extra objects, dark evening-blue palette with white-cyan lines.

If Higgsfield answers with a preset recommendation instead of a job, resubmit
with `declined_preset_id` set to the offered preset id.

Result job: `c9f59f13-8f59-411b-8284-b3dd300dfc3c`.

## 4. Compress

Download the clip to `public/video/raw/hero.mp4` and run `npm run video`
(ffmpeg on PATH). It writes `public/video/hero.mp4` (H.264), `hero.webm` (VP9)
and `hero-poster.jpg`, scaled to 720×960, and prints the size reduction.
