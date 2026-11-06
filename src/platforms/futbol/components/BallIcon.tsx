// Balon 2D (iconos de las tarjetas de errores).
import type { FC } from 'react';

export const BallIcon: FC<{ x: number; y: number; r: number; rotate?: number }> = ({ x, y, r, rotate = 0 }) => {
  const pent = (cx: number, cy: number, rr: number, rot: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = ((rot + i * 72 - 90) * Math.PI) / 180;
      return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
    }).join(' ');
  return (
    <g transform={`rotate(${rotate} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r} fill="#f7f8f6" stroke="#0b1a12" strokeWidth={4} />
      <polygon points={pent(x, y, r * 0.34, 0)} fill="#111614" />
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <polygon key={a} points={pent(x + Math.cos(rad) * r * 0.86, y + Math.sin(rad) * r * 0.86, r * 0.26, a + 36)} fill="#111614" />;
      })}
      <circle cx={x} cy={y} r={r} fill="none" stroke="#0b1a12" strokeWidth={4} />
    </g>
  );
};
