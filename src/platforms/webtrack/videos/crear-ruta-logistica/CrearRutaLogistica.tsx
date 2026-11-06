// Tutorial sin audio: como crear una ruta logistica. Guion en guion.md.
// Tiempos en frames a 30 fps (1290 = 43 s).
import { useRef } from 'react';
import { Bell, MapPin, Shuffle, Spline } from 'lucide-react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { Hook } from '../../../../core/templates/Hook';
import { EndCard } from '../../../../core/templates/EndCard';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { KineticText } from '../../../../core/KineticText';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { Toast } from '../../../../core/Toast';
import { MapBase } from '../../components/MapBase';
import { RouteLine } from '../../components/RouteLine';
import { Pin } from '../../components/Pin';
import { Vehicle } from '../../components/Vehicle';
import { useAnchors } from '../../../../core/anchors';
import { typed } from '../../../../core/typing';
import { CreateRoutePanel, type CreatePanelState, type FieldKey } from './Panel';
import { SidebarCard } from './Sidebar';
import { AVENUES, CPS, FORM, FULL_D, LABELS, SEG1_D, SEG2_D } from './data';
import '../../style.css';

export const DURATION = 1290;

const T = {
  tag: 6,
  hook1: 12,
  hook2: 26,
  hookOut: 76,
  sideIn: 84,
  sideCursor: 112,
  clickCatalog: 146,
  sideOut: 190,
  winIn: 196,
  panelIn: 228,
  clickName: 270,
  clickAbbr: 324,
  clickCustomer: 352,
  clickTime: 394,
  clickWindow: 414,
  clickSpeed: 434,
  clickDesign: 494,
  pinBtn: [530, 614, 698],
  mapClick: [564, 648, 732],
  callouts: [818, 836, 854],
  calloutsOut: 924,
  clickSave: 972,
  saving: [976, 1036] as const,
  toast: 1040,
  car: [1046, 1140] as const,
  winOut: 1150,
  end1: 1160,
  end2: 1178,
  logo: 1196
};

const fontsReady = waitUntilDone();
const PANEL = { left: 16, top: 16, width: 560, height: 740 };
const between = (f: number, a: number, b: number) => f >= a && f < b;

