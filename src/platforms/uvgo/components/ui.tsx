// Piezas de interfaz de los videos de UVGo: paneles de vidrio, filas de explicacion,
// arbol de carpetas, fichas de patrones y logos de tecnologias.
// Paleta tomada de src/styles/theme.ts del repo UVGo (fondo verde-crema, acento coral).
import type { CSSProperties, FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { Folder } from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../core/anim';
import { TECH_PATHS } from './techPaths';

export const C = {
  bg: '#dfe6dc',
  mint: '#b8d4b6',
  cream: '#f7eee1',
  ivory: '#fbf4ea',
  ink: '#171717',
  strong: '#0a0a0a',
  muted: '#525252',
  faint: '#737373',
  border: '#d4d4d4',
  green: '#1d411b',
  leaf: '#4f9a3f',
  logoDark: '#0b5a45',
  coral: '#e07a5f',
  sky: '#0ea5e9',
  deepSky: '#0369a1',
  amber: '#fbbf24',
  amberDeep: '#b45309',
  red: '#ef4444',
  hair: 'rgba(82, 82, 82, 0.1)'
};

/** Color de cada capa del sistema (se repite en mapa, paneles y resumen). */
export const LAYER = {
  web: C.coral,
  server: C.green,
  data: C.deepSky,
  azure: C.sky,
  external: C.amberDeep,
  pilot: '#c2410c'
};

export const LAYOUT_BG = `linear-gradient(180deg, ${C.mint} 0%, ${C.cream} 55%, ${C.ivory} 100%)`;

export const mono = 'ui-monospace, "SF Mono", Menlo, monospace';

/** Logo de una tecnologia (Simple Icons) dentro de una ficha redonda de su color. */
export const TechLogo: FC<{ name: string; color: string; size?: number; bg?: string }> = ({ name, color, size = 64, bg = '#fff' }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 24px -12px rgba(0,0,0,.35), inset 0 0 0 1px rgba(0,0,0,.05)',
      flexShrink: 0
    }}
  >
    <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58}>
      <path d={TECH_PATHS[name]} fill={color} />
    </svg>
  </div>
);

/** Entrada y salida de un bloque: devuelve opacidad y desplazamiento. */
export const useEnter = (at: number, out?: number, dist = 40) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.smooth);
  const q = out != null ? kf(frame, [out, out + 12], [0, 1], EASE.in) : 0;
  return {
    visible: frame >= at - 1 && (out == null || frame <= out + 13),
    style: { opacity: Math.min(1, p * 1.3) * (1 - q), transform: `translateY(${(1 - p) * dist - q * 16}px)` } as CSSProperties,
    p,
    q
  };
};

