// Gancho inicial: etiqueta en pildora y titular en dos lineas que entra palabra por palabra.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { kf, sp } from '../anim';
import { hexA, useBrand } from '../theme';
import { KineticText } from '../KineticText';

export const Hook: FC<{
  tag: string;
  tagIcon?: ReactNode;
  lines: [string, string];
  /** Palabras de la segunda linea con el degradado de marca. */
  highlight?: string[];
  fontSize?: number;
  /** Frames: etiqueta, linea 1, linea 2, salida. */
  at?: { tag: number; line1: number; line2: number; out: number };
}> = ({ tag, tagIcon, lines, highlight = [], fontSize = 120, at = { tag: 6, line1: 12, line2: 26, out: 74 } }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const p = sp(frame, at.tag);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 20px',
          borderRadius: 999,
          background: hexA(brand.primary, 0.08),
          color: brand.primary,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.08em',
          opacity: Math.min(p, 1 - kf(frame, [at.out, at.out + 10], [0, 1])),
          transform: `translateY(${(1 - p) * 20}px)`
        }}
      >
        {tagIcon}
        {tag}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <KineticText text={lines[0]} start={at.line1} out={at.out} style={{ fontSize, justifyContent: 'center' }} />
        <KineticText text={lines[1]} start={at.line2} out={at.out + 3} highlight={highlight} style={{ fontSize, justifyContent: 'center' }} />
      </div>
    </AbsoluteFill>
  );
};
