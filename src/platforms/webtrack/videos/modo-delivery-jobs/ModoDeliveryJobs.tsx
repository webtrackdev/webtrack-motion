// Video explicativo con voz: Modo Delivery en la app de Jobs (reactive#1788, WD-5127).
// La VOZ manda: timeline.json (scripts/voice-timeline.mjs) trae el frame de inicio y fin de
// cada frase y aquí cada acción se coloca respecto a su frase. Voz: narracion.md (Deepgram).
// Guion completo en ./guion.md.
import { useRef, type FC } from 'react';
import { CheckCircle2, CircleSlash, Link2, Truck } from 'lucide-react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { useAnchors, type Box } from '../../../../core/anchors';
import { EndCard } from '../../../../core/templates/EndCard';
import { Hook } from '../../../../core/templates/Hook';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { IcoIcon } from '../../components/IcoIcon';
import { AppConcept, Inherit, Recap, Team } from './Diagrams';
import { ConflictsDialog, JobsHubBg, PrefsPane, SettingsPane, UsersPage, type DeliveryOpt, type SettingsState, type UsersState } from './Screens';
import timeline from './timeline.json';
import '../../style.css';

const P = (i: number) => timeline.phrases[i];
export const DURATION = timeline.duration;
const fontsReady = waitUntilDone();
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);
/** Resalte que entra en `a` y sale en `b`. */
const glow = (f: number, a: number, b: number) => kf(f, [a, a + 10, b - 10, b], [0, 1, 1, 0]);
const vis = (f: number, a: number, b: number) => (f >= a && f < b ? 'visible' : 'hidden');

/** Píldora del paso actual, fija arriba a la izquierda (fuera de la cámara). */
const StepTag: FC<{ n: number; text: string; at: number; out: number }> = ({ n, text, at, out }) => {
  const frame = useCurrentFrame();
  if (frame < at - 2 || frame > out + 12) return null;
  const p = sp(frame, at, SPRING.pop);
  const q = kf(frame, [out, out + 10], [0, 1], EASE.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 22px',
        borderRadius: 999,
        background: '#fff',
        boxShadow: '0 10px 30px rgba(15,23,42,.10)',
        fontSize: 26,
        fontWeight: 700,
        color: '#0f172a',
        opacity: p * (1 - q),
        transform: `translateY(${(1 - p) * -20}px)`,
        zIndex: 20
      }}
    >
      <span style={{ background: BRAND.primary, color: '#fff', borderRadius: 999, padding: '2px 14px', fontSize: 22 }}>PASO {n}</span>
      {text}
    </div>
  );
};

// ── Escena 1: Configuración de Jobs (frases 4 a 8) ───────────────────────────────────────

const S1 = {
  in: P(4).start - 20,
  clickSettings: P(4).start + 130,
  clickSwitch: P(7).start + 25,
  clickSave: P(7).start + 120,
  readOnly: P(8).start + 100,
  out: P(8).end + 6
};

