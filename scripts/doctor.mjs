#!/usr/bin/env node
// Deja webtrack-motion listo para generar videos sin clonar nada más: descarga o actualiza los repos
// de las plataformas en .cache/platforms/<id> (solo src, copia ligera y de solo lectura) y revisa
// las herramientas y claves que hacen falta. Nunca imprime una clave.
//
//   pnpm doctor            revisa todo y descarga o actualiza las plataformas
//   pnpm doctor --check    solo revisa (sin red): para scripts y el worker
//   pnpm doctor --fix      además instala el navegador de render si falta
//
// Las plataformas con "git" en platforms.json se descargan solas (necesitas acceso de lectura al repo:
// `gh auth login` o tu llave SSH de GitHub). Las que apuntan a una ruta local se usan tal cual.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const fix = args.includes('--fix');
const quiet = args.includes('--quiet');

const say = (...m) => { if (!quiet) console.log(...m); };
const problems = [];
const ok = (label, detail = '') => say(`  ✓ ${label}${detail ? ` — ${detail}` : ''}`);
const bad = (label, how) => { problems.push(label); say(`  ✗ ${label}\n      → ${how}`); };
const warn = (label, how) => say(`  ! ${label}\n      → ${how}`);

const run = (cmd, cmdArgs, opts = {}) => spawnSync(cmd, cmdArgs, { encoding: 'utf8', cwd: ROOT, ...opts });
const has = (cmd) => run(process.platform === 'win32' ? 'where' : 'which', [cmd]).status === 0;

