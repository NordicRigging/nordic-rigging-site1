#!/usr/bin/env node
/**
 * Nordic Rigging — hero clip pipeline.
 *
 * Drop the raw Higgsfield download at public/video/raw/hero.mp4 and run
 * `npm run video`. Needs ffmpeg on PATH (or FFMPEG_PATH=/path/to/ffmpeg).
 *
 * Outputs into public/video/ :
 *   hero.mp4         H.264 high, yuv420p, faststart, no audio (Safari + everything)
 *   hero.webm        VP9, no audio (smaller, Chrome/Firefox/Edge)
 * The poster is the hero image itself (public/images/hero.webp), which is
 * also the clip's first and last frame.
 *
 * The clip loops behind the hero text, so it is scaled down to what the
 * layout actually shows (a 3:4 frame at most ~500 css px wide on desktop,
 * full-bleed on phones) — 720x960 covers 2x phones — and encoded with a
 * quality-first CRF. Expect roughly 90 % off the Seedance original.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'public', 'video', 'raw', 'hero.mp4');
const OUT = join(ROOT, 'public', 'video');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const MAX_W = Number(process.env.VIDEO_MAX_W || 720);
const CRF_H264 = process.env.VIDEO_CRF_H264 || '27';
const CRF_VP9 = process.env.VIDEO_CRF_VP9 || '34';

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

const scale = `scale='min(${MAX_W},iw)':-2,setsar=1`;
const inBytes = statSync(RAW).size;

console.log('Encoding hero.mp4 (H.264)…');
run([
  '-i', RAW, '-map', '0:v:0', '-an',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', CRF_H264,
  '-vf', scale, '-g', '48', '-movflags', '+faststart',
  join(OUT, 'hero.mp4')
]);

console.log('Encoding hero.webm (VP9)…');
run([
  '-i', RAW, '-map', '0:v:0', '-an',
  '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', CRF_VP9, '-deadline', 'good', '-cpu-used', '1', '-row-mt', '1',
  '-pix_fmt', 'yuv420p', '-vf', scale, '-g', '48',
  join(OUT, 'hero.webm')
]);

for (const f of ['hero.mp4', 'hero.webm']) {
  const b = statSync(join(OUT, f)).size;
  console.log(`  ${f}: ${mb(b)} (${(100 - (b / inBytes) * 100).toFixed(0)} % smaller than the ${mb(inBytes)} source)`);
}
