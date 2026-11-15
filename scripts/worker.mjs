#!/usr/bin/env node
// Worker de Versio: toma de la cola los videos pedidos desde un issue ("Generar con Claude"),
// le encarga cada uno a Claude Code con el skill `video` (el mismo flujo y calidad que pedirlo
// a mano) y devuelve a Versio dos piezas, que entran solas a la novedad:
//   - GIF  (vista previa): del clip corto `<slug>`, sin voz.
//   - MP4  ("Ver video explicativo"): el tutorial narrado `<slug>-tutorial`, con voz y música
//          (references/tutorial-narrado.md; modelo: videos/modo-delivery-jobs).
//
//   node scripts/worker.mjs            queda esperando trabajos (Ctrl+C para parar)
//   node scripts/worker.mjs --once     atiende lo que haya en cola y termina
//   node scripts/worker.mjs --dry-run  muestra el encargo del siguiente trabajo sin tomarlo ni llamar a Claude
//
// Necesita en .env: MOTION_WORKER_SECRET (el mismo que `supabase secrets set MOTION_WORKER_SECRET=…`)
// y el comando `claude` con sesión iniciada. CLAUDE_MODEL elige el modelo (opcional).
// MOTION_WORKER_ID le pone nombre al worker (por defecto, el del equipo): con él manda su latido
// a Versio cada minuto, así Versio y el MCP saben que hay un worker encendido y qué genera.
// Al pararlo con Ctrl+C, lo que estaba generando vuelve a la cola para que lo tome otro.
// Si cancelan el video en Versio (botón "Cancelar" o cancel_videos del MCP), el worker se entera en
// unos segundos (acción `check`), corta a Claude y al render con sus subprocesos, borra lo armado y
// pasa al siguiente de la cola.
// La voz usa ELEVENLABS_API_KEY (de ./.env, como scripts/narrate.mjs). Reactive se lee de la copia que
// descarga `pnpm doctor` en .cache/platforms/webtrack (el worker la actualiza al arrancar).
// Nunca imprime el secreto.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';
import {
  ROOT, baseUrl, MAX_BYTES, PLATFORM, REACTIVE, envValue, framesDone, slugOf, tutorialOf, brief,
  render, jobDir, useRunner, RANGES, LIMIT_RE, claudeFraction, askClaude as askClaudeWith, CLAUDE_ARGS
} from './lib/pipeline.mjs';

/** Claude cancelable: corre en su propio grupo de procesos (spawnJob) y se corta entero. */
const askClaude = (prompt, logFile) => askClaudeWith(prompt, logFile, { spawnChild: spawnJob, kill: killTree });

const args = process.argv.slice(2);
const once = args.includes('--once');
const dryRun = args.includes('--dry-run');
const POLL_MS = 10_000;
const HEARTBEAT_MS = 60_000;


const secret = envValue('MOTION_WORKER_SECRET');
if (!secret) {
  console.error('Falta MOTION_WORKER_SECRET en el .env de webtrack-motion.');
  process.exit(1);
}

const workerId = (envValue('MOTION_WORKER_ID') || os.hostname().replace(/\.local$/, '')).replace(/[^\w.@-]+/g, '-').slice(0, 64);

async function call(body) {
  const res = await fetch(`${baseUrl}/motion-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': secret, 'X-Worker-Id': workerId },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`motion-jobs ${res.status}: ${data.error ?? 'sin detalle'}`);
    if (data.canceled) cancelCurrent('versio');
    throw err;
  }
  return data;
}

// ---------- Cancelar ----------
// El trabajo en curso y los procesos que lanzó (Claude, render.sh, gif.sh, ffmpeg). Cada uno corre en
// su propio grupo de procesos (detached) para poder cortarlo con todo lo que abrió (Chromium, ffmpeg…).
let current = null; // { canceled: null | 'versio' | 'stop', children: Set<ChildProcess> }

function killTree(child, signal) {
  try { process.kill(-child.pid, signal); } catch { try { child.kill(signal); } catch { /* ya terminó */ } }
}

/** Corta el trabajo en curso: 'versio' = lo cancelaron en Versio; 'stop' = Ctrl+C del worker. */
function cancelCurrent(reason) {
  if (!current || current.canceled) return;
  current.canceled = reason;
  for (const child of current.children) {
    killTree(child, 'SIGTERM');
    setTimeout(() => killTree(child, 'SIGKILL'), 5000).unref();
  }
}

/** Lanza un proceso del trabajo en curso (cortable con cancelCurrent). */
function spawnJob(cmd, cmdArgs) {
  if (current?.canceled) throw new Error('Cancelado');
  const child = spawn(cmd, cmdArgs, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  const owner = current;
  owner?.children.add(child);
  child.on('close', () => owner?.children.delete(child));
  return child;
}

/** Entre pasos: si lo cancelaron, no sigue. */
const checkCanceled = () => { if (current?.canceled) throw new Error('Cancelado'); };

/** Corre un comando sin bloquear el proceso (el latido y el avance siguen) y pasando la salida a onData. */
function runAsync(cmd, cmdArgs, onData) {
  return new Promise((resolve, reject) => {
    let child;
    try { child = spawnJob(cmd, cmdArgs); } catch (e) { return reject(e); }
    let tail = '';
    const onChunk = (d) => {
      const text = d.toString();
      tail = (tail + text).slice(-4000);
      onData?.(text);
    };
    child.stdout.on('data', onChunk);
    child.stderr.on('data', onChunk);
    child.on('error', (e) => reject(new Error(`${cmd}: ${e.message}`)));
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} falló: ${tail.trim().split('\n').slice(-4).join(' | ')}`))));
  });
}

