// Video de funcionalidad: en el editor de rutas se puede crear un contacto nuevo escribiendo su
// email en el selector (PR reactive#1760). Solo titulo y de una a los detalles.
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
import { typed, typedEnd } from '../../../../core/typing';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { IcoIcon } from '../../components/IcoIcon';
import { MapBase } from '../../components/MapBase';
import { RouteLine } from '../../components/RouteLine';
import { Pin } from '../../components/Pin';
import { AVENUES, CPS, FULL_D, LABELS } from '../crear-ruta-logistica/data';
import { ContactsPanel, type ContactsState } from './Panel';
import '../../style.css';

const NEW_EMAIL = 'bodega.norte@ejemplo.com';
const T = {
  panelIn: 8,
  clickField: 48,
  typeStart: 100,
  clickCreate: 164,
  glow: [168, 232] as const,
  callouts: [244, 260],
  calloutsOut: 332,
  winOut: 340,
  end: { title: 350, subtitle: 366, logo: 380 }
};
const BODY_DURATION = 436;
const TYPE_END = typedEnd(NEW_EMAIL, T.typeStart, 1.5);
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });
  const AL = (n: string, dx = 80) => (anchors?.[n] ? { x: anchors[n].x + dx, y: anchors[n].cy + 2 } : { x: 0, y: 0 });

  const created = frame >= T.clickCreate + 3;
  const menu =
    frame < T.clickField + 2 ? 0 : Math.min(sp(frame, T.clickField + 2, SPRING.snappy), 1 - kf(frame, [T.clickCreate + 3, T.clickCreate + 9], [0, 1]));
  const query = created ? '' : typed(frame, NEW_EMAIL, T.typeStart, 1.5);

  const s: ContactsState = {
    frame,
    panel: sp(frame, T.panelIn, SPRING.smooth),
    menu,
    focus: frame >= T.clickField && frame < T.clickCreate + 3,
    query,
    hover: frame >= T.clickCreate - 12 && frame < T.clickCreate + 3 ? 'create' : null,
    chips: created
      ? [
          { text: 'despacho@ejemplo.com', contact: true },
          { text: NEW_EMAIL, contact: true }
        ]
      : [{ text: 'despacho@ejemplo.com', contact: true }],
    glow: kf(frame, [T.glow[0], T.glow[0] + 12, T.glow[1] - 16, T.glow[1]], [0, 1, 1, 0]),
    savePress: 0
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickField - 30, ...A('field-event', 260, -150) },
    { f: T.clickField, ...AL('field-event', 250), click: true },
    { f: T.clickField + 30, ...A('field-event', 240, 90) },
    { f: T.clickCreate, ...AL('opt-create', 110), click: true },
    { f: T.clickCreate + 34, ...A('field-event', 260, 80) }
  ];

  const focus = uiToStage(250, 272);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 14, fx: 960, fy: 540, z: 1 },
    { f: 40, fx: focus.x, fy: focus.y, z: 1.9 },
    { f: 236, fx: focus.x, fy: focus.y, z: 1.9, rx: 0, ry: 0 },
    { f: 264, fx: 960, fy: 560, z: 0.95, rx: 4, ry: 8 },
    { f: 340, fx: 960, fy: 560, z: 0.97, rx: 4, ry: 8 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <MapBase width={1440} height={810} avenues={AVENUES} labels={LABELS} />
            <svg width={1440} height={810} style={{ position: 'absolute', inset: 0 }}>
              <RouteLine d={FULL_D} progress={1} color={BRAND.primary} width={7} glow />
            </svg>
            <Pin x={CPS[0].x} y={CPS[0].y} color="#22c55e" scale={1} />
            <Pin x={CPS[1].x} y={CPS[1].y} color={BRAND.primary} scale={1} />
            <Pin x={CPS[2].x} y={CPS[2].y} color="#ef4444" scale={1} />
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <ContactsPanel s={s} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.clickCreate + 40} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1060} y={300} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="No había forma de crear un contacto nuevo desde la lista." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1090} y={470} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Escribes el email y eliges «Crear»: queda seleccionado." />
        </Camera>
      </AbsoluteFill>

      <Caption at={52} out={96} text="Los contactos se leen completos" />
      <Caption at={104} out={TYPE_END + 36} text="Escribe un email nuevo" />
      <Caption at={T.clickCreate + 6} out={T.callouts[0] + 20} text="Se crea y queda seleccionado" />

      {frame >= T.winOut && <EndCard title="Contactos al instante." highlight={['instante']} subtitle="Editor de rutas · Notificaciones" fontSize={130} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const ContactosRuta = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Contactos en rutas" badge="MEJORA" icon={<IcoIcon name="Contacts" size={84} />} />
  </AbsoluteFill>
);
