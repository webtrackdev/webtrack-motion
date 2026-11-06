// Camara: enfoca un punto del escenario con zoom e inclinacion 3D entre keyframes.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE, kf } from './anim';

export type CamKey = {
  f: number;
  /** Punto del escenario (px) que queda al centro del cuadro. */
  fx?: number;
  fy?: number;
  /** Zoom. */
  z?: number;
  /** Inclinacion en grados. */
  rx?: number;
  ry?: number;
  rz?: number;
};

const track = (keys: CamKey[], prop: keyof CamKey, fallback: number, frame: number) => {
  const pts: { f: number; v: number }[] = [];
  let last = fallback;
  for (const k of keys) {
    const v = (k[prop] as number | undefined) ?? last;
    last = v;
    pts.push({ f: k.f, v });
  }
  if (pts.length === 1) return pts[0].v;
  return kf(
    frame,
    pts.map((p) => p.f),
    pts.map((p) => p.v),
    EASE.cam
  );
};

export const Camera: FC<{ keys: CamKey[]; children: ReactNode; perspective?: number }> = ({
  keys,
  children,
  perspective = 2600
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fx = track(keys, 'fx', width / 2, frame);
  const fy = track(keys, 'fy', height / 2, frame);
  const z = track(keys, 'z', 1, frame);
  const rx = track(keys, 'rx', 0, frame);
  const ry = track(keys, 'ry', 0, frame);
  const rz = track(keys, 'rz', 0, frame);
  // Con origen al centro, el punto (fx, fy) queda al centro si se traslada -z*(p - c).
  const tx = -z * (fx - width / 2);
  const ty = -z * (fy - height / 2);
  return (
    <AbsoluteFill
      style={{
        transformOrigin: '50% 50%',
        transform: `perspective(${perspective}px) translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${z})`
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
