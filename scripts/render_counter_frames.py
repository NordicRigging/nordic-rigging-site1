#!/usr/bin/env python3
"""Renders the hero intro's 0-100 counter as a transparent PNG frame sequence.

Round 11 item 4: the counter used to be a DOM element a JS timer wrote into
on every animation frame, racing the same timer that scrubbed the blueprint
video -- a repeated source of drift between what the number said and what
the video showed. This renders the same readout directly into the video's
own pixels instead, at the video's own frame rate, so there is nothing left
to race: process_video.mjs composites this sequence onto the clip in the
same pass that scales and encodes it, and from then on the number IS the
video. Kept in Python (not ffmpeg's own drawtext) because drawtext's `eif`
expansion -- the documented way to compute per-frame text -- silently
mis-parses in this project's ffmpeg build (verified against the project's
own upstream doc examples, not just this filter's own arguments).

Called by process-video.mjs as a subprocess; not meant to be run standalone
except for debugging one size by hand.
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Match the DOM readout this replaces: .hero__sequence-counter used --text,
# .hero__sequence-percent used --accent-2 (src/styles/global.css).
NUMBER_COLOR = (214, 228, 247, 255)
PERCENT_COLOR = (142, 208, 255, 255)
SHADOW_COLOR = (3, 9, 20, 190)
SHADOW_OFFSET = 4
SHADOW_BLUR = 8


def phase(t, freeze):
    """0-100 count-up, then a hold, then a fade to invisible -- all finished
    strictly before `freeze`, the frame Hero.jsx pauses playback on and
    holds forever after. The DOM counter this replaced faded out (a CSS
    opacity transition) at the same instant the title faded in; baked into
    pixels there's no such transition available once playback stops, so the
    fade has to already be finished by the one frame that's on screen for
    the rest of the clip's life -- otherwise "100%" would sit there
    permanently, under the title, forever.
    """
    count_end = freeze * 0.84
    hold_end = freeze * 0.89
    if t <= count_end:
        return (round(t * 100 / count_end) if count_end > 0 else 100), 1.0
    if t <= hold_end:
        return 100, 1.0
    if t < freeze:
        span = freeze - hold_end
        alpha = 1.0 - (t - hold_end) / span if span > 0 else 0.0
        return 100, max(0.0, min(1.0, alpha))
    return 100, 0.0


def render_frame(w, h, pct, alpha, number_font, percent_font):
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    number_text = str(pct)
    nb = probe.textbbox((0, 0), number_text, font=number_font)
    pb = probe.textbbox((0, 0), "%", font=percent_font)
    n_w, n_h = nb[2] - nb[0], nb[3] - nb[1]
    p_w = pb[2] - pb[0]
    gap = round(w * 0.012)

    total_w = n_w + gap + p_w
    cx, cy = w * 0.5, h * 0.30
    x0 = cx - total_w / 2
    number_origin = (x0 - nb[0], cy - n_h / 2 - nb[1])
    # baseline-align the % sign to the number's own baseline, not its box
    number_baseline = number_origin[1] + nb[3]
    percent_origin = (x0 + n_w + gap - pb[0], number_baseline - pb[3])

    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((number_origin[0], number_origin[1] + SHADOW_OFFSET), number_text, font=number_font, fill=SHADOW_COLOR)
    sd.text((percent_origin[0], percent_origin[1] + SHADOW_OFFSET), "%", font=percent_font, fill=SHADOW_COLOR)
    shadow = shadow.filter(ImageFilter.GaussianBlur(SHADOW_BLUR))

    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.text(number_origin, number_text, font=number_font, fill=NUMBER_COLOR)
    ld.text(percent_origin, "%", font=percent_font, fill=PERCENT_COLOR)

    composited = Image.alpha_composite(shadow, layer)
    if alpha < 1.0:
        r, g, b, a = composited.split()
        a = a.point(lambda v: round(v * alpha))
        composited = Image.merge("RGBA", (r, g, b, a))
    return composited


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, required=True)
    ap.add_argument("--height", type=int, required=True)
    ap.add_argument("--fps", type=float, required=True)
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--out-dir", required=True)
    args = ap.parse_args()

    timing = json.loads((ROOT / "src/lib/hero-timing.json").read_text())
    freeze = timing["freezeTimeSeconds"]

    number_size = round(args.width * 0.05)
    percent_size = round(number_size * 0.5)
    number_font = ImageFont.truetype(FONT_PATH, number_size)
    percent_font = ImageFont.truetype(FONT_PATH, percent_size)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    total_frames = max(1, round(args.duration * args.fps))
    for i in range(total_frames):
        t = i / args.fps
        pct, alpha = phase(t, freeze)
        frame = render_frame(args.width, args.height, pct, alpha, number_font, percent_font)
        frame.save(out_dir / f"f{i:05d}.png")

    print(f"rendered {total_frames} frames to {out_dir}", file=sys.stderr)


if __name__ == "__main__":
    main()
