#!/usr/bin/env node
// Paso 2 del video de una tarea (después de `pnpm video <tarea>` y de que Claude armó los dos videos):
// renderiza el clip (-> GIF) y el tutorial narrado (-> MP4 con voz y música), comprime, sube ambos a
// Versio con tu token y los pone en la novedad. Mismo render que el worker (lib/pipeline.mjs).
//
//   pnpm publish-video WD-4541              renderiza, sube y pone en la novedad; borra las carpetas temporales
//   pnpm publish-video WD-4541 --no-upload  solo renderiza (archivos en out/webtrack/) para revisarlos
//   pnpm publish-video WD-4541 --keep       sube pero conserva las carpetas de jobs/ para seguir ajustando
import fs from 'node:fs';
import path from 'node:path';
import { MAX_BYTES, ROOT, jobDir, render, slugOf, tutorialOf } from './lib/pipeline.mjs';
import { versioTool } from './lib/versio.mjs';

const args = process.argv.slice(2);
const ticket = args.find((a) => !a.startsWith('--'));
if (!ticket) {
  console.error('Uso: pnpm publish-video WD-#### [--no-upload] [--keep]');
  process.exit(1);
}
const slug = slugOf({ ticket: ticket.toUpperCase(), id: ticket });
const taskFile = path.join(ROOT, 'out', 'tasks', `${slug}.json`);
const started = Date.now();
const mins = () => `${Math.round((Date.now() - started) / 6000) / 10} min`;

/** Avance en consola: una línea por fase y el % de cuadros cada 10 %. */
function consoleReport() {
  let last = { phase: null, step: -1 };
  const names = { 'render-clip': 'Renderizando el clip', gif: 'Armando el GIF', 'render-tutorial': 'Renderizando el tutorial', mux: 'Mezclando voz y música' };
  return (phase, fraction) => {
    const step = Math.floor(fraction * 10);
    if (phase !== last.phase) console.log(`→ ${names[phase] ?? phase}…`);
    else if (step > last.step && step < 10) process.stdout.write(`  ${step * 10}%\r`);
    last = { phase, step: phase === last.phase ? Math.max(step, last.step) : step };
  };
}

async function put(url, file, kind) {
  const size = fs.statSync(file).size;
  if (size > MAX_BYTES) throw new Error(`El ${kind.toUpperCase()} pesa ${(size / 1048576).toFixed(1)} MB y Versio acepta hasta 25 MB`);
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': kind === 'gif' ? 'image/gif' : 'video/mp4', 'x-upsert': 'true' }, body: fs.readFileSync(file) });
  if (!res.ok) throw new Error(`La subida del ${kind.toUpperCase()} falló (${res.status}): ${(await res.text()).slice(0, 200)}`);
}

try {
  if (!fs.existsSync(path.join(jobDir(slug), 'index.tsx'))) {
    throw new Error(`No existe ${path.relative(ROOT, jobDir(slug))}: primero \`pnpm video ${ticket}\` y que Claude arme los videos.`);
  }
  const files = await render(slug, consoleReport());
  console.log(`✓ Render listo (${mins()}): ${path.relative(ROOT, files.gif)} y ${path.relative(ROOT, files.video)}${files.tutorial ? '' : ' (sin tutorial: se usa el clip como MP4)'}`);
  if (args.includes('--no-upload')) process.exit(0);

  const task = fs.existsSync(taskFile) ? JSON.parse(fs.readFileSync(taskFile, 'utf8')) : null;
  const where = task ?? await versioTool('find_issue', { issue: ticket });
  const ref = { app: where.app, version: where.version, issue: task?.ticket ?? where.issue?.ticket ?? ticket };
  console.log(`→ Subiendo a Versio (${ref.app} ${ref.version}, ${ref.issue})…`);
  const up = await versioTool('prepare_video_upload', ref);
  await put(up.gif.upload_url, files.gif, 'gif');
  await put(up.video.upload_url, files.video, 'mp4');
  const done = await versioTool('attach_video', { ...ref, gif: up.gif.path, video: up.video.path });
  console.log(`✓ ${ref.issue} en la novedad (${mins()}):\n  GIF:   ${done.attached.gif}\n  Video: ${done.attached.video}`);
  if (!args.includes('--keep')) {
    [jobDir(slug), jobDir(tutorialOf(slug))].forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
    console.log('  Se borraron las carpetas temporales de jobs/ (usa --keep para conservarlas).');
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
