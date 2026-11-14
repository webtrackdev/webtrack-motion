// Lógica común para generar el video de un issue de Versio: la usan el worker (scripts/worker.mjs, cola de
// Versio) y el flujo de cada dev (scripts/video.mjs y scripts/publish-video.mjs). Mismo encargo para Claude,
// mismos slugs, mismo render, GIF, voz y compresión: el resultado es igual venga de donde venga.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'versio.config.json'), 'utf8'));
export const baseUrl = (process.env.VERSIO_BASE_URL || cfg.baseUrl).replace(/\/$/, '');
export const MAX_BYTES = 24 * 1024 * 1024; // Versio rehospeda hasta 25 MB
export const PLATFORM = cfg.platform || 'webtrack';
const platformsCfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'platforms.json'), 'utf8'));
/** Copia de Reactive que descarga `pnpm doctor` (solo lectura). */
export const REACTIVE = path.resolve(ROOT, platformsCfg[PLATFORM]?.source?.repo ?? '.cache/platforms/webtrack');

/** Corre un comando pasando la salida a onData; rechaza con las últimas líneas si falla. */
export function runCommand(cmd, cmdArgs, onData) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
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

// El worker usa su propia versión (cancelable): la registra con useRunner.
let runner = runCommand;
export const useRunner = (fn) => { runner = fn; };

/** Un issue de find_issue (MCP de Versio) con la forma de un trabajo de la cola: así brief y slugOf sirven igual. */
export const jobFromIssue = (issue) => ({ id: issue.id, ticket: issue.ticket ?? null, format: 'claude', payload: issue });

