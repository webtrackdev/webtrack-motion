#!/usr/bin/env node
// Genera de punta a punta el GIF y el tutorial narrado (MP4) de un issue, en esta máquina y sin subir
// nada: Claude arma los dos videos con el skill `video` (mismo encargo que el worker), se renderizan,
// se arma el GIF, se mezcla la voz y se comprime. Deja los archivos en out/videos/<tarea>/.
// Lo lanza el MCP de webtrack-motion (generate_video) en segundo plano; también se usa a mano:
//
//   pnpm generate WD-4541                       el issue se busca en Versio (VERSIO_MCP_TOKEN)
//   pnpm generate WD-4541 --issue issue.json    el issue viene en un archivo (sin Versio)
//
// Estado en out/tasks/<slug>.status.json (lo lee video_status). SIGTERM corta todo lo que lanzó.
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, LIMIT_RE, RANGES, askClaude, brief, claudeFraction, jobDir, jobFromIssue, render, slugOf, tutorialOf
} from './lib/pipeline.mjs';
import { versioTool } from './lib/versio.mjs';
import { videosDir, writeStatus } from './lib/tasks.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const ticketArg = args.find((a, i) => !a.startsWith('--') && !/^--(issue|app|version)$/.test(args[i - 1] ?? ''));
if (!ticketArg) {
  console.error('Uso: pnpm generate WD-#### [--issue archivo.json] [--app <slug>] [--version <número>]');
  process.exit(1);
}

const slug = slugOf({ ticket: ticketArg.toUpperCase(), id: ticketArg });
const started = Date.now();
let status = { ticket: ticketArg.toUpperCase(), slug, state: 'running', phase: 'preparing', progress: 0, pid: process.pid, started_at: new Date(started).toISOString() };
const save = (patch) => { status = { ...status, ...patch, updated_at: new Date().toISOString() }; writeStatus(slug, status); };
save({});

// Cancelar (cancel_video manda SIGTERM al grupo): queda registrado y sale sin marcar error.
let canceled = false;
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    canceled = true;
    save({ state: 'canceled', phase: null, finished_at: new Date().toISOString() });
    process.exit(130);
  });
}

/** Avance global como el de la barra de Versio; nunca retrocede. */
const report = (phase, fraction) => {
  const [from, to] = RANGES[phase];
  const progress = Math.round(from + (to - from) * Math.min(1, Math.max(0, fraction)));
  if (phase !== status.phase || progress > status.progress) save({ phase, progress: Math.max(progress, phase === status.phase ? status.progress : 0) });
};

try {
  // 1. El issue: el que mandaron o el de Versio.
  let issue;
  if (opt('issue')) {
    issue = JSON.parse(fs.readFileSync(path.resolve(opt('issue')), 'utf8'));
  } else {
    const found = await versioTool('find_issue', { issue: ticketArg, ...(opt('app') ? { app: opt('app') } : {}), ...(opt('version') ? { version: opt('version') } : {}) });
    issue = found.issue;
    save({ versio: { app: found.app, version: found.version, version_status: found.version_status } });
  }
  issue.ticket = issue.ticket ?? status.ticket;
  save({ title: issue.title ?? null });

  // 2. Claude arma el clip y el tutorial (carpetas temporales de jobs/, empezando de cero).
  [jobDir(slug), jobDir(tutorialOf(slug))].forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  const logDir = path.join(ROOT, 'out', 'jobs');
  fs.mkdirSync(logDir, { recursive: true });
  const log = path.join(logDir, `${slug}.log`);
  save({ log: path.relative(ROOT, log) });
  report('claude', 0);
  const timer = setInterval(() => report('claude', claudeFraction(slug, started)), 15_000);
  let summary;
  try {
    summary = await askClaude(brief(jobFromIssue(issue), slug), log);
  } finally {
    clearInterval(timer);
  }

  // 3. Render, GIF, voz y compresión.
  const files = await render(slug, report);

  // 4. Copia estable para el usuario: out/videos/<tarea>/ (los de out/<plataforma>/ se pisan).
  const dir = videosDir(status.ticket);
  fs.mkdirSync(dir, { recursive: true });
  const gif = path.join(dir, `${status.ticket}.gif`);
  const mp4 = path.join(dir, `${status.ticket}.mp4`);
  fs.copyFileSync(files.gif, gif);
  fs.copyFileSync(files.video, mp4);
  save({
    state: 'done', phase: null, progress: 100, finished_at: new Date().toISOString(),
    files: { gif, mp4, gif_mb: +(fs.statSync(gif).size / 1048576).toFixed(1), mp4_mb: +(fs.statSync(mp4).size / 1048576).toFixed(1) },
    tutorial: files.tutorial,
    summary: summary ? String(summary).slice(0, 2000) : null,
  });
  // Como el worker: no queda React en jobs/ por cada video (si falla, sí se conserva para revisarlo).
  [jobDir(slug), jobDir(tutorialOf(slug))].forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  console.log(`✓ ${status.ticket}: ${gif} y ${mp4}`);
} catch (e) {
  if (canceled) process.exit(130);
  const limit = LIMIT_RE.test(e.message);
  save({
    state: 'failed', phase: null, finished_at: new Date().toISOString(),
    error: limit ? `Claude llegó a su límite de uso: ${e.message}` : e.message,
    kept: [jobDir(slug), jobDir(tutorialOf(slug))].filter((d) => fs.existsSync(d)).map((d) => path.relative(ROOT, d)),
  });
  console.error(`✗ ${status.ticket}: ${e.message}`);
  process.exit(1);
}

