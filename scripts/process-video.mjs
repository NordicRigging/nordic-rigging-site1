#!/usr/bin/env node
/**
 * Nordic Rigging — video pipeline.
 *
 * Drop the raw Higgsfield downloads into public/video/raw/ :
 *   climb-1.mp4  climb-2.mp4  climb-3.mp4  climb-4.mp4   (one continuous move)
 *   orbit.mp4
 *
 * then run `npm run video`. Outputs into public/video/ :
 *   climb.mp4          — the four climb clips concatenated and re-encoded in a
 *                        SINGLE pass, so they scrub as one unbroken stream
 *   orbit.mp4          — re-encoded for scrubbing
 *   climb-poster.jpg / orbit-poster.jpg — first-frame posters
 *   manifest.json      — runtime metadata (durations, dims, sizes)
 *
 * Encoding contract (scrub-friendly): H.264 high profile, 8-bit yuv420p,
 * keyframe every 12 frames with scenecut disabled, faststart, no audio,
 * each file under 3 MB (the script steps down resolution/CRF until it fits).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'public', 'video', 'raw');
const OUT = join(ROOT, 'public', 'video');
const BUDGET = 3 * 1024 * 1024; // < 3MB each
const GOP = 12;

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';

function ffmpeg(args, opts = {}) {
  const res = spawnSync(FFMPEG, ['-hide_banner', '-y', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts
  });
  if (res.error) {
    throw new Error(`ffmpeg not runnable (${FFMPEG}): ${res.error.message}. Set FFMPEG_PATH.`);
  }
  return res;
}

/** Duration/dimensions via `ffmpeg -i` (no ffprobe dependency). */
function probe(file) {
  const res = ffmpeg(['-i', file]);
  const text = res.stderr || '';
  const dur = text.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  const dim = text.match(/,\s*(\d{2,5})x(\d{2,5})[\s,]/);
  if (!dur) throw new Error(`Could not read duration of ${file}`);
  return {
    duration: (+dur[1]) * 3600 + (+dur[2]) * 60 + (+dur[3]),
    width: dim ? +dim[1] : null,
    height: dim ? +dim[2] : null
  };
}

/** Encode one source (file or concat list) down the quality ladder until it fits the budget. */
function encode(label, inputArgs, outFile) {
  const ladder = [
    { w: 1920, crf: 26 },
    { w: 1600, crf: 27 },
    { w: 1280, crf: 26 },
    { w: 1280, crf: 30 },
    { w: 1280, crf: 34 },
    { w: 960, crf: 32 },
    { w: 960, crf: 37 }
  ];
  for (const { w, crf } of ladder) {
    const args = [
      ...inputArgs,
      '-map', '0:v:0',
      '-an',
      '-c:v', 'libx264',
      '-profile:v', 'high',
      '-pix_fmt', 'yuv420p',
      '-preset', 'slow',
      '-crf', String(crf),
      '-vf', `scale='min(${w},iw)':-2,setsar=1`,
      '-g', String(GOP),
      '-keyint_min', String(GOP),
      '-sc_threshold', '0',
      '-movflags', '+faststart',
      outFile
    ];
    const res = ffmpeg(args);
    if (res.status !== 0) {
      throw new Error(`ffmpeg failed for ${label} (w=${w}, crf=${crf}):\n${res.stderr?.slice(-2000)}`);
    }
    const bytes = statSync(outFile).size;
    if (bytes < BUDGET) {
      console.log(`  ${label}: ${(bytes / 1024 / 1024).toFixed(2)} MB @ ${w}w crf${crf}`);
      return bytes;
    }
    console.log(`  ${label}: ${(bytes / 1024 / 1024).toFixed(2)} MB @ ${w}w crf${crf} — over budget, stepping down`);
  }
  throw new Error(`${label} would not fit under 3MB — check the source material.`);
}

function poster(src, outFile) {
  const res = ffmpeg(['-i', src, '-frames:v', '1', '-q:v', '3', outFile]);
  if (res.status !== 0) throw new Error(`Poster extraction failed for ${src}`);
}

// —— main ——————————————————————————————————————————————————————————————

const climbParts = [1, 2, 3, 4].map(n => join(RAW, `climb-${n}.mp4`));
const orbitRaw = join(RAW, 'orbit.mp4');
const missing = [...climbParts, orbitRaw].filter(f => !existsSync(f));
if (missing.length) {
  console.error('Missing raw clips in public/video/raw/ :');
  for (const f of missing) console.error(`  - ${f}`);
  console.error('\nDownload them from Higgsfield first, then re-run `npm run video`.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

// Concat via the demuxer, decoded and re-encoded in one pass → one unbroken
// stream with a uniform timebase, not four stitched files.
const listFile = join(RAW, 'concat.txt');
writeFileSync(listFile, climbParts.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n');

console.log('Encoding climb (4 clips → one stream)…');
const climbOut = join(OUT, 'climb.mp4');
const climbBytes = encode('climb', ['-f', 'concat', '-safe', '0', '-i', listFile], climbOut);

console.log('Encoding orbit…');
const orbitOut = join(OUT, 'orbit.mp4');
const orbitBytes = encode('orbit', ['-i', orbitRaw], orbitOut);

console.log('Extracting posters…');
poster(climbOut, join(OUT, 'climb-poster.jpg'));
poster(orbitOut, join(OUT, 'orbit-poster.jpg'));

const climbInfo = probe(climbOut);
const orbitInfo = probe(orbitOut);

const manifest = {
  generated: new Date().toISOString(),
  encoding: { codec: 'h264', pixelFormat: 'yuv420p', keyframeInterval: GOP },
  clips: {
    climb: {
      src: '/video/climb.mp4',
      poster: '/video/climb-poster.jpg',
      duration: +climbInfo.duration.toFixed(3),
      width: climbInfo.width,
      height: climbInfo.height,
      bytes: climbBytes
    },
    orbit: {
      src: '/video/orbit.mp4',
      poster: '/video/orbit-poster.jpg',
      duration: +orbitInfo.duration.toFixed(3),
      width: orbitInfo.width,
      height: orbitInfo.height,
      bytes: orbitBytes
    }
  }
};
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
rmSync(listFile, { force: true });

console.log('\nDone. public/video/ now holds:');
console.log(`  climb.mp4  ${(climbBytes / 1024 / 1024).toFixed(2)} MB, ${climbInfo.duration.toFixed(1)}s`);
console.log(`  orbit.mp4  ${(orbitBytes / 1024 / 1024).toFixed(2)} MB, ${orbitInfo.duration.toFixed(1)}s`);
console.log('  climb-poster.jpg, orbit-poster.jpg, manifest.json');
