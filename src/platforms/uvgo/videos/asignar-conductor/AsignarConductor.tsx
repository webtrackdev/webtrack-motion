// Video "UVGo: asignar conductor". Funcionalidad, sin voz. Web y móvil a la vez:
// el admin elige un conductor en la tarjeta "Conductor" del panel (/admin) -> el pedido llega al
// instante a la app del conductor -> el conductor pulsa "Iniciar ruta" y la app envía su ubicación ->
// la moto avanza en "Ruta de entrega" del panel admin.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { useBrand } from '../../../../core/theme';
import { BrowserFrame, CHROME_H } from '../crear-cuenta/screens';
import { AdminScreen, BEZEL, BTN_RUTA, DeliveryIcon, Phone, PilotoScreen, PILOTO, W, puntoRuta, type AdminState, type PilotoState } from './screens';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 580;
const END = SHIFT + BODY;
export const DURATION = END + 100;

// Mundo: navegador a la izquierda y teléfono a la derecha
const WX = 40;
const WY = 100;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });
const PX = 1530;
const PY = 96;
const ph = (p: { x: number; y: number }) => ({ x: PX + BEZEL + p.x, y: PY + BEZEL + p.y });

// ---------------------------------------------------------------- tiempos

const T = {
  selectClick: 84,
  hover: 98,
  pick: 104,
  asignar: 120,
  asignado: 138,
  signal: 146,
  llega: 176,
  tap: 232,
  gps: 250,
  rutaDesde: 300,
  winOut: 560
};

const adminState = (f: number): AdminState => {
  const enVivo = f >= T.gps;
  return {
    dropdown: f >= T.selectClick + 2 && f < T.pick + 2,
    hover: f < T.hover - 6 ? 0 : 1,
    elegido: f >= T.pick + 2 ? PILOTO : '',
    asignando: f >= T.asignar + 2 && f < T.asignado,
    asignado: f >= T.asignado,
    press: kf(f, [T.asignar + 1, T.asignar + 4, T.asignar + 10], [1, 0.95, 1]),
    progreso: kf(f, [T.rutaDesde, 540], [0, 0.82], (t) => t),
    enVivo,
    ping: enVivo ? ((f - T.gps) % 24) / 24 : 0
  };
};

const pilotoState = (f: number): PilotoState => ({
  asignada: sp(f, T.llega, SPRING.pop),
  compartiendo: f >= T.tap + 4,
  enviadas: f < T.gps ? 0 : 1 + Math.floor((f - T.gps) / 12),
  fase: ((f % 66) / 66),
  tap: kf(f, [T.tap, T.tap + 14], [0, 1])
});

// ---------------------------------------------------------------- cámara y cursor

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const WIDE = (f: number) => C(f, 990, 540, 0.86);
const CAM: CamKey[] = [
  WIDE(0),
  WIDE(40),
  C(72, 1066, 740, 1.65),
  C(140, 1066, 740, 1.65),
  WIDE(166),
  WIDE(180),
  C(204, 1737, 530, 1.18),
  C(296, 1737, 530, 1.18),
  WIDE(326),
  WIDE(392),
  C(420, 900, 680, 1.5),
  C(510, 900, 680, 1.5),
  WIDE(540)
];

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  at(64, { x: 1110, y: 790 });
  at(T.selectClick, W.select, true);
  at(T.hover - 8, W.opcion(0));
  at(T.hover, W.opcion(1));
  at(T.pick, W.opcion(1), true);
  at(T.asignar, W.asignar, true);
  at(T.asignar + 24, W.asignar);
  return w;
})();

// ---------------------------------------------------------------- piezas de motion

/** Arco de un punto entre dos posiciones del mundo. */
const Arco: FC<{ from: { x: number; y: number }; to: { x: number; y: number }; t: number; size?: number; children?: ReactNode }> = ({ from, to, t, size = 22, children }) => {
  if (t <= 0 || t >= 1) return null;
  const e = EASE.inOut(t);
  const x = from.x + (to.x - from.x) * e;
  const y = from.y + (to.y - from.y) * e - Math.sin(Math.PI * e) * 160;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 50 }}>
      {children ?? <span style={{ display: 'block', width: size, height: size, borderRadius: 99, background: '#e07a5f', boxShadow: '0 0 0 6px rgba(224,122,95,.25)' }} />}
    </div>
  );
};

