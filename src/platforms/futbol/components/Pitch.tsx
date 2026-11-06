// Fondo de cancha: lineas suaves del area y del circulo central.
import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';

export const PitchLines: FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <AbsoluteFill style={{ opacity }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <g fill="none" stroke="#cfe3d6" strokeWidth={6}>
        <rect x={360} y={-40} width={1200} height={420} rx={4} />
        <rect x={660} y={-40} width={600} height={180} rx={4} />
        <path d="M 760 380 A 200 200 0 0 0 1160 380" />
        <circle cx={960} cy={1240} r={260} />
        <line x1={-20} y1={980} x2={1940} y2={980} />
      </g>
      <circle cx={960} cy={270} r={8} fill="#cfe3d6" />
    </svg>
  </AbsoluteFill>
);
