// Ventana de la app flotando en el escenario. Adentro se trabaja en px reales de la UI
// (1440x810, un viewport de escritorio) y la ventana escala al cuadro.
import type { CSSProperties, FC, ReactNode } from 'react';
import { spring } from 'remotion';
import { EASE, FPS, kf } from './anim';
import { shadows, useBrand } from './theme';

export const UI_W = 1440;
export const UI_H = 810;
export const WIN_SCALE = 1.16;

/** Convierte un punto de la UI a coordenadas del escenario 1920x1080. */
export const uiToStage = (x: number, y: number, stageW = 1920, stageH = 1080) => ({
  x: stageW / 2 + (x - UI_W / 2) * WIN_SCALE,
  y: stageH / 2 + (y - UI_H / 2) * WIN_SCALE
});

export const AppWindow: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => {
  const brand = useBrand();
  return (
  <div
    style={{
      position: 'absolute',
      left: (1920 - UI_W) / 2,
      top: (1080 - UI_H) / 2,
      width: UI_W,
      height: UI_H,
      transform: `scale(${WIN_SCALE})`,
      transformOrigin: '50% 50%',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: shadows(brand).window,
      outline: '1px solid rgba(15,23,40,.08)',
      background: '#eef1f6',
      ...style
    }}
  >
    {children}
  </div>
  );
};

/** Movimiento estandar de la ventana: sube en 3D al entrar y se desenfoca al salir. */
export const windowMotion = (frame: number, inAt: number, outAt: number): CSSProperties => {
  const p = spring({ frame: frame - inAt, fps: FPS, config: { damping: 20, stiffness: 70, mass: 1 } });
  const out = kf(frame, [outAt, outAt + 22], [0, 1], EASE.in);
  return {
    transform: `translateY(${(1 - p) * 760 + out * -40}px) rotateX(${(1 - p) * 28}deg) scale(${(0.88 + 0.12 * p) * (1 - out * 0.12)})`,
    opacity: Math.min(1, p * 2) * (1 - out),
    filter: out > 0 ? `blur(${out * 14}px)` : undefined
  };
};
