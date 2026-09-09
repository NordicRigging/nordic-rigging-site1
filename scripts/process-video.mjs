#!/usr/bin/env node
/**
 * Nordic Rigging — hero clip pipeline.
 *
 * Drop the raw Higgsfield download at public/video/raw/hero.mp4 and run
 * `npm run video`. Needs ffmpeg + python3/Pillow on PATH (or
 * FFMPEG_PATH=/path/to/ffmpeg).
 *
 * Outputs into public/video/ :
 *   hero-lg.mp4 / hero-lg.webm   full source width (1440 px after the 2K
 *                                 upscale), served on screens 900 px and wider
 *   hero-sm.mp4 / hero-sm.webm   960 px wide, served on phones
 * mp4 = H.264 high, yuv420p, faststart; webm = VP9. No audio. The poster is
 * public/images/hero.webp, the clip's first and last frame. Hero.jsx picks
 * the size at mount.
 *
 * Round 11 item 4: the hero intro used to scrub this clip's currentTime from
 * a separate JS timer, with a 0-100 counter as a second DOM element that
 * timer also drove — two things a browser hiccup could knock out of step.
 * Hero.jsx now just plays the clip and reads its own currentTime back, so
 * the counter has to be part of the clip's own pixels: render_counter_frames.py
 * renders a transparent 0-100 PNG sequence at each size's exact output
 * resolution (see that file for why Python, not ffmpeg's own drawtext), and
 * the ffmpeg pass below overlays it in the SAME encode as the scale, so
 * there's one lossy generation from the raw source, not two. freezeTime
 * (src/lib/hero-timing.json) is shared with Hero.jsx: it's both where the
 * counter's own frames stop climbing and where Hero.jsx pauses playback, so
 * the two can't drift the way a duplicated constant could.
 *
 * That also retires the short keyframe interval the old scrub-based intro
 * needed (GOP 6, so a seek issued every animation frame never had to decode
 * a long run of inter-frames first): playback is linear now, so a normal
 * interval compresses better for the same visual quality.
 *
 * Quality-first CRFs; override with VIDEO_CRF_H264 / VIDEO_CRF_VP9.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'public', 'video', 'raw', 'hero.mp4');
const OUT = join(ROOT, 'public', 'video');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';
const PYTHON = process.env.PYTHON_PATH || 'python3';
const CRF_H264 = process.env.VIDEO_CRF_H264 || '27';
const CRF_VP9 = process.env.VIDEO_CRF_VP9 || '40';
const SIZES = [
  { name: 'lg', maxW: Number(process.env.VIDEO_LG_W || 1440) },
  { name: 'sm', maxW: Number(process.env.VIDEO_SM_W || 960) }
];
const GOP = '48';

function run(bin, args) {
  const res = spawnSync(bin, args, { encoding: 'utf8' });
  if (res.error) throw new Error(`${bin} not runnable: ${res.error.message}`);
  if (res.status !== 0) throw new Error(`${bin} failed:\n${res.stderr}`);
  return res.stdout;
}

function ffmpeg(args) {
  run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
}

const mb = n => `${(n / 1024 / 1024).toFixed(2)} MB`;
// ffmpeg's own `scale='min(maxW,iw)':-2` rounds the derived height to the
// nearest even number — duplicated here (not shelled out to ffmpeg first)
// just to size the counter overlay frames at the exact pixels they'll land on.
const scaledSize = (rawW, rawH, maxW) => {
  const w = Math.min(maxW, rawW);
  const h = Math.round((rawH * w) / rawW / 2) * 2;
  return { w, h };
};

if (!existsSync(RAW)) {
  console.error(`Missing ${RAW}\nDownload the Seedance clip from Higgsfield as hero.mp4 into public/video/raw/ first.`);
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });
const inBytes = statSync(RAW).size;

const probe = JSON.parse(
  run(FFPROBE, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,duration',
    '-of', 'json', RAW
  ])
).streams[0];
const [rawW, rawH] = [probe.width, probe.height];
const [fpsNum, fpsDen] = probe.r_frame_rate.split('/').map(Number);
const fps = fpsNum / fpsDen;
const duration = Number(probe.duration);

const timing = JSON.parse(readFileSync(join(ROOT, 'src', 'lib', 'hero-timing.json'), 'utf8'));
console.log(`Raw source: ${rawW}x${rawH}, ${fps}fps, ${duration.toFixed(3)}s — counter freezes at ${timing.freezeTimeSeconds}s`);

for (const { name, maxW } of SIZES) {
  const { w, h } = scaledSize(rawW, rawH, maxW);
  const scale = `scale='min(${maxW},iw)':-2,setsar=1`;
  const frameDir = mkdtempSync(join(tmpdir(), 'hero-counter-'));

  try {
    console.log(`Rendering counter overlay frames for ${name} (${w}x${h})…`);
    run(PYTHON, [
      join(ROOT, 'scripts', 'render_counter_frames.py'),
      '--width', String(w), '--height', String(h),
      '--fps', String(fps), '--duration', String(duration),
      '--out-dir', frameDir
    ]);
    const overlayIn = ['-framerate', String(fps), '-i', join(frameDir, 'f%05d.png')];
    const overlayFilter = `[0:v]${scale}[base];[base][1:v]overlay=0:0:format=auto[out]`;

    console.log(`Encoding hero-${name}.mp4 (H.264, ≤${maxW} px wide)…`);
    ffmpeg([
      '-i', RAW, ...overlayIn, '-map', '[out]', '-an',
      '-filter_complex', overlayFilter,
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', CRF_H264,
      '-g', GOP, '-movflags', '+faststart',
      join(OUT, `hero-${name}.mp4`)
    ]);

    console.log(`Encoding hero-${name}.webm (VP9)…`);
    ffmpeg([
      '-i', RAW, ...overlayIn, '-map', '[out]', '-an',
      '-filter_complex', overlayFilter,
      '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', CRF_VP9, '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1',
      '-pix_fmt', 'yuv420p', '-g', GOP,
      join(OUT, `hero-${name}.webm`)
    ]);
  } finally {
    rmSync(frameDir, { recursive: true, force: true });
  }
}

for (const { name } of SIZES) {
  for (const ext of ['mp4', 'webm']) {
    const f = `hero-${name}.${ext}`;
    const b = statSync(join(OUT, f)).size;
    console.log(`  ${f}: ${mb(b)} (${(100 - (b / inBytes) * 100).toFixed(0)} % smaller than the ${mb(inBytes)} source)`);
  }
}
