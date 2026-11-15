#!/usr/bin/env node
// MCP de webtrack-motion (stdio, JSON-RPC 2.0 por líneas, sin dependencias). Desde cualquier sesión de
// Claude: "genera el GIF y el video de WD-4541". Corre en la máquina del dev y genera ahí mismo; por
// ahora NO sube nada a Versio: entrega las rutas del GIF y del MP4.
//
//   generate_video  arranca la generación en segundo plano (unos 15 min) con scripts/generate.mjs
//   video_status    fase, %, tiempo restante y, al terminar, dónde quedaron el GIF y el MP4
//   cancel_video    corta la generación (Claude, render y voz)
//   list_videos     lo generado o en curso en esta máquina
//
// Instalar para todas las sesiones:  claude mcp add --scope user webtrack-motion -- node <ruta>/scripts/mcp.mjs
// (dentro de este repo ya lo trae .mcp.json). Nada se escribe en stdout salvo el protocolo.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, envValue } from './lib/pipeline.mjs';
import { isAlive, listStatuses, readStatus, slugForTicket } from './lib/tasks.mjs';

const SERVER = { name: 'webtrack-motion', title: 'Webtrack Motion', version: '1.0.0' };
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const TYPICAL_MIN = 15;
const INSTRUCTIONS = `Genera en esta máquina el GIF (vista previa) y el tutorial narrado (MP4) de un issue de Webtrack,
con Claude Code y Remotion (proyecto webtrack-motion). Tarda unos 15 min: generate_video responde al momento y
video_status da el avance. Por ahora no sube nada a Versio: al terminar entrega las rutas de los archivos.
Si no hay VERSIO_MCP_TOKEN en el .env de webtrack-motion, pide al usuario título y texto del issue (y sus PRs).`;

const PHASES = {
  preparing: 'Preparando',
  claude: 'Claude arma el clip y el tutorial',
  'render-clip': 'Renderizando el clip',
  gif: 'Armando el GIF',
  'render-tutorial': 'Renderizando el tutorial narrado',
  mux: 'Mezclando voz y música',
};

const issueProp = { type: 'string', description: 'Tarea de Avanza del issue (p. ej. "WD-4541").' };
const TOOLS = [
  {
    name: 'generate_video',
    title: 'Generar GIF y video de un issue',
    description: 'Arranca en segundo plano la generación del GIF (clip corto) y del tutorial narrado (MP4 con voz y música) de un issue, en esta máquina. Tarda unos 15 min; consulta con video_status. Con solo la tarea, los datos se buscan en Versio (requiere VERSIO_MCP_TOKEN); si no, pasa título, texto y PRs. No sube nada a Versio. Si ya se está generando, no lo repite.',
    inputSchema: {
      type: 'object',
      properties: {
        issue: issueProp,
        title: { type: 'string', description: 'Título de la novedad (lo que verá el cliente). Si se indica, no se consulta Versio.' },
        text: { type: 'string', description: 'Descripción de la novedad (1 a 3 frases).' },
        module: { type: 'string', description: 'Módulo de Reactive (p. ej. "Jobs", "Ruta Logística › Monitor").' },
        kind: { type: 'string', enum: ['feature', 'fix', 'improvement'], description: 'feature = nuevo, fix = corrección, improvement = mejora.' },
        prs: { type: 'array', items: { type: 'string' }, description: 'PRs del issue: "reactive#1790" o su URL de GitHub. De ahí Claude lee qué cambió.' },
        app: { type: 'string', description: 'App de Versio donde buscar (p. ej. "reactive").' },
        version: { type: 'string', description: 'Versión de Versio donde buscar, si la tarea está en varias.' },
      },
      required: ['issue'],
    },
    annotations: { readOnlyHint: false, openWorldHint: true },
  },
  {
    name: 'video_status',
    title: 'Avance de un video',
    description: 'Estado de la generación de un issue: fase, porcentaje, minutos que lleva y que faltan; al terminar, las rutas del GIF y del MP4 (con su peso) y el resumen de Claude; si falló, el error y el registro.',
    inputSchema: { type: 'object', properties: { issue: issueProp }, required: ['issue'] },
    annotations: { readOnlyHint: true },
  },
  {
    name: 'cancel_video',
    title: 'Cancelar un video',
    description: 'Corta la generación en curso de un issue (Claude, render y voz). Lo ya armado se descarta en la próxima generación.',
    inputSchema: { type: 'object', properties: { issue: issueProp }, required: ['issue'] },
    annotations: { readOnlyHint: false, destructiveHint: true },
  },
  {
    name: 'list_videos',
    title: 'Videos de esta máquina',
    description: 'Videos generados o en curso en esta máquina, del más reciente al más viejo, con su estado y sus archivos.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
  },
];

