#!/usr/bin/env node
// Lee de Versio las novedades de una versión y arma el plan de videos y GIF que hay que crear.
// Solo lectura y no crea ni renderiza ningún video: deja el plan en out/versio/<app>/<version>/.
//
//   node scripts/versio.mjs versions                    historial de versiones publicadas
//   node scripts/versio.mjs plan [version|current]      plan de videos (por defecto, la versión actual)
//   node scripts/versio.mjs plan 5.1210 --all           incluye también lo que las reglas omiten
//   node scripts/versio.mjs plan --from-file resp.json  usa una respuesta guardada (sin red ni clave)
//   node scripts/versio.mjs plan 5.12.00.0611-rc-1 --hidden   incluye las novedades ocultas (como 'omitir')
//   opciones: --app <slug>  --platform <id>  --drafts  --hidden  --json
//   Borradores y ocultas piden include=drafts,hidden y una clave con el permiso can_read_drafts.
//
// La clave va en VERSIO_API_KEY (entorno o .env, que está en .gitignore). Nunca se imprime.
// VERSIO_BASE_URL reemplaza la URL de versio.config.json (pruebas contra un servidor local).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'versio.config.json'), 'utf8'));

const args = process.argv.slice(2);
const flag = (k) => args.includes(`--${k}`);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').match(/^--(app|platform|from-file)$/));
const [command = 'plan', versionArg = 'current'] = positional;

const app = opt('app', cfg.app);
const platform = opt('platform', cfg.platform);
const wantHidden = flag('hidden');
const include = (drafts) => [drafts && 'drafts', wantHidden && 'hidden'].filter(Boolean).join(',');
const qs = (drafts) => (include(drafts) ? `?include=${include(drafts)}` : '');
const baseUrl = (process.env.VERSIO_BASE_URL || cfg.baseUrl).replace(/\/$/, '');

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

// ---------- Clave (solo VERSIO_API_KEY; el resto del .env no se toca) ----------
function apiKey() {
  if (process.env.VERSIO_API_KEY) return process.env.VERSIO_API_KEY.trim();
  const envFile = path.join(ROOT, '.env');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(/^\s*VERSIO_API_KEY\s*=\s*(.*)\s*$/);
      if (m) return m[1].replace(/^['"]|['"]$/g, '').trim();
    }
  }
  return '';
}

async function get(route) {
  const key = apiKey();
  if (!key) die('Falta VERSIO_API_KEY. Agrégala al .env de webtrack-motion (la clave sale de Versio > API Keys).');
  const res = await fetch(`${baseUrl}${route}`, { headers: { 'X-API-Key': key } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { error: text.slice(0, 200) };
  }
  if (res.status === 403 && /drafts or hidden/i.test(body.error ?? '')) {
    die('Tu clave no puede leer borradores ni ocultas: pide el permiso can_read_drafts para esa clave en Versio.');
  }
  return { status: res.status, body };
}

// ---------- Respuesta de la API (ruta nueva, con respaldo a la antigua) ----------
const enc = encodeURIComponent;

// Respaldo mínimo para releases-api (sin "items"): cada viñeta del documento Tiptap es una novedad.
const nodeText = (n) => (n.type === 'text' ? n.text ?? '' : (n.content ?? []).map(nodeText).join(''));
function itemsFromNotes(doc) {
  const out = [];
  let module = null;
  for (const node of doc?.content ?? []) {
    if (node.type === 'heading') module = node.attrs?.level === 3 ? nodeText(node).trim() || null : null;
    else if (node.type === 'bulletList' || node.type === 'orderedList') {
      for (const li of node.content ?? []) {
        const lines = (li.content ?? []).map((n) => nodeText(n).trim()).filter(Boolean);
        if (!lines[0]) continue;
        const media = [];
        const walk = (ns) => ns.forEach((n) => {
          if ((n.type === 'image' || n.type === 'video') && n.attrs?.src) {
            const src = n.attrs.src;
            media.push({ type: n.type === 'video' || /\.(mp4|webm|mov)/i.test(src) ? 'video' : /\.gif/i.test(src) ? 'gif' : 'image', url: src, alt: n.attrs.alt ?? null });
          }
          if (n.content) walk(n.content);
        });
        walk(li.content ?? []);
        out.push({ id: String(out.length + 1), title: lines[0], text: lines.slice(1).join('\n'), media, module, kind: null, icon: null, highlight: false });
      }
    }
  }
  return out;
}

async function fetchVersion(which) {
  if (which === 'current') {
    const r = await get(`/api/${enc(app)}${qs(flag('drafts'))}`);
    if (r.status === 200 && r.body.version) return { ...r.body.version, fuente: 'api' };
    if (r.status === 200 && r.body.version === null) {
      // Sin versión publicada: se usa la más reciente del historial (archivada).
      const h = await get(`/api/${enc(app)}/versions${qs(flag('drafts'))}`);
      const last = h.status === 200 ? h.body.versions?.[0] : null;
      if (!last) die(`Versio no tiene versiones publicadas de "${app}".`);
      console.error(`Aviso: "${app}" no tiene una versión publicada ahora; se usa la más reciente del historial (${last.version}).`);
      return fetchVersion(last.version);
    }
    // La ruta nueva puede no estar desplegada todavía: respaldo a releases-api.
    const old = await get(`/releases-api?app=${enc(app)}&latest=true`);
    if (old.status === 200 && old.body.latest) {
      const v = old.body.latest;
      return { version: v.version, title: v.title, published_at: v.published_at, current: true, releases: v.releases, items: itemsFromNotes(v.notes), fuente: 'releases-api (sin tipo ni destacadas)' };
    }
    die(`Versio respondió ${r.status}: ${r.body.error ?? 'sin detalle'}`);
  }
  let drafts = flag('drafts');
  let r = await get(`/api/${enc(app)}/${enc(which)}${qs(drafts)}`);
  if (r.status === 404 && !drafts) {
    // Puede ser un borrador: se reintenta con include=drafts (necesita el permiso can_read_drafts).
    r = await get(`/api/${enc(app)}/${enc(which)}${qs(true)}`);
    if (r.status === 200) console.error(`Aviso: ${which} es un borrador; se leyó con include=drafts.`);
  }
  if (r.status === 200 && r.body.version) return { ...r.body.version, fuente: 'api' };
  die(`Versio respondió ${r.status}: ${r.body.error ?? 'sin detalle'}`);
}

// ---------- Plan ----------
const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y', 'a', 'al', 'un', 'una', 'para', 'por', 'con', 'se', 'que', 'ahora', 'nuevo', 'nueva']);
const tokens = (t) => fold(t).replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
const slugOf = (t) => tokens(t).slice(0, 4).join('-') || 'novedad';

function existingVideos() {
  const dir = path.join(ROOT, 'src/platforms', platform, 'videos');
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory()) : [];
}

