// Motor "del boceto al prototipo": cada bloque de una pantalla pasa por tres capas.
//   1. Boceto: trazo de lapiz irregular que se dibuja solo, con su nota a mano.
//   2. Bloque: placeholder gris (wireframe) que cae y encaja con rebote.
//   3. Diseno: el componente real se pinta con un barrido de izquierda a derecha.
// Un bloque con `stay` se queda como wireframe a proposito (parte del prototipo sin terminar).
import type { CSSProperties, FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Caveat';
import { Pencil } from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../core/anim';
import { C } from './ui';

export const { fontFamily: HAND } = loadFont('normal', { weights: ['500', '700'], subsets: ['latin'] });

export const GRAPHITE = '#3f4a3c';
export const WIRE = '#d7ddd3';
export const WIRE_DARK = '#bcc5b8';
export const BLUEPRINT = 'rgba(14,165,233,.12)';

export type Kind = 'box' | 'text' | 'title' | 'button' | 'image' | 'chart' | 'map' | 'input' | 'avatar' | 'list' | 'nav';

export type BlockSpec = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: Kind;
  /** Nota a mano en el boceto. */
  note?: string;
  radius?: number;
  /** Nota arriba del bloque en lugar de al centro. */
  noteTop?: boolean;
  /** Se queda como wireframe con franjas (parte sin terminar). */
  stay?: string;
};

export type Phase = { sketch: number; wire: number; paint: number };

// Generador pseudoaleatorio estable por semilla (mismo trazo en cada frame).
const rand = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};
const hash = (str: string) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

/** Rectangulo "a mano": lados con temblor y esquinas que se pasan un poco. */
export const roughRect = (w: number, h: number, seed: number, r = 0) => {
  const R = rand(seed);
  const j = () => (R() - 0.5) * 5;
  const o = () => 4 + R() * 6;
  const pts: string[] = [];
  const side = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2 + j() * 1.4;
    const my = (y1 + y2) / 2 + j() * 1.4;
    pts.push(`M ${x1 + j()} ${y1 + j()} Q ${mx} ${my} ${x2 + j()} ${y2 + j()}`);
  };
  const k = Math.min(r, 14);
  side(-o() + k, 0, w + o() - k, 0);
  side(w, -o() + k, w, h + o() - k);
  side(w + o() - k, h, -o() + k, h);
  side(0, h + o() - k, 0, -o() + k);
  return pts.join(' ');
};

/** Garabato horizontal (linea de texto a mano). */
const scribble = (x: number, y: number, w: number, seed: number) => {
  const R = rand(seed);
  let d = `M ${x} ${y}`;
  const n = Math.max(3, Math.round(w / 28));
  for (let i = 1; i <= n; i++) d += ` Q ${x + (w * (i - 0.5)) / n} ${y + (R() - 0.5) * 9} ${x + (w * i) / n} ${y + (R() - 0.5) * 3}`;
  return d;
};

/** Contenido del boceto segun el tipo de bloque. */
const sketchInner = (b: BlockSpec, seed: number) => {
  const { w, h } = b;
  const d: string[] = [];
  if (b.kind === 'image') d.push(`M 8 8 L ${w - 8} ${h - 8} M ${w - 8} 8 L 8 ${h - 8}`);
  if (b.kind === 'text' || b.kind === 'list') {
    const rows = Math.max(1, Math.min(6, Math.floor((h - 10) / 30)));
    for (let i = 0; i < rows; i++) d.push(scribble(14, 22 + i * ((h - 24) / rows), (w - 28) * (i % 2 ? 0.7 : 0.92), seed + i));
  }
  if (b.kind === 'title') d.push(scribble(10, h / 2, w * 0.8, seed));
  if (b.kind === 'chart') {
    const R = rand(seed);
    let p = `M 14 ${h - 20}`;
    for (let i = 1; i <= 6; i++) p += ` L ${14 + ((w - 28) * i) / 6} ${30 + R() * (h - 70)}`;
    d.push(p, `M 14 ${h - 12} L ${w - 12} ${h - 12}`);
  }
  if (b.kind === 'map') d.push(`M 30 ${h - 40} C ${w * 0.3} ${h * 0.4}, ${w * 0.6} ${h * 0.9}, ${w - 40} 40`, `M ${w - 40} 40 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0`);
  if (b.kind === 'input') d.push(scribble(16, h / 2, w * 0.4, seed));
  if (b.kind === 'button') d.push(scribble(w * 0.25, h / 2, w * 0.5, seed));
  if (b.kind === 'avatar') d.push(`M ${w / 2} ${h / 2} m -${w / 2.4} 0 a ${w / 2.4} ${w / 2.4} 0 1 0 ${w / 1.2} 0 a ${w / 2.4} ${w / 2.4} 0 1 0 -${w / 1.2} 0`);
  if (b.kind === 'nav') for (let i = 0; i < 5; i++) d.push(`M ${w / 2 - 10} ${30 + i * 60} l 20 0 l 0 20 l -20 0 z`);
  return d;
};