export function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return '';
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`));
    if (m) return m[1].replace(/^['"]|['"]$/g, '').trim();
  }
  return '';
}

/** Último "N/M" de la salida de Remotion ("Rendered 120/900"): fracción de cuadros listos. */
export function framesDone(text) {
  const clean = text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
  let fraction = null;
  for (const m of clean.matchAll(/(\d+)\s*\/\s*(\d+)/g)) {
    const done = Number(m[1]);
    const total = Number(m[2]);
    if (total > 0 && done <= total) fraction = done / total;
  }
  return fraction;
}

// ---------- Encargo para Claude ----------
export const slugOf = (job) => `versio-${(job.ticket || job.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
export const tutorialOf = (slug) => `${slug}-tutorial`;
export const pascalOf = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

export function brief(job, slug) {
  const p = job.payload ?? {};
  const tut = tutorialOf(slug);
  const prs = (p.prs ?? []).map((pr) => `${pr.repo}#${pr.number} (${pr.url})`);
  const badge = p.highlight || p.kind === 'feature' ? 'NUEVO' : p.kind === 'fix' ? 'CORRECCIÓN' : 'MEJORA';
  return `Construye DOS videos de una novedad que pidió Versio: un clip corto (para el GIF) y un tutorial narrado (el MP4).
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

**Son DOS videos, ambos TEMPORALES** (no se guardan en el repo; se borran al subirlos):

1. **Clip corto \`${slug}\`** (componente \`${pascalOf(slug)}\`), sin voz, 10 a 20 s: de él sale el GIF de vista previa.
   Es el video de funcionalidad de siempre (Flujo rápido del skill).
   Empieza con \`node scripts/new-video.mjs ${PLATFORM} ${slug} --name ${pascalOf(slug)} --job …\` (opciones del skill).
2. **Tutorial narrado \`${tut}\`** (componente \`${pascalOf(tut)}\`), con voz: es el MP4 "Ver video explicativo".
   Sigue \`.claude/skills/video/references/tutorial-narrado.md\` y toma como modelo
   \`src/platforms/${PLATFORM}/videos/modo-delivery-jobs/\` (y su guion \`guion.md\` en esa carpeta):
   qué es, pasos con la pantalla real, casos o detalles y resumen; la voz manda (timeline.json).
   Duración según la novedad: funcionalidad 2 a 4 min, mejora 1 a 2 min, corrección 40 a 70 s. No rellenes.
   Empieza con \`node scripts/new-video.mjs ${PLATFORM} ${tut} --name ${pascalOf(tut)} --job …\` y reemplaza el contenido.
   Voz: \`narracion.md\` → \`node scripts/narrate.mjs check\` → \`synthesize\` → \`node scripts/voice-timeline.mjs … --sections=…\`
   → \`synthesize\` otra vez (caché, sin costo). Menos de 3.500 caracteres de guion (nunca más de 5.000).
   Reutiliza las pantallas del clip: impórtalas con \`../${slug}/…\`.

Cada uno queda en \`src/platforms/${PLATFORM}/jobs/<slug>/\` con su propio \`index.tsx\` y sin registrarse en \`Root.tsx\`.
Todo tu trabajo va SOLO en esas dos carpetas. Piezas de videos existentes: impórtalas con \`../../videos/<video>/…\` o cópialas.

**Reglas inamovibles**
- Nunca escribas en ${REACTIVE} ni en ningún otro repo; nada de git (fetch, checkout, commit).
- Fidelidad visual a Reactive: mismos íconos, estructura, clases y textos del i18n. Datos ficticios.
- No toques \`src/core\`, \`Root.tsx\`, \`src/platforms/${PLATFORM}/videos/\` ni el skill: solo tus dos carpetas de \`jobs/\`.
- NO renderices MP4 ni GIF ni mezcles el audio (\`narrate.mjs mux\`): se hace al final con \`pnpm publish-video\` (o el worker). Solo stills de
  revisión con \`./still.sh ${PLATFORM} <slug> <frame>\`, y pasa la lista de verificación de calidad-diseno.md.
- El tutorial no está listo sin la voz sintetizada (\`out/${PLATFORM}/audio/${tut}/narration.mp3\`) y su \`timeline.json\`.
- Antes de terminar, \`pnpm typecheck\` no debe dar errores en tus videos.

**Reporte final** (breve): los dos slugs con su DURATION, título y badge, secciones del tutorial y caracteres
del guion, qué se simplificó o dedujo.`;
}

export const outFile = (name) => path.join(ROOT, 'out', PLATFORM, name);
export const seconds = (file) => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout);

/** Comprime el tutorial hasta que quepa en Versio: primero baja la calidad a 1080p y al final pasa a 720p. */
export async function fitForVersio(file) {
  if (fs.statSync(file).size <= MAX_BYTES) return file;
  const out = file.replace(/\.mp4$/, '-versio.mp4');
  for (const [crf, scale] of [[24, null], [27, null], [30, null], [30, '1280:-2'], [34, '1280:-2']]) {
    await runner('ffmpeg', ['-v', 'error', '-y', '-i', file, ...(scale ? ['-vf', `scale=${scale}:flags=lanczos`] : []),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
    if (fs.statSync(out).size <= MAX_BYTES) return out;
  }
  return out; // upload() avisa del peso si aun así no cabe
}

/** Render con Remotion reportando los cuadros listos como avance de la fase. */
export const renderWithProgress = (id, phase, report) =>
  runner('./render.sh', [PLATFORM, id], (text) => {
    const f = framesDone(text);
    if (f !== null) report(phase, f);
  });

export async function render(slug, report) {
  // Clip corto -> GIF de vista previa.
  report('render-clip', 0);
  await renderWithProgress(slug, 'render-clip', report);
  report('gif', 0);
  await runner('./gif.sh', [PLATFORM, slug]);
  const gif = outFile(`${slug}.gif`);
  if (fs.statSync(gif).size > MAX_BYTES) {
    // Demasiado pesado para Versio: más angosto y con menos cuadros.
    report('gif', 0.5);
    await runner('./gif.sh', [PLATFORM, slug, '720', '10']);
  }
  // Tutorial narrado -> MP4 "Ver video explicativo" (imagen + voz + música).
  const tut = tutorialOf(slug);
  if (!fs.existsSync(path.join(jobDir(tut), 'index.tsx'))) {
    console.warn(`  ⚠ Claude no armó el tutorial (${tut}): se sube el clip corto como MP4.`);
    return { video: outFile(`${slug}.mp4`), gif, tutorial: false };
  }
  if (!fs.existsSync(path.join(ROOT, 'out', PLATFORM, 'audio', tut, 'narration.mp3'))) {
    throw new Error(`El tutorial ${tut} no tiene la voz sintetizada (narrate.mjs synthesize)`);
  }
  report('render-tutorial', 0);
  await renderWithProgress(tut, 'render-tutorial', report);
  report('mux', 0);
  await runner('node', ['scripts/narrate.mjs', 'mux', PLATFORM, tut]);
  const video = await fitForVersio(outFile(`${tut}-voz.mp4`));
  console.log(`  Tutorial: ${Math.round(seconds(video))} s, ${(fs.statSync(video).size / 1048576).toFixed(1)} MB`);
  return { video, gif, tutorial: true };
}

// Carpeta temporal del video: se crea en cada encargo y se borra al subirlo (no queda React en el repo).
export const jobDir = (slug) => path.join(ROOT, 'src/platforms', PLATFORM, 'jobs', slug);
