// Portero de perfil (ilustracion plana), con brazos resueltos por cinematica inversa para
// que las manos sigan al balon. back = brazo lejano (detras del balon), front = brazo cercano.
import type { FC } from 'react';

const INK = '#0b1a12';

export type KeeperPose = { x: number; y: number; hand: { x: number; y: number }; lean?: number };

const UPPER = 118;
const FORE = 112;

/** Codo por IK de dos segmentos, doblado hacia abajo. */
const elbow = (s: { x: number; y: number }, h: { x: number; y: number }) => {
  const dx = h.x - s.x;
  const dy = h.y - s.y;
  const d = Math.min(Math.hypot(dx, dy), UPPER + FORE - 1);
  const a = Math.acos((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d));
  const base = Math.atan2(dy, dx);
  const ang = base + a; // codo hacia abajo
  return { x: s.x + UPPER * Math.cos(ang), y: s.y + UPPER * Math.sin(ang) };
};

const Limb: FC<{ a: { x: number; y: number }; b: { x: number; y: number }; w: number; color: string }> = ({ a, b, w, color }) => (
  <>
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={w} strokeLinecap="round" />
  </>
);

export const shoulderOf = (p: KeeperPose, far: boolean) => ({ x: p.x + (far ? 18 : -6), y: p.y - 150 + (far ? -6 : 0) });

export const KeeperArm: FC<{ p: KeeperPose; far?: boolean; jersey: string; accent: string; dx?: number }> = ({ p, far = false, jersey, accent, dx = 0 }) => {
  const s = shoulderOf(p, far);
  const h = { x: p.hand.x + dx, y: p.hand.y + (far ? -10 : 8) };
  const e = elbow(s, h);
  const col = far ? '#077a44' : jersey;
  return (
    <g>
      <Limb a={s} b={e} w={40} color={col} />
      <Limb a={e} b={h} w={36} color={col} />
      {/* Guante */}
      <circle cx={h.x} cy={h.y} r={30} fill="#eef3ef" stroke={INK} strokeWidth={4} />
      <rect x={h.x - 20} y={h.y + 14} width={40} height={14} rx={6} fill={accent} stroke={INK} strokeWidth={3} transform={`rotate(${far ? -20 : -30} ${h.x} ${h.y})`} />
    </g>
  );
};

export const KeeperBody: FC<{ p: KeeperPose; jersey: string; accent: string }> = ({ p, jersey, accent }) => (
  <g transform={`rotate(${p.lean ?? 8} ${p.x} ${p.y})`}>
    {/* Piernas */}
    <rect x={p.x - 52} y={p.y + 40} width={46} height={190} rx={22} fill="#1f2b25" stroke={INK} strokeWidth={4} transform={`rotate(10 ${p.x - 30} ${p.y + 40})`} />
    <rect x={p.x - 6} y={p.y + 40} width={46} height={190} rx={22} fill="#1f2b25" stroke={INK} strokeWidth={4} transform={`rotate(-8 ${p.x + 16} ${p.y + 40})`} />
    {/* Short */}
    <rect x={p.x - 62} y={p.y - 10} width={124} height={90} rx={24} fill="#0b1a12" />
    {/* Torso */}
    <rect x={p.x - 70} y={p.y - 190} width={140} height={210} rx={54} fill={jersey} stroke={INK} strokeWidth={4} />
    <rect x={p.x - 70} y={p.y - 120} width={140} height={22} fill={accent} opacity={0.85} />
    <text x={p.x + 4} y={p.y - 30} textAnchor="middle" fontSize={64} fontWeight={800} fill="#ffffff" opacity={0.9}>
      1
    </text>
    {/* Cabeza */}
    <circle cx={p.x + 6} cy={p.y - 238} r={46} fill="#e7b48f" stroke={INK} strokeWidth={4} />
    <path d={`M ${p.x - 40} ${p.y - 250} Q ${p.x + 4} ${p.y - 300} ${p.x + 50} ${p.y - 256} L ${p.x + 46} ${p.y - 236} Q ${p.x + 4} ${p.y - 262} ${p.x - 36} ${p.y - 230} Z`} fill="#2b1d14" />
    <circle cx={p.x + 34} cy={p.y - 236} r={5} fill={INK} />
  </g>
);
