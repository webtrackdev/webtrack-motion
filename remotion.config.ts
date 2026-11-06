// Configuracion de Remotion para todas las plataformas.
// Los repos de cada plataforma (platforms.json) solo se LEEN: su CSS y sus componentes se
// importan con el alias @<plataforma>; nunca se escribe en ellos.
import fs from 'node:fs';
import path from 'node:path';
import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

type PlatformEntry = { name: string; source: { type: 'repo'; repo: string; src?: string } | { type: 'url'; url: string } | { type: 'theme' } };

const here = process.cwd();
const ownModules = path.resolve(here, 'node_modules');
const platforms: Record<string, PlatformEntry> = JSON.parse(fs.readFileSync(path.join(here, 'platforms.json'), 'utf8'));

const aliases: Record<string, string> = {};
const repoModules: string[] = [];
for (const [id, p] of Object.entries(platforms)) {
  if (p.source.type !== 'repo') continue;
  const repo = path.resolve(here, p.source.repo);
  aliases[`@${id}`] = path.join(repo, p.source.src ?? 'src');
  repoModules.push(path.join(repo, 'node_modules'));
}

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

Config.overrideWebpackConfig((current) => {
  const withTailwind = enableTailwind(current);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      modules: [ownModules, ...repoModules, 'node_modules'],
      alias: {
        ...(withTailwind.resolve?.alias ?? {}),
        ...aliases,
        // Una sola copia de React aunque un repo traiga la suya.
        react: path.join(ownModules, 'react'),
        'react-dom': path.join(ownModules, 'react-dom'),
        'react/jsx-runtime': path.join(ownModules, 'react/jsx-runtime.js'),
        'react/jsx-dev-runtime': path.join(ownModules, 'react/jsx-dev-runtime.js')
      }
    }
  };
});