const SettingsScene: FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const c = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 720, y: 405 });
  const st = (n: string, dy = 0) => {
    const b = anchors?.[n];
    return b ? uiToStage(b.cx, b.cy + dy) : { x: 960, y: 540 };
  };

  const paneP = frame < S1.clickSettings + 4 ? 0 : Math.min(1, sp(frame, S1.clickSettings + 4, SPRING.smooth));
  const s: SettingsState = {
    pane: paneP,
    delivery: frame >= S1.clickSwitch + 3,
    glowReschedule: glow(frame, P(5).start + 85, P(5).end + 6),
    glowDelivery: glow(frame, P(6).start, P(7).end - 30),
    togglePress: pulse(frame, S1.clickSwitch),
    savePress: pulse(frame, S1.clickSave),
    readOnly: kf(frame, [S1.readOnly, S1.readOnly + 14], [0, 1])
  };

  const cursor: Waypoint[] | null = anchors && [
    { f: P(4).start + 50, ...c('hub-settings', -220, 160) },
    { f: S1.clickSettings, ...c('hub-settings'), click: true },
    { f: S1.clickSettings + 40, ...c('row-delivery', 120, 140) },
    { f: S1.clickSwitch, ...c('sw-delivery'), click: true },
    { f: S1.clickSave, ...c('save'), click: true },
    { f: S1.clickSave + 34, ...c('save', -160, -120) }
  ];

  const settingsBtn = st('hub-settings');
  const card = st('general-card', -40);
  const row = st('row-delivery');
  const save = st('save', -60);
  const top = st('general-card', -150);
  const cam: CamKey[] = [
    { f: S1.in, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: P(4).start + 40, fx: 960, fy: 540, z: 1 },
    { f: P(4).start + 100, fx: settingsBtn.x - 200, fy: settingsBtn.y + 120, z: 1.55 },
    { f: S1.clickSettings + 14, fx: settingsBtn.x - 200, fy: settingsBtn.y + 120, z: 1.55 },
    { f: S1.clickSettings + 50, fx: card.x, fy: card.y, z: 1.3 },
    { f: P(5).start + 70, fx: card.x, fy: card.y, z: 1.3 },
    { f: P(5).start + 100, fx: card.x, fy: card.y + 20, z: 1.5 },
    { f: P(6).start, fx: card.x, fy: card.y + 20, z: 1.5 },
    { f: P(6).start + 30, fx: row.x, fy: row.y, z: 1.75 },
    { f: S1.clickSwitch + 30, fx: row.x, fy: row.y, z: 1.75 },
    { f: S1.clickSave - 10, fx: save.x, fy: save.y, z: 1.35 },
    { f: P(8).start + 40, fx: save.x, fy: save.y, z: 1.35 },
    { f: S1.readOnly - 10, fx: top.x, fy: top.y + 40, z: 1.45 },
    { f: S1.out, fx: top.x, fy: top.y + 40, z: 1.45 }
  ];

  return (
    <AbsoluteFill style={{ visibility: vis(frame, S1.in, S1.out + 26) }}>
      <Camera keys={cam}>
        <AppWindow style={{ ...windowMotion(frame, S1.in, S1.out), background: 'var(--background)' }}>
          <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
            <JobsHubBg settingsPress={pulse(frame, S1.clickSettings)} settingsGlow={glow(frame, P(4).start + 80, S1.clickSettings + 6)} />
            <SettingsPane s={s} />
          </div>
          {cursor && <Cursor path={cursor} hideAt={S1.clickSave + 40} scale={0.85} />}
        </AppWindow>
      </Camera>
    </AbsoluteFill>
  );
};

// ── Escenas 2 a 4: Ajustes de Usuario y Gestión de Preferencias (frases 10 a 19) ─────────

const DIEGO = 4103;
const MARIO = 4105;
const JORGE = 4107;
const S2 = {
  in: P(10).start - 14,
  pick: P(10).start + 120,
  openPrefs: P(10).start + 200,
  pickOff: P(15).start + 120,
  apply: P(15).start + 185,
  // Escena 3: varios usuarios
  picks: [P(16).start + 70, P(16).start + 100, P(16).start + 130],
  openBulk: P(16).start + 205,
  dialogIn: P(17).start + 15,
  understood: P(17).start + 165,
  pickOff2: P(17).start + 200,
  apply2: P(17).start + 235,
  out: P(19).end + 8
};