function envValue(name) {
  if (process.env[name]) return process.env[name].trim();
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return '';
  const m = fs.readFileSync(file, 'utf8').match(new RegExp(`^\\s*${name}\\s*=\\s*(.*?)\\s*$`, 'm'));
  return m ? m[1].replace(/^['"]|['"]$/g, '').trim() : '';
}

// ---------- Plataformas ----------
/** Copia ligera del repo: solo la carpeta src, sin historial. Si ya existe, la pone al día con la rama. */
function syncRepo(id, source) {
  const dir = path.resolve(ROOT, source.repo);
  const branch = source.branch ?? 'main';
  const sub = source.src ?? 'src';
  if (!fs.existsSync(path.join(dir, '.git'))) {
    if (checkOnly) return bad(`${id}: falta la copia de ${source.git}`, 'corre `pnpm doctor` (necesita red y acceso de lectura al repo)');
    say(`  … ${id}: descargando ${source.git} (${branch}, solo ${sub}/)`);
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    const clone = run('git', ['clone', '--depth', '1', '--branch', branch, '--filter=blob:none', '--sparse', source.git, dir], { stdio: quiet ? 'pipe' : 'inherit' });
    if (clone.status !== 0) {
      fs.rmSync(dir, { recursive: true, force: true });
      return bad(`${id}: no se pudo descargar ${source.git}`, 'revisa tu acceso a GitHub (`gh auth login` y luego `gh auth setup-git`, o tu llave SSH)');
    }
    run('git', ['-C', dir, 'sparse-checkout', 'set', sub]);
  } else if (!checkOnly) {
    const fetch = run('git', ['-C', dir, 'fetch', '--depth', '1', 'origin', branch]);
    if (fetch.status === 0) run('git', ['-C', dir, 'reset', '--hard', '--quiet', 'FETCH_HEAD']);
    else warn(`${id}: no se pudo actualizar (se usa la copia que ya tienes)`, 'revisa tu conexión o tu acceso a GitHub');
  }
  if (!fs.existsSync(path.join(dir, sub))) return bad(`${id}: la copia no tiene ${sub}/`, `borra ${path.relative(ROOT, dir)} y corre \`pnpm doctor\``);
  const sha = run('git', ['-C', dir, 'log', '-1', '--format=%h %cr']).stdout.trim();
  ok(`${id}: ${source.git.replace(/^https:\/\/github.com\//, '').replace(/\.git$/, '')}@${branch}`, sha);
}

say('Plataformas');
const platforms = JSON.parse(fs.readFileSync(path.join(ROOT, 'platforms.json'), 'utf8'));
for (const [id, p] of Object.entries(platforms)) {
  if (p.source?.type !== 'repo') continue;
  if (p.source.git) syncRepo(id, p.source);
  else if (fs.existsSync(path.resolve(ROOT, p.source.repo))) ok(`${id}: ${p.source.repo} (ruta local)`);
  else say(`  · ${id}: ${p.source.repo} no existe (plataforma local de otra persona: se omite)`);
}

// ---------- Herramientas ----------
say('\nHerramientas');
const [major] = process.versions.node.split('.').map(Number);
if (major >= 20) ok('Node', process.versions.node);
else bad(`Node ${process.versions.node}`, 'instala Node 20 o más nuevo');

if (fs.existsSync(path.join(ROOT, 'node_modules', 'remotion'))) ok('Dependencias', 'node_modules');
else bad('Faltan las dependencias', 'corre `pnpm install`');

for (const tool of ['ffmpeg', 'ffprobe']) {
  if (has(tool)) ok(tool);
  else bad(`Falta ${tool}`, process.platform === 'darwin' ? '`brew install ffmpeg`' : 'instala ffmpeg (trae ffprobe)');
}

const browser = (() => {
  if (process.env.BROWSER && fs.existsSync(process.env.BROWSER)) return process.env.BROWSER;
  for (const cache of [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright')]) {
    if (!fs.existsSync(cache)) continue;
    for (const d of fs.readdirSync(cache).filter((n) => n.startsWith('chromium_headless_shell-')).sort().reverse()) {
      for (const sub of fs.readdirSync(path.join(cache, d))) {
        const bin = path.join(cache, d, sub, 'chrome-headless-shell');
        if (fs.existsSync(bin)) return bin;
      }
    }
  }
  return null;
})();
if (browser) ok('Navegador de render', 'chrome-headless-shell');
else if (fix && !checkOnly) {
  say('  … instalando chrome-headless-shell');
  const r = run('npx', ['--yes', 'playwright', 'install', 'chromium-headless-shell'], { stdio: 'inherit' });
  if (r.status === 0) ok('Navegador de render', 'instalado');
  else bad('No se pudo instalar el navegador', '`npx playwright install chromium-headless-shell`');
} else bad('Falta el navegador de render', '`pnpm doctor --fix` o `npx playwright install chromium-headless-shell`');

if (has('claude')) ok('Claude Code', run('claude', ['--version']).stdout.trim());
else bad('Falta Claude Code', 'https://docs.claude.com/claude-code — luego `claude` para iniciar sesión');

if (!has('gh')) bad('Falta gh (GitHub CLI)', process.platform === 'darwin' ? '`brew install gh` y luego `gh auth login`' : 'instala gh y corre `gh auth login`');
else if (run('gh', ['auth', 'status']).status === 0) ok('GitHub (gh)', 'sesión iniciada: Claude lee los PRs con scripts/pr.sh');
else bad('gh sin sesión', '`gh auth login`');

// ---------- Claves (.env) ----------
say('\nClaves (.env)');
if (!fs.existsSync(path.join(ROOT, '.env'))) warn('No hay .env', 'copia .env.example como .env y completa las claves');
const audio = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio.config.json'), 'utf8'));
const voiceKey = (audio.provider ?? 'elevenlabs') === 'deepgram' ? 'DEEPGRAM_API_KEY' : 'ELEVENLABS_API_KEY';
if (envValue(voiceKey)) ok(voiceKey, 'voz de los tutoriales');
else bad(`Falta ${voiceKey}`, `agrégala al .env (voz de los tutoriales; ${voiceKey === 'ELEVENLABS_API_KEY' ? 'ElevenLabs › Profile › API keys' : 'Deepgram › API keys'})`);
if (envValue('VERSIO_MCP_TOKEN')) ok('VERSIO_MCP_TOKEN', 'leer la tarea y subir el video (pnpm video / publish-video)');
else bad('Falta VERSIO_MCP_TOKEN', 'agrégalo al .env: Versio › MCP (Claude) › Nuevo token');
if (envValue('VERSIO_API_KEY')) ok('VERSIO_API_KEY', 'solo para pnpm versio');
if (envValue('MOTION_WORKER_SECRET')) ok('MOTION_WORKER_SECRET', 'solo si corres el worker');

say(problems.length ? `\n${problems.length} pendiente(s): resuélvelos y vuelve a correr \`pnpm doctor\`.` : '\nTodo listo para generar videos.');
process.exit(problems.length ? 1 : 0);