/** Panel de vidrio de una parada: numero, etiqueta, titulo y pestanas de la parada. */
export const StationPanel: FC<{
  at: number;
  out: number;
  num: string;
  eyebrow: string;
  title: string;
  color: string;
  tabs?: { label: string; from: number }[];
  left?: number;
  width?: number;
  children: ReactNode;
}> = ({ at, out, num, eyebrow, title, color, tabs = [], left = 990, width = 870, children }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.smooth);
  const q = kf(frame, [out, out + 14], [0, 1], EASE.in);
  if (frame < at - 1 || frame > out + 15) return null;
  const active = tabs.reduce((acc, t, i) => (frame >= t.from ? i : acc), 0);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 78,
        width,
        height: 924,
        borderRadius: 40,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 40px 90px -30px rgba(23,23,23,.35), inset 0 0 0 1.5px rgba(255,255,255,.9)',
        padding: '40px 46px',
        opacity: Math.min(1, p * 1.4) * (1 - q),
        transform: `translateX(${(1 - p) * 120 + q * 60}px) scale(${0.96 + 0.04 * p})`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: color,
            color: '#fff',
            fontSize: 26,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 12px 26px -10px ${color}`
          }}
        >
          {num}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color, textTransform: 'uppercase' }}>{eyebrow}</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink, lineHeight: 1.1 }}>{title}</div>
        </div>
      </div>
      {tabs.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
          {tabs.map((t, i) => (
            <div
              key={t.label}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 700,
                background: i === active ? color : 'rgba(23,23,23,.06)',
                color: i === active ? '#fff' : C.faint,
                transition: 'none'
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative', flex: 1, marginTop: 30 }}>{children}</div>
    </div>
  );
};

/** Bloque que vive dentro de un panel entre `at` y `out` (las pestanas se cambian asi). */
export const Step: FC<{ at: number; out: number; children: ReactNode }> = ({ at, out, children }) => {
  const e = useEnter(at, out, 30);
  if (!e.visible) return null;
  return <div style={{ position: 'absolute', inset: 0, ...e.style }}>{children}</div>;
};

/** Fila "Qué / Por qué / Dónde". */
export const InfoRow: FC<{ at: number; label: string; color: string; text: ReactNode; icon?: ReactNode }> = ({ at, label, color, text, icon }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.smooth);
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        padding: '20px 24px',
        borderRadius: 24,
        background: 'rgba(255,255,255,.75)',
        boxShadow: `inset 0 0 0 1.5px ${C.hair}`,
        opacity: Math.min(1, p * 1.4),
        transform: `translateX(${(1 - p) * 50}px)`
      }}
    >
      <div
        style={{
          minWidth: 132,
          height: 44,
          padding: '0 16px',
          borderRadius: 14,
          background: `${color}1f`,
          color,
          fontSize: 21,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center'
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 27, lineHeight: 1.36, color: C.ink, fontWeight: 500, paddingTop: 3 }}>{text}</div>
    </div>
  );
};

/** Arbol de carpetas: nombre en monoespaciada y para que sirve. */
export const FolderTree: FC<{ at: number; root: string; color: string; items: { name: string; text: string }[]; gap?: number }> = ({
  at,
  root,
  color,
  items,
  gap = 9
}) => {
  const frame = useCurrentFrame();
  const r = sp(frame, at, SPRING.smooth);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: r, fontFamily: mono, fontSize: 26, fontWeight: 700, color: C.ink }}>
        <Folder size={30} color={color} fill={`${color}33`} strokeWidth={2.2} />
        {root}
      </div>
      <div style={{ position: 'relative', paddingLeft: 34, display: 'flex', flexDirection: 'column', gap }}>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 0,
            width: 2.5,
            borderRadius: 2,
            background: `${color}55`,
            height: `${kf(frame, [at + 4, at + 4 + items.length * 7], [0, 100])}%`
          }}
        />
        {items.map((it, i) => {
          const p = sp(frame, at + 8 + i * 7, SPRING.pop);
          return (
            <div
              key={it.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: Math.min(1, p * 1.5),
                transform: `translateX(${(1 - p) * 40}px)`
              }}
            >
              <div style={{ width: 18, height: 2.5, background: `${color}55`, marginLeft: -20 }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 250,
                  padding: '8px 14px',
                  borderRadius: 14,
                  background: `${color}14`,
                  fontFamily: mono,
                  fontSize: 23,
                  fontWeight: 700,
                  color: C.ink
                }}
              >
                <Folder size={24} color={color} fill={`${color}40`} strokeWidth={2.2} />
                {it.name}
              </div>
              <div style={{ fontSize: 23, lineHeight: 1.3, color: C.muted, fontWeight: 500 }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Ficha de un patron de diseno: nombre y para que sirve. */
export const PatternChip: FC<{ at: number; name: string; text: string; color: string; icon: ReactNode; where?: string }> = ({
  at,
  name,
  text,
  color,
  icon,
  where
}) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '16px 18px',
        borderRadius: 22,
        background: '#fff',
        boxShadow: `0 14px 30px -20px rgba(23,23,23,.45), inset 0 0 0 1.5px ${C.hair}`,
        opacity: Math.min(1, p * 1.5),
        transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 20}px)`
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 15,
          background: `${color}1c`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 23, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{name}</div>
        <div style={{ fontSize: 20, lineHeight: 1.3, color: C.muted, fontWeight: 500, marginTop: 3 }}>{text}</div>
        {where && <div style={{ fontFamily: mono, fontSize: 17, color, fontWeight: 700, marginTop: 6 }}>{where}</div>}
      </div>
    </div>
  );
};

/** Pildora pequena con texto (etiquetas de canales, tablas, estados). */
export const Pill: FC<{ children: ReactNode; color: string; solid?: boolean; style?: CSSProperties }> = ({ children, color, solid, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: 999,
      fontSize: 21,
      fontWeight: 700,
      background: solid ? color : `${color}1c`,
      color: solid ? '#fff' : color,
      whiteSpace: 'nowrap',
      ...style
    }}
  >
    {children}
  </div>
);