const UsersScene: FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(ref, fontsReady);
  const c = (n: string, dx = 0, dy = 0) => (anchors?.[n] ? { x: anchors[n].cx + dx, y: anchors[n].cy + dy } : { x: 720, y: 405 });
  const box = (n: string): Box | undefined => anchors?.[n];
  const st = (n: string, dx = 0, dy = 0) => {
    const b = box(n);
    return b ? uiToStage(b.cx + dx, b.cy + dy) : { x: 960, y: 540 };
  };

  // Selección de la tabla en cada momento.
  let selected: number[] = [];
  if (frame >= S2.pick + 2 && frame < S2.apply + 16) selected = [DIEGO];
  else if (frame >= S2.picks[0] + 2 && frame < S2.apply2 + 16) selected = [MARIO, JORGE, DIEGO].filter((_, i) => frame >= S2.picks[i] + 2);

  const values: Record<number, DeliveryOpt> = {};
  if (frame >= S2.apply + 18) values[DIEGO] = 0;
  if (frame >= S2.apply2 + 18) {
    values[MARIO] = 0;
    values[JORGE] = 0;
  }

  const first = frame < S2.picks[0];
  const paneOpen = first ? S2.openPrefs + 4 : S2.openBulk + 4;
  const paneClose = first ? S2.apply + 8 : S2.apply2 + 8;
  const paneP = frame < paneOpen ? 0 : Math.min(sp(frame, paneOpen, SPRING.smooth), 1 - kf(frame, [paneClose, paneClose + 12], [0, 1]));
  const prefValue: DeliveryOpt = first ? (frame >= S2.pickOff + 2 ? 0 : -1) : frame >= S2.pickOff2 + 2 ? 0 : -1;

  const us: UsersState = {
    selected,
    values,
    settingsPress: Math.max(pulse(frame, S2.openPrefs), pulse(frame, S2.openBulk)),
    settingsGlow: Math.max(glow(frame, S2.pick + 10, S2.openPrefs + 6), glow(frame, S2.picks[2] + 10, S2.openBulk + 6)),
    columnGlow: glow(frame, P(18).start + 150, P(19).end),
    flashId: frame < S2.picks[0] ? DIEGO : null,
    flash: kf(frame, [S2.apply + 18, S2.apply + 26, S2.apply + 60], [0, 1, 0])
  };
  const flash2 = kf(frame, [S2.apply2 + 18, S2.apply2 + 26, S2.apply2 + 60], [0, 1, 0]);
  if (flash2 > 0) {
    us.flashId = MARIO;
    us.flash = flash2;
  }

  const prefs = {
    pane: paneP,
    value: prefValue,
    glowOpt: {
      '-1': glow(frame, P(11).start + 40, P(11).end + 6),
      '1': glow(frame, P(13).start + 10, P(13).end + 6),
      '0': Math.max(glow(frame, P(14).start + 10, P(14).end + 6), glow(frame, S2.pickOff - 6, S2.apply + 4))
    },
    glowBlock: glow(frame, P(10).start + 270, P(11).start + 30),
    applyPress: Math.max(pulse(frame, S2.apply), pulse(frame, S2.apply2)),
    count: first ? 1 : 3
  };
  const dialogP = frame < S2.dialogIn ? 0 : Math.min(sp(frame, S2.dialogIn, SPRING.smooth), 1 - kf(frame, [S2.understood + 2, S2.understood + 12], [0, 1]));

  // El diálogo se centra con translate(-50%, -50%) y las anclas no ven transforms: se corrigen a mano.
  const dlg = box('conflicts');
  const fixDlg = (n: string, dx = 0, dy = 0) => {
    const b = box(n);
    return b && dlg ? { x: b.cx - dlg.w / 2 + dx, y: b.cy - dlg.h / 2 + dy } : { x: 720, y: 405 };
  };
  const dlgStage = uiToStage(720, 405);
  const cursor: Waypoint[] | null = anchors && [
    { f: P(10).start + 60, ...c(`chk-${DIEGO}`, 160, 120) },
    { f: S2.pick, ...c(`chk-${DIEGO}`), click: true },
    { f: S2.openPrefs, ...c('tb-settings'), click: true },
    { f: S2.openPrefs + 40, ...c('opt--1', 200, 60) },
    { f: S2.pickOff - 40, ...c('opt-0', 180, 40) },
    { f: S2.pickOff, ...c('opt-0', -86, 0), click: true },
    { f: S2.apply, ...c('apply'), click: true },
    { f: S2.apply + 40, ...c(`cell-${DIEGO}`, 60, 60) },
    { f: S2.picks[0] - 20, ...c(`chk-${MARIO}`, 120, 30) },
    { f: S2.picks[0], ...c(`chk-${MARIO}`), click: true },
    { f: S2.picks[1], ...c(`chk-${JORGE}`), click: true },
    { f: S2.picks[2], ...c(`chk-${DIEGO}`), click: true },
    { f: S2.openBulk, ...c('tb-settings'), click: true },
    { f: S2.understood - 30, ...fixDlg('understood', -60, 50) },
    { f: S2.understood, ...fixDlg('understood'), click: true },
    { f: S2.pickOff2, ...c('opt-0', -86, 0), click: true },
    { f: S2.apply2, ...c('apply'), click: true },
    { f: S2.apply2 + 40, ...c(`cell-${JORGE}`, 80, 60) }
  ];

  const table = st(`row-${MARIO}`, 0, -40);
  const chk = st(`chk-${DIEGO}`, 260, -10);
  const block = st('delivery-block', 0, 10);
  const applyB = st('apply', -150, -40);
  const col = st('col-delivery', 0, 150);
  const cam: CamKey[] = [
    { f: S2.in, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: S2.pick - 50, fx: chk.x, fy: chk.y, z: 1.45 },
    { f: S2.openPrefs + 10, fx: chk.x, fy: chk.y, z: 1.45 },
    { f: S2.openPrefs + 50, fx: block.x, fy: block.y, z: 1.55 },
    { f: P(11).start, fx: block.x, fy: block.y, z: 1.7 },
    { f: P(15).start + 60, fx: block.x, fy: block.y, z: 1.7 },
    { f: S2.apply - 20, fx: applyB.x, fy: applyB.y, z: 1.45 },
    { f: S2.apply + 20, fx: applyB.x, fy: applyB.y, z: 1.45 },
    { f: S2.apply + 50, fx: table.x, fy: table.y, z: 1.25 },
    { f: S2.openBulk + 10, fx: table.x, fy: table.y, z: 1.25 },
    { f: S2.openBulk + 30, fx: 960, fy: 540, z: 1.05 },
    { f: S2.dialogIn + 16, fx: dlgStage.x, fy: dlgStage.y, z: 1.75 },
    { f: S2.understood + 10, fx: dlgStage.x, fy: dlgStage.y, z: 1.75 },
    { f: S2.understood + 30, fx: block.x, fy: block.y + 60, z: 1.4 },
    { f: S2.apply2 + 14, fx: block.x, fy: block.y + 60, z: 1.4 },
    { f: S2.apply2 + 44, fx: table.x, fy: table.y, z: 1.2 },
    { f: P(18).start + 120, fx: table.x, fy: table.y, z: 1.2 },
    { f: P(18).start + 160, fx: col.x - 120, fy: col.y, z: 1.5 },
    { f: S2.out, fx: col.x - 120, fy: col.y, z: 1.5 }
  ];

  return (
    <AbsoluteFill style={{ visibility: vis(frame, S2.in, S2.out + 26) }}>
      <Camera keys={cam}>
        <AppWindow style={{ ...windowMotion(frame, S2.in, S2.out), background: 'var(--background)' }}>
          <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
            <UsersPage s={us} />
            <PrefsPane s={prefs as never} />
            {/* Montado desde el frame 0 (con p = 0 no se ve) para medir el ancla del diálogo. */}
            <div style={{ position: 'absolute', inset: 0, visibility: dialogP > 0.01 ? 'visible' : 'hidden', pointerEvents: 'none' }}>
              <ConflictsDialog
                p={Math.max(dialogP, 0.02)}
                groups={[
                  { v: 1, users: ['Mario León', 'Jorge Rivas'] },
                  { v: 0, users: ['Diego Paz'] }
                ]}
              />
            </div>
          </div>
          {cursor && <Cursor path={cursor} hideAt={S2.apply2 + 50} scale={0.85} />}
        </AppWindow>
        <Callout at={P(19).start + 30} out={S2.out - 6} x={1360} y={250} tint="#00B8A9" icon={<Link2 size={26} strokeWidth={2.6} />} title="Igual que la organización" body="Sigue el interruptor general." width={460} />
        <Callout at={P(19).start + 70} out={S2.out - 4} x={1380} y={430} tint={BRAND.success} icon={<CheckCircle2 size={26} strokeWidth={2.6} />} title="Habilitado" body="Su excepción: siempre con Modo Delivery." width={460} />
        <Callout at={P(19).start + 110} out={S2.out - 2} x={1400} y={610} tint="#677187" icon={<CircleSlash size={26} strokeWidth={2.6} />} title="Deshabilitado" body="Su excepción: siempre sin Modo Delivery." width={460} />
      </Camera>
    </AbsoluteFill>
  );
};

