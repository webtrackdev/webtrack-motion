// Estado de los videos que se generan en esta máquina (scripts/generate.mjs), en out/tasks/<slug>.status.json.
// Lo escribe el proceso que genera y lo leen el MCP (video_status, list_videos) y cancel_video.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, slugOf } from './pipeline.mjs';

const TASKS = path.join(ROOT, 'out', 'tasks');

export const slugForTicket = (ticket) => slugOf({ ticket: String(ticket).trim().toUpperCase(), id: String(ticket) });
export const statusFile = (slug) => path.join(TASKS, `${slug}.status.json`);
export const videosDir = (ticket) => path.join(ROOT, 'out', 'videos', String(ticket).toUpperCase());

export function writeStatus(slug, status) {
  fs.mkdirSync(TASKS, { recursive: true });
  const file = statusFile(slug);
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(status, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

/** ¿Sigue vivo el proceso? (Un estado "running" de un proceso muerto quedó cortado.) */
export function isAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

export function readStatus(slug) {
  const file = statusFile(slug);
  if (!fs.existsSync(file)) return null;
  const status = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (status.state === 'running' && !isAlive(status.pid)) {
    return { ...status, state: 'interrupted', error: 'El proceso se cortó (equipo apagado, reinicio o error inesperado). Vuelve a generarlo.' };
  }
  return status;
}

export function listStatuses() {
  if (!fs.existsSync(TASKS)) return [];
  return fs.readdirSync(TASKS)
    .filter((f) => f.endsWith('.status.json'))
    .map((f) => readStatus(f.replace(/\.status\.json$/, '')))
    .filter(Boolean)
    .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
}
