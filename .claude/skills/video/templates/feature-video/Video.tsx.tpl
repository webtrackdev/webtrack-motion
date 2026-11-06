// Video de funcionalidad: __TITLE__ (__REF__). Solo titulo y de una a los detalles.
// Generado por scripts/new-video.mjs: ajusta los TODO. Reglas de calidad:
// .claude/skills/video/references/calidad-diseno.md
import { useRef } from 'react';
import { Check, X__LUCIDE_IMPORT__ } from 'lucide-react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SPRING, kf, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { useAnchors } from '../../../../core/anchors';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';__ICON_IMPORT__
import { Screen, type ScreenState } from './Screen';
import '../../style.css';

// Tiempos del cuerpo en frames a 30 fps (el cuerpo arranca despues de la entrada).
const T = {
  clickA: 48, // TODO: primer clic (abre algo)
  clickB: 104, // TODO: segundo clic (el cambio que muestra el PR)
  result: 112, // TODO: el resultado ya se ve
  callouts: [208, 224],
  calloutsOut: 296,
  winOut: 304,
  end: { title: 314, subtitle: 330, logo: 344 }
};
const BODY_DURATION = 400;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });

  const s: ScreenState = {
    frame,
    open: frame < T.clickA + 2 ? 0 : Math.min(sp(frame, T.clickA + 2, SPRING.snappy), 1 - kf(frame, [T.clickB + 3, T.clickB + 9], [0, 1])),
    changed: frame >= T.clickB + 3,
    pressA: pulse(frame, T.clickA),
    pressB: pulse(frame, T.clickB),
    glow: kf(frame, [T.result, T.result + 12, T.result + 70, T.result + 86], [0, 1, 1, 0])
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickA - 28, ...A('btn-a', 160, 120) },
    { f: T.clickA, ...A('btn-a'), click: true },
    { f: T.clickB, ...A('btn-b'), click: true },
    { f: T.clickB + 32, ...A('btn-b', 100, 130) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px): zoom 1.6-1.9 sobre el foco.
  const focus = uiToStage(720, 405); // TODO: punto de la UI donde ocurre la accion (centro por defecto)
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 14, fx: 960, fy: 540, z: 1 },
    { f: 40, fx: focus.x, fy: focus.y, z: 1.8 },
    { f: 196, fx: focus.x, fy: focus.y, z: 1.8, rx: 0, ry: 0 },
    { f: 226, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 304, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <Screen s={s} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.clickB + 38} scale={0.85} />}
          </AppWindow>
          {/* Callouts sobre una zona NO esencial; stage = fx + (pantalla - 960) / z */}
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1480} y={340} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="__ANTES__" />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1510} y={520} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="__AHORA__" />
        </Camera>
      </AbsoluteFill>

      <Caption at={30} out={T.clickB - 4} text="TODO: primera accion" />
      <Caption at={T.clickB} out={T.result + 90} text="TODO: el cambio" />

      {frame >= T.winOut && <EndCard title="__END_TITLE__" highlight={['__END_HIGHLIGHT__']} subtitle="__END_SUBTITLE__" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const __NAME__ = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="__TITLE__" badge="__BADGE__" icon={__ICON_JSX__} />
  </AbsoluteFill>
);
