// Mapa urbano estilizado (vectorial, sin teselas): manzanas, calles, parques y agua.
// Determinista: misma semilla, mismo mapa en cada frame.
import { memo, type FC } from 'react';

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export type Avenue = { d: string; width?: number };
export type MapLabel = { x: number; y: number; text: string; rotate?: number; size?: number; weight?: number };

const COLORS = {
  land: '#eceff4',
  block: '#e4e8ef',
  road: '#ffffff',
  casing: '#d9dee7',
  park: '#d7eedd',
  water: '#cfe0f6',
  label: '#8a93a6'
};

export const MapBase: FC<{ width: number; height: number; avenues: Avenue[]; labels?: MapLabel[]; seed?: number }> = memo(
  ({ width, height, avenues, labels = [], seed = 7 }) => {
    const r = rng(seed);
    const pad = 300;
    const minor: string[] = [];
    for (let x = -pad; x < width + pad; x += 70 + r() * 40) {
      const skew = (r() - 0.5) * 40;
      minor.push(`M ${x} ${-pad} L ${x + skew} ${height + pad}`);
    }
    for (let y = -pad; y < height + pad; y += 62 + r() * 34) {
      const skew = (r() - 0.5) * 40;
      minor.push(`M ${-pad} ${y} L ${width + pad} ${y + skew}`);
    }
    const parks = Array.from({ length: 7 }, () => ({
      x: r() * width,
      y: r() * height,
      w: 70 + r() * 120,
      h: 50 + r() * 90
    }));
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <rect width={width} height={height} fill={COLORS.land} />
        {/* Agua: un lago y un rio */}
        <path
          d={`M ${width * 0.62} -20 C ${width * 0.7} ${height * 0.18}, ${width * 0.9} ${height * 0.1}, ${width + 20} ${height * 0.28} L ${width + 20} -20 Z`}
          fill={COLORS.water}
        />
        <path
          d={`M -20 ${height * 0.82} C ${width * 0.15} ${height * 0.78}, ${width * 0.3} ${height * 0.95}, ${width * 0.45} ${height + 20}`}
          stroke={COLORS.water}
          strokeWidth={34}
          fill="none"
        />
        {parks.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={18} fill={COLORS.park} />
        ))}
        <g transform={`rotate(-7 ${width / 2} ${height / 2})`}>
          {minor.map((d, i) => (
            <path key={i} d={d} stroke={COLORS.road} strokeWidth={5} fill="none" opacity={0.9} />
          ))}
        </g>
        {avenues.map((a, i) => (
          <g key={i}>
            <path d={a.d} stroke={COLORS.casing} strokeWidth={(a.width ?? 14) + 5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={a.d} stroke={COLORS.road} strokeWidth={a.width ?? 14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
            fill={COLORS.label}
            fontSize={l.size ?? 12}
            fontWeight={l.weight ?? 600}
            letterSpacing={0.3}
            style={{ paintOrder: 'stroke', stroke: COLORS.land, strokeWidth: 4 }}
          >
            {l.text}
          </text>
        ))}
      </svg>
    );
  }
);
