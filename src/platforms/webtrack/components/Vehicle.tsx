// Unidad en movimiento sobre una ruta, orientada segun el sentido de avance.
import type { FC } from 'react';
import { Navigation2 } from 'lucide-react';
import { pointAt } from '../../../core/geo';

export const Vehicle: FC<{ d: string; t: number; color: string; frame: number; opacity?: number }> = ({
  d,
  t,
  color,
  frame,
  opacity = 1
}) => {
  if (opacity <= 0) return null;
  const p = pointAt(d, t);
  const pulse = (frame % 36) / 36;
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, width: 0, height: 0, zIndex: 8, opacity }}>
      <div
        style={{
          position: 'absolute',
          left: -26,
          top: -26,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: color,
          opacity: 0.28 * (1 - pulse),
          transform: `scale(${0.6 + pulse * 0.9})`
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -17,
          top: -17,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: color,
          border: '3px solid #fff',
          boxShadow: '0 8px 18px -6px rgba(15,23,40,.5)',
          display: 'grid',
          placeItems: 'center',
          transform: `rotate(${p.angle + 90}deg)`
        }}
      >
        <Navigation2 size={16} color="#fff" fill="#fff" />
      </div>
    </div>
  );
};
