// Tarjeta flotante que "sale" de la interfaz para destacar un beneficio.
import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { shadows, useBrand } from './theme';
import { EASE, SPRING, kf, sp } from './anim';

export const Callout: FC<{
  at: number;
  out?: number;
  x: number;
  y: number;
  icon: ReactNode;
  title: string;
  body?: string;
  tint?: string;
  width?: number;
}> = ({ at, out, x, y, icon, title, body, tint, width = 430 }) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const SHADOW = shadows(brand);
  const p = sp(frame, at, SPRING.pop);
  const q = out != null ? kf(frame, [out, out + 10], [0, 1], EASE.in) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        padding: '20px 24px',
        background: 'rgba(255,255,255,.96)',
        border: `1px solid ${brand.border}`,
        borderRadius: 22,
        boxShadow: SHADOW.float,
        opacity: Math.min(1, p * 1.5) * (1 - q),
        transform: `translateY(${(1 - p) * 40 - q * 20}px) scale(${0.82 + 0.18 * p - q * 0.06})`,
        transformOrigin: '0% 50%',
        fontFamily: brand.font
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          flex: 'none',
          borderRadius: 16,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background: `linear-gradient(135deg, ${tint ?? brand.primary}, ${brand.accent})`,
          boxShadow: SHADOW.lift
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 25, fontWeight: 800, color: brand.ink, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {title}
        </div>
        {body && (
          <div style={{ fontSize: 18, fontWeight: 600, color: brand.muted, marginTop: 4, lineHeight: 1.3 }}>{body}</div>
        )}
      </div>
    </div>
  );
};