/** Placeholder gris segun el tipo (wireframe). */
const WireInner: FC<{ b: BlockSpec }> = ({ b }) => {
  const bar = (wPct: number, h = 12, mt = 10, c = WIRE_DARK): CSSProperties => ({ width: `${wPct}%`, height: h, borderRadius: 6, background: c, marginTop: mt });
  if (b.kind === 'text' || b.kind === 'list') {
    const rows = Math.max(1, Math.min(6, Math.floor((b.h - 16) / 34)));
    return (
      <div style={{ padding: 16 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={bar(i % 2 ? 62 : 88, 14, i ? 14 : 0)} />
        ))}
      </div>
    );
  }
  if (b.kind === 'title') return <div style={{ padding: '0 6px', height: '100%', display: 'flex', alignItems: 'center' }}><div style={bar(80, Math.min(26, b.h * 0.55), 0)} /></div>;
  if (b.kind === 'button')
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={bar(46, 12, 0, '#a9b3a4')} />
      </div>
    );
  if (b.kind === 'image' || b.kind === 'map' || b.kind === 'chart')
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${b.w} ${b.h}`} preserveAspectRatio="none">
        <path d={`M 0 0 L ${b.w} ${b.h} M ${b.w} 0 L 0 ${b.h}`} stroke={WIRE_DARK} strokeWidth={2} />
      </svg>
    );
  if (b.kind === 'input')
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <div style={bar(40, 10, 0)} />
      </div>
    );
  return null;
};

/** Franjas de "en construccion". */
export const Hazard: FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      background: `repeating-linear-gradient(-45deg, ${WIRE} 0 18px, #e7ebe4 18px 36px)`,
      border: `3px dashed ${WIRE_DARK}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <div style={{ fontFamily: HAND, fontSize: 30, fontWeight: 700, color: GRAPHITE, background: '#fff8', padding: '4px 14px', borderRadius: 10 }}>{label}</div>
  </div>
);

/** Un bloque de la pantalla con sus tres capas. */
export const Block: FC<{ b: BlockSpec; t: Phase; children?: ReactNode; noteSide?: 'in' | 'top' }> = ({ b, t, children, noteSide = 'in' }) => {
  const frame = useCurrentFrame();
  const seed = hash(b.id);
  if (frame < t.sketch) return null;
  const r = b.radius ?? 16;
  // Boceto
  const draw = kf(frame, [t.sketch, t.sketch + 18], [0, 1], EASE.out);
  const sketchOut = kf(frame, [t.wire, t.wire + 14], [1, 0], EASE.in);
  // Bloque
  const drop = sp(frame, t.wire, SPRING.pop);
  const wireOut = b.stay ? 1 : kf(frame, [t.paint + 6, t.paint + 22], [1, 0], EASE.in);
  // Diseno
  const wipe = b.stay ? 0 : kf(frame, [t.paint, t.paint + 18], [0, 1], EASE.inOut);
  const len = 2 * (b.w + b.h) + 60;
  // Lapiz: recorre el contorno mientras empieza el trazo de este bloque.
  const per = draw * 2 * (b.w + b.h);
  const pen =
    per < b.w ? { x: per, y: 0 } : per < b.w + b.h ? { x: b.w, y: per - b.w } : per < 2 * b.w + b.h ? { x: b.w - (per - b.w - b.h), y: b.h } : { x: 0, y: b.h - (per - 2 * b.w - b.h) };
  const showPen = frame < t.sketch + 8;
  return (
    <div style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h }}>
      {sketchOut > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: sketchOut }}>
          <svg width={b.w} height={b.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <path d={roughRect(b.w, b.h, seed, r)} stroke={GRAPHITE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} />
            <path
              d={roughRect(b.w, b.h, seed + 99, r)}
              stroke={GRAPHITE}
              strokeOpacity={0.35}
              strokeWidth={1.4}
              fill="none"
              strokeDasharray={`${len * Math.max(0, draw - 0.15)} ${len}`}
            />
            {sketchInner(b, seed).map((d, i) => (
              <path key={i} d={d} stroke={GRAPHITE} strokeOpacity={0.7} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - kf(frame, [t.sketch + 8 + i * 2, t.sketch + 26 + i * 2], [0, 1]))} />
            ))}
          </svg>
          {showPen && (
            <div style={{ position: 'absolute', left: pen.x - 4, top: pen.y - 44, zIndex: 50, filter: 'drop-shadow(0 6px 6px rgba(0,0,0,.3))' }}>
              <Pencil size={48} color={GRAPHITE} fill="#fbbf24" strokeWidth={1.8} />
            </div>
          )}
          {b.note && (
            <div
              style={{
                position: 'absolute',
                left: noteSide === 'top' ? 0 : 0,
                right: 0,
                top: noteSide === 'top' ? -46 : b.noteTop ? 14 : b.h / 2 - 22,
                textAlign: 'center',
                fontFamily: HAND,
                fontSize: Math.min(36, Math.max(24, b.h * 0.3)),
                fontWeight: 700,
                color: C.coral,
                opacity: kf(frame, [t.sketch + 12, t.sketch + 22], [0, 1]),
                transform: `rotate(${((seed % 5) - 2) * 0.8}deg)`,
                whiteSpace: 'nowrap'
              }}
            >
              {b.note}
            </div>
          )}
        </div>
      )}
      {frame >= t.wire && wireOut > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: r,
            background: b.kind === 'button' ? WIRE_DARK : WIRE,
            overflow: 'hidden',
            opacity: Math.min(1, drop * 1.5) * wireOut,
            transform: `translateY(${(1 - drop) * -46}px) rotate(${(1 - drop) * ((seed % 7) - 3)}deg)`
          }}
        >
          {b.stay ? <Hazard label={b.stay} /> : <WireInner b={b} />}
        </div>
      )}
      {wipe > 0 && (
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(-40px ${(1 - wipe) * 100}% -40px -40px)` }}>{children}</div>
      )}
    </div>
  );
};

/** Escalona las fases de una lista de bloques a partir de los inicios de cada fase. */
export const stagger = (start: { sketch: number; wire: number; paint: number }, i: number, step = { sketch: 7, wire: 5, paint: 6 }): Phase => ({
  sketch: start.sketch + i * step.sketch,
  wire: start.wire + i * step.wire,
  paint: start.paint + i * step.paint
});
