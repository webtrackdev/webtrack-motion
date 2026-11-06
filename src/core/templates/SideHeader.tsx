// Encabezado de escena en la columna izquierda: etiqueta en pildora, titular cinetico y una
// frase de apoyo. Para videos que explican varias cosas una por una (pasos o mejoras).
import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../anim';
import { hexA, useBrand } from '../theme';
import { KineticText } from '../KineticText';

export const SideHeader: FC<{
  tag: string;
  icon?: ReactNode;
  title: string;
  body: string;
  at: number;
  out: number;
  x?: number;
  y?: number;
  width?: number;
  titleSize?: number;
}> = ({ tag, icon, title, body, at, out, x = 130, y = 300, width = 640, titleSize = 80 }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  if (frame < at - 2 || frame > out + 14) return null;
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 12], [0, 1], EASE.in);
  const b = sp(frame, at + 14);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width, opacity: 1 - q, transform: `translateY(${-q * 20}px)` }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 18px',
          marginBottom: 22,
          borderRadius: 999,
          background: hexA(brand.primary, 0.09),
          color: brand.primary,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.12em',
          opacity: Math.min(1, p * 1.5),
          transform: `scale(${0.7 + 0.3 * p})`,
          transformOrigin: '0% 50%'
        }}
      >
        {icon}
        {tag}
      </div>
      <KineticText text={title} start={at + 4} out={out} style={{ fontSize: titleSize, lineHeight: 1.04 }} />
      <div style={{ marginTop: 24, fontSize: 32, fontWeight: 600, lineHeight: 1.35, color: brand.muted, opacity: b * (1 - q), transform: `translateY(${(1 - b) * 16}px)` }}>{body}</div>
    </div>
  );
};
