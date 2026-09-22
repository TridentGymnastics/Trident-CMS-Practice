/**
 * Optimise a video for the website.
 *
 *   npm run optimise:video -- "<input>" public/videos/programs/<name>.mp4
 *
 * Encodes H.264 (universal playback — including Android Chrome, which cannot
 * decode H.265/HEVC), caps the long edge at 1280px, enables +faststart so
 * playback begins before the file finishes downloading, and auto-tunes CRF
 * until the result fits the size budget.
 *
 * NOTE: MEDIA-OPTIMIZATION.md still prescribes libx265 — do not follow it for
 * web video. The files actually shipping are H.264, which is correct.
 */
import { spawnSync } from 'node:child_process';
import { statSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const MAX_BYTES = 2 * 1024 * 1024; // 2MB budget
const MAX_EDGE = 1280;
const CRF_START = 26;
const CRF_MAX = 34;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: npm run optimise:video -- "<input>" "<output.mp4>"');
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const mb = (n) => (n / 1048576).toFixed(2) + 'MB';

function probe(file) {
  const out = spawnSync(ffmpeg, ['-hide_banner', '-i', file]).stderr.toString();
  const dims = out.match(/,\s(\d{2,5})x(\d{2,5})[\s,]/);
  if (!dims) throw new Error('Could not read video dimensions');
  return { width: +dims[1], height: +dims[2], hasAudio: /Stream .*: Audio:/.test(out) };
}

// Long edge to MAX_EDGE, preserving aspect. Both dims must stay even for yuv420p.
function targetSize({ width, height }) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const even = (n) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { w: even(width), h: even(height) };
}

const src = probe(input);
const { w, h } = targetSize(src);
mkdirSync(dirname(output), { recursive: true });

console.log(`in : ${input}`);
console.log(`     ${src.width}x${src.height} ${mb(statSync(input).size)} audio:${src.hasAudio ? 'yes' : 'no'}`);
console.log(`out: ${w}x${h} target <${mb(MAX_BYTES)}`);

let done = false;
for (let crf = CRF_START; crf <= CRF_MAX; crf += 2) {
  const args = [
    '-y', '-i', input,
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow',
    '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-vf', `scale=${w}:${h}`,
    '-movflags', '+faststart',
    ...(src.hasAudio ? ['-c:a', 'aac', '-b:a', '96k'] : ['-an']),
    output,
  ];
  const r = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  if (r.status !== 0) {
    console.error(r.stderr.toString().split('\n').slice(-6).join('\n'));
    process.exit(1);
  }
  const size = statSync(output).size;
  const ok = size <= MAX_BYTES;
  console.log(`  crf ${crf} -> ${mb(size)} ${ok ? 'OK' : '(over budget, retrying)'}`);
  if (ok) { done = true; break; }
}

if (!done) {
  console.error(`Could not reach ${mb(MAX_BYTES)} by crf ${CRF_MAX}. Shorten the clip or lower MAX_EDGE.`);
  unlinkSync(output);
  process.exit(1);
}

const final = statSync(output).size;
console.log(`\n${output}`);
console.log(`  ${mb(statSync(input).size)} -> ${mb(final)} (${Math.round((1 - final / statSync(input).size) * 100)}% smaller)`);
