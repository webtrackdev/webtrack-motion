// Tutorial sin audio: tramos de una ruta y tiempo de parada autorizada. Guion en guion.md.
// Tiempos en frames a 30 fps (1040 = ~35 s).
import { useRef } from 'react';
import { Clock, Route as RouteIcon, ShieldCheck, Spline } from 'lucide-react';
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
import { pointAt, progressOf } from '../../../../core/geo';
import { useAnchors } from '../../../../core/anchors';
import { typed } from '../../../../core/typing';
import { SegmentsPanel, type SegPanelState } from './Panel';
import { AVENUES, CPS, EDIT_SEG, FULL_D, LABELS, ROUTE_NAME, SEGS, STOP_MINUTES } from './data';
import '../../style.css';

export const DURATION = 1040;

const T = {
  tag: 6,
  hook1: 12,
  hook2: 26,
  hookOut: 74,
  winIn: 80,
  panelIn: 104,
  drops: [132, 150, 168, 186],
  cursorIn: 290,
  clickSeg: 322,
  clickStop: 384,
  clickNoLimit: 444,
  clickStopTime: 490,
  clickSubSave: 562,
  callouts: [652, 670, 688],
  calloutsOut: 790,
  car: { start: 640, arrive: 700, leave: 744, end: 792 },
  clickSave: 834,
  toast: 842,
  winOut: 900,
  end1: 910,
  end2: 928,
  logo: 946
};

const fontsReady = waitUntilDone();
const PANEL = { left: 16, top: 16, width: 560, height: 740 };
const T_STOP = progressOf(FULL_D, CPS[2].x, CPS[2].y);

