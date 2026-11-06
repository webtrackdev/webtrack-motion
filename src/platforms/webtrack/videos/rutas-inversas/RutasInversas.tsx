// Video de lanzamiento: Rutas inversas (PR #1743, WD-3970).
// Guion en prompt.md. Tiempos en frames a 30 fps (780 = 26 s).
import { useRef } from 'react';
import { Gauge, Repeat, Unlink } from 'lucide-react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EndCard } from '../../../../core/templates/EndCard';
import { Cursor } from '../../../../core/Cursor';
import { KineticText } from '../../../../core/KineticText';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { Toast } from '../../../../core/Toast';
import { MapBase } from '../../components/MapBase';
import { RouteLine } from '../../components/RouteLine';
import { Pin } from '../../components/Pin';
import { Vehicle } from '../../components/Vehicle';
import { progressOf } from '../../../../core/geo';
import { useAnchors } from '../../../../core/anchors';
import { RouteEditorPanelMock, type PanelState } from './Panel';
import { AVENUES, CHECKPOINTS, DISTANCE_KM, FORWARD_D, LABELS, NEW_ROUTE, REVERSE_D, SOURCE_ROUTE } from './data';
import '../../style.css';

// Duracion del cuerpo (todo lo que va despues de la entrada).
const BODY_DURATION = 780;

// Marcas de tiempo (frames)
const T = {
  tag: 6,
  hook1: 12,
  hook2: 24,
  hookOut: 70,
  winIn: 56,
  fwdDraw: [100, 158] as const,
  fwdCar: [128, 214] as const,
  panelIn: 206,
  cursorIn: 238,
  clickReverse: 270,
  breakout: [274, 318] as const,
  comboIn: 280,
  clickCombo: 326,
  clickOption: 358,
  loading: [362, 378] as const,
  items: 378,
  ghost: [396, 424] as const,
  revDraw: [430, 500] as const,
  revCar: [470, 566] as const,
  callouts: [452, 472, 492] as const,
  calloutsOut: 566,
  clickSave: 606,
  toast: 616,
  winOut: 664,
  end1: 672,
  end2: 690,
  logo: 708
};

const fontsReady = waitUntilDone();
const PANEL = { left: 16, top: 16, width: 560, height: 740 };