// El render, el GIF y la voz (lib/pipeline.mjs) corren con runAsync: así se pueden cancelar.
useRunner(runAsync);

// ---------- Avance (barra de progreso en Versio) ----------
// Avance global 0-100 por fases: Claude 0-70, clip 70-78, GIF 78-81, tutorial 81-95, voz 95-97, subida 97-100.
const REPORT_EVERY_MS = 15_000;

/** Reporta a Versio sin saturar: al cambiar de fase o cada 15 s si avanzó. Nunca retrocede. */
function progressReporter(job) {
  let last = { phase: null, progress: -1, at: 0 };
  return (phase, fraction) => {
    const [from, to] = RANGES[phase];
    const progress = Math.round(from + (to - from) * Math.min(1, Math.max(0, fraction)));
    const now = Date.now();
    const changed = phase !== last.phase;
    if (!changed && (progress <= last.progress || now - last.at < REPORT_EVERY_MS)) return;
    last = { phase, progress: Math.max(progress, last.progress), at: now };
    call({ action: 'progress', id: job.id, phase, progress: last.progress })
      .then((r) => { if (r?.canceled) cancelCurrent('versio'); })
      .catch(() => {});
  };
}



// ---------- Render, subida y cierre ----------
async function upload(job, file, kind) {
  const size = fs.statSync(file).size;
  if (size > MAX_BYTES) throw new Error(`El ${kind.toUpperCase()} pesa ${(size / 1048576).toFixed(1)} MB y Versio acepta hasta 25 MB`);
  const { uploadUrl, path: remote } = await call({ action: 'upload-url', id: job.id, kind });
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': kind === 'gif' ? 'image/gif' : 'video/mp4', 'x-upsert': 'true' },
    body: fs.readFileSync(file)
  });
  if (!res.ok) throw new Error(`La subida del ${kind.toUpperCase()} falló (${res.status})`);
  return remote;
}

// ---------- Límite de uso de Claude ----------
// "You've hit your 5-hour limit · resets 7:50pm (America/Guatemala)": no es culpa del video. Si se
// marcara fallido, el worker vaciaría la cola en minutos (cada trabajo falla al instante). El
// trabajo vuelve a la cola y el worker espera a que se restablezca el límite.
const DEFAULT_LIMIT_WAIT_MS = 15 * 60 * 1000;

/** Milisegundos hasta la hora de "resets 7:50pm" (hora local del equipo), con 2 min de margen. */
function untilReset(message) {
  const m = message.match(/resets\s+(\d{1,2})(?::(\d{2}))?\s*([ap]m)?/i);
  if (!m) return DEFAULT_LIMIT_WAIT_MS;
  let hour = Number(m[1]) % 12;
  if ((m[3] ?? '').toLowerCase() === 'pm') hour += 12;
  if (!m[3] && Number(m[1]) === 12) hour = 12;
  const at = new Date();
  at.setHours(hour, Number(m[2] ?? 0), 0, 0);
  if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
  return Math.min(at.getTime() - Date.now(), 6 * 60 * 60 * 1000) + 2 * 60 * 1000;
}


