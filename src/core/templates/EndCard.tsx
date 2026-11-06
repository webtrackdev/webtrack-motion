// Cierre: titular grande, frase de apoyo y logo de la plataforma.
import type { FC } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { SPRING, sp } from '../anim';
import { useBrand } from '../theme';
import { KineticText } from '../KineticText';

export const EndCard: FC<{
  title: string;
  highlight?: string[];
  subtitle?: string;
  fontSize?: number;
  /** Frames: titular, apoyo, logo. */
  at: { title: number; subtitle: number; logo: number };
}> = ({ title, highlight = [], subtitle, fontSize = 150, at }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const sub = sp(frame, at.subtitle);
  const logo = sp(frame, at.logo, SPRING.soft);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 }}>
      <KineticText text={title} start={at.title} highlight={highlight} style={{ fontSize, justifyContent: 'center' }} />
      {subtitle && (
        <div style={{ fontSize: 40, fontWeight: 600, color: brand.muted, letterSpacing: '-0.01em', opacity: sub, transform: `translateY(${(1 - sub) * 24}px)` }}>
          {subtitle}
        </div>
      )}
      {brand.logo && (
        <Img
          src={staticFile(brand.logo)}
          style={{ position: 'absolute', bottom: 70, height: 92, opacity: logo, transform: `translateY(${(1 - logo) * 16}px)` }}
        />
      )}
    </AbsoluteFill>
  );
};
