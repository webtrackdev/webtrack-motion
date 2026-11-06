// Video de funcionalidad: en Jobs > Calendario, los jobs sin responsable tienen su fila
// "Sin asignar" y el filtro Responsable > Sin asignar ya filtra (DevDatabase#365, front en
// reactive#1754). Solo titulo y de una a los detalles.
import { useRef } from 'react';
import { Check, X } from 'lucide-react';
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
import { fontFamily, waitUntilDone } from '../../fonts';
import { IcoIcon } from '../../components/IcoIcon';
import { CHIPS_H, PICK_DAY, SinAsignarScreen, type SinAsignarState } from './Screen';
import '../../style.css';

const T = {
  scrollDown: [30, 56] as const,
  glow: [52, 114] as const,
  scrollUp: [114, 134] as const,
  clickResp: 148,
  clickOpt: 178,
  closePop: 198,
  scrollDetail: [202, 228] as const,
  clickCell: 240,
  callouts: [336, 352],
  calloutsOut: 420,
  winOut: 428,
  end: { title: 438, subtitle: 454, logo: 468 }
};
const BODY_DURATION = 524;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const box = (n: string) => anchors?.[n];

  // Desplazamientos de la pagina: ver la fila nueva, volver a los filtros, bajar al detalle.
  const rowY = box('row-unassigned')?.y ?? 760;
  // Las anclas se miden sin la fila de chips; al filtrar la pagina baja CHIPS_H px.
  const cellY = (box(`fcell-${PICK_DAY}`)?.y ?? 640) + CHIPS_H;
  const S1 = Math.max(0, rowY + 52 + 30 - 810);
  const S2 = Math.max(0, cellY - 170);
  const scroll = kf(frame, [T.scrollDown[0], T.scrollDown[1], T.scrollUp[0], T.scrollUp[1], T.scrollDetail[0], T.scrollDetail[1]], [0, S1, S1, 0, 0, S2]);

  const at = (n: string, dx: number, dy: number, sc: number) => {
    const b = box(n);
    return b ? { x: b.cx + dx, y: b.cy + dy - sc } : { x: 720, y: 405 };
  };
  const left = (n: string, dx: number, sc: number) => {
    const b = box(n);
    return b ? { x: b.x + dx, y: b.cy - sc } : { x: 720, y: 405 };
  };

  const filtered = frame >= T.clickOpt + 2;
  const s: SinAsignarState = {
    frame,
    scroll,
    rowGlow: kf(frame, [T.glow[0], T.glow[0] + 10, T.glow[1] - 12, T.glow[1]], [0, 1, 1, 0]),
    popover: frame < T.clickResp + 2 ? 0 : Math.min(sp(frame, T.clickResp + 2, SPRING.snappy), 1 - kf(frame, [T.closePop, T.closePop + 6], [0, 1])),
    hoverOption: frame >= T.clickOpt - 12 && frame < T.clickOpt + 2 ? 0 : null,
    filtered,
    chips: filtered ? Math.min(1, sp(frame, T.clickOpt + 2, SPRING.snappy)) : 0,
    triggerPress: pulse(frame, T.clickResp),
    cellPicked: frame >= T.clickCell + 2,
    detail: frame < T.clickCell + 2 ? 0 : sp(frame, T.clickCell + 2, SPRING.smooth)
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: 104, ...at('f-resp', 220, 240, 0) },
    { f: T.clickResp, ...left('f-resp', 60, 0), click: true },
    { f: T.clickOpt, ...left('opt-0', 90, 0), click: true },
    { f: T.closePop, ...at('f-resp', 420, 40, 0) },
    { f: T.clickCell, ...at(`fcell-${PICK_DAY}`, 0, CHIPS_H, S2), click: true },
    { f: T.clickCell + 32, ...at(`fcell-${PICK_DAY}`, 120, 130 + CHIPS_H, S2) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px).
  const rowFocus = uiToStage(600, rowY - S1 - 40);
  const respB = box('f-resp');
  const filterFocus = uiToStage((respB?.x ?? 620) + 140, (respB?.cy ?? 230) + 150);
  const detailFocus = uiToStage(640, cellY - S2 + 150);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 18, fx: 960, fy: 540, z: 1 },
    { f: 56, fx: rowFocus.x, fy: rowFocus.y, z: 1.6 },
    { f: 112, fx: rowFocus.x, fy: rowFocus.y, z: 1.6 },
    { f: 138, fx: filterFocus.x, fy: filterFocus.y, z: 1.75 },
    { f: 200, fx: filterFocus.x, fy: filterFocus.y, z: 1.75 },
    { f: 230, fx: detailFocus.x, fy: detailFocus.y, z: 1.5 },
    { f: 326, fx: detailFocus.x, fy: detailFocus.y, z: 1.5, rx: 0, ry: 0 },
    { f: 354, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 428, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <SinAsignarScreen s={s} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.clickCell + 38} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1480} y={340} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="«Sin asignar» no filtraba y esos jobs no salían en ninguna fila." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1510} y={520} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Tienen su propia fila, se filtran y abren su detalle." />
        </Camera>
      </AbsoluteFill>

      <Caption at={38} out={112} text="Los jobs sin responsable ya tienen su fila" />
      <Caption at={142} out={226} text="Filtra el Calendario por «Sin asignar»" />
      <Caption at={236} out={328} text="Y abre el detalle de esos jobs" />

      {frame >= T.winOut && <EndCard title="Ningún job afuera." highlight={['afuera']} subtitle="Jobs · Calendario" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const JobsSinAsignar = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Jobs sin asignar" badge="CORRECCIÓN" icon={<IcoIcon name="Jobs" size={84} />} />
  </AbsoluteFill>
);
