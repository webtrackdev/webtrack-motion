// Linea de ruta que se dibuja con el tiempo, con flechas de sentido que avanzan.
import type { FC } from 'react';
import { evolvePath, getLength } from '@remotion/paths';
import { pointAt } from '../../../core/geo';

export const RouteLine: FC<{
  d: string;
  /** 0..1 cuanto del trazo esta dibujado. */
  progress: number;
  color: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
  /** Frame actual para animar las flechas; sin el, no hay flechas. */
  flowFrame?: number;
  glow?: boolean;
}> = ({ d, progress, color, width = 7, opacity = 1, dashed, flowFrame, glow }) => {
  if (progress <= 0) return null;
  const evo = evolvePath(progress, d);
  const len = getLength(d);
  const arrows: { x: number; y: number; angle: number }[] = [];
  if (flowFrame != null) {
    const gap = 64;
    const shift = (flowFrame * 2.2) % gap;
    for (let at = shift + 20; at < len * progress - 14; at += gap) arrows.push(pointAt(d, at / len));
  }
  return (
    <g opacity={opacity}>
      <path d={d} stroke="#ffffff" strokeWidth={width + 6} fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
      <path
        d={d}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? '2 12' : evo.strokeDasharray}
        strokeDashoffset={dashed ? 0 : evo.strokeDashoffset}
        style={glow ? { filter: `drop-shadow(0 4px 10px ${color}66)` } : undefined}
      />
      {arrows.map((a, i) => (
        <path
          key={i}
          d="M -4 -4.5 L 2 0 L -4 4.5"
          transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`}
          stroke="#fff"
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};
