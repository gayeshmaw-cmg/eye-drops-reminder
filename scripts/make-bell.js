// Generates sounds/bell.wav: a short synthesized bell/chime tone for the
// Android notification channel (see README "Option B"). Run with: node scripts/make-bell.js
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const RINGS = 4, GAP = 0.9; // same cadence as the in-app chime in index.html's beep()
const ringTail = 1.6; // seconds of decay rendered per ring
const duration = (RINGS - 1) * GAP + ringTail;
const n = Math.floor(sampleRate * duration);
const data = new Float32Array(n);

// Inharmonic partials approximate a small bell/chime.
const fundamental = 740; // Hz
const partials = [
  { ratio: 1.00, amp: 1.00, decay: 3.2 },
  { ratio: 2.00, amp: 0.55, decay: 4.2 },
  { ratio: 2.76, amp: 0.35, decay: 5.0 },
  { ratio: 4.07, amp: 0.22, decay: 6.0 },
  { ratio: 5.40, amp: 0.12, decay: 7.0 },
];

for (let r = 0; r < RINGS; r++) {
  const startSample = Math.floor(r * GAP * sampleRate);
  for (let i = startSample; i < n; i++) {
    const t = (i - startSample) / sampleRate;
    let s = 0;
    for (const p of partials) {
      s += p.amp * Math.sin(2 * Math.PI * fundamental * p.ratio * t) * Math.exp(-p.decay * t);
    }
    data[i] += s;
  }
}

// Normalize to avoid clipping, then convert to 16-bit PCM.
let peak = 0;
for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(data[i]));
const scale = peak > 0 ? 0.9 / peak : 1;

const pcm = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) {
  let v = Math.max(-1, Math.min(1, data[i] * scale));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}

const byteRate = sampleRate * 2;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);  // PCM
header.writeUInt16LE(1, 22);  // mono
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(2, 32);  // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);

const outDir = path.join(__dirname, '..', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'bell.wav'), Buffer.concat([header, pcm]));
console.log('Wrote sounds/bell.wav');