// ---------- Herramientas ----------
const minutesSince = (iso) => (Date.now() - Date.parse(iso)) / 60000;

/** Lo que se le muestra a Claude de un estado: legible y con el estimado de lo que falta. */
function view(s) {
  if (!s) return null;
  const elapsed = minutesSince(s.started_at);
  const base = { issue: s.ticket, title: s.title ?? null, state: s.state, started_at: s.started_at };
  if (s.state === 'running') {
    const pct = s.progress ?? 0;
    const remaining = pct >= 8 ? (elapsed / pct) * (100 - pct) : Math.max(TYPICAL_MIN - elapsed, TYPICAL_MIN * (1 - pct / 100), 1);
    return {
      ...base,
      phase: PHASES[s.phase] ?? s.phase,
      percent: pct,
      elapsed_min: Math.round(elapsed),
      remaining_min: Math.max(1, Math.round(remaining)),
      stalled: minutesSince(s.updated_at ?? s.started_at) > 10,
      log: s.log ?? null,
    };
  }
  if (s.state === 'done') {
    return { ...base, files: s.files, tutorial: s.tutorial, took_min: Math.round((Date.parse(s.finished_at) - Date.parse(s.started_at)) / 60000), summary: s.summary ?? null };
  }
  return { ...base, error: s.error ?? null, log: s.log ?? null, kept: s.kept ?? [] };
}