export const TramosParadaAutorizada = () => {
  const frame = useCurrentFrame();
  const panelRef = useRef<HTMLDivElement>(null);
  const anchors = useAnchors(panelRef, fontsReady);
  const A = (name: string, dx = 0, dy = 0) => {
    const b = anchors?.[name];
    return b ? { x: PANEL.left + b.cx + dx, y: PANEL.top + b.cy + dy } : { x: 0, y: 0 };
  };

  // ── Panel ───────────────────────────────────────────────────────────────────
  const cpsIn = T.drops.map((d) => (frame < d ? 0 : sp(frame, d, SPRING.smooth)));
  const segP = SEGS.map((_, i) => kf(frame, [T.drops[i + 1], T.drops[i + 1] + 22], [0, 1], EASE.inOut));
  const km = kf(frame, [T.drops[1], T.drops[3] + 22], [0, 18.6], EASE.out);
  const subIn = kf(frame, [T.clickSeg + 2, T.clickSeg + 7], [0, 1], EASE.out);
  const subOut = kf(frame, [T.clickSubSave + 4, T.clickSubSave + 14], [0, 1], EASE.in);
  const panelState: SegPanelState = {
    frame,
    cps: cpsIn,
    distance: frame < T.drops[1] ? '—' : `${km.toFixed(1)} km`,
    activeRow: frame >= T.clickSeg - 10 && frame < T.clickSeg + 6 ? EDIT_SEG : null,
    savePress: kf(frame, [T.clickSave + 1, T.clickSave + 4, T.clickSave + 10], [0, 1, 0]),
    sub: frame < T.clickSeg + 2 ? 0 : subIn * (1 - subOut),
    stopAuthorized: frame >= T.clickStop + 2,
    withoutStopTime: frame < T.clickNoLimit + 2,
    noLimitIn: frame < T.clickStop + 2 ? 0 : sp(frame, T.clickStop + 2, SPRING.smooth),
    stopTimeIn: frame < T.clickNoLimit + 2 ? 0 : sp(frame, T.clickNoLimit + 2, SPRING.smooth),
    stopTime: typed(frame, STOP_MINUTES, T.clickStopTime + 6, 5),
    stopTimeFocus: frame >= T.clickStopTime + 2 && frame < T.clickSubSave,
    subSavePress: kf(frame, [T.clickSubSave + 1, T.clickSubSave + 4, T.clickSubSave + 10], [0, 1, 0])
  };

  // ── Mapa ────────────────────────────────────────────────────────────────────
  const editing = frame >= T.clickSeg && frame < T.clickSubSave + 14;
  const focusSeg = editing ? kf(frame, [T.clickSeg, T.clickSeg + 10], [0, 1]) : kf(frame, [T.clickSubSave + 14, T.clickSubSave + 24], [1, 0]) * (frame >= T.clickSubSave ? 1 : 0);
  const labelsIn = sp(frame, T.drops[3] + 20, SPRING.pop);
  const labelsOut = kf(frame, [T.callouts[0] - 20, T.callouts[0] - 8], [0, 1]);
  const chipIn = frame < T.clickSubSave + 16 ? 0 : sp(frame, T.clickSubSave + 16, SPRING.pop);

  const carT =
    frame < T.car.leave
      ? kf(frame, [T.car.start, T.car.arrive], [0, T_STOP], EASE.inOut)
      : kf(frame, [T.car.leave, T.car.end], [T_STOP, 1], EASE.inOut);
  const carOpacity = kf(frame, [T.car.start, T.car.start + 6, T.car.end + 10, T.car.end + 20], [0, 1, 1, 0]);
  const stopRing = kf(frame, [T.car.arrive, T.car.leave - 4], [0, 1], (t) => t);
  const stopRingVis = frame >= T.car.arrive && frame < T.car.leave + 6 ? kf(frame, [T.car.leave, T.car.leave + 6], [1, 0]) : 0;

  // ── Ventana y camara ────────────────────────────────────────────────────────
  const winStyle = windowMotion(frame, T.winIn, T.winOut);
  const panelP = sp(frame, T.panelIn, SPRING.smooth);
  const listStage = uiToStage(PANEL.left + 300, 330);
  const togglesStage = uiToStage(PANEL.left + 300, 470);
  const saveStage = uiToStage(PANEL.left + 280, PANEL.top + PANEL.height - 70);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 104, fx: 960, fy: 540, z: 1 },
    { f: 150, fx: 1000, fy: 520, z: 1.1 },
    { f: 280, fx: 1000, fy: 520, z: 1.1 },
    { f: 312, fx: listStage.x, fy: listStage.y, z: 1.55 },
    { f: 340, fx: listStage.x, fy: listStage.y, z: 1.55 },
    { f: 372, fx: togglesStage.x, fy: togglesStage.y, z: 1.95 },
    { f: 548, fx: togglesStage.x, fy: togglesStage.y + 30, z: 1.95 },
    { f: 600, fx: 1000, fy: 520, z: 1.1, rx: 0, ry: 0 },
    { f: 630, fx: 1310, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 792, fx: 1330, fy: 560, z: 0.9, rx: 4, ry: -12 },
    { f: 818, fx: saveStage.x, fy: saveStage.y, z: 1.7, rx: 0, ry: 0 },
    { f: 848, fx: saveStage.x, fy: saveStage.y, z: 1.7 },
    { f: 876, fx: 960, fy: 540, z: 1 }
  ];

  // ── Cursor ──────────────────────────────────────────────────────────────────
  const cursor: Waypoint[] | null = anchors && [
    { f: T.cursorIn, ...A(`seg-btn-${EDIT_SEG}`, 160, 80) },
    { f: T.clickSeg, ...A(`seg-btn-${EDIT_SEG}`), click: true },
    { f: T.clickSeg + 30, ...A(`seg-btn-${EDIT_SEG}`, 120, 40) },
    { f: T.clickStop, ...A('toggle-stop'), click: true },
    { f: T.clickNoLimit, ...A('toggle-nolimit'), click: true },
    { f: T.clickStopTime, ...A('field-stoptime', -40, 0), click: true },
    { f: T.clickSubSave, ...A('sub-save'), click: true },
    { f: T.clickSubSave + 26, ...A('sub-save', 80, -40) }
  ];
  const cursorSave: Waypoint[] | null = anchors && [
    { f: T.clickSave - 22, ...A('save', 60, -60) },
    { f: T.clickSave, ...A('save', 6, 2), click: true },
    { f: T.clickSave + 30, ...A('save', 40, 30) }
  ];

  const segMid = SEGS.map((d) => pointAt(d, 0.5));
  const stopMid = pointAt(SEGS[EDIT_SEG], 0.5);
  const carPos = pointAt(FULL_D, carT);

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />

      {/* 1. Gancho */}
      {frame < T.winIn + 24 && (
        <Hook
          tag="TUTORIAL · TRAMOS"
          tagIcon={<Spline size={22} strokeWidth={2.5} />}
          lines={['Cada tramo,', 'con sus propias reglas.']}
          highlight={['propias', 'reglas']}
          fontSize={124}
          at={{ tag: T.tag, line1: T.hook1, line2: T.hook2, out: T.hookOut }}
        />
      )}

      {/* 2-6. La app (siempre montada para medir anclas) */}
      <AbsoluteFill style={{ visibility: frame >= T.winIn - 2 && frame < T.winOut + 26 ? 'visible' : 'hidden' }}>
        <Camera keys={cam}>
          <AppWindow style={winStyle}>
            <MapBase width={1440} height={810} avenues={AVENUES} labels={LABELS} />
            <svg width={1440} height={810} style={{ position: 'absolute', inset: 0 }}>
              {SEGS.map((d, i) => (
                <RouteLine
                  key={i}
                  d={d}
                  progress={segP[i]}
                  color={BRAND.primary}
                  width={i === EDIT_SEG ? 7 + 3 * focusSeg : 7}
                  opacity={i === EDIT_SEG ? 1 : 1 - 0.6 * focusSeg}
                  flowFrame={frame}
                  glow={i === EDIT_SEG && focusSeg > 0}
                />
              ))}
            </svg>
            {CPS.map((c, i) => (
              <Pin
                key={c.name}
                x={c.x}
                y={c.y}
                color={i === 0 ? BRAND.success : i === CPS.length - 1 ? BRAND.danger : BRAND.primary}
                scale={frame < T.drops[i] ? 0 : sp(frame, T.drops[i], SPRING.pop)}
              >
                {i === 0 || i === CPS.length - 1 ? <span style={{ width: 8, height: 8, borderRadius: 9, background: '#fff', display: 'block' }} /> : String(i)}
              </Pin>
            ))}

            {/* Etiquetas de tramo (capa de motion, no son UI de la app) */}
            {segMid.map((m, i) => {
              const hi = i === EDIT_SEG ? focusSeg : 0;
              const vis = labelsIn * (1 - labelsOut) * (i === EDIT_SEG ? 1 : 1 - 0.6 * focusSeg);
              if (vis <= 0.01) return null;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: m.x + 18,
                    top: m.y - 40,
                    padding: '5px 11px',
                    borderRadius: 999,
                    background: hi > 0.5 ? BRAND.primary : '#fff',
                    color: hi > 0.5 ? '#fff' : BRAND.primary,
                    border: `1.5px solid ${BRAND.primary}`,
                    fontSize: 13,
                    fontWeight: 800,
                    opacity: vis,
                    transform: `scale(${(0.6 + 0.4 * labelsIn) * (1 + 0.15 * hi)})`,
                    boxShadow: '0 8px 18px -8px rgba(15,23,40,.4)',
                    zIndex: 9
                  }}
                >
                  Tramo {i + 1}
                </div>
              );
            })}

            {/* Resultado: chip del tramo configurado */}
            {chipIn > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: stopMid.x + 22,
                  top: stopMid.y - 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 12px',
                  borderRadius: 12,
                  background: '#fff',
                  border: '1px solid rgba(34,160,107,.35)',
                  color: '#16794f',
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: '0 12px 26px -10px rgba(15,23,40,.4)',
                  opacity: chipIn * (1 - labelsOut * 0.0),
                  transform: `scale(${0.6 + 0.4 * chipIn})`,
                  transformOrigin: '0% 50%',
                  zIndex: 9
                }}
              >
                <Clock size={14} />
                Parada autorizada · {STOP_MINUTES} min
              </div>
            )}

            <Vehicle d={FULL_D} t={carT} color={BRAND.primary} frame={frame} opacity={carOpacity} />
            {stopRingVis > 0 && (
              <svg width={1440} height={810} style={{ position: 'absolute', inset: 0, zIndex: 9 }}>
                <circle cx={carPos.x} cy={carPos.y} r={30} fill="none" stroke="rgba(34,160,107,.18)" strokeWidth={5} opacity={stopRingVis} />
                <circle
                  cx={carPos.x}
                  cy={carPos.y}
                  r={30}
                  fill="none"
                  stroke="#22a06b"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 30 * stopRing} ${2 * Math.PI * 30}`}
                  transform={`rotate(-90 ${carPos.x} ${carPos.y})`}
                  opacity={stopRingVis}
                />
              </svg>
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
                opacity: Math.min(1, panelP * 2),
                zIndex: 20
              }}
            >
              <SegmentsPanel s={panelState} />
            </div>

            <Toast at={T.toast} out={T.winOut - 4} text={`La ruta "${ROUTE_NAME}" se guardó con éxito.`} x={1000} y={22} />
            {cursor && <Cursor path={cursor} hideAt={T.clickSubSave + 30} scale={0.85} />}
            {cursorSave && <Cursor path={cursorSave} hideAt={T.clickSave + 34} scale={0.85} />}
          </AppWindow>

          <Callout at={T.callouts[0]} out={T.calloutsOut} x={1500} y={300} icon={<ShieldCheck size={28} strokeWidth={2.4} />}
            title="Parada autorizada" body="La unidad puede detenerse en el tramo." />
          <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1530} y={452} icon={<Clock size={28} strokeWidth={2.4} />}
            title={`Hasta ${STOP_MINUTES} minutos`} body="O sin límite, si así lo prefieres." />
          <Callout at={T.callouts[2]} out={T.calloutsOut + 6} x={1500} y={604} icon={<RouteIcon size={28} strokeWidth={2.4} />}
            title="Reglas por tramo" body="Velocidad y tiempos de recorrido." />
        </Camera>
      </AbsoluteFill>

      <Caption at={140} out={290} text="Cada par de checkpoints forma un tramo" />
      <Caption at={300} out={356} text="Abre el tramo que quieres configurar" />
      <Caption at={362} out={424} text="Activa «Parada Autorizada»" />
      <Caption at={430} out={482} text="Desactiva «Sin límite de tiempo»" />
      <Caption at={488} out={548} text="Escribe los minutos permitidos" />
      <Caption at={554} out={604} text="Guarda el tramo" />
      <Caption at={640} out={792} text={`Parada autorizada de hasta ${STOP_MINUTES} minutos`} />
      <Caption at={808} out={886} text="Guarda la ruta" />

      {/* 7. Cierre */}
      {frame >= T.winOut && (
        <EndCard title="Paradas bajo control." highlight={['control']} subtitle="Configura cada tramo de tu ruta." fontSize={140} at={{ title: T.end1, subtitle: T.end2, logo: T.logo }} />
      )}
    </AbsoluteFill>
  );
};
