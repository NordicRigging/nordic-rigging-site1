#!/usr/bin/env node
/**
 * Nordic Rigging — hero clip pipeline.
 *
 * Drop the raw Higgsfield download at public/video/raw/hero.mp4 and run
 * `npm run video`. Needs ffmpeg on PATH (or FFMPEG_PATH=/path/to/ffmpeg).
 *
 * Outputs into public/video/ :
 *   hero-lg.mp4 / hero-lg.webm   full source width (1248 px from Seedance 1080p 3:4),
 *                                 served on screens 900 px and wider where the clip
 *                                 covers the whole viewport
 *   hero-sm.mp4 / hero-sm.webm   720 px wide, served on phones (2x devices covered)
 * mp4 = H.264 high, yuv420p, faststart (Safari + everything); webm = VP9.
 * No audio. The poster is public/images/hero.webp, the clip's first and last
 * frame. Hero.jsx picks the size at mount.
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
const CRF_VP9 = process.env.VIDEO_CRF_VP9 || '34';
const SIZES = [
  { name: 'lg', maxW: Number(process.env.VIDEO_LG_W || 1280) },
  { name: 'sm', maxW: Number(process.env.VIDEO_SM_W || 720) }
];

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
    '-vf', scale, '-g', '48', '-movflags', '+faststart',
    join(OUT, `hero-${name}.mp4`)
  ]);

  console.log(`Encoding hero-${name}.webm (VP9)…`);
  run([
    '-i', RAW, '-map', '0:v:0', '-an',
    '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', CRF_VP9, '-deadline', 'good', '-cpu-used', '1', '-row-mt', '1',
    '-pix_fmt', 'yuv420p', '-vf', scale, '-g', '48',
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