/** "reactive#1790" o una URL de GitHub → { repo, number, url }. */
function parsePr(raw) {
  const url = raw.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (url) return { repo: url[2], number: Number(url[3]), url: raw };
  const short = raw.match(/^([\w.-]+)#(\d+)$/);
  if (short) return { repo: short[1], number: Number(short[2]), url: `https://github.com/webtrackdev/${short[1]}/pull/${short[2]}` };
  throw new Error(`PR no válido: "${raw}" (usa "reactive#1790" o la URL de GitHub)`);
}

function generateVideo(a) {
  const ticket = String(a.issue).trim().toUpperCase();
  const slug = slugForTicket(ticket);
  const current = readStatus(slug);
  if (current?.state === 'running') return { started: false, message: 'Ya se está generando: no se repite.', status: view(current) };

  const runArgs = [path.join(ROOT, 'scripts/generate.mjs'), ticket];
  if (a.title) {
    const issue = {
      id: ticket, ticket, title: a.title, text: a.text ?? '', module: a.module ?? null, kind: a.kind ?? null,
      icon: null, highlight: false, image: null, prs: (a.prs ?? []).map(parsePr),
    };
    const file = path.join(ROOT, 'out', 'tasks', `${slug}.issue.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(issue, null, 2));
    runArgs.push('--issue', file);
  } else if (!envValue('VERSIO_MCP_TOKEN')) {
    throw new Error('No hay VERSIO_MCP_TOKEN en el .env de webtrack-motion para buscar el issue en Versio: pásame el título, el texto y los PRs del issue.');
  } else {
    if (a.app) runArgs.push('--app', a.app);
    if (a.version) runArgs.push('--version', a.version);
  }

  // Proceso aparte y en su propio grupo: sigue aunque se cierre esta sesión, y cancel_video lo corta entero.
  const out = fs.openSync(path.join(ROOT, 'out', 'tasks', `${slug}.runner.log`), 'w');
  const child = spawn(process.execPath, runArgs, { cwd: ROOT, detached: true, stdio: ['ignore', out, out] });
  child.unref();
  return {
    started: true,
    issue: ticket,
    pid: child.pid,
    message: `Generando el GIF y el tutorial narrado de ${ticket} en esta máquina. Tarda unos ${TYPICAL_MIN} min: consulta con video_status. No se sube nada a Versio.`,
  };
}

function cancelVideo(a) {
  const slug = slugForTicket(a.issue);
  const s = readStatus(slug);
  if (!s || s.state !== 'running') return { canceled: false, message: s ? `No se está generando (estado: ${s.state}).` : 'No hay nada generado ni en curso para ese issue.' };
  try { process.kill(-s.pid, 'SIGTERM'); } catch { try { process.kill(s.pid, 'SIGTERM'); } catch { /* ya terminó */ } }
  setTimeout(() => { if (isAlive(s.pid)) { try { process.kill(-s.pid, 'SIGKILL'); } catch { /* ya terminó */ } } }, 5000).unref();
  return { canceled: true, issue: s.ticket, message: 'Cancelado: se cortó Claude y el render.' };
}

async function callTool(name, a = {}) {
  switch (name) {
    case 'generate_video': {
      if (!a.issue) throw new Error('Falta issue (p. ej. "WD-4541").');
      const r = generateVideo(a);
      if (!r.started) return r;
      await new Promise((res) => setTimeout(res, 1500));
      const s = readStatus(slugForTicket(a.issue));
      if (s?.state === 'failed') throw new Error(s.error);
      return { ...r, status: view(s) };
    }
    case 'video_status': {
      const s = readStatus(slugForTicket(a.issue));
      if (!s) return { issue: String(a.issue).toUpperCase(), state: 'none', message: 'No se ha generado en esta máquina. Usa generate_video.' };
      return view(s);
    }
    case 'cancel_video':
      return cancelVideo(a);
    case 'list_videos':
      return listStatuses().map(view);
    default:
      return null;
  }
}

// ---------- Protocolo ----------
const send = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
const text = (value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }];

async function handle(req) {
  if (!req || req.jsonrpc !== '2.0' || typeof req.method !== 'string') return req?.id !== undefined ? { jsonrpc: '2.0', id: req.id ?? null, error: { code: -32600, message: 'Invalid Request' } } : null;
  if (req.id === undefined) return null; // notificación
  const ok = (result) => ({ jsonrpc: '2.0', id: req.id, result });
  switch (req.method) {
    case 'initialize': {
      const asked = String(req.params?.protocolVersion ?? '');
      return ok({ protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0], capabilities: { tools: {} }, serverInfo: SERVER, instructions: INSTRUCTIONS });
    }
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS });
    case 'tools/call': {
      try {
        const result = await callTool(req.params?.name, req.params?.arguments ?? {});
        if (result === null) return { jsonrpc: '2.0', id: req.id, error: { code: -32602, message: `Herramienta desconocida: ${req.params?.name}` } };
        return ok({ content: text(result) });
      } catch (e) {
        return ok({ content: text(e.message), isError: true });
      }
    }
    default:
      return { jsonrpc: '2.0', id: req.id, error: { code: -32601, message: `Método no soportado: ${req.method}` } };
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); continue; }
    const batch = Array.isArray(msg) ? msg : [msg];
    Promise.all(batch.map(handle)).then((res) => {
      const out = res.filter(Boolean);
      if (out.length) send(Array.isArray(msg) ? out : out[0]);
    });
  }
});
process.stdin.on('end', () => process.exit(0));
