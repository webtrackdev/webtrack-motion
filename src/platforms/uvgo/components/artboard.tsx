// Mesa de trabajo de una pantalla (estilo herramienta de diseno) y marcas de prototipo:
// estado de la pantalla, notas adhesivas, cotas, zonas clicables y la etiqueta "PROTOTIPO".
import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { Layers, PenLine, Sparkles, Zap } from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../core/anim';
import { GRAPHITE, HAND } from './build';
import { C } from './ui';

export const AB_W = 1440;
export const AB_H = 900;

export type Stages = { sketch: number; wire: number; paint: number; proto: number };

const stageInfo = (f: number, s: Stages) => {
  if (f >= s.proto) return { label: 'Prototipo v0.1', color: C.coral, Icon: Zap };
  if (f >= s.paint) return { label: 'Diseño', color: C.green, Icon: Sparkles };
  if (f >= s.wire) return { label: 'Wireframe', color: '#64748b', Icon: Layers };
  return { label: 'Boceto', color: GRAPHITE, Icon: PenLine };
};

export const Artboard: FC<{ x: number; y: number; num: string; name: string; s: Stages; finalBg: string; children: ReactNode }> = ({ x, y, num, name, s, finalBg, children }) => {
  const frame = useCurrentFrame();
  const info = stageInfo(frame, s);
  const bump = Math.max(...[s.wire, s.paint, s.proto].map((k) => (frame >= k && frame < k + 14 ? 1 - (frame - k) / 14 : 0)));
  const wire = kf(frame, [s.wire - 6, s.wire + 10], [0, 1]);
  const paint = kf(frame, [s.paint - 4, s.paint + 26], [0, 1], EASE.inOut);
  const appear = sp(frame, s.sketch - 30, SPRING.soft);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: AB_W, height: AB_H }}>
      {/* encabezado de la mesa */}
      <div style={{ position: 'absolute', left: 0, top: -74, display: 'flex', alignItems: 'center', gap: 16, opacity: appear }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.muted, letterSpacing: '-0.01em' }}>
          {num} · {name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            borderRadius: 999,
            background: info.color,
            color: '#fff',
            fontSize: 24,
            fontWeight: 800,
            transform: `scale(${1 + bump * 0.18})`
          }}
        >
          <info.Icon size={22} strokeWidth={2.6} /> {info.label}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: '0 40px 90px -40px rgba(23,23,23,.45), 0 0 0 1px rgba(23,23,23,.06)',
          opacity: appear,
          transform: `scale(${0.96 + 0.04 * appear})`
        }}
      >
        {/* papel con cuadricula */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fbf8f1',
            backgroundImage: 'linear-gradient(rgba(14,165,233,.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(14,165,233,.12) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* fondo de wireframe */}
        <div style={{ position: 'absolute', inset: 0, background: '#f1f3ef', opacity: wire * (1 - paint) }} />
        {/* fondo real de la app, barrido */}
        <div style={{ position: 'absolute', inset: 0, background: finalBg, clipPath: `inset(0 ${(1 - paint) * 100}% 0 0)` }} />
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
      </div>
    </div>
  );
};

/** Nota adhesiva escrita a mano. */
export const Sticky: FC<{ x: number; y: number; text: string; at: number; rot?: number; color?: string; w?: number }> = ({ x, y, text, at, rot = -4, color = '#fde68a', w = 260 }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        padding: '18px 20px 22px',
        background: color,
        boxShadow: '0 18px 30px -16px rgba(0,0,0,.45)',
        fontFamily: HAND,
        fontSize: 34,
        fontWeight: 700,
        lineHeight: 1.05,
        color: '#3b2f0a',
        transform: `rotate(${rot}deg) scale(${p}) translateY(${(1 - p) * -30}px)`,
        transformOrigin: '50% 0',
        zIndex: 30
      }}
    >
      <div style={{ position: 'absolute', top: -12, left: '50%', width: 90, height: 24, marginLeft: -45, background: 'rgba(255,255,255,.55)', transform: 'rotate(2deg)' }} />
      {text}
    </div>
  );
};

