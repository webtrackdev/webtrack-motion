// Tutorial sin audio: crear una geocerca en el mapa y asignarla a unidades. Guion en guion.md.
// Tiempos en frames a 30 fps (1290 = 43 s).
import { useRef, type FC } from 'react';
import { BarChart3, Bell, Cpu, List, Map as MapIcon, Navigation2, Truck, Users } from 'lucide-react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, SPRING, kf, lerp, sp } from '../../../../core/anim';
import { Backdrop } from '../../../../core/Backdrop';
import { Camera, type CamKey } from '../../../../core/Camera';
import { AppWindow, uiToStage, windowMotion } from '../../../../core/AppWindow';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { Callout } from '../../../../core/Callout';
import { Caption } from '../../../../core/Caption';
import { useAnchors } from '../../../../core/anchors';
import { typed } from '../../../../core/typing';
import { pointAt } from '../../../../core/geo';
import { shadows } from '../../../../core/theme';
import { Hook } from '../../../../core/templates/Hook';
import { EndCard } from '../../../../core/templates/EndCard';
import { MapBase } from '../../components/MapBase';
import { IcoIcon } from '../../components/IcoIcon';
import { BRAND } from '../../platform';
import { fontFamily, waitUntilDone } from '../../fonts';
import { AssignPage, GeofenceForm, MapToolbarMock, type AssignState } from './Screens';
import { AVENUES, GEOFENCE, LABELS, P118_PATH, UNITS } from './data';
import '../../style.css';

export const DURATION = 1290;

const T = {
  hook: { tag: 6, line1: 12, line2: 26, out: 74 },
  mapIn: 80,
  clickGeo: 136,
  clickCircle: 168,
  drawStart: 200,
  drawEnd: 238,
  formIn: 246,
  clickName: 282,
  clickAddr: 324,
  clickSave: 372,
  mapOut: 420,
  menuIn: 434,
  clickMenu: 482,
  menuOut: 520,
  pageIn: 526,
  clickNotify: 590,
  clickNotifyOpt: 618,
  clickNext1: 656,
  clickGeo2: 700,
  clickGeoOpt: 724,
  clickUnit: 752,
  clickUnitOpt1: 774,
  clickUnitOpt2: 792,
  clickAssign: 826,
  clickNext2: 872,
  clickFinish: 926,
  pageOut: 952,
  resultIn: 958,
  car: [992, 1060] as const,
  callouts: [1012, 1030, 1048],
  calloutsOut: 1128,
  resultOut: 1150,
  end: { title: 1162, subtitle: 1180, logo: 1198 }
};

const fontsReady = waitUntilDone();
const between = (f: number, a: number, b: number) => f >= a && f < b;
const pulse = (f: number, c: number) => kf(f, [c + 1, c + 4, c + 10], [0, 1, 0]);

const UnitMarker: FC<{ x: number; y: number; name: string; angle?: number; ring?: number }> = ({ x, y, name, angle = 0, ring = 0 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 8 }}>
    {ring > 0 && (
      <div style={{ position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: '50%', border: `3px solid ${BRAND.success}`, opacity: 1 - ring, transform: `scale(${0.6 + ring})` }} />
    )}
    <div
      style={{
        position: 'absolute',
        left: -15,
        top: -15,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: BRAND.primary,
        border: '3px solid #fff',
        boxShadow: '0 6px 14px -5px rgba(15,23,40,.5)',
        display: 'grid',
        placeItems: 'center',
        transform: `rotate(${angle}deg)`
      }}
    >
      <Navigation2 size={14} color="#fff" fill="#fff" />
    </div>
    <div style={{ position: 'absolute', left: 18, top: -11, padding: '2px 7px', borderRadius: 6, background: '#fff', fontSize: 11, fontWeight: 800, color: BRAND.ink, boxShadow: '0 4px 10px -4px rgba(15,23,40,.35)', whiteSpace: 'nowrap' }}>
      {name}
    </div>
  </div>
);

