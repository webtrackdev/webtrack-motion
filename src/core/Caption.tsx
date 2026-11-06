// Subtitulo tipo "pildora" en la parte baja del cuadro.
import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { hexA, useBrand } from './theme';
import { EASE, SPRING, kf, sp } from './anim';

export const Caption: FC<{ at: number; out: number; text: string; y?: number }> = ({ at, out, text, y = 958 }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 9], [0, 1], EASE.in);
  if (frame < at - 1 || frame > out + 10) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', zIndex: 60 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 30px 16px 22px',
          borderRadius: 999,
          background: 'rgba(15,23,40,.88)',
          color: '#fff',
          fontFamily: brand.font,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.015em',
          boxShadow: '0 20px 50px -16px rgba(15,23,40,.5)',
          opacity: Math.min(1, p * 1.6) * (1 - q),
          transform: `translateY(${(1 - p) * 30 + q * 14}px) scale(${0.9 + 0.1 * p})`
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 99,
            background: `linear-gradient(135deg, ${brand.primarySoft ?? hexA(brand.primary, 0.65)}, ${brand.accent})`,
            boxShadow: `0 0 0 5px ${hexA(brand.primarySoft ?? brand.primary, 0.25)}`
          }}
        />
        {text}
      </div>
    </div>
  );
};
