#!/usr/bin/env node
// Worker de Versio: toma de la cola los videos pedidos desde un issue ("Generar con Claude"),
// le encarga cada uno a Claude Code con el skill `video` (el mismo flujo y calidad que pedirlo
// a mano), renderiza el MP4 y su GIF y los devuelve a Versio, que los pone solos en la novedad.
//
//   node scripts/worker.mjs            queda esperando trabajos (Ctrl+C para parar)
//   node scripts/worker.mjs --once     atiende lo que haya en cola y termina
//   node scripts/worker.mjs --dry-run  muestra el encargo del siguiente trabajo sin tomarlo ni llamar a Claude
//
// Necesita en .env: MOTION_WORKER_SECRET (el mismo que `supabase secrets set MOTION_WORKER_SECRET=…`)
// y el comando `claude` con sesión iniciada. CLAUDE_MODEL elige el modelo (opcional).
// Nunca imprime el secreto.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'versio.config.json'), 'utf8'));
const args = process.argv.slice(2);
const once = args.includes('--once');
const dryRun = args.includes('--dry-run');
const baseUrl = (process.env.VERSIO_BASE_URL || cfg.baseUrl).replace(/\/$/, '');
const POLL_MS = 10_000;
const CLAUDE_TIMEOUT_MS = 60 * 60 * 1000; // la función considera abandonado un trabajo a los 90 min
const MAX_BYTES = 24 * 1024 * 1024; // Versio rehospeda hasta 25 MB
const PLATFORM = cfg.platform || 'webtrack';
const REACTIVE = path.resolve(ROOT, '..', 'reactive');

function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`));
    if (m) return m[1].replace(/^['"]|['"]$/g, '').trim();
  }
  return '';
}

const secret = envValue('MOTION_WORKER_SECRET');
if (!secret) {
  console.error('Falta MOTION_WORKER_SECRET en el .env de webtrack-motion.');
  process.exit(1);
}

async function call(body) {
  const res = await fetch(`${baseUrl}/motion-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Worker-Secret': secret },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`motion-jobs ${res.status}: ${data.error ?? 'sin detalle'}`);
  return data;
}

