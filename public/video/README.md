# Video assets

Three clips belong in this directory. They are referenced by these exact paths:

| File               | Used by                        | Source job                             |
| ------------------ | ------------------------------ | -------------------------------------- |
| `hero.mp4`         | Hero, scroll-scrubbed          | THE DEPARTURE, approved take           |
| `archipelago.mp4`  | Services, kinetic type section | `f78a4767-0854-43ca-ac42-b3db311a6814` |
| `craft.mp4`        | Spinlock, pinned section       | `162c7512-b86d-43a7-a7eb-e2b81c023de6` |

They are not committed here: the Higgsfield CDN
(`d8j0ntlcm91z4.cloudfront.net`) is blocked by this environment's egress policy,
so they have to be downloaded and committed by hand.

## Encoding

H.264 in an mp4 container, under 3 MB each, no audio track. `faststart` moves
the moov atom to the front so the browser can begin decoding before the whole
file has arrived, and a short keyframe interval is what makes scrubbing
responsive — without it, every seek has to decode forward from a distant
keyframe.

```sh
ffmpeg -i input.mp4 \
  -an \
  -c:v libx264 -profile:v high -crf 26 -preset slow \
  -g 12 -keyint_min 12 -sc_threshold 0 \
  -movflags +faststart \
  -vf "scale=1600:-2" \
  hero.mp4
```

Raise `-crf` to shrink further if a clip lands over 3 MB.

## No fixed duration or dimensions

The scrub engine reads `duration`, `videoWidth` and `videoHeight` from each file
at runtime and derives its cover-fit from them, so clips of any length or aspect
ratio drop in without code changes.

## A note on stand-ins

If you generate placeholder clips at these paths to test locally, delete them
before committing — nothing here is gitignored, precisely so the real files
cannot be silently skipped.
