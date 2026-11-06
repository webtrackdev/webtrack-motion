// Cursor animado por waypoints, con arco natural, clic con pulsacion y onda.
import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useBrand } from './theme';
import { EASE, kf, lerp } from './anim';

export type Waypoint = { f: number; x: number; y: number; click?: boolean };

export const Cursor: FC<{ path: Waypoint[]; hideAt?: number; scale?: number }> = ({
  path,
  hideAt,
  scale = 1
}) => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  const first = path[0];
  const last = path[path.length - 1];

  let x = first.x;
  let y = first.y;
  if (frame >= last.f) {
    x = last.x;
    y = last.y;
  } else if (frame > first.f) {
    const i = path.findIndex((p, idx) => idx < path.length - 1 && frame >= p.f && frame < path[idx + 1].f);
    const a = path[i];
    const b = path[i + 1];
    const t = EASE.inOut((frame - a.f) / (b.f - a.f));
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    x = lerp(a.x, b.x, t);
    // Arco leve hacia arriba: un trazo recto se ve robotico.
    y = lerp(a.y, b.y, t) - Math.sin(Math.PI * t) * Math.min(60, dist * 0.12);
  }

  const clicks = path.filter((p) => p.click).map((p) => p.f + 2);
  let press = 1;
  let ripple: { r: number; o: number } | null = null;
  for (const c of clicks) {
    if (frame >= c - 1 && frame <= c + 10) press = Math.min(press, kf(frame, [c - 1, c + 2, c + 9], [1, 0.8, 1]));
    if (frame >= c && frame <= c + 22) {
      const t = (frame - c) / 22;
      ripple = { r: lerp(6, 46, EASE.out(t)), o: 0.45 * (1 - t) };
    }
  }

  const opacity = Math.min(
    kf(frame, [first.f - 8, first.f], [0, 1]),
    hideAt ? kf(frame, [hideAt, hideAt + 8], [1, 0]) : 1
  );

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 50, opacity }}>
      {ripple && (
        <div
          style={{
            position: 'absolute',
            left: x - ripple.r,
            top: y - ripple.r,
            width: ripple.r * 2,
            height: ripple.r * 2,
            borderRadius: '50%',
            background: brand.primary,
            opacity: ripple.o
          }}
        />
      )}
      <svg
        width={30 * scale}
        height={36 * scale}
        viewBox="0 0 30 36"
        style={{
          position: 'absolute',
          left: x - 4 * scale,
          top: y - 3 * scale,
          transform: `scale(${press})`,
          transformOrigin: '4px 3px',
          filter: 'drop-shadow(0 6px 10px rgba(15,23,40,.35))'
        }}
      >
        <path
          d="M4 3 L4 28 L10.5 21.8 L14.6 31.2 L19 29.3 L15 20.2 L23.5 20.2 Z"
          fill="#fff"
          stroke={brand.ink}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