const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} falló: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-4).join(' | ')}`);
};

// ---------- Encargo para Claude ----------
const slugOf = (job) => `versio-${(job.ticket || job.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
const pascalOf = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

function brief(job, slug) {
  const p = job.payload ?? {};
  const prs = (p.prs ?? []).map((pr) => `${pr.repo}#${pr.number} (${pr.url})`);
  const badge = p.highlight || p.kind === 'feature' ? 'NUEVO' : p.kind === 'fix' ? 'CORRECCIÓN' : 'MEJORA';
  return `Construye UN video de funcionalidad (para MP4 y GIF) de una novedad que pidió Versio.
Proyecto: ${ROOT} (Remotion). Plataforma: ${PLATFORM}. Respuestas y comentarios en español, código en inglés.

**Novedad (tal como la verá el cliente)**
- Tarea: ${p.ticket ?? job.ticket ?? 'sin tarea'}
- Título: ${p.title ?? ''}
- Texto: ${p.text || '(sin texto)'}
- Módulo: ${p.module ?? '(sin módulo)'} · Tipo: ${p.kind ?? 'sin tipo'} · Badge sugerido: ${badge}${p.icon ? ` · Ícono en Versio: ${p.icon}` : ''}
- PRs: ${prs.length ? prs.join(', ') : 'ninguno (dedúcelo de la pantalla real y dilo en el reporte)'}
${p.image ? `- Imagen o GIF que ya trae la novedad: ${p.image}` : ''}

**Lee primero**, en este orden: \`CLAUDE.md\`, \`.claude/skills/video/SKILL.md\` y de ahí
\`references/calidad-diseno.md\`, \`references/fidelidad-visual.md\` y \`references/catalogo-piezas.md\`.
Sigue el "Flujo rápido" del skill: entiende el PR con \`scripts/pr.sh info|diff|i18n <N> <repo>\`,
lee la pantalla real en ${REACTIVE} (solo lectura) y elige el video modelo más parecido.

**Slug fijo: \`${slug}\`** (componente \`${pascalOf(slug)}\`). El video es TEMPORAL: no se guarda en el repo.
Empieza con \`node scripts/new-video.mjs ${PLATFORM} ${slug} --name ${pascalOf(slug)} --job …\` (opciones del skill).
Eso crea \`src/platforms/${PLATFORM}/jobs/${slug}/\` con su propio \`index.tsx\` (composición) y sin registrarlo en
\`Root.tsx\`. Todo tu trabajo va SOLO en esa carpeta; el worker la borra después de subir el video.
Si reutilizas piezas de un video existente, impórtalas con \`../../videos/<video>/…\` o cópialas a tu carpeta.

**Reglas inamovibles**
- Nunca escribas en ${REACTIVE} ni en ningún otro repo; nada de git (fetch, checkout, commit).
- Fidelidad visual a Reactive: mismos íconos, estructura, clases y textos del i18n. Datos ficticios.
- No toques \`src/core\`, \`Root.tsx\`, \`src/platforms/${PLATFORM}/videos/\` ni el skill: solo tu carpeta de \`jobs/\`.
- NO renderices MP4 ni GIF (lo hace el worker al terminar). Solo stills de revisión con
  \`./still.sh ${PLATFORM} ${slug} <frame>\`, y pasa la lista de verificación de calidad-diseno.md.
- Antes de terminar, \`pnpm typecheck\` no debe dar errores en tu video.

**Reporte final** (breve): slug, DURATION, título y badge, qué muestra (3 líneas), qué se simplificó o dedujo.`;
}

// Claude solo puede editar dentro de webtrack-motion (acceptEdits no aprueba rutas fuera),
// leer Reactive, y correr los scripts del skill. Sin git.
const CLAUDE_ARGS = [
  '--permission-mode', 'acceptEdits',
  '--output-format', 'json',
  '--allowedTools',
  'Read', 'Glob', 'Grep', 'Edit', 'Write',
  `Read(/${REACTIVE}/**)`,
  'Bash(node scripts/new-video.mjs:*)', 'Bash(./still.sh:*)', 'Bash(scripts/pr.sh:*)',
  'Bash(ffmpeg:*)', 'Bash(ls:*)', 'Bash(pnpm typecheck)', 'Bash(npx tsc:*)',
  '--disallowedTools', 'Bash(git:*)', 'Bash(rm:*)', 'Bash(./render.sh:*)', 'Bash(./gif.sh:*)'
];

function askClaude(prompt, logFile) {
  const model = envValue('CLAUDE_MODEL');
  const cmdArgs = ['-p', prompt, ...CLAUDE_ARGS, ...(model ? ['--model', model] : [])];
  return new Promise((resolve, reject) => {
    const child = spawn('claude', cmdArgs, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = fs.createWriteStream(logFile);
    let stdout = '';
    child.stdout.on('data', (d) => { stdout += d; out.write(d); });
    child.stderr.on('data', (d) => out.write(d));
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Claude tardó más de 60 min')); }, CLAUDE_TIMEOUT_MS);
    child.on('error', (e) => { clearTimeout(timer); reject(new Error(`No se pudo ejecutar claude: ${e.message}`)); });
    child.on('close', (code) => {
      clearTimeout(timer);
      out.end();
      let result = null;
      try { result = JSON.parse(stdout); } catch { /* salida no JSON */ }
      if (code !== 0 || result?.is_error) return reject(new Error(`Claude terminó con error${result?.result ? `: ${String(result.result).slice(0, 300)}` : ` (código ${code})`}`));
      resolve(result?.result ?? '');
    });
  });
}

// ---------- Render, subida y cierre ----------
function render(slug) {
  run('./render.sh', [PLATFORM, slug]);
  run('./gif.sh', [PLATFORM, slug]);
  let gif = path.join(ROOT, 'out', PLATFORM, `${slug}.gif`);
  if (fs.statSync(gif).size > MAX_BYTES) {
    // Demasiado pesado para Versio: más angosto y con menos cuadros.
    run('./gif.sh', [PLATFORM, slug, '720', '10']);
  }
  return { video: path.join(ROOT, 'out', PLATFORM, `${slug}.mp4`), gif };
}

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

// Carpeta temporal del video: se crea en cada encargo y se borra al subirlo (no queda React en el repo).
const jobDir = (slug) => path.join(ROOT, 'src/platforms', PLATFORM, 'jobs', slug);

async function handle(job) {
  const slug = slugOf(job);
  fs.rmSync(jobDir(slug), { recursive: true, force: true });
  const label = `${job.ticket ?? job.id} → ${slug}`;
  const logDir = path.join(ROOT, 'out', 'jobs');
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `${slug}.log`);
  const started = Date.now();
  const mins = () => `${Math.round((Date.now() - started) / 60000)} min`;
  try {
    if (job.format !== 'claude') throw new Error(`Formato "${job.format}" ya no se genera: pide "Generar con Claude"`);
    console.log(`→ ${label}: Claude está armando el video (registro en out/jobs/${slug}.log)…`);
    const report = await askClaude(brief(job, slug), logFile);
    console.log(`  Claude terminó (${mins()}). Renderizando…`);
    const files = render(slug);
    const video = await upload(job, files.video, 'mp4');
    const gif = await upload(job, files.gif, 'gif');
    const done = await call({ action: 'complete', id: job.id, video, gif });
    fs.rmSync(jobDir(slug), { recursive: true, force: true });
    console.log(`✓ ${label} (${mins()}): ${done.added ? 'agregado a la novedad' : 'listo (la versión no es borrador: no se agregó)'}`);
    if (report) console.log(`  ${String(report).split('\n').slice(0, 8).join('\n  ')}`);
  } catch (e) {
    console.error(`✗ ${label}: ${e.message}`);
    if (fs.existsSync(jobDir(slug))) console.error(`  El código quedó en ${path.relative(ROOT, jobDir(slug))} (ignorado por git) para revisarlo; el próximo encargo lo reemplaza.`);
    await call({ action: 'fail', id: job.id, error: e.message }).catch(() => {});
  }
}

if (dryRun) {
  // No toma el trabajo: muestra cómo quedaría el encargo con datos de ejemplo.
  const sample = { id: '00000000-prueba', ticket: 'WD-0000', format: 'claude', payload: { ticket: 'WD-0000', prs: [{ repo: 'reactive', number: 1, url: 'https://github.com/webtrackdev/reactive/pull/1' }], title: 'Ejemplo', text: 'Texto de ejemplo.', module: 'Jobs', kind: 'feature', icon: null, highlight: false, image: null } };
  console.log(brief(sample, slugOf(sample)));
  console.log('\nclaude', ['-p', '<encargo>', ...CLAUDE_ARGS].join(' '));
  process.exit(0);
}

console.log(`Worker de Versio activo (${baseUrl}). ${once ? 'Atiende la cola y termina.' : 'Ctrl+C para parar.'}`);
for (;;) {
  let job = null;
  try {
    ({ job } = await call({ action: 'next' }));
  } catch (e) {
    console.error(e.message);
    if (once) process.exit(1);
  }
  if (job) {
    await handle(job);
    continue;
  }
  if (once) break;
  await new Promise((r) => setTimeout(r, POLL_MS));
}