async function handle(job) {
  const slug = slugOf(job);
  const dirs = [jobDir(slug), jobDir(tutorialOf(slug))];
  const clean = () => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  clean();
  const label = `${job.ticket ?? job.id} → ${slug}`;
  const logDir = path.join(ROOT, 'out', 'jobs');
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `${slug}.log`);
  const started = Date.now();
  const mins = () => `${Math.round((Date.now() - started) / 60000)} min`;
  current = { canceled: null, children: new Set() };
  // ¿Lo cancelaron en Versio? Pregunta cada 5 s (además, cada reporte de avance lo dice).
  const watch = setInterval(() => {
    call({ action: 'check', id: job.id }).then((r) => { if (r?.canceled) cancelCurrent('versio'); }).catch(() => {});
  }, 5000);
  try {
    if (job.format !== 'claude') throw new Error(`Formato "${job.format}" ya no se genera: pide "Generar con Claude"`);
    console.log(`→ ${label}: Claude está armando el clip y el tutorial narrado (registro en out/jobs/${slug}.log)…`);
    const progress = progressReporter(job);
    progress('claude', 0);
    const claudeTimer = setInterval(() => progress('claude', claudeFraction(slug, started)), 15_000);
    let report;
    try {
      report = await askClaude(brief(job, slug), logFile);
    } finally {
      clearInterval(claudeTimer);
    }
    checkCanceled();
    console.log(`  Claude terminó (${mins()}). Renderizando…`);
    const files = await render(slug, progress);
    checkCanceled();
    progress('upload', 0);
    const video = await upload(job, files.video, 'mp4');
    progress('upload', 0.6);
    const gif = await upload(job, files.gif, 'gif');
    const done = await call({ action: 'complete', id: job.id, video, gif });
    clean();
    console.log(`✓ ${label} (${mins()}): ${done.added ? 'agregado a la novedad' : 'listo (la versión no es borrador: no se agregó)'}`);
    if (report) console.log(`  ${String(report).split('\n').slice(0, 8).join('\n  ')}`);
  } catch (e) {
    // Parando con Ctrl+C: stop() cortó los procesos y el trabajo vuelve a la cola, no falla.
    if (stopping) return;
    if (current?.canceled === 'versio') {
      clean();
      console.log(`⊘ ${label}: cancelado en Versio (${mins()}). Se cortó y se borró lo armado.`);
      return;
    }
    if (LIMIT_RE.test(e.message)) {
      const wait = untilReset(e.message);
      console.error(`⏸ ${label}: ${e.message}`);
      console.error(`  Vuelve a la cola. El worker espera ${Math.round(wait / 60000)} min a que se restablezca el límite.`);
      await call({ action: 'release', id: job.id }).catch(() => {});
      return { pauseMs: wait };
    }
    console.error(`✗ ${label}: ${e.message}`);
    const left = dirs.filter((d) => fs.existsSync(d)).map((d) => path.relative(ROOT, d));
    if (left.length) console.error(`  El código quedó en ${left.join(' y ')} (ignorado por git) para revisarlo; el próximo encargo lo reemplaza.`);
    await call({ action: 'fail', id: job.id, error: e.message }).catch(() => {});
  } finally {
    clearInterval(watch);
    current = null;
  }
}

if (dryRun) {
  // No toma el trabajo: muestra cómo quedaría el encargo con datos de ejemplo.
  const sample = { id: '00000000-prueba', ticket: 'WD-0000', format: 'claude', payload: { ticket: 'WD-0000', prs: [{ repo: 'reactive', number: 1, url: 'https://github.com/webtrackdev/reactive/pull/1' }], title: 'Ejemplo', text: 'Texto de ejemplo.', module: 'Jobs', kind: 'feature', icon: null, highlight: false, image: null } };
  console.log(brief(sample, slugOf(sample)));
  console.log('\nclaude', ['-p', '<encargo>', ...CLAUDE_ARGS].join(' '));
  process.exit(0);
}

// Pone al día la copia de Reactive (y revisa herramientas y claves) antes de tomar trabajos.
const doctor = spawnSync(process.execPath, [path.join(ROOT, 'scripts/doctor.mjs'), '--quiet'], { cwd: ROOT, stdio: 'inherit' });
if (doctor.status !== 0) console.warn('⚠ Falta algo para generar videos: corre `pnpm doctor` para ver qué.');

console.log(`Worker de Versio "${workerId}" activo (${baseUrl}). ${once ? 'Atiende la cola y termina.' : 'Ctrl+C para parar.'}`);

// Latido: mientras Claude genera (unos 10 min) el worker no pregunta por trabajo; sin esto
// parecería apagado. (El render bloquea el proceso unos minutos: Versio le da margen.)
const heartbeat = setInterval(() => { call({ action: 'heartbeat' }).catch(() => {}); }, HEARTBEAT_MS);
heartbeat.unref();

// Ctrl+C: avisa a Versio, que devuelve a la cola lo que se estaba generando.
let stopping = false;
async function stop(signal) {
  if (stopping) process.exit(1); // segundo Ctrl+C: sale ya
  stopping = true;
  clearInterval(heartbeat);
  // Los procesos van en su propio grupo: Ctrl+C no les llega solo.
  cancelCurrent('stop');
  console.log(`\n${signal}: avisando a Versio…`);
  try {
    const { requeued } = await call({ action: 'stop' });
    if (requeued) console.log('  Lo que se estaba generando volvió a la cola.');
  } catch (e) {
    console.error(`  No se pudo avisar a Versio: ${e.message}`);
  }
  process.exit(0);
}
// Al salir (incluido el segundo Ctrl+C) no deja procesos sueltos.
process.on('exit', () => { for (const child of current?.children ?? []) killTree(child, 'SIGKILL'); });
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
for (;;) {
  let job = null;
  try {
    ({ job } = await call({ action: 'next' }));
  } catch (e) {
    console.error(e.message);
    if (once) process.exit(1);
  }
  if (job) {
    const result = await handle(job);
    if (result?.pauseMs) {
      if (once) break;
      // Esperando el límite: el latido sigue (el worker está encendido, solo en pausa).
      await new Promise((r) => setTimeout(r, result.pauseMs));
    }
    continue;
  }
  if (once) break;
  await new Promise((r) => setTimeout(r, POLL_MS));
}
if (once) await call({ action: 'stop' }).catch(() => {});
