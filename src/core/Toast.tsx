// Toast de confirmacion con el look de sonner de la app.
import type { FC } from 'react';
import { CircleCheck } from 'lucide-react';
import { useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from './anim';

export const Toast: FC<{ at: number; out: number; text: string; x: number; y: number }> = ({ at, out, text, x, y }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 10], [0, 1], EASE.in);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 14px 36px -10px rgba(16,24,40,.25)',
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--heading-foreground)',
        opacity: Math.min(1, p * 1.5) * (1 - q),
        transform: `translateY(${(1 - p) * -24}px) scale(${0.92 + 0.08 * p})`,
        zIndex: 40
      }}
    >
      <CircleCheck size={18} color="#22a06b" />
      {text}
    </div>
  );
};