const RutasInversasBody = () => {
  const frame = useCurrentFrame();
  const panelRef = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(panelRef, fontsReady);
  // Ancla en coordenadas de la UI (la ventana), centrada en el elemento.
  const A = (name: string, dx = 0, dy = 0) => {
    const b = anchors?.[name];
    return b ? { x: PANEL.left + b.cx + dx, y: PANEL.top + b.cy + dy } : { x: 0, y: 0 };
  };

  // ── Panel ────────────────────────────────────────────────────────────────────
  const panelP = sp(frame, T.panelIn, SPRING.smooth);
  const reverse = frame >= T.clickReverse + 2;
  const breakout = Math.min(sp(frame, T.breakout[0], SPRING.pop), 1 - sp(frame, T.breakout[1], SPRING.smooth));
  const menu = Math.min(sp(frame, T.clickCombo + 3, SPRING.snappy), 1 - kf(frame, [T.clickOption + 3, T.clickOption + 9], [0, 1]));
  const items = [0, 1, 2, 3].map((i) => (frame < T.items ? 0 : sp(frame, T.items + i * 6, SPRING.smooth)));
  const km = kf(frame, [T.items, T.items + 30], [0, DISTANCE_KM], EASE.out);
  const panelState: PanelState = {
    mode: reverse ? 'reverse' : 'normal',
    combo: reverse ? sp(frame, T.comboIn, SPRING.smooth) : 0,
    menu: Math.max(0, menu),
    hoverOption: frame > T.clickOption - 12 && frame < T.clickOption + 8 ? 0 : null,
    value: frame >= T.clickOption + 4 ? SOURCE_ROUTE : null,
    loading: frame >= T.loading[0] && frame < T.loading[1],
    spin: frame * 18,
    items,
    distance: frame < T.items ? '—' : `${km.toFixed(1)} km`,
    breakout: Math.max(0, breakout),
    savePress: kf(frame, [T.clickSave + 1, T.clickSave + 4, T.clickSave + 10], [0, 1, 0]),
    activePop: reverse ? 1 + 0.25 * (1 - sp(frame, T.clickReverse + 2, SPRING.pop)) : 1
  };

  // ── Mapa ─────────────────────────────────────────────────────────────────────
  const fwdProgress = kf(frame, [...T.fwdDraw], [0, 1], EASE.inOut);
  const ghost = kf(frame, [...T.ghost], [0, 1]);
  const revProgress = kf(frame, [...T.revDraw], [0, 1], EASE.inOut);
  const fwdCarT = kf(frame, [...T.fwdCar], [0, 1], EASE.inOut);
  const revCarT = kf(frame, [...T.revCar], [0, 1], EASE.inOut);
  const carOpacity =
    frame < T.ghost[0]
      ? kf(frame, [T.fwdCar[0], T.fwdCar[0] + 6, T.fwdCar[1] + 20, T.fwdCar[1] + 30], [0, 1, 1, 0], EASE.out)
      : kf(frame, [T.revCar[0], T.revCar[0] + 6], [0, 1]);

  // Pines: en la ida aparecen cuando el trazo los alcanza; al invertir se recolorean en
  // el orden del regreso.
  const fwdAt = CHECKPOINTS.map((c) => progressOf(FORWARD_D, c.x, c.y));
  const revAt = CHECKPOINTS.map((c) => progressOf(REVERSE_D, c.x, c.y));
  const pins = CHECKPOINTS.map((c, i) => {
    const n = CHECKPOINTS.length;
    if (frame < T.ghost[0] + 10) {
      const hit = T.fwdDraw[0] + (T.fwdDraw[1] - T.fwdDraw[0]) * fwdAt[i];
      const color = i === 0 ? BRAND.success : i === n - 1 ? BRAND.danger : BRAND.primary;
      const label = i === 0 ? '' : i === n - 1 ? '' : String(i);
      const out = kf(frame, [T.ghost[0], T.ghost[0] + 10], [0, 1], EASE.in);
      return { c, color, label, scale: sp(frame, hit, SPRING.pop) * (1 - out), kind: i === 0 ? 'o' : i === n - 1 ? 'd' : 'm' };
    }
    const hit = T.revDraw[0] + (T.revDraw[1] - T.revDraw[0]) * revAt[i];
    const ri = n - 1 - i; // orden en la ruta inversa
    const color = ri === 0 ? BRAND.success : ri === n - 1 ? BRAND.danger : BRAND.primary;
    return { c, color, label: ri === 0 || ri === n - 1 ? '' : String(ri), scale: sp(frame, hit, SPRING.pop), kind: ri === 0 ? 'o' : ri === n - 1 ? 'd' : 'm' };
  });

  // ── Ventana: entrada y salida ────────────────────────────────────────────────
  const winStyle = windowMotion(frame, T.winIn, T.winOut);

  // ── Camara (coordenadas del escenario 1920x1080) ─────────────────────────────
  const pillsStage = uiToStage(PANEL.left + 220, PANEL.top + 190);
  const listStage = uiToStage(PANEL.left + 280, PANEL.top + 420);
  const saveStage = uiToStage(PANEL.left + 280, PANEL.top + PANEL.height - 70);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 150, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 200, fx: 1010, fy: 520, z: 1.06, rx: 0, ry: 0 },
    { f: 226, fx: 1010, fy: 520, z: 1.06 },
    { f: 262, fx: pillsStage.x, fy: pillsStage.y, z: 2.05, rx: 0, ry: 0 },
    { f: 340, fx: pillsStage.x, fy: pillsStage.y + 20, z: 2.05 },
    { f: 380, fx: listStage.x, fy: listStage.y, z: 1.65 },
    { f: 418, fx: listStage.x, fy: listStage.y, z: 1.65, rx: 0, ry: 0 },
    { f: 456, fx: 1310, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 560, fx: 1330, fy: 560, z: 0.9, rx: 4, ry: -12 },
    { f: 590, fx: saveStage.x, fy: saveStage.y, z: 1.7, rx: 0, ry: 0 },
    { f: 618, fx: saveStage.x, fy: saveStage.y, z: 1.7 },
    { f: 650, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 }
  ];

  // ── Cursor ───────────────────────────────────────────────────────────────────
  const cursor1 = anchors && [
    { f: T.cursorIn, ...A('pill-reverse', 90, 70) },
    { f: T.clickReverse, ...A('pill-reverse', 4, 3), click: true },
    { f: T.clickReverse + 26, ...A('pill-reverse', 30, 40) },
    { f: T.clickCombo, ...A('combo', 40, 2), click: true },
    { f: T.clickOption, ...A('option-0', -20, 2), click: true },
    { f: T.clickOption + 30, ...A('option-0', 40, 60) }
  ];
  const cursor2 = anchors && [
    { f: T.clickSave - 22, ...A('save', 60, -60) },
    { f: T.clickSave, ...A('save', 6, 2), click: true },
    { f: T.clickSave + 30, ...A('save', 40, 30) }
  ];

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />

      {/* Escenas 2-5: la app. Siempre montada (oculta fuera de sus escenas) para que las
          anclas del cursor se midan desde el primer frame. */}
      <AbsoluteFill style={{ visibility: frame >= T.winIn - 2 && frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={winStyle}>
            <MapBase width={1440} height={810} avenues={AVENUES} labels={LABELS} />
            <svg width={1440} height={810} style={{ position: 'absolute', inset: 0 }}>
              {frame < T.ghost[1] + 1 ? (
                <RouteLine
                  d={FORWARD_D}
                  progress={fwdProgress}
                  color={ghost > 0 ? '#8d97ab' : BRAND.primary}
                  opacity={1 - ghost * 0.55}
                  flowFrame={ghost > 0 ? undefined : frame}
                  glow={ghost === 0}
                />
              ) : (
                <RouteLine d={FORWARD_D} progress={1} color="#9aa3b5" opacity={0.45} dashed />
              )}
              <RouteLine d={REVERSE_D} progress={revProgress} color={BRAND.primary} flowFrame={frame} glow />
            </svg>
            {pins.map((p, i) => (
              <Pin key={i} x={p.c.x} y={p.c.y} color={p.color} scale={p.scale}>
                {p.kind === 'm' ? p.label : <span style={{ width: 8, height: 8, borderRadius: 9, background: '#fff', display: 'block' }} />}
              </Pin>
            ))}
            <Vehicle
              d={frame < T.ghost[0] ? FORWARD_D : REVERSE_D}
              t={frame < T.ghost[0] ? fwdCarT : revCarT}
              color={BRAND.primary}
              frame={frame}
              opacity={carOpacity}
            />

            {/* Panel del editor */}
            <div
              ref={panelRef}
              style={{
                position: 'absolute',
                left: PANEL.left,
                top: PANEL.top,
                width: PANEL.width,
                height: PANEL.height,
                transform: `translateX(${(1 - panelP) * -640}px)`,
                opacity: Math.min(1, panelP * 2),
                zIndex: 20
              }}
            >
              <RouteEditorPanelMock s={panelState} />
            </div>

            <Toast at={T.toast} out={T.winOut - 4} text={`La ruta "${NEW_ROUTE}" se guardó con éxito.`} x={1020} y={22} />
            {cursor1 && <Cursor path={cursor1} hideAt={T.clickOption + 34} scale={0.85} />}
            {cursor2 && <Cursor path={cursor2} hideAt={T.clickSave + 34} scale={0.85} />}
          </AppWindow>

          {/* Beneficios flotando al lado de la ventana */}
          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1500} y={300} icon={<Repeat size={28} strokeWidth={2.4} />}
            title="Checkpoints invertidos" body="Cada tramo conserva su configuración." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1530} y={452} icon={<Gauge size={28} strokeWidth={2.4} />}
            title="Hereda la configuración" body="Velocidad, horarios y notificaciones." />
          <Callout at={T.callouts[2]} out={T.calloutsOut + 6} x={1500} y={604} icon={<Unlink size={28} strokeWidth={2.4} />}
            title="Ruta independiente" body="Edítala sin tocar la ruta de ida." />
        </Camera>
      </AbsoluteFill>

      <Caption at={112} out={196} text="Tu ruta de ida ya está trazada" />
      <Caption at={252} out={320} text="Elige «Inversa» en Base de la ruta" />
      <Caption at={330} out={376} text="Selecciona la ruta que quieres invertir" />
      <Caption at={440} out={560} text="El regreso se arma solo" />
      <Caption at={584} out={652} text="Guarda y listo" />

      {/* Escena 6: cierre */}
      {frame >= T.winOut && (
        <EndCard title="Rutas inversas." highlight={['inversas']} subtitle="El camino de regreso, en un clic." at={{ title: T.end1, subtitle: T.end2, logo: T.logo }} />
      )}
    </AbsoluteFill>
  );
};

// Entrada rapida de lanzamiento y, debajo, el cuerpo desplazado para que la ventana de la app
// suba justo cuando la entrada sale (la ventana entra en el frame 56 del cuerpo).
const INTRO_WORDS = ['Ida.', 'Vuelta.', 'Un clic.'];
const SHIFT = launchIntroLength(INTRO_WORDS.length) - 62;
export const DURATION = BODY_DURATION + SHIFT;

export const RutasInversas = () => (
  <AbsoluteFill style={{ background: BRAND.bg }}>
    <Backdrop />
    <Sequence from={SHIFT}>
      <RutasInversasBody />
    </Sequence>
    <LaunchIntro words={INTRO_WORDS} title="Rutas inversas" icon={<Repeat size={84} strokeWidth={2.4} />} />
  </AbsoluteFill>
);
