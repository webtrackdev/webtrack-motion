// Video de funcionalidad: en el Dashboard PT (vista Aeropuerto) los refrescos ya no vacian el
// tablero: se conservan las tarjetas y el encabezado dice "Actualizando…" (PR reactive#1782).
// Solo titulo y de una a los detalles.
import { useRef } from 'react';
import { Check, X } from 'lucide-react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { kf } from '../../../../core/anim';
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
import { AirportScreen, type AirportState } from './Screen';
import '../../style.css';

const T = {
  oldLoader: 44,
  wipe: [100, 126] as const,
  refresh: 150,
  newData: 232,
  fresh: [232, 292] as const,
  callouts: [300, 316],
  calloutsOut: 384,
  winOut: 392,
  end: { title: 402, subtitle: 418, logo: 432 }
};
const SWITCH_AT = (T.wipe[0] + T.wipe[1]) / 2;
const BODY_DURATION = 488;
const fontsReady = waitUntilDone();

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });

  // Antes (contraste breve): el refresco reemplazaba el tablero por el cargador. Ahora: tarjetas
  // conservadas y "Actualizando…" hasta que llega el tablero nuevo.
  const old = frame < SWITCH_AT;
  const refreshing = frame >= T.refresh && frame < T.newData;
  const s: AirportState = {
    frame,
    loader: old && frame >= T.oldLoader,
    refreshing,
    data: frame >= T.newData ? 1 : 0,
    fresh: kf(frame, [T.fresh[0], T.fresh[0] + 12, T.fresh[1] - 16, T.fresh[1]], [0, 1, 1, 0])
  };
  const wipeT = kf(frame, [T.wipe[0], T.wipe[1]], [0, 1]);

  const cursor: Waypoint[] | null = anchors && [
    { f: T.wipe[1] + 4, ...A('kpi-refs', -180, 120) },
    { f: T.refresh + 6, ...A('updated', -220, 90) },
    { f: T.refresh + 44, ...A('badge-0', -30, 30) },
    { f: T.newData - 4, ...A('badge-0', -30, 30) },
    { f: T.newData + 26, ...A('stop-changed', 70, 40) }
  ];

  // Camara cerca para que se lea en el GIF (960 px): mitad derecha del tablero.
  const loaderView = uiToStage(850, 330);
  const ahoraView = uiToStage(850, 440);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 14, fx: 960, fy: 540, z: 1 },
    { f: 38, fx: loaderView.x, fy: loaderView.y, z: 1.6 },
    { f: 110, fx: loaderView.x, fy: loaderView.y, z: 1.6 },
    { f: 138, fx: ahoraView.x, fy: ahoraView.y, z: 1.6 },
    { f: 292, fx: ahoraView.x, fy: ahoraView.y, z: 1.6, rx: 0, ry: 0 },
    { f: 322, fx: 1500, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 392, fx: 1520, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <AirportScreen s={s} />
            </div>
            {/* Transicion de Antes a Ahora: barra de color que cruza la ventana */}
            {wipeT > 0 && wipeT < 1 && (
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${BRAND.primary}, ${BRAND.accent})`, transform: `translateX(${(wipeT * 2 - 1) * 100}%)`, zIndex: 80 }} />
            )}
            {cursor && <Cursor path={cursor} hideAt={T.fresh[1] + 4} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1490} y={330} width={400} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="Cada actualización vaciaba la pantalla con un cargador." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1500} y={530} width={390} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Las tarjetas se quedan y se reemplazan al llegar el tablero nuevo." />
        </Camera>
      </AbsoluteFill>

      <Caption at={52} out={T.wipe[0] + 6} text="Antes: cada refresco vaciaba el tablero" />
      <Caption at={T.refresh + 4} out={T.newData - 6} text="Ahora: las tarjetas se quedan" />
      <Caption at={T.newData + 4} out={T.fresh[1] + 6} text="Llegan los datos nuevos y se actualizan" />

      {frame >= T.winOut && <EndCard title="Actualiza sin vaciar." highlight={['vaciar']} subtitle="Dashboard PT" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const AeropuertoActualizando = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Dashboard PT" badge="MEJORA" icon={<IcoIcon name="Workplan" size={84} />} />
  </AbsoluteFill>
);
