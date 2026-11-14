#!/usr/bin/env node
// Línea de tiempo de un video narrado donde la VOZ manda (explicativos de plataforma).
// Toma la duración real de cada frase (out/<plataforma>/audio/<slug>/plan.json, tras synthesize),
// las encadena con respiros y escribe:
//   - videos/<slug>/timeline.json: frames de inicio y fin de cada frase y de cada sección (lo lee el video)
//   - videos/<slug>/narracion.md: las mismas ventanas, para que synthesize coloque la voz ahí (usa la caché)
//
//   node scripts/voice-timeline.mjs <plataforma> <slug> --sections=0-3,4-8,9-15 [--lead=0.7] [--gap=0.35] [--break=1.1] [--tail=3.6]
//
// Flujo: narracion.md (ventanas provisionales) -> narrate.mjs synthesize -> este script -> synthesize otra vez
// (sin costo) -> armar el video con timeline.json -> render -> narrate.mjs mux.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [platform, slug, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
if (!platform || !slug || !opt.sections) {
  console.error('uso: node scripts/voice-timeline.mjs <plataforma> <slug> --sections=0-3,4-8 [--lead=0.7] [--gap=0.35] [--break=1.1] [--tail=3.6]');
  process.exit(1);
}
const FPS = 30;
const lead = Number(opt.lead ?? 0.7); // segundos antes de la primera frase
const gap = Number(opt.gap ?? 0.35); // respiro entre frases de una misma sección
const brk = Number(opt.break ?? 1.1); // respiro entre secciones (cambio de escena)
const tail = Number(opt.tail ?? 3.6); // cierre después de la última frase

const plan = JSON.parse(fs.readFileSync(path.join(root, 'out', platform, 'audio', slug, 'plan.json'), 'utf8'));
const sections = opt.sections.split(',').map((r) => {
  const [a, b] = r.split('-').map(Number);
  return Array.from({ length: (b ?? a) - a + 1 }, (_, k) => a + k);
});
const covered = sections.flat();
if (covered.length !== plan.length || covered.some((v, i) => v !== i)) {
  console.error(`Las secciones deben cubrir las frases 0-${plan.length - 1} en orden.`);
  process.exit(1);
}

let t = lead;
const starts = [];
sections.forEach((sec, si) => {
  if (si > 0) t += brk;
  sec.forEach((i, k) => {
    if (k > 0) t += gap;
    starts[i] = t;
    t += plan[i].dur;
  });
});
const f = (sec) => Math.round(sec * FPS);
const timeline = {
  fps: FPS,
  phrases: plan.map((p, i) => ({ i, start: f(starts[i]), end: f(starts[i] + p.dur), text: p.text })),
  sections: sections.map((sec) => ({ phrases: sec, start: f(starts[sec[0]]), end: f(starts[sec.at(-1)] + plan[sec.at(-1)].dur) })),
  duration: Math.ceil((t + tail) * FPS)
};
// Carpeta temporal de un trabajo del worker (jobs/<slug>) o la del video (videos/<slug>).
const jobDir = path.join(root, 'src/platforms', platform, 'jobs', slug);
const dir = fs.existsSync(jobDir) ? jobDir : path.join(root, 'src/platforms', platform, 'videos', slug);
fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(timeline, null, 1));

const md = [`<!-- Narración de ${slug}. Ventanas = timeline.json (scripts/voice-timeline.mjs). -->`, ''];
for (const p of timeline.phrases) md.push(`<!-- #${p.i} [${(p.start / FPS).toFixed(2)} -> ${(p.end / FPS + 0.3).toFixed(2)}] -->`, p.text, '');
fs.writeFileSync(path.join(dir, 'narracion.md'), md.join('\n'));

console.log(`timeline.json: ${timeline.phrases.length} frases, ${timeline.duration} frames (${(timeline.duration / FPS).toFixed(1)} s)`);
timeline.sections.forEach((s, i) => console.log(`  sección ${i}: frases ${s.phrases[0]}-${s.phrases.at(-1)}  frames ${s.start}-${s.end}`));
console.log('Siguiente: node scripts/narrate.mjs synthesize (reusa la caché y coloca la voz en estas ventanas).');