function similar(slug, existing, min) {
  const a = new Set(tokens(slug.replace(/-/g, ' ')));
  let best = null;
  for (const e of existing) {
    const b = new Set(tokens(e.replace(/-/g, ' ')));
    const inter = [...a].filter((w) => b.has(w)).length;
    // Contención: un video corto ("rutas-inversas") dentro de un título largo cuenta como parecido.
    const score = inter >= 2 ? inter / Math.min(a.size, b.size) : inter / (new Set([...a, ...b]).size || 1);
    if (e === slug || score >= min) if (!best || score > best.score) best = { slug: e, score: e === slug ? 1 : score };
  }
  return best;
}

function ruleFor(item) {
  if (item.kind === 'internal') return cfg.rules.internal;
  if (item.highlight) return { ...cfg.rules.feature, ...cfg.rules.highlight, badge: item.kind === 'fix' ? 'CORRECCIÓN' : 'NUEVO' };
  if (item.kind === 'feature') return cfg.rules.feature;
  if (item.kind === 'fix') return cfg.rules.fix;
  return cfg.rules.sinTipo;
}

function buildPlan(v) {
  const existing = existingVideos();
  const used = new Map();
  const entries = (v.items ?? []).map((item) => {
    const rule = ruleFor(item);
    let slug = slugOf(item.title);
    const n = used.get(slug) ?? 0;
    used.set(slug, n + 1);
    if (n) slug = `${slug}-${n + 1}`;
    const dup = similar(slug, existing, cfg.similitudMinima);
    const media = item.media ?? [];
    let accion = item.hidden ? 'omitir (oculta en Versio)' : rule.formato === 'omitir' ? 'omitir' : dup ? 'revisar duplicado' : 'crear';
    if (accion === 'crear' && media.some((m) => m.type === 'video')) accion = 'revisar (ya trae video en Versio)';
    return {
      id: item.id, titulo: item.title, texto: item.text ?? '', modulo: item.module, tipo: item.kind, destacada: !!item.highlight,
      formato: rule.formato, prioridad: rule.prioridad ?? null, badge: rule.badge ?? null,
      slug, accion, posibleDuplicado: dup ? dup.slug : null,
      medios: media.map((m) => ({ tipo: m.type, url: m.url })),
      comando: rule.formato === 'omitir' || item.hidden ? null
        : `node scripts/new-video.mjs ${platform} ${slug} --title ${JSON.stringify(item.title.length > 40 ? item.title.slice(0, 37) + '...' : item.title)} --badge ${rule.badge ?? 'MEJORA'}${item.module ? ` --subtitle ${JSON.stringify(item.module)}` : ''}`,
    };
  });
  const order = { alta: 0, media: 1, baja: 2 };
  const pending = entries.filter((e) => !e.accion.startsWith('omitir')).sort((a, b) => (order[a.prioridad] ?? 3) - (order[b.prioridad] ?? 3));
  return {
    app, plataforma: platform, version: v.version, estado: v.status ?? null, titulo: v.title ?? null, publicada: v.published_at ?? null, fuente: v.fuente,
    releases: (v.releases ?? []).map((r) => `${r.repo ?? '?'}@${r.tag ?? r.version}`),
    resumen: {
      novedades: entries.length,
      paraCrear: entries.filter((e) => e.accion === 'crear').length,
      porRevisar: entries.filter((e) => e.accion.startsWith('revisar')).length,
      omitidas: entries.filter((e) => e.accion.startsWith('omitir')).length,
    },
    entries: flag('all') ? [...pending, ...entries.filter((e) => e.accion.startsWith('omitir'))] : pending,
  };
}