/** Cota rosa de diseno (medida entre dos puntos). */
export const Redline: FC<{ x1: number; y1: number; x2: number; y2: number; label: string; at: number; out: number }> = ({ x1, y1, x2, y2, label, at, out }) => {
  const frame = useCurrentFrame();
  const o = Math.min(kf(frame, [at, at + 10], [0, 1]), kf(frame, [out, out + 10], [1, 0]));
  if (o <= 0) return null;
  const vertical = x1 === x2;
  const pink = '#ec4899';
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o, pointerEvents: 'none', zIndex: 25 }}>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={pink} strokeWidth={2.5} />
        {vertical ? (
          <>
            <line x1={x1 - 8} y1={y1} x2={x1 + 8} y2={y1} stroke={pink} strokeWidth={2.5} />
            <line x1={x2 - 8} y1={y2} x2={x2 + 8} y2={y2} stroke={pink} strokeWidth={2.5} />
          </>
        ) : (
          <>
            <line x1={x1} y1={y1 - 8} x2={x1} y2={y1 + 8} stroke={pink} strokeWidth={2.5} />
            <line x1={x2} y1={y2 - 8} x2={x2} y2={y2 + 8} stroke={pink} strokeWidth={2.5} />
          </>
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (x1 + x2) / 2,
          top: (y1 + y2) / 2,
          transform: 'translate(-50%, -50%)',
          padding: '3px 10px',
          borderRadius: 8,
          background: pink,
          color: '#fff',
          fontSize: 18,
          fontWeight: 800
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Zona clicable del prototipo (rectangulo azul con rayo). */
export const Hotspot: FC<{ x: number; y: number; w: number; h: number; at: number; out?: number; r?: number }> = ({ x, y, w, h, at, out = 1e9, r = 14 }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  const o = kf(frame, [out, out + 10], [1, 0]);
  if (frame < at || o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 6,
        top: y - 6,
        width: w + 12,
        height: h + 12,
        borderRadius: r + 6,
        border: `3px solid ${C.sky}`,
        background: 'rgba(14,165,233,.10)',
        opacity: Math.min(1, p) * o,
        transform: `scale(${0.9 + 0.1 * p})`,
        zIndex: 26
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -16,
          top: -16,
          width: 34,
          height: 34,
          borderRadius: 99,
          background: C.sky,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 14px -6px rgba(0,0,0,.5)'
        }}
      >
        <Zap size={20} color="#fff" strokeWidth={2.8} fill="#fff" />
      </div>
    </div>
  );
};

/** Sello diagonal "PROTOTIPO" en la esquina de la mesa. */
export const ProtoRibbon: FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  if (frame < at) return null;
  return (
    <div style={{ position: 'absolute', right: 0, top: 0, width: 260, height: 260, overflow: 'hidden', zIndex: 28, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          right: -70,
          top: 46,
          width: 340,
          padding: '10px 0',
          textAlign: 'center',
          background: C.coral,
          color: '#fff',
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: '0.2em',
          transform: `rotate(45deg) scale(${p})`,
          boxShadow: '0 10px 20px -10px rgba(0,0,0,.5)'
        }}
      >
        PROTOTIPO
      </div>
    </div>
  );
};

/** Flecha de flujo entre dos mesas (se dibuja de `from` a `to` en coordenadas del mundo). */
export const FlowArrow: FC<{ x1: number; y1: number; x2: number; y2: number; at: number; dur?: number }> = ({ x1, y1, x2, y2, at, dur = 26 }) => {
  const frame = useCurrentFrame();
  const p = kf(frame, [at, at + dur], [0, 1], EASE.inOut);
  if (frame < at) return null;
  const mx = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} C ${mx} ${y1 - 160}, ${mx} ${y2 - 160}, ${x2} ${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.35;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 40 }} width={1} height={1}>
      <path d={d} stroke={C.sky} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${len * p} ${len}`} />
      <circle cx={x1} cy={y1} r={10} fill={C.sky} />
      {p > 0.96 && <path d={`M ${x2 - 22} ${y2 - 14} L ${x2} ${y2} L ${x2 - 22} ${y2 + 14}`} stroke={C.sky} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