// ── Video completo ───────────────────────────────────────────────────────────────────────

const CAPTIONS: [number, string][] = [
  [4, 'Se activa en la web: Configuración de Jobs'],
  [5, 'Pestaña General'],
  [6, 'Nuevo: Modo Delivery en la app de Jobs'],
  [7, 'Enciéndelo y guarda: aplica a toda la organización'],
  [8, 'Sin permiso de edición, solo consulta'],
  [10, 'Ajustes de Usuario › Gestión de Preferencias'],
  [11, 'Igual que la organización: sigue el interruptor'],
  [13, 'Activado: aunque la organización lo tenga apagado'],
  [14, 'Desactivado: aunque la organización lo tenga encendido'],
  [15, 'Ejemplo: mantenimiento en Desactivado'],
  [16, 'Varios usuarios a la vez'],
  [17, 'Conflictos Detectados: valores distintos'],
  [18, 'Nueva columna: Modo Delivery'],
  [19, 'El valor de cada persona, de un vistazo']
];

export const ModoDeliveryJobs = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />
      {frame < P(0).end + 20 && (
        <Hook
          tag="TUTORIAL · Jobs"
          tagIcon={<IcoIcon name="Jobs" size={28} />}
          lines={['Modo Delivery', 'en la app de Jobs']}
          highlight={['Jobs']}
          fontSize={128}
          at={{ tag: 6, line1: 14, line2: 30, out: P(0).end - 6 }}
        />
      )}
      {frame >= P(1).start - 10 && frame < P(3).end + 30 && (
        <AppConcept at={P(1).start - 6} bullets={[P(1).start + 10, P(2).start + 10, P(3).start + 10]} taps={[P(2).start + 170, P(2).start + 235, P(2).start + 300]} out={P(3).end + 6} />
      )}

      <SettingsScene />

      {frame >= P(9).start - 12 && frame < P(9).end + 30 && <Team at={P(9).start - 6} split={P(9).start + 140} out={P(9).end + 4} />}

      <UsersScene />
      {frame >= P(12).start && frame < P(12).end + 24 && <Inherit at={P(12).start + 6} flips={[P(12).start + 150, P(12).start + 220]} out={P(12).end + 6} />}

      {frame >= P(20).start - 10 && frame < P(20).end + 30 && <Recap at={[P(20).start + 5, P(20).start + 120, P(20).start + 235]} out={P(20).end + 8} />}
      {frame >= P(21).start - 4 && (
        <EndCard title="Entregas en un toque." highlight={['toque.']} subtitle="Jobs · Modo Delivery" fontSize={136} at={{ title: P(21).start, subtitle: P(21).start + 18, logo: P(21).start + 32 }} />
      )}

      <StepTag n={1} text="Para toda la organización" at={P(4).start} out={P(8).end} />
      <StepTag n={2} text="Excepciones por usuario" at={P(10).start} out={P(15).end} />
      <StepTag n={3} text="Varios usuarios a la vez" at={P(16).start} out={P(17).end} />
      <StepTag n={4} text="Revisar quién lo tiene" at={P(18).start} out={P(19).end} />

      {CAPTIONS.map(([i, text]) => (
        <Caption key={i} at={P(i).start + 6} out={P(i).end} text={text} />
      ))}
      <div style={{ display: 'none' }}>
        <Truck />
      </div>
    </AbsoluteFill>
  );
};