export const CrearRutaLogistica = () => {
  const frame = useCurrentFrame();
  const panelRef = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(panelRef, fontsReady);
  const A = (name: string, dx = 0, dy = 0) => {
    const b = anchors?.[name];
    return b ? { x: PANEL.left + b.cx + dx, y: PANEL.top + b.cy + dy } : { x: 0, y: 0 };
  };
  // Clic sobre el lado izquierdo de un input (donde se escribe).
  const AL = (name: string) => {
    const b = anchors?.[name];
    return b ? { x: PANEL.left + b.x + 60, y: PANEL.top + b.cy + 2 } : { x: 0, y: 0 };
  };

  // ── Formulario ──────────────────────────────────────────────────────────────
  const focus: FieldKey | null = between(frame, T.clickName + 2, T.clickAbbr + 2)
    ? 'name'
    : between(frame, T.clickAbbr + 2, T.clickCustomer + 2)
      ? 'abbr'
      : between(frame, T.clickCustomer + 2, T.clickCustomer + 12)
        ? 'customer'
        : between(frame, T.clickTime + 2, T.clickWindow + 2)
          ? 'time'
          : between(frame, T.clickWindow + 2, T.clickWindow + 12)
            ? 'window'
            : between(frame, T.clickSpeed + 2, T.clickDesign)
              ? 'speed'
              : null;
  const values = {
    name: typed(frame, FORM.name, T.clickName + 4),
    abbr: typed(frame, FORM.abbr, T.clickAbbr + 4),
    customer: frame >= T.clickCustomer + 7 ? FORM.customer : '',
    time: typed(frame, FORM.time, T.clickTime + 4, 3),
    window: frame >= T.clickWindow + 7 ? FORM.window : '',
    speed: typed(frame, FORM.speed, T.clickSpeed + 4, 3)
  };

  // ── Checkpoints ─────────────────────────────────────────────────────────────
  const placed = T.mapClick.map((c) => (frame < c + 4 ? 0 : sp(frame, c + 4, SPRING.smooth)));
  const dropping = T.pinBtn.findIndex((b, i) => between(frame, b + 2, T.mapClick[i] + 4));
  const panelVisible =
    dropping >= 0
      ? 1 - kf(frame, [T.pinBtn[dropping] + 2, T.pinBtn[dropping] + 8], [0, 1])
      : Math.min(1, ...T.mapClick.map((c) => (frame >= c + 4 && frame < c + 14 ? kf(frame, [c + 4, c + 12], [0, 1]) : 1)));
  const seg1 = kf(frame, [T.mapClick[1] + 4, T.mapClick[1] + 34], [0, 1], EASE.inOut);
  const seg2 = kf(frame, [T.mapClick[2] + 4, T.mapClick[2] + 30], [0, 1], EASE.inOut);
  const km = frame < T.mapClick[1] + 4 ? null : frame < T.mapClick[2] + 4
    ? kf(frame, [T.mapClick[1] + 4, T.mapClick[1] + 34], [0, 11.2], EASE.out)
    : kf(frame, [T.mapClick[2] + 4, T.mapClick[2] + 30], [11.2, 18.6], EASE.out);

  const savingIn = kf(frame, [T.saving[0], T.saving[0] + 6], [0, 1]);
  const savingOut = kf(frame, [T.saving[1], T.saving[1] + 8], [0, 1]);
  const panelState: CreatePanelState = {
    frame,
    tab: frame >= T.clickDesign + 2 ? 'design' : 'general',
    values,
    focus,
    cps: placed,
    cpNames: CPS.map((c) => c.name),
    distance: km == null ? '—' : `${km.toFixed(1)} km`,
    activeRow: dropping >= 0 ? dropping : null,
    savePress: kf(frame, [T.clickSave + 1, T.clickSave + 4, T.clickSave + 10], [0, 1, 0]),
    saving: savingIn * (1 - savingOut),
    savingStep: Math.min(3, Math.max(0, Math.floor((frame - T.saving[0]) / 14)))
  };

  // ── Ventana y camara ────────────────────────────────────────────────────────
  const winStyle = windowMotion(frame, T.winIn, T.winOut);
  const panelP = sp(frame, T.panelIn, SPRING.smooth);
  const formTop = uiToStage(PANEL.left + 280, 250);
  const formLow = uiToStage(PANEL.left + 280, 470);
  const saveStage = uiToStage(PANEL.left + 280, PANEL.top + PANEL.height - 70);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 226, fx: 960, fy: 540, z: 1 },
    { f: 262, fx: formTop.x, fy: formTop.y, z: 1.8 },
    { f: 362, fx: formTop.x, fy: formTop.y, z: 1.8 },
    { f: 390, fx: formLow.x, fy: formLow.y, z: 1.8 },
    { f: 462, fx: formLow.x, fy: formLow.y, z: 1.8, rx: 0, ry: 0 },
    { f: 492, fx: 960, fy: 540, z: 1.1 },
    { f: 772, fx: 960, fy: 540, z: 1.1, rx: 0, ry: 0 },
    { f: 806, fx: 1310, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 926, fx: 1330, fy: 560, z: 0.9, rx: 4, ry: -12 },
    { f: 956, fx: saveStage.x, fy: saveStage.y, z: 1.7, rx: 0, ry: 0 },
    { f: 984, fx: saveStage.x, fy: saveStage.y, z: 1.7 },
    { f: 1012, fx: 860, fy: 540, z: 1.12 },
    { f: 1046, fx: 960, fy: 540, z: 1 }
  ];

  // ── Cursor (coordenadas de la UI) ───────────────────────────────────────────
  const cursor: Waypoint[] | null = anchors && [
    { f: T.clickName - 28, ...A('field-name', 160, 90) },
    { f: T.clickName, ...AL('field-name'), click: true },
    { f: T.clickAbbr, ...AL('field-abbr'), click: true },
    { f: T.clickCustomer, ...AL('field-customer'), click: true },
    { f: T.clickTime, ...AL('field-time'), click: true },
    { f: T.clickWindow, ...AL('field-window'), click: true },
    { f: T.clickSpeed, ...AL('field-speed'), click: true },
    { f: T.clickSpeed + 26, ...AL('field-speed') },
    { f: T.clickDesign, ...A('tab-design'), click: true },
    ...T.pinBtn.flatMap((b, i) => [
      { f: b, ...A(`pin-btn-${i}`), click: true },
      { f: T.mapClick[i], x: CPS[i].x, y: CPS[i].y - 4, click: true },
      { f: T.mapClick[i] + 14, x: CPS[i].x + 30, y: CPS[i].y + 26 }
    ]),
    { f: T.mapClick[2] + 30, x: CPS[2].x + 60, y: CPS[2].y + 60 }
  ];
  const cursorSave: Waypoint[] | null = anchors && [
    { f: T.clickSave - 22, ...A('save', 60, -60) },
    { f: T.clickSave, ...A('save', 6, 2), click: true },
    { f: T.clickSave + 30, ...A('save', 40, 30) }
  ];

  // Cursor del menu lateral (coordenadas del escenario)
  const side = sp(frame, T.sideIn, SPRING.smooth);
  const sideOut = kf(frame, [T.sideOut, T.sideOut + 16], [0, 1], EASE.in);

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />

      {/* 1. Gancho */}
      {frame < T.sideIn + 20 && (
        <Hook
          tag="TUTORIAL · RUTAS LOGÍSTICAS"
          lines={['Tu primera ruta logística,', 'en menos de un minuto.']}
          highlight={['un', 'minuto']}
          fontSize={112}
          at={{ tag: T.tag, line1: T.hook1, line2: T.hook2, out: T.hookOut }}
        />
      )}

      {/* 2. Menu lateral */}
      {frame >= T.sideIn - 2 && frame < T.sideOut + 18 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              opacity: Math.min(1, side * 1.5) * (1 - sideOut),
              transform: `translateY(${(1 - side) * 120}px) scale(${1.5 * (0.92 + 0.08 * side) * (1 + sideOut * 0.18)})`,
              filter: sideOut > 0 ? `blur(${sideOut * 10}px)` : undefined
            }}
          >
            <SidebarCard activeCatalog={frame >= T.clickCatalog + 2} />
          </div>
          <Cursor
            path={[
              { f: T.sideCursor, x: 1180, y: 760 },
              { f: T.clickCatalog, x: 884, y: 562, click: true },
              { f: T.clickCatalog + 30, x: 940, y: 620 }
            ]}
            hideAt={T.sideOut}
          />
        </AbsoluteFill>
      )}

      {/* 3-6. La app (siempre montada para medir anclas) */}
      <AbsoluteFill style={{ visibility: frame >= T.winIn - 2 && frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={winStyle}>
            <MapBase width={1440} height={810} avenues={AVENUES} labels={LABELS} />
            <svg width={1440} height={810} style={{ position: 'absolute', inset: 0 }}>
              <RouteLine d={SEG1_D} progress={seg1} color={BRAND.primary} flowFrame={frame} glow />
              <RouteLine d={SEG2_D} progress={seg2} color={BRAND.primary} flowFrame={frame} glow />
            </svg>
            {CPS.map((c, i) => (
              <Pin
                key={c.name}
                x={c.x}
                y={c.y}
                color={i === 0 ? BRAND.success : i === CPS.length - 1 ? BRAND.danger : BRAND.primary}
                scale={frame < T.mapClick[i] + 2 ? 0 : sp(frame, T.mapClick[i] + 2, SPRING.pop)}
              >
                {i === 1 ? '1' : <span style={{ width: 8, height: 8, borderRadius: 9, background: '#fff', display: 'block' }} />}
              </Pin>
            ))}
            <Vehicle d={FULL_D} t={kf(frame, [...T.car], [0, 1], EASE.inOut)} color={BRAND.primary} frame={frame} opacity={kf(frame, [T.car[0], T.car[0] + 6], [0, 1])} />

            {/* Aviso al colocar un checkpoint (reactiveMapRoute.checkpoint.dropHint) */}
            {dropping >= 0 && (
              <div style={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 999,
                    background: 'rgba(15,23,40,.86)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: sp(frame, T.pinBtn[dropping] + 4, SPRING.smooth),
                    transform: `translateY(${(1 - sp(frame, T.pinBtn[dropping] + 4, SPRING.smooth)) * -16}px)`
                  }}
                >
                  <MapPin size={15} />
                  Haz clic en el mapa para colocar
                </div>
              </div>
            )}

            <div
              ref={panelRef}
              style={{
                position: 'absolute',
                left: PANEL.left,
                top: PANEL.top,
                width: PANEL.width,
                height: PANEL.height,
                transform: `translateX(${(1 - panelP) * -640}px)`,
                opacity: Math.min(1, panelP * 2) * panelVisible,
                zIndex: 20
              }}
            >
              <CreateRoutePanel s={panelState} />
            </div>

            <Toast at={T.toast} out={T.winOut - 4} text={`La ruta "${FORM.name}" se guardó con éxito.`} x={1000} y={22} />
            {cursor && <Cursor path={cursor} hideAt={T.mapClick[2] + 34} scale={0.85} />}
            {cursorSave && <Cursor path={cursorSave} hideAt={T.clickSave + 34} scale={0.85} />}
          </AppWindow>

          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1500} y={300} icon={<Spline size={28} strokeWidth={2.4} />}
            title="Configura cada tramo" body="Velocidad, paradas y tiempos." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1530} y={452} icon={<Shuffle size={28} strokeWidth={2.4} />}
            title="Rutas alternas" body="Define los desvíos permitidos." />
          <Callout at={T.callouts[2]} out={T.calloutsOut + 6} x={1500} y={604} icon={<Bell size={28} strokeWidth={2.4} />}
            title="Notificaciones" body="Avisos por correo si se pasa del tiempo." />
        </Camera>
      </AbsoluteFill>

      <Caption at={100} out={186} text="Entra a Logística › Catálogo Ruta Logística" />
      <Caption at={262} out={470} text="Completa la información general" />
      <Caption at={480} out={520} text="Pasa a Diseño de la Ruta" />
      <Caption at={528} out={772} text="Coloca cada checkpoint en el mapa" />
      <Caption at={806} out={926} text="Ajusta los detalles cuando lo necesites" />
      <Caption at={950} out={1138} text="Guarda y tu ruta queda lista" />

      {/* 7. Cierre */}
      {frame >= T.winOut && (
        <EndCard title="Tu ruta, lista." highlight={['lista']} subtitle="Asígnala y monitoréala en tiempo real." at={{ title: T.end1, subtitle: T.end2, logo: T.logo }} />
      )}
    </AbsoluteFill>
  );
};
