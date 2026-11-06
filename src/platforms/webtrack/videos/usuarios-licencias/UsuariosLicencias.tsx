// Video de funcionalidad: al crear usuarios y toparse con el limite de licencias, cancelar el
// aviso ya no cambia la organizacion elegida (PR reactive#1790). Solo titulo y a los detalles.
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
import { MEMBERSHIP, ORGS, UsersScreen, type UsersState } from './Screen';
import '../../style.css';

const T = {
  paneIn: 10,
  clickOrg: 58,
  clickOrgOpt: 86,
  clickSave: 122,
  validating: 124,
  creating: 146,
  formBack: 162,
  dialogIn: 164,
  clickCancel: 226,
  glow: [236, 296] as const,
  callouts: [304, 320],
  calloutsOut: 392,
  winOut: 400,
  end: { title: 410, subtitle: 426, logo: 440 }
};
const BODY_DURATION = 496;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const Body = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const A = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 0, y: 0 });
  const AL = (n: string) => (anchors?.[n] ? { x: anchors[n].x + 60, y: anchors[n].cy + 2 } : { x: 0, y: 0 });

  const chosen = frame >= T.clickOrgOpt + 3 ? 'Logística Norte' : 'Transportes Alfa';
  const member = MEMBERSHIP[frame >= T.clickOrgOpt + 8 ? chosen : 'Transportes Alfa'];
  const orgOpen = frame < T.clickOrg + 2 ? 0 : Math.min(sp(frame, T.clickOrg + 2, SPRING.snappy), 1 - kf(frame, [T.clickOrgOpt + 3, T.clickOrgOpt + 9], [0, 1]));
  const dialogOpen = frame < T.dialogIn ? 0 : Math.min(sp(frame, T.dialogIn, SPRING.snappy), 1 - kf(frame, [T.clickCancel + 2, T.clickCancel + 12], [0, 1]));

  const s: UsersState = {
    frame,
    pane: sp(frame, T.paneIn, SPRING.smooth),
    org: chosen,
    division: member.division,
    subdivision: member.subdivision,
    orgOpen,
    orgHover: frame >= T.clickOrgOpt - 10 && frame < T.clickOrgOpt + 4 ? ORGS.indexOf('Logística Norte') : null,
    glow: kf(frame, [T.glow[0], T.glow[0] + 12, T.glow[1] - 14, T.glow[1]], [0, 1, 1, 0]),
    savePress: pulse(frame, T.clickSave),
    busy: frame >= T.validating && frame < T.creating ? 'validating' : frame >= T.creating && frame < T.formBack ? 'creating' : null,
    dialog: dialogOpen,
    cancelPress: pulse(frame, T.clickCancel)
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickOrg - 28, ...A('org', -150, 130) },
    { f: T.clickOrg, ...AL('org'), click: true },
    { f: T.clickOrgOpt, ...A('org-opt-1', -40, 0), click: true },
    { f: T.clickSave, ...A('save'), click: true },
    { f: T.clickCancel, ...A('dlg-cancel'), click: true },
    { f: T.clickCancel + 32, ...A('org', 40, 150) }
  ];

  // Camara cerca para que la UI se lea tambien en el GIF (960 px).
  const membership = uiToStage(1056, 400);
  const guardar = uiToStage(1056, 520);
  const dialog = uiToStage(720, 410);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 12, fx: 960, fy: 540, z: 1 },
    { f: 44, fx: membership.x, fy: membership.y, z: 1.9 },
    { f: 106, fx: membership.x, fy: membership.y, z: 1.9 },
    { f: 118, fx: guardar.x, fy: guardar.y, z: 1.6 },
    { f: 146, fx: guardar.x, fy: guardar.y, z: 1.6 },
    { f: 168, fx: dialog.x, fy: dialog.y, z: 1.9 },
    { f: 230, fx: dialog.x, fy: dialog.y, z: 1.9 },
    { f: 246, fx: membership.x, fy: membership.y, z: 1.9 },
    { f: 298, fx: membership.x, fy: membership.y, z: 1.9, rx: 0, ry: 0 },
    { f: 326, fx: 1300, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 400, fx: 1320, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      <AbsoluteFill style={{ visibility: frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={{ ...windowMotion(frame, 0, T.winOut), background: 'var(--background)' }}>
            <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
              <UsersScreen s={s} />
            </div>
            {cursor && <Cursor path={cursor} hideAt={T.clickCancel + 38} scale={0.85} />}
          </AppWindow>
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={300} y={300} tint={BRAND.danger} icon={<X size={28} strokeWidth={3} />} title="Antes" body="Al cancelar el aviso, el formulario volvía a la organización del usuario en sesión." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={330} y={500} tint={BRAND.success} icon={<Check size={28} strokeWidth={3} />} title="Ahora" body="Conserva lo elegido: el usuario se crea en su organización." />
        </Camera>
      </AbsoluteFill>

      <Caption at={30} out={110} text="Elige la organización del usuario" />
      <Caption at={114} out={160} text="Guarda el usuario" />
      <Caption at={170} out={226} text="La organización llegó a su límite de licencias" />
      <Caption at={234} out={300} text="Cancela y todo sigue como lo dejaste" />

      {frame >= T.winOut && <EndCard title="Sin sorpresas." highlight={['sorpresas']} subtitle="Creación rápida de usuarios" fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};

// Funcionalidad: solo el titulo y directo a los detalles.
const SHIFT = launchIntroLength(0) - 8;
export const DURATION = BODY_DURATION + SHIFT;

export const UsuariosLicencias = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <Body />
    </Sequence>
    <LaunchIntro title="Licencias de usuario" badge="CORRECCIÓN" icon={<IcoIcon name="UserPlus" size={84} />} />
  </AbsoluteFill>
);