const GeofenceShape: FC<{ r: number; drawing: boolean; label: number; flash?: number }> = ({ r, drawing, label, flash = 0 }) => {
  if (r <= 0) return null;
  const { cx, cy } = GEOFENCE;
  return (
    <>
      <svg width={1440} height={810} style={{ position: 'absolute', inset: 0, zIndex: 4 }}>
        <circle cx={cx} cy={cy} r={r} fill={BRAND.primary} fillOpacity={0.14 + 0.12 * flash} stroke={BRAND.primary} strokeWidth={3} strokeDasharray={drawing ? '8 7' : undefined} />
        {drawing && (
          <>
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={BRAND.primary} strokeWidth={2} strokeDasharray="5 5" />
            <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={BRAND.primary} strokeWidth={2.5} />
          </>
        )}
      </svg>
      {label > 0 && (
        <div style={{ position: 'absolute', left: cx, top: cy - r - 34, transform: `translateX(-50%) scale(${0.7 + 0.3 * label})`, opacity: label, padding: '4px 10px', borderRadius: 8, background: '#fff', border: `1.5px solid ${BRAND.primary}`, color: BRAND.primary, fontSize: 13, fontWeight: 800, zIndex: 6, whiteSpace: 'nowrap' }}>
          {GEOFENCE.name}
        </div>
      )}
    </>
  );
};

const MenuItem: FC<{ icon?: React.ReactNode; label: string; active?: boolean; child?: boolean; group?: boolean }> = ({ icon, label, active, child, group }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 50, padding: child ? '0 18px 0 58px' : '0 18px', borderRadius: 12, fontSize: child ? 19 : 20, fontWeight: active ? 800 : group ? 700 : 600, color: active ? BRAND.primary : group ? BRAND.ink : BRAND.body, background: active ? 'rgba(4,14,255,.08)' : 'transparent' }}>
    {icon}
    <span style={{ flex: 1 }}>{label}</span>
  </div>
);

