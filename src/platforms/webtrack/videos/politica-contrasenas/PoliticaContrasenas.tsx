// Video de funcionalidad: la politica de contrasenas tiene tope de 39 caracteres distintos y el
// aviso dice cuantos pide (PR reactive#1785, WD-4589 / WD-4590). Solo titulo y a los detalles.
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
import { Toast } from '../../../../core/Toast';
import { useAnchors } from '../../../../core/anchors';
import { typed, typedEnd } from '../../../../core/typing';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { IcoIcon } from '../../components/IcoIcon';
import { CreateScreen, PolicyScreen, type CreateState, type PolicyState } from './Screens';
import '../../style.css';

const PASSWORD = 'aAaAaAaA1!';
const SCROLL = 300;

const T = {
  paneIn: 4,
  clickInput: 40,
  type1: 52,
  type2: 58,
  clickFix: 112,
  fixed: 118,
  clickSave: 150,
  saving: [152, 172] as const,
  toast: 174,
  paneOut: 186,
  swap: 200,
  paneBIn: 212,
  scroll: [220, 246] as const,
  clickRadio: 258,
  clickPw: 280,
  typeStart: 288,
  clickEye: 338,
  callouts: [386, 402],
  calloutsOut: 470,
  winOut: 478,
  end: { title: 488, subtitle: 504, logo: 518 }
};
const TYPED_END = typedEnd(PASSWORD, T.typeStart, 3);
const BODY_DURATION = 566;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });

  // Escena 1: el campo "Caracteres distintos minimos"
  const unique = frame < T.type1 ? '2' : frame < T.fixed ? (frame < T.type2 ? '4' : '40') : '4';
  const paneA = frame < T.paneIn ? 0 : Math.min(sp(frame, T.paneIn, SPRING.smooth), 1 - kf(frame, [T.paneOut, T.paneOut + 18], [0, 1]));
  const policy: PolicyState = {
    frame,
    pane: paneA,
    unique,
    own: frame >= T.type1,
    focus: frame >= T.clickInput && frame < T.clickSave,
    saving: frame >= T.saving[0] && frame < T.saving[1],
    savePress: pulse(frame, T.clickSave)
  };

  // Escena 2: crear usuario con contrasena manual
  const create: CreateState = {
    frame,
    pane: frame < T.paneBIn ? 0 : sp(frame, T.paneBIn, SPRING.smooth),
    scroll: SCROLL * kf(frame, [T.scroll[0], T.scroll[1]], [0, 1]),
    mode: frame >= T.clickRadio + 3 ? 'manual' : 'auto',
    manualIn: frame < T.clickRadio + 3 ? 0 : sp(frame, T.clickRadio + 3, SPRING.snappy),
    pw: typed(frame, PASSWORD, T.typeStart, 3),
    show: frame >= T.clickEye + 3,
    focus: frame >= T.clickPw && frame < T.clickEye,
    validated: frame >= TYPED_END + 4,
    policy: { requiredLength: 8, requiredUniqueChars: 4 },
    eyePress: pulse(frame, T.clickEye)
  };
  const swapA = kf(frame, [T.swap, T.swap + 10], [0, 1]);

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickInput - 22, ...A('unique-input', -260, 150) },
    { f: T.clickInput, ...A('unique-input', 20, 2), click: true },
    { f: T.clickFix - 6, ...A('unique-input', 20, 2) },
    { f: T.clickFix, ...A('unique-input', 20, 2), click: true },
    { f: T.clickSave, ...A('save'), click: true },
    { f: T.clickSave + 18, ...A('save', 120, -140) },
    { f: T.clickRadio - 24, ...A('radio-manual', 140, 80 - SCROLL) },
    { f: T.clickRadio, ...A('radio-manual', 4, -SCROLL), click: true },
    { f: T.clickPw, ...A('pw-input', -140, -SCROLL), click: true },
    { f: T.clickEye, ...A('pw-eye', 0, -SCROLL), click: true },
    { f: T.clickEye + 26, ...A('pw-eye', 60, 90 - SCROLL) }
  ];

  const row = uiToStage(992, 290);
  const pwArea = uiToStage(1056, 400);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 10, fx: 960, fy: 540, z: 1 },
    { f: 36, fx: row.x, fy: row.y, z: 1.75 },
    { f: 186, fx: row.x, fy: row.y, z: 1.75 },
    { f: 214, fx: pwArea.x, fy: pwArea.y, z: 1.9 },
    { f: 366, fx: pwArea.x, fy: pwArea.y, z: 1.9, rx: 0, ry: 0 },
    { f: 394, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 478, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <PolicyScreen s={policy} />
              <div style={{ position: 'absolute', inset: 0, opacity: swapA, visibility: swapA > 0.01 ? 'visible' : 'hidden' }}>
                <CreateScreen s={create} />
              </div>
            </div>
            <Toast at={T.toast} out={T.toast + 40} text="Política de contraseñas guardada" x={1030} y={34} />
            {cursor && <Cursor path={cursor} hideAt={T.clickEye + 34} scale={0.85} />}
          </AppWindow>
          <Callout
            at={T.callouts[0]}
            out={T.calloutsOut}
            x={240}
            y={250}
            width={540}
            tint={BRAND.danger}
            icon={<X size={28} strokeWidth={3} />}
            title="Antes"
            body="Se podía pedir más caracteres distintos de los que una contraseña automática puede tener, y el aviso no decía cuántos."
          />
          <Callout
            at={T.callouts[1]}
            out={T.calloutsOut + 3}
            x={270}
            y={560}
            width={540}
            tint={BRAND.success}
            icon={<Check size={28} strokeWidth={3} />}
            title="Ahora"
            body="Tope de 39 y el aviso dice cuántos pide."
          />
        </Camera>
      </AbsoluteFill>

      <Caption at={28} out={60} text="Política de contraseñas de la organización" />
      <Caption at={66} out={108} text="Tope de 39: lo que arma la contraseña automática" />
      <Caption at={116} out={176} text="Corrige a 4 y guarda" />
      <Caption at={228} out={314} text="Crea un usuario con contraseña manual" />
      <Caption at={326} out={380} text="El aviso dice cuántos distintos pide" />

      {frame >= T.winOut && <EndCard title="Reglas claras." highlight={['claras']} subtitle="Política de contraseñas" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const PoliticaContrasenas = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Política de contraseñas" badge="MEJORA" icon={<IcoIcon name="Key" size={84} />} />
  </AbsoluteFill>
);
