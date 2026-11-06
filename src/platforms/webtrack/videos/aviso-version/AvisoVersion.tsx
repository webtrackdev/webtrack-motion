// Video de funcionalidad: con un panel (slide) abierto, el aviso de nueva version ahora responde
// a los clics y pulsarlo ya no cierra el panel (PR reactive#1762, WD-4514). Solo titulo y a los detalles.
import { useRef } from 'react';
import { Check, X } from 'lucide-react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SPRING, kf, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, WIN_SCALE, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { useAnchors } from '../../../../core/anchors';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { IcoIcon } from '../../components/IcoIcon';
import { UsersScreen, type UsersState } from '../usuarios-licencias/Screen';
import { UpdateToast } from './UpdateToast';
import '../../style.css';

const T = {
  paneIn: 8,
  toastIn: 64,
  click: 138,
  callouts: [258, 276],
  calloutsOut: 372,
  winOut: 380,
  end: { title: 390, subtitle: 406, logo: 420 }
};
const BODY_DURATION = 474;
const fontsReady = waitUntilDone();

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });

  // Formulario del panel tal como lo dejo el usuario: nada cambia en el panel durante el video.
  const s: UsersState = {
    frame,
    pane: sp(frame, T.paneIn, SPRING.smooth),
    org: 'Transportes Alfa',
    division: 'Zona Centro',
    subdivision: 'Ruta 1',
    orgOpen: 0,
    orgHover: null,
    glow: 0,
    savePress: 0,
    busy: null,
    dialog: 0,
    cancelPress: 0
  };

  // windowMotion reemplaza el scale de AppWindow: se vuelve a aplicar para que uiToStage coincida.
  const win = windowMotion(frame, 0, T.winOut);
  const enter = sp(frame, T.toastIn, SPRING.pop);
  const exit = kf(frame, [T.click + 3, T.click + 15], [0, 1]);
  const hover = kf(frame, [T.click - 14, T.click - 3], [0, 1]) * (1 - kf(frame, [T.click + 3, T.click + 6], [0, 1]));
  const press = kf(frame, [T.click + 1, T.click + 4, T.click + 10], [0, 1, 0]);

  const cursor: Waypoint[] | null = anchors && [
    { f: T.toastIn + 22, x: 930, y: 330 },
    { f: T.click, ...A('toast-dismiss'), click: true },
    { f: T.click + 34, ...A('toast-dismiss', -330, -230) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px).
  const pane = uiToStage(1056, 400);
  const toast = uiToStage(1226, 700);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 14, fx: 960, fy: 540, z: 1 },
    { f: 46, fx: pane.x, fy: pane.y, z: 1.4 },
    { f: 62, fx: toast.x, fy: toast.y, z: 1.85 },
    { f: 150, fx: toast.x, fy: toast.y, z: 1.85 },
    { f: 182, fx: pane.x, fy: pane.y, z: 1.4 },
    { f: 246, fx: pane.x, fy: pane.y, z: 1.4, rx: 0, ry: 0 },
    { f: 276, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 380, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...win, transform: `${win.transform} scale(${WIN_SCALE})`, background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <UsersScreen s={s} />
              <UpdateToast enter={enter} exit={exit} hover={hover} press={press} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.click + 40} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={300} y={300} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="El aviso no respondía y pulsarlo cerraba el panel." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={330} y={500} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="El aviso responde y el panel sigue abierto." />
        </Camera>
      </AbsoluteFill>

      <Caption at={24} out={66} text="Tienes un panel abierto" />
      <Caption at={72} out={114} text="Llega el aviso de nueva versión" />
      <Caption at={118} out={150} text="Pulsa «Ahora no»" />
      <Caption at={158} out={250} text="El aviso responde y el panel sigue abierto" />

      {frame >= T.winOut && <EndCard title="Sin trabas." highlight={['trabas']} subtitle="Aviso de nueva versión" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const AvisoVersion = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Aviso de versión" badge="CORRECCIÓN" icon={<IcoIcon name="RefreshCw" size={84} />} />
  </AbsoluteFill>
);
