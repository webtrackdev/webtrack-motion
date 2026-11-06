// Video de funcionalidad: en ConfigApp > Nueva task, las plantillas se actualizan al cambiar
// la division y pulsar Buscar (PR reactive#1777). Solo titulo y de una a los detalles.
import { useRef } from 'react';
import { Check, LayoutTemplate, X } from 'lucide-react';
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
import { ConfigAppScreen, DIVISIONS, type ScreenState } from './Screen';
import '../../style.css';

const NORTE = ['Reporte cada 30 s · Norte', 'APN Tigo · Norte'];
const SUR = ['Reporte cada 30 s · Sur', 'Odómetro inicial · Sur', 'APN Claro · Sur'];

const T = {
  winIn: 0,
  clickTpl1: 46,
  closeTpl1: 90,
  clickDiv: 112,
  clickDivOpt: 138,
  clickSearch: 166,
  searchEnd: 192,
  clickTpl2: 214,
  closeTpl2: 290,
  callouts: [298, 314],
  calloutsOut: 384,
  winOut: 392,
  end: { title: 402, subtitle: 418, logo: 432 }
};
const BODY_DURATION = 490;
const fontsReady = waitUntilDone();
const between = (f: number, a: number, b: number) => f >= a && f < b;
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });
  const AL = (n: string) => (anchors?.[n] ? { x: anchors[n].x + 50, y: anchors[n].cy + 2 } : { x: 0, y: 0 });

  const open = (a: number, b: number) => (frame < a ? 0 : Math.min(sp(frame, a, SPRING.snappy), 1 - kf(frame, [b, b + 6], [0, 1])));
  const s: ScreenState = {
    frame,
    division: frame >= T.clickDivOpt + 3 ? 'Zona Sur' : 'Zona Norte',
    divisionOpen: open(T.clickDiv + 2, T.clickDivOpt + 3),
    divisionHover: between(frame, T.clickDivOpt - 10, T.clickDivOpt + 4) ? 1 : null,
    searching: between(frame, T.clickSearch + 2, T.searchEnd),
    searchPress: pulse(frame, T.clickSearch),
    templateOpen: Math.max(open(T.clickTpl1 + 2, T.closeTpl1), open(T.clickTpl2 + 2, T.closeTpl2)),
    templateHover: null,
    templates: frame >= T.searchEnd ? SUR : NORTE,
    fresh: frame < T.clickTpl2 + 4 ? 0 : kf(frame, [T.clickTpl2 + 4, T.clickTpl2 + 14, T.closeTpl2 - 10, T.closeTpl2], [0, 1, 1, 0])
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickTpl1 - 26, ...A('template', 140, 90) },
    { f: T.clickTpl1, ...AL('template'), click: true },
    { f: T.closeTpl1 - 6, ...AL('template') },
    { f: T.clickDiv, ...AL('division'), click: true },
    { f: T.clickDivOpt, ...A(`division-opt-${DIVISIONS.indexOf('Zona Sur')}`, -40, 0), click: true },
    { f: T.clickSearch, ...A('search'), click: true },
    { f: T.clickTpl2, ...AL('template'), click: true },
    { f: T.clickTpl2 + 30, ...A('template', 60, 120) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px): plantilla, filtros, plantilla.
  const tpl = uiToStage(500, 470);
  const division = uiToStage(860, 290);
  const search = uiToStage(430, 210);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 12, fx: 960, fy: 540, z: 1 },
    { f: 40, fx: tpl.x, fy: tpl.y, z: 1.9 },
    { f: 92, fx: tpl.x, fy: tpl.y, z: 1.9 },
    { f: 110, fx: division.x, fy: division.y, z: 1.9 },
    { f: 146, fx: division.x, fy: division.y, z: 1.9 },
    { f: 162, fx: search.x, fy: search.y, z: 1.9 },
    { f: 194, fx: search.x, fy: search.y, z: 1.9 },
    { f: 212, fx: tpl.x, fy: tpl.y, z: 1.9 },
    { f: 290, fx: tpl.x, fy: tpl.y, z: 1.9, rx: 0, ry: 0 },
    { f: 318, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 392, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, T.winIn, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <ConfigAppScreen s={s} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.clickTpl2 + 34} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1480} y={360} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="Al cambiar la división, las plantillas podían no aparecer." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1510} y={520} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Se actualizan cada vez que pulsas Buscar." />
        </Camera>
      </AbsoluteFill>

      <Caption at={30} out={100} text="Plantillas de la división actual" />
      <Caption at={106} out={200} text="Cambia la división y pulsa Buscar" />
      <Caption at={208} out={290} text="Las plantillas se actualizan" />

      {frame >= T.winOut && <EndCard title="Plantillas al día." highlight={['día']} subtitle="ConfigApp · Nueva task" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const ConfigAppPlantillas = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Plantillas al día" badge="MEJORA" icon={<LayoutTemplate size={84} strokeWidth={2.2} />} />
  </AbsoluteFill>
);