/** Toque del dedo sobre el teléfono. */
const Toque: FC<{ f: number; at: number; p: { x: number; y: number } }> = ({ f, at, p }) => {
  if (f < at - 12 || f > at + 20) return null;
  const inn = kf(f, [at - 12, at - 2], [0, 1]);
  const ring = kf(f, [at, at + 18], [0, 1]);
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, zIndex: 60 }}>
      <span style={{ position: 'absolute', width: 54, height: 54, left: -27, top: -27, borderRadius: 99, background: 'rgba(15,23,40,.35)', border: '3px solid rgba(255,255,255,.9)', opacity: inn * (1 - ring), transform: `scale(${1 - ring * 0.2})` }} />
      <span style={{ position: 'absolute', width: 120, height: 120, left: -60, top: -60, borderRadius: 99, border: '3px solid rgba(255,255,255,.8)', opacity: ring > 0 ? 1 - ring : 0, transform: `scale(${0.4 + ring * 0.8})` }} />
    </div>
  );
};

// ---------------------------------------------------------------- escena

const MAPA = { x: WX + W.mapa.x, y: WY + CHROME_H + W.mapa.y, w: W.mapa.w, h: 411 };
const motoEnMapa = (progreso: number) => {
  const [mx, my] = puntoRuta(progreso);
  return { x: MAPA.x + (mx / 477) * MAPA.w, y: MAPA.y + (my / 400) * MAPA.h };
};

const Body: FC = () => {
  const f = useCurrentFrame();
  const admin = adminState(f);
  const piloto = pilotoState(f);
  const phoneIn = sp(f, 10, SPRING.smooth);
  const phoneOut = kf(f, [T.winOut, T.winOut + 20], [0, 1], EASE.in);
  const origenSenal = ui({ x: 1026, y: 520 });
  const telefono = ph({ x: 195, y: 560 });
  const gpsDesde = ph({ x: 90, y: 226 }); // centro del radar

  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
            <BrowserFrame route="/admin" routeFlash={0}>
              <AdminScreen st={admin} />
            </BrowserFrame>
          </div>
        </div>
        <Phone style={{ left: PX, top: PY, opacity: Math.min(1, phoneIn * 1.4) * (1 - phoneOut), transform: `translateX(${(1 - phoneIn) * 300}px) rotate(${(1 - phoneIn) * 6}deg)`, filter: phoneOut > 0 ? `blur(${phoneOut * 12}px)` : undefined }}>
          <PilotoScreen st={piloto} />
        </Phone>

        {/* el pedido viaja del panel al teléfono */}
        <Arco from={origenSenal} to={telefono} t={kf(f, [T.signal, T.llega], [0, 1])}>
          <span style={{ display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: 99, background: '#1d411b', color: '#fff', boxShadow: '0 0 0 10px rgba(224,122,95,.3), 0 20px 40px -10px rgba(0,0,0,.5)' }}>
            <DeliveryIcon size={34} />
          </span>
        </Arco>

        {/* posiciones del GPS: del teléfono a la moto del mapa */}
        {Array.from({ length: 24 }, (_, i) => {
          const at = T.gps + i * 12;
          const t = kf(f, [at, at + 26], [0, 1]);
          return <Arco key={i} from={gpsDesde} to={motoEnMapa(admin.progreso)} t={t} size={16} />;
        })}

        {f >= 60 && f < 160 && <Cursor path={CURSOR} scale={0.75} />}
        <Toque f={f} at={T.tap} p={ph(BTN_RUTA)} />
      </Camera>

      <Caption at={36} out={142} text="El admin asigna un conductor" />
      <Caption at={172} out={228} text="El conductor lo recibe al instante" />
      <Caption at={234} out={322} text="Inicia la ruta y comparte su ubicación" />
      <Caption at={330} out={536} text="El admin sigue el pedido en el mapa" y={14} />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const AsignarConductor: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Asigna un conductor" badge="ENTREGAS" icon={<DeliveryIcon size={64} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Asignado y en camino." highlight={['camino']} subtitle="Panel admin → App del conductor" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={124} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
