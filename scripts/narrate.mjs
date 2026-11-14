#!/usr/bin/env node
// Voz y música para los videos de motion. Adaptación a Node del pipeline de ../Webinars
// (webinar_voice.py): mismo guion con tiempos, voz de ElevenLabs o de Deepgram (Aura-2), misma
// música con ducking. Aquí el video ya existe (out/<plataforma>/<slug>.mp4, sin audio) y se le monta
// la narración sin tocar su imagen.
//
//   node scripts/narrate.mjs check      <plataforma> <slug>            revisa el guion: ventanas, duración estimada y costo (no llama a ningún servicio)
//   node scripts/narrate.mjs synthesize <plataforma> <slug> [--mock]   genera la voz por sección (ElevenLabs o Deepgram) -> narration.mp3 + .srt
//   node scripts/narrate.mjs mux        <plataforma> <slug> [--no-music] [--no-voice]   -> out/<plataforma>/<slug>-voz.mp4
//   node scripts/narrate.mjs voices [--provider=deepgram]               lista las voces (ElevenLabs: de tu cuenta; Deepgram: las de español)
//
// Guion: src/platforms/<plataforma>/videos/<slug>/narracion.md, mismo formato que script.md de
// Webinars. Los tiempos son SEGUNDOS DEL VIDEO FINAL (entrada incluida):
//
//   <!-- #0 [2.40 -> 6.00] -->
//   Toma una foto y ToolTrack analiza tus herramientas.
//
// --mock genera tonos en lugar de voz (para probar tiempos y mezcla sin gastar créditos).
// La voz se guarda en caché por texto+ajustes: repetir synthesize no vuelve a cobrar.
// Servicio de voz: audio.config.json -> provider ("elevenlabs" | "deepgram"), o --provider=... Con Deepgram se puede
// elegir la voz con --voice=aura-2-sirio-es. Claves: ELEVENLABS_API_KEY / DEEPGRAM_API_KEY, del entorno o de ./.env
// (--env=<ruta> para usar otro archivo).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [cmd, platform, slug, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--') && !a.includes('=')));
const opt = Object.fromEntries(rest.filter((a) => a.startsWith('--') && a.includes('=')).map((a) => a.slice(2).split(/=(.*)/s).slice(0, 2)));

const die = (msg) => {
  console.error(`Error: ${msg}`);
  process.exit(1);
};

const cfg = JSON.parse(fs.readFileSync(path.join(root, 'audio.config.json'), 'utf8'));

// ---------- utilidades ----------
const run = (bin, args, { quiet = false } = {}) => {
  if (!quiet) console.log('  $', bin, args.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ').slice(0, 220));
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) die(`${bin} falló:\n${(r.stderr || '').slice(-1500)}`);
  return r.stdout;
};
const duration = (file) => parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { quiet: true }));
const hasAudio = (file) => run('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], { quiet: true }).trim() !== '';

const parseTime = (s) => {
  s = s.trim();
  if (!s.includes(':')) return parseFloat(s);
  const [h, m, rest2] = s.split(':');
  const [sec, ms = '0'] = rest2.split(/[,.]/);
  return +h * 3600 + +m * 60 + +sec + +ms / 1000;
};
const srtTime = (t) => {
  let ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  ms -= s * 1000;
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(s)},${p(ms, 3)}`;
};

const loadKey = (name) => {
  if (process.env[name]) return process.env[name];
  const candidates = [opt.env, path.join(root, '.env')].filter(Boolean);
  for (const f of candidates) {
    if (!fs.existsSync(f)) continue;
    const m = fs.readFileSync(f, 'utf8').match(new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`, 'm'));
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
};

// ---------- guion ----------
// Carpeta del video: la temporal de un trabajo del worker (jobs/<slug>) o la de videos/<slug>.
const videoDir = () => {
  const job = path.join(root, 'src/platforms', platform, 'jobs', slug);
  return fs.existsSync(job) ? job : path.join(root, 'src/platforms', platform, 'videos', slug);
};
const scriptPath = () => path.join(videoDir(), 'narracion.md');
const TIME_RE = /\[\s*([0-9:.,]+)\s*->\s*([0-9:.,]+)\s*\]/;