export const GeocercaAsignarUnidad = () => {
  const frame = useCurrentFrame();
  const mapRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const mapA = useAnchors(mapRef, fontsReady);
  const pageA = useAnchors(pageRef, fontsReady);
  const M = (n: string, dx = 0, dy = 0) => (mapA?.[n] ? { x: mapA[n].cx + dx, y: mapA[n].cy + dy } : { x: 0, y: 0 });
  const ML = (n: string) => (mapA?.[n] ? { x: mapA[n].x + 50, y: mapA[n].cy + 2 } : { x: 0, y: 0 });
  const P = (n: string, dx = 0, dy = 0) => (pageA?.[n] ? { x: pageA[n].cx + dx, y: pageA[n].cy + dy } : { x: 0, y: 0 });

  // ── Escena del mapa ───────────────────────────────────────────────────────────────
  const flyout = frame < T.clickGeo + 2 ? 0 : Math.min(sp(frame, T.clickGeo + 2, SPRING.snappy), 1 - kf(frame, [T.drawStart - 6, T.drawStart], [0, 1]));
  const drawR = frame < T.drawStart ? 0 : kf(frame, [T.drawStart, T.drawEnd], [0, GEOFENCE.r], EASE.inOut);
  const formP = frame < T.formIn ? 0 : sp(frame, T.formIn, SPRING.smooth) * (1 - kf(frame, [T.clickSave + 4, T.clickSave + 12], [0, 1], EASE.in));
  const saved = frame >= T.clickSave + 6;
  const labelIn = saved ? sp(frame, T.clickSave + 8, SPRING.pop) : 0;
  const formState = {
    frame,
    name: typed(frame, GEOFENCE.name, T.clickName + 4),
    address: typed(frame, GEOFENCE.address, T.clickAddr + 4),
    focus: between(frame, T.clickName + 2, T.clickAddr + 2) ? ('name' as const) : between(frame, T.clickAddr + 2, T.clickSave) ? ('address' as const) : null,
    savePress: pulse(frame, T.clickSave)
  };

  // ── Pantalla de asignacion ─────────────────────────────────────────────────────────
  const open = (a: number, b: number) => (frame < a ? 0 : Math.min(sp(frame, a, SPRING.snappy), 1 - kf(frame, [b, b + 6], [0, 1])));
  const assign: AssignState = {
    step: frame < T.clickNext1 + 2 ? 0 : frame < T.clickNext2 + 2 ? 1 : 2,
    notifyOpen: open(T.clickNotify + 2, T.clickNotifyOpt + 3),
    notifyHover: between(frame, T.clickNotifyOpt - 10, T.clickNotifyOpt + 4) ? 2 : null,
    notify: frame >= T.clickNotifyOpt + 3 ? 'Entrada/Salida' : '',
    geoOpen: open(T.clickGeo2 + 2, T.clickGeoOpt + 3),
    geoHover: between(frame, T.clickGeoOpt - 10, T.clickGeoOpt + 4) ? 0 : null,
    geofences: frame >= T.clickGeoOpt + 3 ? ['Bodega Central (Círculo)'] : [],
    unitOpen: open(T.clickUnit + 2, T.clickUnitOpt2 + 6),
    unitHover: between(frame, T.clickUnitOpt1 - 10, T.clickUnitOpt1 + 4) ? 0 : between(frame, T.clickUnitOpt2 - 10, T.clickUnitOpt2 + 4) ? 1 : null,
    units: frame >= T.clickUnitOpt2 + 3 ? ['P-118', 'C-204'] : frame >= T.clickUnitOpt1 + 3 ? ['P-118'] : [],
    assigned: frame < T.clickAssign + 3 ? 0 : sp(frame, T.clickAssign + 3, SPRING.smooth),
    press: { next1: pulse(frame, T.clickNext1), assign: pulse(frame, T.clickAssign), next2: pulse(frame, T.clickNext2), finish: pulse(frame, T.clickFinish) }
  };

  // ── Escena de resultado ────────────────────────────────────────────────────────────
  const carT = kf(frame, [...T.car], [0, 1], EASE.inOut);
  const car = pointAt(P118_PATH, carT);
  const entered = frame >= T.car[0] + 50;
  const enterRing = entered ? kf(frame, [T.car[0] + 50, T.car[0] + 72], [0, 1], EASE.out) : 0;
  const flash = entered ? kf(frame, [T.car[0] + 50, T.car[0] + 56, T.car[0] + 76], [0, 1, 0]) : 0;

  // ── Cursores (coordenadas de la UI de cada ventana) ─────────────────────────────────
  const mapCursor: Waypoint[] | null = mapA && [
    { f: T.clickGeo - 26, ...M('btn-geofences', 160, 120) },
    { f: T.clickGeo, ...M('btn-geofences'), click: true },
    { f: T.clickCircle, ...M('btn-circle'), click: true },
    { f: T.drawStart, x: GEOFENCE.cx, y: GEOFENCE.cy, click: true },
    { f: T.drawEnd, x: GEOFENCE.cx + GEOFENCE.r, y: GEOFENCE.cy },
    { f: T.clickName, ...ML('field-name'), click: true },
    { f: T.clickAddr, ...ML('field-address'), click: true },
    { f: T.clickSave, ...M('form-save'), click: true },
    { f: T.clickSave + 26, ...M('form-save', -60, 50) }
  ];
  const pageCursor: Waypoint[] | null = pageA && [
    { f: T.clickNotify - 26, ...P('notify', 120, 90) },
    { f: T.clickNotify, ...P('notify', -60, 0), click: true },
    { f: T.clickNotifyOpt, ...P('notify-opt-2', -80, 0), click: true },
    { f: T.clickNext1, ...P('next-1'), click: true },
    { f: T.clickGeo2, ...P('geo', -80, 0), click: true },
    { f: T.clickGeoOpt, ...P('geo-opt-0', -60, 0), click: true },
    { f: T.clickUnit, ...P('unit', -80, 0), click: true },
    { f: T.clickUnitOpt1, ...P('unit-opt-0', -100, 0), click: true },
    { f: T.clickUnitOpt2, ...P('unit-opt-1', -100, 0), click: true },
    { f: T.clickAssign, ...P('assign'), click: true },
    { f: T.clickNext2, ...P('next-2'), click: true },
    { f: T.clickFinish, ...P('finish'), click: true },
    { f: T.clickFinish + 24, ...P('finish', -60, -40) }
  ];

  // ── Camara ──────────────────────────────────────────────────────────────────
  const toolbar = uiToStage(160, 190);
  const draw = uiToStage(GEOFENCE.cx, GEOFENCE.cy);
  const form = uiToStage(1240, 330);
  const page1 = uiToStage(720, 330);
  const page2 = uiToStage(720, 430);
  const page3 = uiToStage(820, 420);
  const cam: CamKey[] = [
    { f: 0, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 104, fx: 960, fy: 540, z: 1 },
    { f: 128, fx: toolbar.x, fy: toolbar.y, z: 2.0 },
    { f: 176, fx: toolbar.x, fy: toolbar.y, z: 2.0 },
    { f: 198, fx: draw.x, fy: draw.y, z: 1.4 },
    { f: 250, fx: draw.x, fy: draw.y, z: 1.4 },
    { f: 274, fx: form.x, fy: form.y, z: 1.7 },
    { f: 378, fx: form.x, fy: form.y, z: 1.7 },
    { f: 404, fx: 960, fy: 540, z: 1 },
    { f: 540, fx: 960, fy: 540, z: 1 },
    { f: 572, fx: page1.x, fy: page1.y, z: 1.35 },
    { f: 684, fx: page1.x, fy: page1.y, z: 1.35 },
    { f: 704, fx: page2.x, fy: page2.y, z: 1.3 },
    { f: 880, fx: page2.x, fy: page2.y, z: 1.3 },
    { f: 900, fx: page3.x, fy: page3.y, z: 1.25 },
    { f: 952, fx: page3.x, fy: page3.y, z: 1.25, rx: 0, ry: 0 },
    { f: 966, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 996, fx: 960, fy: 540, z: 1, rx: 0, ry: 0 },
    { f: 1024, fx: 1310, fy: 560, z: 0.88, rx: 4, ry: -12 },
    { f: 1150, fx: 1330, fy: 560, z: 0.9, rx: 4, ry: -12 }
  ];

  const menuP = sp(frame, T.menuIn, SPRING.smooth);
  const menuOut = kf(frame, [T.menuOut, T.menuOut + 16], [0, 1], EASE.in);
  const showMap = frame >= T.mapIn - 2 && frame < T.mapOut + 26;
  const showPage = frame >= T.pageIn - 2 && frame < T.pageOut + 26;
  const showResult = frame >= T.resultIn - 2 && frame < T.resultOut + 26;

  const mapLayer = (children: React.ReactNode) => (
    <>
      <MapBase width={1440} height={810} avenues={AVENUES} labels={LABELS} />
      {children}
    </>
  );

  return (
    <AbsoluteFill style={{ fontFamily, background: BRAND.bg }}>
      <Backdrop />

      {frame < T.mapIn + 24 && (
        <Hook
          tag="TUTORIAL · GEOCERCAS"
          tagIcon={<IcoIcon name="Geofences" size={24} />}
          lines={['Crea una geocerca', 'y asígnala a tus unidades.']}
          highlight={['tus', 'unidades']}
          fontSize={116}
          at={T.hook}
        />
      )}

      {/* Menu: Geocercas > Geocercas Asignadas */}
      {frame >= T.menuIn - 2 && frame < T.menuOut + 18 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ opacity: Math.min(1, menuP * 1.5) * (1 - menuOut), transform: `translateY(${(1 - menuP) * 120}px) scale(${1.5 * (0.92 + 0.08 * menuP) * (1 + menuOut * 0.18)})`, filter: menuOut > 0 ? `blur(${menuOut * 10}px)` : undefined }}>
            <div style={{ width: 460, padding: '26px 18px 20px', borderRadius: 26, background: '#fff', border: `1px solid ${BRAND.border}`, boxShadow: shadows(BRAND).window }}>
              <Img src={staticFile('webtrack/brand/webtrack-wordmark.png')} style={{ height: 54, margin: '0 0 18px 10px' }} />
              <MenuItem icon={<MapIcon size={22} />} label="Mapa" />
              <MenuItem icon={<Truck size={22} />} label="Logística" group />
              <MenuItem icon={<IcoIcon name="Geofences" size={22} />} label="Geocercas" group />
              <MenuItem label="Catálogo de Geocercas" child icon={<List size={18} />} />
              <MenuItem label="Geocercas Asignadas" child icon={<List size={18} />} active={frame >= T.clickMenu + 2} />
              <MenuItem icon={<BarChart3 size={22} />} label="Reportes" group />
            </div>
          </div>
          <Cursor path={[{ f: T.clickMenu - 30, x: 1180, y: 760 }, { f: T.clickMenu, x: 890, y: 711, click: true }, { f: T.clickMenu + 26, x: 950, y: 770 }]} hideAt={T.menuOut} />
        </AbsoluteFill>
      )}

      <Camera keys={cam}>
        {/* Escenas 2-3: mapa, dibujo y formulario */}
        <AbsoluteFill style={{ visibility: showMap ? 'visible' : 'hidden' }}>
          <AppWindow style={windowMotion(frame, T.mapIn, T.mapOut)}>
            {mapLayer(
              <>
                {UNITS.map((u) => (
                  <UnitMarker key={u.name} {...u} />
                ))}
                <GeofenceShape r={drawR} drawing={!saved} label={labelIn} />
              </>
            )}
            <div ref={mapRef} style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
              <MapToolbarMock geoActive={frame >= T.clickGeo + 2 && frame < T.drawStart} flyout={flyout} circleActive={frame >= T.clickCircle + 2} />
              <GeofenceForm
                s={formState}
                style={{ opacity: formP, transform: `translateX(${(1 - formP) * 40}px)`, visibility: formP > 0.01 ? 'visible' : 'hidden', maxHeight: 'none' }}
              />
            </div>
            {mapCursor && <Cursor path={mapCursor} hideAt={T.clickSave + 30} scale={0.85} />}
          </AppWindow>
        </AbsoluteFill>

        {/* Escenas 5-7: wizard de asignacion */}
        <AbsoluteFill style={{ visibility: showPage ? 'visible' : 'hidden' }}>
          <AppWindow style={{ ...windowMotion(frame, T.pageIn, T.pageOut), background: 'var(--background)' }}>
            <div ref={pageRef} style={{ position: 'absolute', inset: 0 }}>
              <AssignPage s={assign} />
            </div>
            {pageCursor && <Cursor path={pageCursor} hideAt={T.clickFinish + 28} scale={0.85} />}
          </AppWindow>
        </AbsoluteFill>

        {/* Escena 8: resultado */}
        <AbsoluteFill style={{ visibility: showResult ? 'visible' : 'hidden' }}>
          <AppWindow style={windowMotion(frame, T.resultIn, T.resultOut)}>
            {mapLayer(
              <>
                <GeofenceShape r={GEOFENCE.r} drawing={false} label={1} flash={flash} />
                {UNITS.slice(1).map((u) => (
                  <UnitMarker key={u.name} {...u} />
                ))}
                <UnitMarker name="P-118" x={car.x} y={car.y} angle={car.angle + 90} ring={enterRing} />
                {entered && (
                  <div style={{ position: 'absolute', left: car.x + 26, top: car.y + 14, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 12, background: '#fff', border: '1px solid rgba(34,160,107,.35)', color: '#16794f', fontSize: 13, fontWeight: 800, boxShadow: '0 12px 26px -10px rgba(15,23,40,.4)', opacity: sp(frame, T.car[0] + 52, SPRING.pop), zIndex: 9, whiteSpace: 'nowrap' }}>
                    <Bell size={14} /> Entrada · {GEOFENCE.name}
                  </div>
                )}
              </>
            )}
          </AppWindow>
        </AbsoluteFill>

        <Callout at={T.callouts[0]} out={T.calloutsOut} x={1500} y={300} icon={<Bell size={28} strokeWidth={2.4} />} title="Entrada y salida" body="Elige qué movimiento notificar." />
        <Callout at={T.callouts[1]} out={T.calloutsOut + 3} x={1530} y={452} icon={<Users size={28} strokeWidth={2.4} />} title="Varias unidades a la vez" body="Asigna en un solo paso." />
        <Callout at={T.callouts[2]} out={T.calloutsOut + 6} x={1500} y={604} icon={<Cpu size={28} strokeWidth={2.4} />} title="Geocerca en el GPS" body="Opcional, con Usar Geocerca Hardware." />
      </Camera>

      <Caption at={110} out={190} text="Abre Geocercas y elige el círculo" />
      <Caption at={196} out={262} text="Dibuja la geocerca en el mapa" />
      <Caption at={268} out={410} text="Ponle nombre y guarda" y={44} />
      <Caption at={448} out={516} text="Ve a Geocercas › Geocercas Asignadas y toca +" />
      <Caption at={566} out={668} text="Elige cuándo notificar" />
      <Caption at={690} out={884} text="Selecciona la geocerca y las unidades" />
      <Caption at={892} out={952} text="Revisa y confirma la asignación" />
      <Caption at={1000} out={1140} text="Recibe avisos cuando una unidad entre o salga" />

      {frame >= T.resultOut && <EndCard title="Tus zonas, bajo control." highlight={['control']} subtitle="Crea geocercas y asígnalas en minutos." fontSize={140} at={T.end} />}
    </AbsoluteFill>
  );
};
