// Pin de checkpoint con la forma del editor de rutas (gota rotada) y radio de geocerca.
import type { FC, ReactNode } from 'react';

export const Pin: FC<{ x: number; y: number; color: string; scale: number; children?: ReactNode; radius?: number }> = ({
  x,
  y,
  color,
  scale,
  children,
  radius = 34
}) => {
  if (scale <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 5 }}>
      <div
        style={{
          position: 'absolute',
          left: -radius,
          top: -radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '50%',
          background: `${color}1f`,
          border: `1.5px solid ${color}55`,
          transform: `scale(${scale})`
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -15,
          top: -38,
          width: 30,
          height: 30,
          transform: `scale(${scale})`,
          transformOrigin: '50% 125%'
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            background: color,
            border: '2.5px solid #fff',
            boxShadow: '0 6px 14px -4px rgba(15,23,40,.45)',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <div style={{ transform: 'rotate(45deg)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