const readScript = () => {
  const file = scriptPath();
  if (!fs.existsSync(file)) die(`no existe ${path.relative(root, file)}`);
  const sections = [];
  let prev = null;
  for (const block of fs.readFileSync(file, 'utf8').split(/\n\s*\n/)) {
    const text = block.replace(/<!--[\s\S]*?-->/g, '').split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
    if (!text) continue;
    const m = block.match(TIME_RE);
    if (!m) die(`bloque con texto y sin tiempo [inicio -> fin]: "${text.slice(0, 60)}..."`);
    const start = parseTime(m[1]);
    const end = parseTime(m[2]);
    if (end <= start) die(`tiempo inválido (fin <= inicio): [${start} -> ${end}] "${text.slice(0, 50)}..."`);
    if (prev !== null && start < prev) console.warn(`Aviso: el inicio ${start}s va antes que el de la sección anterior.`);
    prev = start;
    sections.push({ start, end, text });
  }
  if (!sections.length) die('narracion.md no tiene secciones con texto');
  return sections;
};

const estimate = (text) => Math.max(0.8, text.length / cfg.narration.charsPerSecond);

const paths = () => {
  const dir = path.join(root, 'out', platform, 'audio', slug);
  return { dir, chunks: path.join(dir, 'chunks'), narration: path.join(dir, 'narration.mp3'), srt: path.join(dir, 'narration.srt'), plan: path.join(dir, 'plan.json') };
};

/** Coloca cada sección en su inicio; si la anterior no terminó, espera (nunca se montan). */
const place = (sections, durations) => {
  const placed = [];
  let cursor = 0;
  sections.forEach((s, i) => {
    const at = Math.max(s.start, cursor);
    placed.push({ ...s, at, dur: durations[i], moved: at - s.start > 0.1, overflow: at + durations[i] - s.end });
    cursor = at + durations[i] + cfg.narration.gap;
  });
  return placed;
};

const report = (placed, videoDur) => {
  let bad = 0;
  for (const [i, p] of placed.entries()) {
    const flag = [];
    if (p.moved) flag.push(`movida ${p.start.toFixed(1)}s → ${p.at.toFixed(1)}s (la anterior no terminaba)`);
    if (p.overflow > 0.4) flag.push(`se pasa ${p.overflow.toFixed(1)}s de su ventana`);
    if (videoDur && p.at + p.dur > videoDur) flag.push(`termina después del video (${videoDur.toFixed(1)}s)`);
    if (flag.length) bad++;
    console.log(`  #${i} ${p.at.toFixed(1).padStart(5)}s → ${(p.at + p.dur).toFixed(1).padStart(5)}s  (${p.dur.toFixed(1)}s, ventana ${(p.end - p.start).toFixed(1)}s) ${flag.length ? '⚠ ' + flag.join('; ') : ''}`);
  }
  console.log(bad ? `\n${bad} sección(es) con aviso: acorta el texto o amplía la ventana en narracion.md.` : '\nTodas las secciones caben en su ventana.');
};

// ---------- servicios de voz ----------
const provider = opt.provider ?? cfg.provider ?? 'elevenlabs';

/** Parte un texto en trozos <= max caracteres respetando las oraciones. */
const splitText = (text, max) => {
  if (text.length <= max) return [text];
  const out = [];
  let cur = '';
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    if ((cur + ' ' + sentence).trim().length > max && cur) {
      out.push(cur.trim());
      cur = sentence;
    } else cur = (cur + ' ' + sentence).trim();
  }
  if (cur) out.push(cur.trim());
  return out;
};

const ttsElevenlabs = async (text, key, file) => {
  const el = cfg.elevenlabs;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${el.voice_id}?output_format=${el.output_format ?? 'mp3_44100_128'}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: el.model_id, language_code: el.language_code ?? 'es', voice_settings: el.voice_settings })
  });
  if (!res.ok) die(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return parseFloat(res.headers.get('character-cost') ?? text.length);
};

