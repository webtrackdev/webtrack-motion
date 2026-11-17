#!/usr/bin/env node
// Paso 1 del video de una tarea, en la máquina de cada dev (sin worker): trae el issue de Versio y
// muestra el encargo para Claude (el mismo que usa el worker). Claude arma el clip y el tutorial
// narrado, y al final `pnpm publish-video <tarea>` renderiza, sube y lo pone en la novedad.
//
//   pnpm video WD-4541                     busca la tarea en Versio (borrador más reciente)
//   pnpm video WD-4541 --version 5.12.00.0911 --app reactive
//   pnpm video WD-4541 --fresh             borra lo armado antes para esa tarea y empieza de cero
//
// Necesita VERSIO_MCP_TOKEN en .env (Versio › MCP (Claude) › Nuevo token).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, brief, jobDir, jobFromIssue, slugOf, tutorialOf, withTicketPrs } from './lib/pipeline.mjs';
import { versioTool } from './lib/versio.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const ticket = args.find((a, i) => !a.startsWith('--') && !/^--(app|version)$/.test(args[i - 1] ?? ''));
if (!ticket) {
  console.error('Uso: pnpm video WD-#### [--version <número>] [--app <slug>] [--fresh]');
  process.exit(1);
}

try {
  const found = await versioTool('find_issue', { issue: ticket, ...(opt('app') ? { app: opt('app') } : {}), ...(opt('version') ? { version: opt('version') } : {}) });
  const job = jobFromIssue(withTicketPrs({ ...found.issue, ticket: found.issue.ticket ?? ticket }));
  const slug = slugOf(job);
  const task = { app: found.app, version: found.version, version_status: found.version_status, source: found.source ?? 'versio', ticket: found.issue.ticket ?? ticket, slug, issue: job.payload, fetched_at: new Date().toISOString() };
  const taskDir = path.join(ROOT, 'out', 'tasks');
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(path.join(taskDir, `${slug}.json`), JSON.stringify(task, null, 2));

  const dirs = [jobDir(slug), jobDir(tutorialOf(slug))];
  if (args.includes('--fresh')) dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  const existing = dirs.filter((d) => fs.existsSync(d)).map((d) => path.relative(ROOT, d));

  console.log(found.version ? `# ${task.ticket} · ${found.app} ${found.version} (${found.version_status})` : `# ${task.ticket} · desde Avanza (no está en ninguna versión de Versio)`);
  if (!found.version) console.log(`\n> ${found.note ?? 'Datos de Avanza.'}`);
  else if (!found.editable) console.log(`\n> ⚠ La versión ${found.version} no es borrador: el video se puede generar, pero publish-video no podrá ponerlo en la novedad hasta que la pasen a borrador (o indica --version de un borrador).`);
  if (found.also_in?.length) console.log(`\n> También está en: ${found.also_in.join(', ')}. Se usa ${found.version}; cambia con --version.`);
  if (found.media?.gif || found.media?.video) console.log('\n> La novedad ya tiene GIF o video generado: al publicar se reemplaza.');
  if (existing.length) console.log(`\n> Ya hay trabajo de antes en ${existing.join(' y ')}: continúa sobre eso o empieza de cero con --fresh.`);
  console.log(`\n${brief(job, slug)}`);
  console.log(`
**Al terminar (flujo local, sin worker)**
1. Muéstrale al usuario 2 o 3 stills del clip y del tutorial y espera su visto bueno.
2. Corre \`pnpm publish-video ${task.ticket}\`: renderiza el clip y el tutorial, arma el GIF, mezcla la voz,
   comprime, sube ambos a Versio y los pone en la novedad (GIF = vista previa, MP4 = "Ver video explicativo").
   Para solo renderizar y revisar los archivos sin subir: \`pnpm publish-video ${task.ticket} --no-upload\`.`);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
