// Utilidades de tiempo y movimiento compartidas por todos los videos.
import { Easing, interpolate, spring, type SpringConfig } from 'remotion';

export const FPS = 30;

/** Segundos a frames. */
export const s = (sec: number) => Math.round(sec * FPS);

// Curvas: `out` para entradas, `inOut` para traslados, `cam` para la camara (arranque y
// frenado largos, como una grua).
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  cam: Easing.bezier(0.5, 0, 0.12, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45)
};

// Resortes: `smooth` sin rebote visible, `pop` con un rebote corto para elementos que
// "saltan" de la interfaz, `snappy` para clics.
export const SPRING: Record<string, Partial<SpringConfig>> = {
  soft: { damping: 200, stiffness: 90, mass: 1 },
  smooth: { damping: 24, stiffness: 120, mass: 0.9 },
  pop: { damping: 13, stiffness: 170, mass: 0.75 },
  snappy: { damping: 20, stiffness: 260, mass: 0.6 }
};

/** Progreso 0..1 de un resorte que arranca en `start`. */
export const sp = (frame: number, start: number, config: Partial<SpringConfig> = SPRING.smooth) =>
  spring({ frame: frame - start, fps: FPS, config });

/** Interpolacion por tramos con easing y sin extrapolar. */
export const kf = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = EASE.inOut
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Entrada y salida de un elemento: 0 antes de `inAt`, 1 visible, 0 despues de `outAt`. */
export const presence = (frame: number, inAt: number, outAt: number, dur = 12) =>
  Math.min(sp(frame, inAt, SPRING.smooth), 1 - kf(frame, [outAt, outAt + dur], [0, 1], EASE.in));