// Deepgram Aura-2: POST /v1/speak?model=<voz>, cabecera "Authorization: Token <clave>", cuerpo {"text": ...}.
// Máximo 2000 caracteres por petición; la respuesta es MP3 y 'dg-char-count' trae los caracteres facturados.
const deepgramModel = () => opt.voice ?? cfg.deepgram?.model ?? 'aura-2-javier-es';
const ttsDeepgram = async (text, key, file) => {
  const model = deepgramModel();
  const parts = [];
  let billed = 0;
  for (const piece of splitText(text, 1900)) {
    const base = process.env.DEEPGRAM_BASE_URL ?? cfg.deepgram?.baseUrl ?? 'https://api.deepgram.com';
    const res = await fetch(`${base}/v1/speak?model=${encodeURIComponent(model)}`, {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: piece })
    });
    if (!res.ok) die(`Deepgram ${res.status}: ${(await res.text()).slice(0, 300)}`);
    billed += parseFloat(res.headers.get('dg-char-count') ?? piece.length);
    parts.push(Buffer.from(await res.arrayBuffer()));
  }
  fs.writeFileSync(file, Buffer.concat(parts)); // los MP3 se pueden concatenar
  return billed;
};

const PROVIDERS = {
  elevenlabs: {
    label: () => `ElevenLabs ${cfg.elevenlabs.voice_id.slice(0, 4)}… | modelo ${cfg.elevenlabs.model_id}`,
    envKey: 'ELEVENLABS_API_KEY',
    per1k: () => cfg.pricing.elevenlabs_per_1k_chars,
    // Misma huella que antes: la caché de frases ya generadas sigue valiendo.
    fingerprint: (mock, text) => [mock, text, cfg.elevenlabs.voice_id, cfg.elevenlabs.model_id, cfg.elevenlabs.voice_settings],
    tts: ttsElevenlabs
  },
  deepgram: {
    label: () => `Deepgram | voz ${deepgramModel()}`,
    envKey: 'DEEPGRAM_API_KEY',
    per1k: () => cfg.pricing.deepgram_per_1k_chars,
    fingerprint: (mock, text) => [mock, text, 'deepgram', deepgramModel()],
    tts: ttsDeepgram
  }
};
const V = PROVIDERS[provider] ?? die(`servicio de voz desconocido: ${provider} (elevenlabs | deepgram)`);

// ---------- comandos ----------
const cmdCheck = () => {
  const sections = readScript();
  const placed = place(sections, sections.map((s) => estimate(s.text)));
  const chars = sections.reduce((a, s) => a + s.text.length, 0);
  console.log(`${sections.length} secciones, ${chars} caracteres (estimado con ${cfg.narration.charsPerSecond} car/s):\n`);
  const video = path.join(root, 'out', platform, `${slug}.mp4`);
  report(placed, fs.existsSync(video) ? duration(video) : null);
  console.log(`\nCosto estimado de la voz (${provider}): US$ ${((chars / 1000) * V.per1k()).toFixed(2)} (solo si se sintetiza; check no cobra).`);
};

