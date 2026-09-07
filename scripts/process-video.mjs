#!/usr/bin/env node
/**
 * Nordic Rigging — hero clip pipeline.
 *
 * Drop the raw Higgsfield download at public/video/raw/hero.mp4 and run
 * `npm run video`. Needs ffmpeg on PATH (or FFMPEG_PATH=/path/to/ffmpeg).
 *
 * Outputs into public/video/ :
 *   hero-lg.mp4 / hero-lg.webm   full source width (1440 px after the 2K
 *                                 upscale), served on screens 900 px and wider
 *   hero-sm.mp4 / hero-sm.webm   960 px wide, served on phones
 * mp4 = H.264 high, yuv420p, faststart; webm = VP9. No audio. The poster is
 * public/images/hero.webp, the clip's first and last frame. Hero.jsx picks
 * the size at mount.
 *
 * This clip is scrubbed via currentTime in the hero intro, not played
 * linearly, so both encodes use a short keyframe interval (-g 6): the
 * default (48, fine for a looping autoplay background) makes most seeks
 * decode a run of ~20+ inter-frames from the last keyframe first, which
 * with a scrub loop issuing a new seek every animation frame reads as
 * choppy. Two things to know if you touch the CRFs:
 *   - VP9 needs a real quality trade to keep -g 6 from ballooning: at
 *     the old CRF (34) libvpx ignored -g outright and chose near-every-
 *     frame keyframes anyway, producing a WebM *larger than the original
 *     source*. CRF 40 respects -g and lands at a sane size — this clip
 *     displays small (see Hero.css's .hero__video sizing), so the quality
 *     trade isn't very visible.
 *   - All-intra (-g 1) isn't the answer either: it fixes scrub cost but
 *     wrecks normal inter-frame compression, especially on VP9.
 *
 * Quality-first CRFs; override with VIDEO_CRF_H264 / VIDEO_CRF_VP9.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'public', 'video', 'raw', 'hero.mp4');
const OUT = join(ROOT, 'public', 'video');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const CRF_H264 = process.env.VIDEO_CRF_H264 || '27';
const CRF_VP9 = process.env.VIDEO_CRF_VP9 || '40';
const SIZES = [
  { name: 'lg', maxW: Number(process.env.VIDEO_LG_W || 1440) },
  { name: 'sm', maxW: Number(process.env.VIDEO_SM_W || 960) }
];
const GOP = '6';

function run(args) {
  const res = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (res.error) throw new Error(`ffmpeg not runnable (${FFMPEG}): ${res.error.message}. Set FFMPEG_PATH.`);
  if (res.status !== 0) throw new Error(`ffmpeg failed:\n${res.stderr}`);
}

const mb = n => `${(n / 1024 / 1024).toFixed(2)} MB`;

if (!existsSync(RAW)) {
  console.error(`Missing ${RAW}\nDownload the Seedance clip from Higgsfield as hero.mp4 into public/video/raw/ first.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });
const inBytes = statSync(RAW).size;

for (const { name, maxW } of SIZES) {
  const scale = `scale='min(${maxW},iw)':-2,setsar=1`;

  console.log(`Encoding hero-${name}.mp4 (H.264, ≤${maxW} px wide)…`);
  run([
    '-i', RAW, '-map', '0:v:0', '-an',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', CRF_H264,
    '-vf', scale, '-g', GOP, '-movflags', '+faststart',
    join(OUT, `hero-${name}.mp4`)
  ]);

  console.log(`Encoding hero-${name}.webm (VP9)…`);
  run([
    '-i', RAW, '-map', '0:v:0', '-an',
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', CRF_VP9, '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1',
    '-pix_fmt', 'yuv420p', '-vf', scale, '-g', GOP,
    join(OUT, `hero-${name}.webm`)
  ]);
}

for (const { name } of SIZES) {
  for (const ext of ['mp4', 'webm']) {
    const f = `hero-${name}.${ext}`;
    const b = statSync(join(OUT, f)).size;
    console.log(`  ${f}: ${mb(b)} (${(100 - (b / inBytes) * 100).toFixed(0)} % smaller than the ${mb(inBytes)} source)`);
  }
}
