// Geometria de rutas: trazo con esquinas redondeadas y muestreo sobre el path.
import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';

export type Pt = [number, number];

/** Polilinea a path SVG con esquinas redondeadas (radio r). */
export const roundedPath = (pts: Pt[], r = 36): string => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py);
    const l2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = cx - ((cx - px) / l1) * rr;
    const ay = cy - ((cy - py) / l1) * rr;
    const bx = cx + ((nx - cx) / l2) * rr;
    const by = cy + ((ny - cy) / l2) * rr;
    d += ` L ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
};

/** Punto y angulo (grados) en la fraccion t del path. */
export const pointAt = (d: string, t: number) => {
  const len = getLength(d);
  const at = Math.max(0, Math.min(len, len * t));
  const p = getPointAtLength(d, at)!;
  const tan = getTangentAtLength(d, at)!;
  return { x: p.x, y: p.y, angle: (Math.atan2(tan.y, tan.x) * 180) / Math.PI };
};

/** Fraccion del path mas cercana a un punto (para saber cuando el trazo llega a un checkpoint). */
export const progressOf = (d: string, x: number, y: number, samples = 400) => {
  const len = getLength(d);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= samples; i++) {
    const p = getPointAtLength(d, (len * i) / samples)!;
    const dist = Math.hypot(p.x - x, p.y - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i / samples;
    }
  }
  return best;
};
