// Fondo limpio con dos halos de color de marca que derivan lento.
import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hexA, useBrand } from './theme';

export const Backdrop: FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const t = frame / 30;
  const a = { x: 22 + Math.sin(t * 0.35) * 6, y: 18 + Math.cos(t * 0.3) * 5 };
  const b = { x: 80 + Math.cos(t * 0.28) * 6, y: 86 + Math.sin(t * 0.33) * 5 };
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 70% at ${a.x}% ${a.y}%, ${hexA(brand.primary, 0.1 * intensity)}, transparent 70%),
                     radial-gradient(55% 65% at ${b.x}% ${b.y}%, ${hexA(brand.accent, 0.1 * intensity)}, transparent 70%),
                     linear-gradient(180deg, #fbfbfe, ${brand.bg})`
      }}
    />
  );
};
