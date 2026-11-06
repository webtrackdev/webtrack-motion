// Video de funcionalidad: ConfigApp > Nueva task. La plantilla pone la marca de las unidades y la
// afiliacion pasa a un boton popover en la tarjeta de unidades (PR reactive#1786).
// Solo titulo y de una a los detalles.
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
import { ConfigAppScreen, type ScreenState } from './Screen';
import '../../style.css';

const T = {
  winIn: 0,
  clickTpl: 38,
  typeStart: 54,
  clickOpt: 92,
  scroll: [108, 140] as [number, number],
  clickMs: 164,
  clickDiv: 200,
  clickDivOpt: 228,
  clickApply: 256,
  fetchEnd: 272,
  callouts: [300, 316],
  calloutsOut: 392,
  winOut: 400,
  end: { title: 410, subtitle: 426, logo: 440 }
};
const BODY_DURATION = 498;
const fontsReady = waitUntilDone();
const between = (f: number, a: number, b: number) => f >= a && f < b;
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);
const TYPED = 'tel';

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);

  // La vista previa de la plantilla empuja hacia abajo todo lo que sigue.
  const previewH = anchors?.['preview-inner']?.h ?? 0;
  const barY = anchors?.bar?.y ?? 0;
  const SCROLL = Math.max(0, barY + previewH - 70);
  const scrollAt = (f: number) => kf(f, T.scroll, [0, SCROLL]);
  const shiftAt = (f: number, name: string) => (/^(ms|bar)/.test(name) && f >= T.clickOpt + 3 ? previewH : 0);
  // Punto de pantalla (UI) de un ancla en el frame f, ya con el desplazamiento de la pagina.
  const A = (n: string, f: number, dx = 0, dy = 0) =>
    anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + shiftAt(f, n) - scrollAt(f) + dy } : { x: 0, y: 0 };

  const open = (a: number, b: number) => (frame < a ? 0 : Math.min(sp(frame, a, SPRING.snappy), 1 - kf(frame, [b, b + 6], [0, 1])));
  const typed = Math.max(0, Math.min(TYPED.length, Math.floor((frame - T.typeStart) / 5) + (frame >= T.typeStart ? 1 : 0)));
  const applied = frame >= T.clickApply + 3;
  const picked = frame >= T.clickOpt + 3;

  const s: ScreenState = {
    frame,
    scroll: scrollAt(frame),
    tplOpen: open(T.clickTpl + 2, T.clickOpt + 3),
    tplSearch: TYPED.slice(0, typed),
    tplHover: between(frame, T.clickOpt - 12, T.clickOpt + 4) ? 0 : null,
    tplSelected: picked,
    msOpen: open(T.clickMs + 2, T.clickApply + 3),
    divOpen: open(T.clickDiv + 2, T.clickDivOpt + 3),
    divHover: between(frame, T.clickDivOpt - 12, T.clickDivOpt + 4) ? 1 : null,
    draftDivision: frame >= T.clickDivOpt + 3 ? 'Zona Sur' : null,
    appliedDivision: applied ? 'Zona Sur' : null,
    applyPress: pulse(frame, T.clickApply),
    fetching: between(frame, T.clickApply + 3, T.fetchEnd)
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickTpl - 26, ...A('tpl-field', T.clickTpl, 200, 110) },
    { f: T.clickTpl, ...A('tpl-field', T.clickTpl, -240), click: true },
    { f: T.clickOpt - 8, ...A('tpl-opt-0', T.clickOpt, -120) },
    { f: T.clickOpt, ...A('tpl-opt-0', T.clickOpt, -120), click: true },
    { f: T.clickOpt + 18, ...A('tpl-field', T.clickOpt, 120, 180) },
    { f: T.clickMs - 22, ...A('ms-btn', T.clickMs, 120, 60) },
    { f: T.clickMs, ...A('ms-btn', T.clickMs), click: true },
    { f: T.clickDiv, ...A('ms-div', T.clickDiv, 40), click: true },
    { f: T.clickDivOpt, ...A('ms-div-opt-1', T.clickDivOpt, -40), click: true },
    { f: T.clickApply, ...A('ms-apply', T.clickApply), click: true },
    { f: T.clickApply + 28, ...A('ms-apply', T.clickApply, 260, 140) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px).
  const tpl = uiToStage(520, 250);
  const bar = uiToStage(500, 300);
  const pop = uiToStage(470, 330);
  const res = uiToStage(500, 290);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 12, fx: 960, fy: 540, z: 1 },
    { f: 34, fx: tpl.x, fy: tpl.y, z: 1.75 },
    { f: 104, fx: tpl.x, fy: tpl.y, z: 1.75 },
    { f: 140, fx: bar.x, fy: bar.y, z: 1.75 },
    { f: 160, fx: bar.x, fy: bar.y, z: 1.75 },
    { f: 176, fx: pop.x, fy: pop.y, z: 1.75 },
    { f: 254, fx: pop.x, fy: pop.y, z: 1.75 },
    { f: 276, fx: res.x, fy: res.y, z: 1.7 },
    { f: 298, fx: res.x, fy: res.y, z: 1.7, rx: 0, ry: 0 },
    { f: 326, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 400, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
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
            {cursor && <Cursor path={cursor} hideAt={T.clickApply + 32} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1480} y={330} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="Había que elegir marca y afiliación en los filtros y pulsar Buscar." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1510} y={540} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Eliges la plantilla y ves sus unidades: la afiliación está a un clic." />
        </Camera>
      </AbsoluteFill>

      <Caption at={30} out={104} text="La plantilla trae su marca" />
      <Caption at={112} out={160} text="Ves sus unidades al elegirla" />
      <Caption at={166} out={290} text="Afiliación a un clic: elige y aplica" />

      {frame >= T.winOut && <EndCard title="Afiliación a un clic." highlight={['clic']} subtitle="ConfigApp · Nueva task" fontSize={130} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const ConfigappAfiliacion = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Plantillas y afiliación" badge="MEJORA" icon={<IcoIcon name="Layout" size={84} />} />
  </AbsoluteFill>
);