function renderMd(p) {
  const L = [];
  L.push(`# Plan de videos · ${p.app} ${p.version}${p.titulo ? ` · ${p.titulo}` : ''}`, '');
  if (p.estado === 'draft') L.push('> **Borrador**: puede cambiar hasta que se publique; no es el contenido final.', '');
  L.push(`- Estado: ${p.estado ?? 'desconocido'}  |  Publicada: ${p.publicada ?? 'sin fecha'}  |  Plataforma: ${p.plataforma}  |  Fuente: ${p.fuente}`);
  if (p.releases.length) L.push(`- Releases: ${p.releases.join(', ')}`);
  const r = p.resumen;
  L.push(`- ${r.novedades} novedades: **${r.paraCrear} para crear**, ${r.porRevisar} por revisar, ${r.omitidas} omitidas`, '');
  L.push('No se ha creado ningún video: este plan solo lista lo que sale en la versión.', '');
  p.entries.forEach((e, i) => {
    L.push(`## ${i + 1}. ${e.titulo}`);
    L.push(`- **${e.accion}** · ${e.formato}${e.prioridad ? ` · prioridad ${e.prioridad}` : ''}${e.destacada ? ' · destacada' : ''}`);
    L.push(`- Módulo: ${e.modulo ?? 'sin módulo'} · Tipo: ${e.tipo ?? 'sin tipo'} · Slug: \`${e.slug}\``);
    if (e.posibleDuplicado) L.push(`- Posible duplicado: ya existe \`${e.posibleDuplicado}\``);
    if (e.texto) L.push(`- Detalle: ${e.texto.replace(/\n/g, ' ')}`);
    if (e.medios.length) L.push(`- Medios en Versio: ${e.medios.map((m) => `${m.tipo} ${m.url}`).join(' · ')}`);
    if (e.comando) L.push('', '```bash', e.comando, '```');
    L.push('');
  });
  return L.join('\n');
}

async function main() {
  if (command === 'versions') {
    const r = await get(`/api/${enc(app)}/versions${qs(flag('drafts'))}`);
    if (r.status !== 200) die(`Versio respondió ${r.status}: ${r.body.error ?? 'sin detalle'}`);
    for (const v of r.body.versions) console.log(`${v.current ? '*' : ' '} ${v.version}\t${v.status ?? ''}\t${(v.published_at ?? '').slice(0, 10)}\t${v.title ?? ''}`);
    console.log('\n* = versión actual');
    return;
  }
  if (command !== 'plan') die('Comandos: versions | plan [version|current] [--all] [--from-file archivo.json] [--json]');

  const fromFile = opt('from-file');
  let v;
  if (fromFile) {
    const body = JSON.parse(fs.readFileSync(path.resolve(fromFile), 'utf8'));
    v = { ...(body.version ?? body), fuente: `archivo ${path.basename(fromFile)}` };
  } else {
    v = await fetchVersion(versionArg);
  }
  const plan = buildPlan(v);
  const dir = path.join(ROOT, 'out/versio', app, String(plan.version));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(plan, null, 2));
  fs.writeFileSync(path.join(dir, 'plan.md'), renderMd(plan));
  if (flag('json')) return console.log(JSON.stringify(plan, null, 2));

  console.log(`\n${app} ${plan.version}  [${plan.estado ?? '?'}]  (${plan.fuente})  ·  ${plan.resumen.novedades} novedades: ${plan.resumen.paraCrear} para crear, ${plan.resumen.porRevisar} por revisar, ${plan.resumen.omitidas} omitidas\n`);
  for (const e of plan.entries) console.log(`${(e.prioridad ?? '-').padEnd(5)} ${e.formato.padEnd(7)} ${e.accion.padEnd(34)} ${e.slug.padEnd(30)} ${e.titulo}`);
  console.log(`\nPlan completo: ${path.relative(ROOT, path.join(dir, 'plan.md'))}`);
}

main().catch((e) => die(`Error: ${e.message}`));
