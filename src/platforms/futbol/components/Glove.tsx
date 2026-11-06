// Guante de portero ilustrado (vista frontal, palma hacia el espectador).
// Coordenadas locales del guante izquierdo de la imagen (mano derecha del portero): el
// pulgar apunta hacia el centro. El derecho se dibuja espejado con mirror.
import type { FC } from 'react';

export type GlovePose = {
  /** Apertura de los dedos (0 juntos, 1 muy abiertos). */
  spread: number;
  /** Angulo del pulgar en grados desde la vertical (positivo hacia el centro). */
  thumb: number;
  /** Flexion de los dedos (0 rectos, 1 curvados hacia el balon). */
  curl?: number;
};

export type GlovePlacement = { x: number; y: number; scale?: number; rotate?: number; mirror?: boolean };

const INK = '#0b1a12';
const LATEX = '#eef3ef';
const LATEX_SHADE = '#d9e3dc';

const FINGERS = [
  // de afuera (menique) hacia el pulgar (indice)
  { bx: -46, len: 92, base: -14 },
  { bx: -16, len: 116, base: -5 },
  { bx: 16, len: 124, base: 3 },
  { bx: 48, len: 112, base: 12 }
];
const FINGER_W = 34;
const THUMB = { bx: 64, by: 26, len: 100, w: 38 };
const FINGER_BY = -46;

const rotV = (len: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return { x: len * Math.sin(r), y: -len * Math.cos(r) };
};

const fingerAngle = (i: number, pose: GlovePose) => FINGERS[i].base * (0.4 + pose.spread);

/** Puntos clave en coordenadas del padre: punta del indice, union indice-pulgar y punta del pulgar. */
export const gloveKeyPoints = (pose: GlovePose, at: GlovePlacement) => {
  const s = at.scale ?? 1;
  const m = at.mirror ? -1 : 1;
  const rot = ((at.rotate ?? 0) * Math.PI) / 180;
  const toParent = (p: { x: number; y: number }) => {
    const lx = p.x * s * m;
    const ly = p.y * s;
    const r = m * rot;
    return { x: at.x + lx * Math.cos(r) - ly * Math.sin(r), y: at.y + lx * Math.sin(r) + ly * Math.cos(r) };
  };
  const curl = 1 - 0.18 * (pose.curl ?? 0);
  const iv = rotV(FINGERS[3].len * curl, fingerAngle(3, pose));
  const tv = rotV(THUMB.len, pose.thumb);
  return {
    index: toParent({ x: FINGERS[3].bx + iv.x, y: FINGER_BY + iv.y }),
    web: toParent({ x: 62, y: -14 }),
    thumb: toParent({ x: THUMB.bx + tv.x, y: THUMB.by + tv.y })
  };
};

const Capsule: FC<{ x: number; y: number; w: number; len: number; deg: number; tip?: string }> = ({ x, y, w, len, deg, tip }) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <rect x={-w / 2} y={-len} width={w} height={len + w / 2} rx={w / 2} fill={LATEX} stroke={INK} strokeWidth={4} />
    {tip && <path d={`M ${-w / 2 + 2} ${-len + w * 0.55} A ${w / 2 - 2} ${w / 2 - 2} 0 0 1 ${w / 2 - 2} ${-len + w * 0.55} Z`} fill={tip} />}
    <line x1={-w / 2 + 9} y1={-len * 0.42} x2={w / 2 - 9} y2={-len * 0.42} stroke={LATEX_SHADE} strokeWidth={3} strokeLinecap="round" />
  </g>
);

export const Glove: FC<{ pose: GlovePose; at: GlovePlacement; accent: string; band: string; opacity?: number }> = ({ pose, at, accent, band, opacity = 1 }) => {
  const s = at.scale ?? 1;
  const curl = 1 - 0.18 * (pose.curl ?? 0);
  return (
    <g opacity={opacity} transform={`translate(${at.x} ${at.y}) rotate(${(at.mirror ? -1 : 1) * (at.rotate ?? 0)}) scale(${(at.mirror ? -1 : 1) * s} ${s})`}>
      {/* Dedos detras de la palma */}
      {FINGERS.map((f, i) => (
        <Capsule key={i} x={f.bx} y={FINGER_BY} w={FINGER_W} len={f.len * curl} deg={fingerAngle(i, pose)} tip={accent} />
      ))}
      {/* Palma */}
      <rect x={-70} y={-62} width={140} height={150} rx={48} fill={LATEX} stroke={INK} strokeWidth={4} />
      <rect x={-44} y={-30} width={88} height={84} rx={30} fill={LATEX_SHADE} opacity={0.7} />
      {/* Puno */}
      <rect x={-64} y={74} width={128} height={64} rx={20} fill={band} stroke={INK} strokeWidth={4} />
      <rect x={-64} y={96} width={128} height={14} fill={accent} opacity={0.9} />
      {/* Pulgar encima */}
      <Capsule x={THUMB.bx} y={THUMB.by} w={THUMB.w} len={THUMB.len} deg={pose.thumb} tip={accent} />
    </g>
  );
};
