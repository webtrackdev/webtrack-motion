#!/usr/bin/env node
// Arma el esqueleto de un video de funcionalidad (con los valores de calidad ya puestos) y lo
// registra en el Root de la plataforma. Uso:
//   node scripts/new-video.mjs <plataforma> <slug> --name PascalCase --title "Titulo corto" \
//     --badge NUEVO|MEJORA|CORRECCIÓN --icon ico:Jobs|lucide:Truck \
//     [--ref "reactive#1790"] [--end "Sin sorpresas."] [--highlight sorpresas] \
//     [--subtitle "Modulo · Pantalla"] [--antes "..."] [--ahora "..."]
// Despues: reemplaza Screen.tsx por la replica real y ajusta los TODO (SKILL.md, paso 4).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const [platform, slug] = args;
if (!platform || !slug || platform.startsWith('--') || slug.startsWith('--')) {
  console.error('Uso: node scripts/new-video.mjs <plataforma> <slug> --name Pascal --title "..." --badge NUEVO --icon ico:Jobs');
  process.exit(1);
}
const opt = (k, d = '') => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const name = opt('name', slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(''));
const title = opt('title', name);
const badge = opt('badge', 'NUEVO');
const iconSpec = opt('icon', 'lucide:Sparkles');
const ref = opt('ref', 'sin referencia');
const endTitle = opt('end', `${title}.`);
const highlight = opt('highlight', endTitle.replace(/[.,;:!?¡¿]/g, '').split(' ').pop());
const subtitle = opt('subtitle', title);
const antes = opt('antes', 'TODO: lo que pasaba antes (del PR, no inventes).');
const ahora = opt('ahora', 'TODO: lo que pasa ahora.');

const platformDir = path.join(ROOT, 'src/platforms', platform);
if (!fs.existsSync(platformDir)) {
  console.error(`No existe la plataforma ${platform} en src/platforms (alta con scripts/new-platform.mjs).`);
  process.exit(1);
}
const videoDir = path.join(platformDir, 'videos', slug);
if (fs.existsSync(videoDir)) {
  console.error(`Ya existe ${path.relative(ROOT, videoDir)}; no se sobrescribe.`);
  process.exit(1);
}

// Icono de la entrada: ico:<nombre IcoMoon> (IcoIcon de la plataforma) o lucide:<Nombre>
const [kind, iconName] = iconSpec.split(':');
let iconImport = '';
let lucideImport = '';
let iconJsx;
if (kind === 'ico') {
  if (!fs.existsSync(path.join(platformDir, 'components/IcoIcon.tsx'))) {
    console.error(`La plataforma ${platform} no tiene components/IcoIcon.tsx: usa --icon lucide:<Nombre>.`);
    process.exit(1);
  }
  iconImport = "\nimport { IcoIcon } from '../../components/IcoIcon';";
  iconJsx = `<IcoIcon name="${iconName}" size={84} />`;
} else {
  lucideImport = `, ${iconName}`;
  iconJsx = `<${iconName} size={84} strokeWidth={2.2} />`;
}

const tplDir = path.join(ROOT, '.claude/skills/video/templates/feature-video');
const fill = (s) =>
  s
    .replaceAll('__LUCIDE_IMPORT__', lucideImport)
    .replaceAll('__ICON_IMPORT__', iconImport)
    .replaceAll('__ICON_JSX__', iconJsx)
    .replaceAll('__NAME__', name)
    .replaceAll('__TITLE__', title)
    .replaceAll('__BADGE__', badge)
    .replaceAll('__REF__', ref)
    .replaceAll('__END_TITLE__', endTitle)
    .replaceAll('__END_HIGHLIGHT__', highlight)
    .replaceAll('__END_SUBTITLE__', subtitle)
    .replaceAll('__ANTES__', antes)
    .replaceAll('__AHORA__', ahora);

fs.mkdirSync(videoDir, { recursive: true });
fs.writeFileSync(path.join(videoDir, `${name}.tsx`), fill(fs.readFileSync(path.join(tplDir, 'Video.tsx.tpl'), 'utf8')));
fs.writeFileSync(path.join(videoDir, 'Screen.tsx'), fill(fs.readFileSync(path.join(tplDir, 'Screen.tsx.tpl'), 'utf8')));
fs.writeFileSync(path.join(videoDir, 'guion.md'), fill(fs.readFileSync(path.join(tplDir, 'guion.md.tpl'), 'utf8')));

// Registro en Root.tsx: import tras el ultimo import de videos y Composition antes de </>
const rootFile = path.join(platformDir, 'Root.tsx');
let root = fs.readFileSync(rootFile, 'utf8');
const constName = slug.toUpperCase().replace(/-/g, '_');
if (root.includes(`id="${slug}"`)) {
  console.log(`Root.tsx ya registra ${slug}.`);
} else {
  const importLine = `import { ${name}, DURATION as ${constName} } from './videos/${slug}/${name}';\n`;
  const imports = [...root.matchAll(/^import .* from '\.\/videos\/.*';\n/gm)];
  const last = imports[imports.length - 1];
  root = last
    ? root.slice(0, last.index + last[0].length) + importLine + root.slice(last.index + last[0].length)
    : root.replace(/(\nconst video)/, `\n${importLine}$1`);
  const comp = `    <Composition id="${slug}" component={withBrand(BRAND, ${name})} durationInFrames={${constName}} {...video} />\n`;
  root = root.replace(/(\s*<\/>\n\);\s*)$/, `\n${comp.trimEnd()}$1`);
  fs.writeFileSync(rootFile, root);
}

console.log(`Listo: ${path.relative(ROOT, videoDir)}/ (${name}.tsx, Screen.tsx, guion.md) y registro en Root.tsx.`);
console.log(`Siguiente: ./still.sh ${platform} ${slug} 120   (frame del cuerpo + 51 de la entrada)`);
