#!/usr/bin/env node
// Genera de punta a punta el GIF y el tutorial narrado (MP4) de un issue, en esta máquina y sin subir
// nada: Claude arma los dos videos con el skill `video` (mismo encargo que el worker), se renderizan,
// se arma el GIF, se mezcla la voz y se comprime. Deja los archivos en out/videos/<tarea>/.
// Lo lanza el MCP de webtrack-motion (generate_video) en segundo plano; también se usa a mano:
//
//   pnpm generate WD-4541                       el issue se busca en Versio (VERSIO_MCP_TOKEN)
//   pnpm generate WD-4541 --issue issue.json    el issue viene en un archivo (sin Versio)
//   pnpm generate WD-4541 --no-publish          solo genera en local (no sube a YouTube)
//
// Al terminar publica el tutorial en el canal de YouTube de Versio y, si la tarea está en un borrador,
// deja en la novedad el GIF de vista previa y el enlace de YouTube (MCP de Versio: prepare_video_upload →
// PUT → publish_youtube). Si no se puede publicar, el video queda igual en out/videos/ y el estado dice por qué.
//
// Estado en out/tasks/<slug>.status.json (lo lee video_status). SIGTERM corta todo lo que lanzó.
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, LIMIT_RE, MAX_BYTES, RANGES, askClaude, brief, cfg, claudeFraction, envValue, jobDir, jobFromIssue, render, slugOf, tutorialOf, withTicketPrs
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

async function put(url, file, type) {
  const size = fs.statSync(file).size;
  if (size > MAX_BYTES) throw new Error(`${path.basename(file)} pesa ${(size / 1048576).toFixed(1)} MB y Versio acepta hasta 25 MB`);
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': type, 'x-upsert': 'true' }, body: fs.readFileSync(file) });
  if (!res.ok) throw new Error(`La subida de ${path.basename(file)} falló (${res.status})`);
}

/** Sube el GIF y el MP4 a Versio y publica el tutorial en YouTube; con borrador, también en la novedad. */
async function publish(issue, gif, mp4) {
  const app = status.versio?.app ?? opt('app') ?? cfg.app;
  // Solo si la tarea está en una versión de Versio se pone en su novedad; si vino de Avanza, solo YouTube.
  const inVersio = status.versio?.version ? { version: status.versio.version, issue: issue.ticket } : {};
  report('upload', 0);
  const up = await versioTool('prepare_video_upload', { app, ...inVersio, ticket: issue.ticket });
  await put(up.gif.upload_url, gif, 'image/gif');
  report('upload', 0.2);
  await put(up.video.upload_url, mp4, 'video/mp4');
  report('upload', 0.6);
  const r = await versioTool('publish_youtube', {
    app, ...inVersio, video_path: up.video.path, gif_path: up.gif.path,
    ...(inVersio.version ? {} : { title: issue.title, description: issue.text || undefined }),
  });
  return { youtube: r.youtube, attached: r.attached, note: r.note ?? null };
}

/** Avance global como el de la barra de Versio; nunca retrocede. */
const report = (phase, fraction) => {
  const [from, to] = RANGES[phase];
  const progress = Math.round(from + (to - from) * Math.min(1, Math.max(0, fraction)));
  if (phase !== status.phase || progress > status.progress) save({ phase, progress: Math.max(progress, phase === status.phase ? status.progress : 0) });
};

try {
  // 1. El issue: el que mandaron, el de Versio o, si no está en ninguna versión, el de Avanza (find_issue).
  let issue;
  if (opt('issue')) {
    issue = JSON.parse(fs.readFileSync(path.resolve(opt('issue')), 'utf8'));
  } else {
    const found = await versioTool('find_issue', { issue: ticketArg, ...(opt('app') ? { app: opt('app') } : {}), ...(opt('version') ? { version: opt('version') } : {}) });
    issue = found.issue;
    save({ source: found.source ?? 'versio', versio: { app: found.app, version: found.version, version_status: found.version_status } });
  }
  issue.ticket = issue.ticket ?? status.ticket;
  // PRs que nombran la tarea en GitHub: Claude ve todo lo que cambió (y si vino de Avanza, son los únicos).
  issue = withTicketPrs(issue);
  save({ title: issue.title ?? null, prs: issue.prs.map((pr) => `${pr.repo}#${pr.number}`) });

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
    files: { gif, mp4, gif_mb: +(fs.statSync(gif).size / 1048576).toFixed(1), mp4_mb: +(fs.statSync(mp4).size / 1048576).toFixed(1) },
    tutorial: files.tutorial,
    summary: summary ? String(summary).slice(0, 2000) : null,
  });

  // 5. YouTube (y la novedad, si está en un borrador de Versio). Un fallo aquí no pierde el video.
  if (args.includes('--no-publish')) save({ publish: { skipped: 'Se pidió --no-publish.' } });
  else if (!envValue('VERSIO_MCP_TOKEN')) save({ publish: { skipped: 'Sin VERSIO_MCP_TOKEN en el .env: no se publicó en YouTube.' } });
  else {
    try {
      save({ publish: await publish(issue, gif, mp4) });
    } catch (e) {
      save({ publish: { error: e.message } });
    }
  }
  save({ state: 'done', phase: null, progress: 100, finished_at: new Date().toISOString() });
  // Como el worker: no queda React en jobs/ por cada video (si falla, sí se conserva para revisarlo).
  [jobDir(slug), jobDir(tutorialOf(slug))].forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  console.log(`✓ ${status.ticket}: ${gif} y ${mp4}${status.publish?.youtube ? ` · YouTube: ${status.publish.youtube.url}` : status.publish?.error ? ` · sin publicar: ${status.publish.error}` : ''}`);
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