const cmdSynthesize = async () => {
  const sections = readScript();
  const P = paths();
  fs.mkdirSync(P.chunks, { recursive: true });
  const mock = flags.has('--mock');
  const key = mock ? null : loadKey(V.envKey);
  if (!mock && !key) die(`falta ${V.envKey} (entorno o ./.env). Para probar sin voz usa --mock`);
  console.log(mock ? 'MODO MOCK: tonos en lugar de voz (sin servicio, sin costo).' : `Voz ${V.label()}`);

  let billed = 0;
  let cached = 0;
  const wavs = [];
  for (const [i, s] of sections.entries()) {
    const hash = crypto.createHash('sha1').update(JSON.stringify(V.fingerprint(mock, s.text))).digest('hex').slice(0, 12);
    const mp3 = path.join(P.chunks, `${hash}.mp3`);
    const wav = path.join(P.chunks, `sec_${String(i).padStart(3, '0')}.wav`);
    if (fs.existsSync(mp3)) {
      cached++;
    } else if (mock) {
      run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=${200 + (i % 4) * 30}:duration=${estimate(s.text).toFixed(2)}`, '-af', 'volume=0.18,afade=t=in:d=0.05,afade=t=out:st=0.2:d=0.1', '-c:a', 'libmp3lame', mp3], { quiet: true });
    } else {
      console.log(`  [${i + 1}/${sections.length}] ${s.text.slice(0, 60)}`);
      billed += await V.tts(s.text, key, mp3);
    }
    run('ffmpeg', ['-y', '-v', 'error', '-i', mp3, '-ar', '44100', '-ac', '2', wav], { quiet: true });
    wavs.push(wav);
  }

  const durs = wavs.map(duration);
  const placed = place(sections, durs);
  const inputs = wavs.flatMap((w) => ['-i', w]);
  const filters = placed.map((p, i) => `[${i}:a]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[a${i}]`);
  const mix = placed.map((_, i) => `[a${i}]`).join('');
  run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', `${filters.join(';')};${mix}amix=inputs=${placed.length}:normalize=0[out]`, '-map', '[out]', '-c:a', 'libmp3lame', '-q:a', '2', P.narration], { quiet: true });
  fs.writeFileSync(P.srt, placed.map((p, i) => `${i + 1}\n${srtTime(p.at)} --> ${srtTime(p.at + p.dur)}\n${p.text}\n`).join('\n'));
  fs.writeFileSync(P.plan, JSON.stringify(placed, null, 2));

  console.log('\nTiempos reales:');
  report(placed, null);
  console.log(`\nGenerado: ${path.relative(root, P.narration)} y .srt`);
  if (!mock) console.log(`Reutilizadas de caché: ${cached} | caracteres facturados: ${billed.toFixed(0)} (~US$ ${((billed / 1000) * V.per1k()).toFixed(2)})`);
};

const cmdMux = () => {
  const video = path.join(root, 'out', platform, `${slug}.mp4`);
  if (!fs.existsSync(video)) die(`no existe ${path.relative(root, video)}: renderiza primero con ./render.sh ${platform} ${slug}`);
  const P = paths();
  const useVoice = !flags.has('--no-voice');
  if (useVoice && !fs.existsSync(P.narration)) die(`no existe ${path.relative(root, P.narration)}: corre antes synthesize`);
  const musicFile = flags.has('--no-music') ? null : path.resolve(root, opt.music ?? cfg.music.file);
  if (musicFile && !fs.existsSync(musicFile)) die(`no existe la música ${musicFile}`);
  if (!useVoice && !musicFile) die('nada que montar: quitaste la voz y la música');

  const dur = duration(video);
  const out = path.join(root, 'out', platform, `${slug}-voz.mp4`);
  const inputs = ['-i', video];
  const filters = [];
  let voiceLabel = null;
  let idx = 1;
  if (useVoice) {
    inputs.push('-i', P.narration);
    voiceLabel = `[${idx}:a]`;
    idx++;
  }
  let bg = null;
  if (musicFile) {
    inputs.push('-stream_loop', '-1', '-i', musicFile);
    const m = cfg.music;
    filters.push(`[${idx}:a]volume=${opt.musicvolume ?? m.volume},aresample=44100,aformat=channel_layouts=stereo,atrim=0:${dur.toFixed(3)},afade=t=in:d=${m.fadeIn},afade=t=out:st=${Math.max(0, dur - m.fadeOut).toFixed(3)}:d=${m.fadeOut}[mvol]`);
    bg = '[mvol]';
  }
  let final;
  if (voiceLabel && bg) {
    if (cfg.music.duck) {
      // La voz se divide: una copia se mezcla y otra baja la música mientras se habla.
      filters.push(`${voiceLabel}aresample=44100,aformat=channel_layouts=stereo,volume=${cfg.narration.volume},apad=whole_dur=${dur.toFixed(3)},asplit=2[vA][vB]`);
      filters.push('[mvol][vA]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=500[mduck]');
      filters.push(`[vB][mduck]amix=inputs=2:duration=longest:normalize=0,atrim=0:${dur.toFixed(3)},asetpts=PTS-STARTPTS[aout]`);
    } else {
      filters.push(`${voiceLabel}aresample=44100,aformat=channel_layouts=stereo,apad=whole_dur=${dur.toFixed(3)}[vB]`);
      filters.push(`[vB]${bg}amix=inputs=2:duration=longest:normalize=0,atrim=0:${dur.toFixed(3)},asetpts=PTS-STARTPTS[aout]`);
    }
    final = '[aout]';
  } else if (voiceLabel) {
    filters.push(`${voiceLabel}aresample=44100,aformat=channel_layouts=stereo,apad=whole_dur=${dur.toFixed(3)},atrim=0:${dur.toFixed(3)}[aout]`);
    final = '[aout]';
  } else {
    filters.push('[mvol]anull[aout]');
    final = '[aout]';
  }
  // La imagen no se vuelve a codificar: solo se agrega el audio.
  run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '0:v', '-map', final, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  console.log(`\nListo: ${path.relative(root, out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB, ${duration(out).toFixed(1)} s)`);
  if (hasAudio(video)) console.log('Aviso: el video original ya tenía audio; se descartó.');
};

const DEEPGRAM_VOICES_ES = [
  ['aura-2-javier-es', 'masculina, mexicana: cercana, profesional, amigable'],
  ['aura-2-sirio-es', 'masculina, mexicana: tranquila, profesional, barítono'],
  ['aura-2-valerio-es', 'masculina, mexicana: grave, conocedora, natural'],
  ['aura-2-luciano-es', 'masculina, mexicana: carismática, enérgica'],
  ['aura-2-aquila-es', 'masculina, latinoamericana: expresiva, entusiasta'],
  ['aura-2-nestor-es', 'masculina, peninsular: tranquila, profesional'],
  ['aura-2-alvaro-es', 'masculina, peninsular: clara, conocedora'],
  ['aura-2-estrella-es', 'femenina, mexicana: cercana, natural'],
  ['aura-2-olivia-es', 'femenina, mexicana: aireada, cálida'],
  ['aura-2-selena-es', 'femenina, latinoamericana: cercana, amigable'],
  ['aura-2-celeste-es', 'femenina, colombiana: clara, enérgica'],
  ['aura-2-gloria-es', 'femenina, colombiana: casual, suave'],
  ['aura-2-antonia-es', 'femenina, argentina: cercana, entusiasta'],
  ['aura-2-diana-es', 'femenina, peninsular: segura, expresiva'],
  ['aura-2-agustina-es', 'femenina, peninsular: tranquila, clara'],
  ['aura-2-silvia-es', 'femenina, peninsular: carismática, cálida'],
  ['aura-2-carina-es', 'femenina, peninsular: profesional, enérgica']
];

const cmdVoices = async () => {
  if (provider === 'deepgram') {
    console.log('Voces Aura-2 en español de Deepgram (usa --voice=<modelo> o cambia deepgram.model en audio.config.json):');
    for (const [m, d] of DEEPGRAM_VOICES_ES) console.log(`${m.padEnd(22)} ${d}`);
    return;
  }
  const key = loadKey('ELEVENLABS_API_KEY');
  if (!key) die('falta ELEVENLABS_API_KEY');
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': key } });
  if (!res.ok) die(`ElevenLabs ${res.status}`);
  for (const v of (await res.json()).voices) console.log(`${v.voice_id}  ${v.name}`);
};

const needVideo = () => {
  if (!platform || !slug) die(`uso: node scripts/narrate.mjs ${cmd} <plataforma> <slug>`);
};
switch (cmd) {
  case 'check':
    needVideo();
    cmdCheck();
    break;
  case 'synthesize':
    needVideo();
    await cmdSynthesize();
    break;
  case 'mux':
    needVideo();
    cmdMux();
    break;
  case 'voices':
    await cmdVoices();
    break;
  default:
    die('comandos: check | synthesize | mux | voices  (ver el encabezado de scripts/narrate.mjs)');
}
