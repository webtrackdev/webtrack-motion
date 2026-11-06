#!/usr/bin/env node
// Da de alta una plataforma nueva.
//
//   node scripts/new-platform.mjs <id> --name "Nombre" --repo ../ruta/al/repo [--src src] [--css ruta/dentro/del/repo.css]
//   node scripts/new-platform.mjs <id> --name "Nombre" --url https://app.ejemplo.com
//   node scripts/new-platform.mjs <id> --name "Nombre" --theme 1      (tema sin plataforma: deportes, cursos...)
//   Opcionales: --primary #hex --accent #hex --ink #hex --bg #hex --font "Google Font" --logo ruta/al/logo.png
//
// Crea src/platforms/<id>/ (perfil de marca, fuente, estilos, entrada, Root, videos/), copia
// el logo a public/<id>/brand/ y registra la plataforma en platforms.json y tsconfig.json.
// Nunca escribe en el repo de la plataforma: solo guarda su ruta para leerlo.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [id, ...rest] = process.argv.slice(2);
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];

const fail = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) fail('id requerido, en minusculas y con guiones (ej. versio)');
if (!opt.repo && !opt.url && !opt.theme) fail('usa --repo <ruta>, --url <url> o --theme 1');
const dir = path.join(root, 'src/platforms', id);
if (fs.existsSync(dir)) fail(`ya existe src/platforms/${id}`);

const name = opt.name ?? id;
const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const hex = (v, d) => (v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d);

// Repo: validar que existe y que el CSS indicado existe.
let repoAbs = null;
let cssImport = null;
if (opt.repo) {
  repoAbs = path.resolve(root, opt.repo);
  if (!fs.existsSync(repoAbs)) fail(`no existe el repo ${repoAbs}`);
  if (opt.css) {
    const cssAbs = path.join(repoAbs, opt.css);
    if (!fs.existsSync(cssAbs)) fail(`no existe el CSS ${cssAbs}`);
    cssImport = path.relative(dir, cssAbs).split(path.sep).join('/');
  }
}

// Fuente de Google, si existe en @remotion/google-fonts.
const fontModule = opt.font ? opt.font.replace(/\s+/g, '') : null;
const hasFont = fontModule && fs.existsSync(path.join(root, 'node_modules/@remotion/google-fonts/dist/esm', `${fontModule}.mjs`));
if (opt.font && !hasFont) console.warn(`Aviso: "${opt.font}" no esta en @remotion/google-fonts; se usa la fuente del sistema.`);

// Logo
let logoRel;
if (opt.logo) {
  const src = path.resolve(root, opt.logo);
  if (!fs.existsSync(src)) fail(`no existe el logo ${src}`);
  const destDir = path.join(root, 'public', id, 'brand');
  fs.mkdirSync(destDir, { recursive: true });
  const file = `logo${path.extname(src)}`;
  fs.copyFileSync(src, path.join(destDir, file));
  logoRel = `${id}/brand/${file}`;
}

fs.mkdirSync(path.join(dir, 'videos'), { recursive: true });
const write = (f, s) => fs.writeFileSync(path.join(dir, f), s.trimStart());

write(
  'fonts.ts',
  hasFont
    ? `
import { loadFont } from '@remotion/google-fonts/${fontModule}';

export const { fontFamily, waitUntilDone } = loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
`
    : `
// Sin fuente de Google: se usa la del sistema. Cambiala por la de la plataforma si la tiene.
export const fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
export const waitUntilDone = () => document.fonts.ready;
`
);

write(
  'platform.ts',
  `
// Perfil de la plataforma ${name}.
// Fuente de diseno: ${opt.repo ? `repo ${opt.repo} (solo lectura, alias @${id})` : opt.url ? `sitio ${opt.url}` : 'tema propio, sin plataforma'}.
// Ajusta los colores con los tokens reales de la plataforma.
import type { Brand } from '../../core/theme';
import { fontFamily } from './fonts';

export const BRAND: Brand = {
  name: ${JSON.stringify(name)},
  primary: '${hex(opt.primary, '#2563eb')}',
  accent: '${hex(opt.accent, '#7c3aed')}',
  ink: '${hex(opt.ink, '#0f1728')}',
  body: '#3a4256',
  muted: '#677187',
  bg: '${hex(opt.bg, '#f6f7fb')}',
  card: '#ffffff',
  border: '#eceef3',
  success: '#22c55e',
  danger: '#ef4444',
  font: fontFamily${logoRel ? `,\n  logo: '${logoRel}'` : ''}
};
`
);

write(
  'style.css',
  `
${cssImport ? `/* CSS real de ${name} (solo lectura). */\n@import '${cssImport}';\n` : `/* ${name}: sin CSS importado. Si hay repo, importa aqui su hoja principal. */\n@import 'tailwindcss';\n`}@import '../../core/base.css';

@source './';
@source '../../core';
`
);

write(
  'index.ts',
  `
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
`
);

write(
  'Root.tsx',
  `
// Videos de ${name}. Un <Composition> por video; el id es el nombre del archivo final.
import { Composition } from 'remotion';
import { withBrand } from '../../core/platform';
import { BRAND } from './platform';
import { Ejemplo, DURATION as EJEMPLO } from './videos/ejemplo/Ejemplo';

const video = { fps: 30, width: 1920, height: 1080 };

export const RemotionRoot = () => (
  <>
    <Composition id="${id}-ejemplo" component={withBrand(BRAND, Ejemplo)} durationInFrames={EJEMPLO} {...video} />
  </>
);
`
);

// Video de ejemplo: gancho + cierre con la marca, para comprobar el alta.
fs.mkdirSync(path.join(dir, 'videos/ejemplo'), { recursive: true });
fs.writeFileSync(
  path.join(dir, 'videos/ejemplo/Ejemplo.tsx'),
  `// Video minimo para comprobar la marca de ${name}. Borralo cuando haya videos reales.
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Backdrop } from '../../../../core/Backdrop';
import { Hook } from '../../../../core/templates/Hook';
import { EndCard } from '../../../../core/templates/EndCard';
import { fontFamily } from '../../fonts';
import '../../style.css';

export const DURATION = 180;

export const Ejemplo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Backdrop />
      {frame < 96 && <Hook tag="${name.toUpperCase()}" lines={['Videos de producto,', 'con tu propia marca.']} highlight={['propia', 'marca']} />}
      {frame >= 90 && <EndCard title=${JSON.stringify(name + '.')} subtitle="Listo para el primer video." at={{ title: 96, subtitle: 112, logo: 126 }} />}
    </AbsoluteFill>
  );
};
`
);

// Registro
const regPath = path.join(root, 'platforms.json');
const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
reg[id] = {
  name,
  source: opt.repo
    ? { type: 'repo', repo: path.relative(root, repoAbs).split(path.sep).join('/'), src: opt.src ?? 'src', ...(opt.css ? { css: opt.css } : {}) }
    : opt.url
      ? { type: 'url', url: opt.url }
      : { type: 'theme' }
};
fs.writeFileSync(regPath, JSON.stringify(reg, null, 2) + '\n');

if (opt.repo) {
  const tsPath = path.join(root, 'tsconfig.json');
  const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
  ts.compilerOptions.paths[`@${id}/*`] = [`${reg[id].source.repo}/${reg[id].source.src}/*`];
  fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2) + '\n');
}

console.log(`Plataforma "${name}" creada en src/platforms/${id}`);
console.log(`Prueba:  ./still.sh ${id} ${id}-ejemplo 40 150`);
