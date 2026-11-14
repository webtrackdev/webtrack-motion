#!/usr/bin/env node
// Sincroniza la narración con el video cuando la VOZ manda (videos explicativos).
//
//   node scripts/sync-beats.mjs <plataforma> <slug>          genera narracion.md desde beats.json
//   node scripts/sync-beats.mjs <plataforma> <slug> --fit    además, con la voz ya sintetizada (plan.json),
//                                                           calcula las anclas de cada escena para que cada
//                                                           frase termine antes de que empiece la siguiente
//
// beats.json (en la carpeta del video): hook (frames), scenes [{dur, A, N}] y beats [{scene, at, text}].
//   at  = frame, en el tiempo ORIGINAL de la escena, donde empieza la imagen que explica esa frase
//   A/N = anclas de la escena en tiempo original (A) y en tiempo ya ajustado a la voz (N)
// El video lee las mismas anclas (components/time.ts): entre dos anclas la imagen corre a su ritmo y,
// si la voz aún no termina, se queda quieta esperándola. narracion.md sale de la misma fuente.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [platform, slug, ...rest] = process.argv.slice(2);
if (!platform || !slug) {
  console.error('uso: node scripts/sync-beats.mjs <plataforma> <slug> [--fit]');
  process.exit(1);
}
// Carpeta temporal de un trabajo del worker (jobs/<slug>) o la del video (videos/<slug>).
const jobDir = path.join(root, 'src/platforms', platform, 'jobs', slug);
const dir = fs.existsSync(jobDir) ? jobDir : path.join(root, 'src/platforms', platform, 'videos', slug);
const beatsPath = path.join(dir, 'beats.json');
const B = JSON.parse(fs.readFileSync(beatsPath, 'utf8'));
const FPS = 30;
const GAP = 0.35; // respiro entre frases (s)
const TAIL = 12; // frames finales de la escena (se desvanece)

const plan = (() => {
  const p = path.join(root, 'out', platform, 'audio', slug, 'plan.json');
  return rest.includes('--fit') && fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
})();
if (rest.includes('--fit') && !plan) {
  console.error('Falta plan.json: sintetiza primero (node scripts/narrate.mjs synthesize ...).');
  process.exit(1);
}
if (plan && plan.length !== B.beats.length) {
  console.error(`plan.json tiene ${plan.length} frases y beats.json ${B.beats.length}: vuelve a sintetizar.`);
  process.exit(1);
}

/** Anclas A/N de una escena. Sin voz medida, N = A (ritmo original). */
B.scenes.forEach((sc, si) => {
  const mine = B.beats.map((b, i) => ({ ...b, i })).filter((b) => b.scene === si);
  const A = [0, ...mine.map((b) => b.at), sc.dur - TAIL, sc.dur];
  const N = [0];
  for (let k = 0; k < A.length - 1; k++) {
    const lenO = A[k + 1] - A[k];
    const beat = k >= 1 && k <= mine.length ? mine[k - 1] : null;
    const need = plan && beat ? Math.ceil((plan[beat.i].dur + GAP) * FPS) : 0;
    N.push(N[k] + Math.max(lenO, need));
  }
  // Sin --fit se conservan las anclas ya ajustadas a la voz (si las frases no cambiaron de lugar).
  const keep = !plan && Array.isArray(sc.N) && Array.isArray(sc.A) && sc.N.length === A.length && sc.A.join() === A.join();
  sc.A = A;
  if (!keep) sc.N = N;
  sc._beatIdx = mine.map((b) => b.i);
});

let at = B.hook;
const sceneStart = B.scenes.map((sc) => {
  const s = at;
  at += sc.N[sc.N.length - 1];
  return s;
});
const end = at;

const frames = B.beats.map((b, i) => {
  if (b.scene < 0) return b.at;
  const sc = B.scenes[b.scene];
  return sceneStart[b.scene] + sc.N[1 + sc._beatIdx.indexOf(i)];
});
B.scenes.forEach((sc) => delete sc._beatIdx);
fs.writeFileSync(beatsPath, JSON.stringify(B, null, 2) + '\n');

const lines = [
  `<!-- NARRACIÓN de ${slug}. Generada por scripts/sync-beats.mjs desde beats.json: edita beats.json, no este archivo. -->`,
  `<!-- Tiempos en segundos del video final. Video: ${(end / FPS).toFixed(1)} s (${end} frames). -->`,
  ''
];
B.beats.forEach((b, i) => {
  const s = frames[i] / FPS;
  const e = (i + 1 < frames.length ? frames[i + 1] : end) / FPS;
  lines.push(`<!-- #${i} [${s.toFixed(2)} -> ${Math.max(e, s + 0.5).toFixed(2)}] -->`, b.text, '');
});
fs.writeFileSync(path.join(dir, 'narracion.md'), lines.join('\n'));
console.log(`narracion.md: ${B.beats.length} frases; video final ${(end / FPS).toFixed(1)} s (${end} frames)`);
console.log('duración por escena (s):', B.scenes.map((sc) => (sc.N[sc.N.length - 1] / FPS).toFixed(1)).join(', '));
