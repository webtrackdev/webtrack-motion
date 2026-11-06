// Video de funcionalidad: el Mapa de referencias publicas abre sin errores aunque no exista la
// pestana de Grupos (PR reactive#1792). Solo titulo y de una a los detalles.
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
import { PLACES, ReferencesScreen, SELECTED, type RefsState } from './Screen';
import '../../style.css';

const T = {
  clickRetry: 64,
  wipe: [94, 120] as const,
  markers: 124,
  clickRefs: 168,
  clickRow: 214,
  callouts: [284, 300],
  calloutsOut: 372,
  winOut: 380,
  end: { title: 390, subtitle: 406, logo: 420 }
};
const MAP_AT = (T.wipe[0] + T.wipe[1]) / 2;
const BODY_DURATION = 476;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });

  const showMap = frame >= MAP_AT;
  // Sacudida de la tarjeta de error al reintentar: sigue fallando.
  const shake = frame >= T.clickRetry + 3 && frame < T.clickRetry + 22 ? Math.sin((frame - T.clickRetry) * 1.9) * 14 * (1 - (frame - T.clickRetry - 3) / 19) : 0;
  const wipeT = kf(frame, [T.wipe[0], T.wipe[1]], [0, 1]);

  const s: RefsState = {
    frame,
    showMap,
    markers: PLACES.map((_, i) => (frame < T.markers + i * 6 ? 0 : sp(frame, T.markers + i * 6, SPRING.pop))),
    panel: frame < T.clickRefs + 3 ? 0 : sp(frame, T.clickRefs + 3, SPRING.snappy),
    btnPress: pulse(frame, T.clickRefs),
    retryPress: pulse(frame, T.clickRetry),
    shake,
    hoverRow: frame >= T.clickRow - 14 && frame < T.clickRow + 3 ? SELECTED : null,
    picked: frame < T.clickRow + 3 ? 0 : sp(frame, T.clickRow + 3, SPRING.snappy)
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: 30, ...A('retry', 230, 130) },
    { f: T.clickRetry, ...A('retry'), click: true },
    { f: T.clickRetry + 40, ...A('refs-btn', -260, 260) },
    { f: T.clickRefs, ...A('refs-btn'), click: true },
    { f: T.clickRow, ...A(`row-${SELECTED}`, -40, 0), click: true },
    { f: T.clickRow + 34, ...A(`row-${SELECTED}`, 120, 150) }
  ];

  const errorFocus = uiToStage(720, 405);
  const mapView = uiToStage(760, 400);
  const panelView = uiToStage(990, 330);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 14, fx: 960, fy: 540, z: 1 },
    { f: 30, fx: errorFocus.x, fy: errorFocus.y, z: 1.6 },
    { f: 90, fx: errorFocus.x, fy: errorFocus.y, z: 1.6 },
    { f: 130, fx: mapView.x, fy: mapView.y, z: 1.3 },
    { f: 156, fx: mapView.x, fy: mapView.y, z: 1.3 },
    { f: 176, fx: panelView.x, fy: panelView.y, z: 1.6 },
    { f: 276, fx: panelView.x, fy: panelView.y, z: 1.6, rx: 0, ry: 0 },
    { f: 306, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 380, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <ReferencesScreen s={s} />
            </div>
            {/* Transicion de recarga: barra de color que cruza la ventana */}
            {wipeT > 0 && wipeT < 1 && (
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, ${BRAND.primary}, ${BRAND.accent})`, transform: `translateX(${(wipeT * 2 - 1) * 100}%)`, zIndex: 80 }} />
            )}
            {cursor && <Cursor path={cursor} hideAt={T.clickRow + 40} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1640} y={360} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="Abrir el mapa de referencias públicas mostraba un error." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1670} y={520} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Abre normal, sin necesitar la pestaña de Grupos." />
        </Camera>
      </AbsoluteFill>

      <Caption at={22} out={T.wipe[0] + 6} text="Antes: el mapa de referencias fallaba" />
      <Caption at={T.wipe[1] + 6} out={T.clickRefs - 4} text="Ahora: abre con sus referencias" />
      <Caption at={T.clickRefs + 6} out={T.clickRow + 70} text="La lista y el mapa funcionan juntos" />

      {frame >= T.winOut && <EndCard title="Mapa sin errores." highlight={['errores']} subtitle="Referencias públicas" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const ReferenciasPublicas = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Referencias públicas" badge="CORRECCIÓN" icon={<IcoIcon name="Marker1" size={84} />} />
  </AbsoluteFill>
);
