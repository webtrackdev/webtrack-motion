// Video "UVGo: repartidor en el CIT". Funcionalidad, sin voz.
// Panel admin: el conductor Luis Rodas lleva el pedido -> "Ruta de entrega" en pantalla completa ->
// "Alternar vista 3D" -> "Centrar en el repartidor": la moto llega al CIT de la UVG
// (14.6039125, -90.4891944) y la cámara gira alrededor del edificio. Mapa con datos reales de OpenStreetMap.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Box, Crosshair, Layers, Map as MapIcon, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import type * as THREE from 'three';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { useBrand } from '../../../../core/theme';
import { BrowserFrame, CHROME_H, U, VW } from '../crear-cuenta/screens';
import { AdminScreen, DeliveryIcon, PEDIDO, type AdminState } from '../asignar-conductor/screens';
import { MapaCIT, useModeloMoto, type Vista } from './escena';
import { OSM } from './osm';

const NOMBRE = 'Luis Rodas';
const DESTINO = 'CIT · UVG';
const COORD = '14.60391, -90.48919';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 490;
const END = SHIFT + BODY;
export const DURATION = END + 100;

const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos

const T = {
  maxClick: 112,
  expand: [116, 136],
  btn3d: 156,
  tilt: [158, 184],
  grow: [158, 196],
  cross: 232,
  fly: [234, 268],
  llega: 300,
  winOut: 470
};

const PEQ = { x: 374, y: 365, w: 509, h: 519 };
const GRANDE = { x: 16, y: 16, w: 1408, h: 868 };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const ADMIN: AdminState = { dropdown: false, hover: -1, elegido: NOMBRE, asignando: false, asignado: true, press: 1, progreso: 0.9, enVivo: true, ping: 0, piloto: NOMBRE, destino: DESTINO };

/** La moto termina el último tramo y se detiene en el CIT. */
const progreso = (f: number) => kf(f, [0, T.llega], [0.55, 1], EASE.out);

const [BX, BZ] = OSM.bodega;
const RUTA_C = { cx: BX / 2, cz: BZ / 2 };

const vista = (f: number): Vista => {
  const tilt = kf(f, T.tilt, [0, 1], EASE.inOut);
  const fly = kf(f, T.fly, [0, 1], EASE.inOut);
  const ruta: Vista = { cx: RUTA_C.cx, cz: RUTA_C.cz, dist: mix(980, 900, tilt), pitch: 60 * tilt, bearing: -20 * tilt - kf(f, [184, 232], [0, 10]) };
  // alrededor del CIT: la cámara gira despacio con la moto ya estacionada
  const cit: Vista = { cx: 0, cz: 0, dist: kf(f, [268, 460], [380, 210]), pitch: 58, bearing: kf(f, [234, 470], [-30, 75], (t) => t) };
  return {
    cx: mix(ruta.cx, cit.cx, fly),
    cz: mix(ruta.cz, cit.cz, fly),
    dist: mix(ruta.dist, cit.dist, fly),
    pitch: mix(ruta.pitch, cit.pitch, fly),
    bearing: mix(ruta.bearing, cit.bearing, fly)
  };
};

// ---------------------------------------------------------------- tarjeta del mapa (RouteOverview)

const Boton: FC<{ active?: boolean; children: ReactNode }> = ({ active, children }) => (
  <span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 12, border: `1px solid ${active ? U.coral : 'rgba(82,82,82,.1)'}`, background: active ? U.coral : '#fff', color: active ? '#fff' : U.muted }}>{children}</span>
);

const flotante = { border: '1px solid rgba(82,82,82,.1)', background: 'rgba(255,255,255,.94)', boxShadow: '0 12px 28px -14px rgb(0 0 0 / .25)' } as const;

const TarjetaMapa: FC<{ f: number; modelo: THREE.Object3D | null }> = ({ f, modelo }) => {
  const e = kf(f, T.expand, [0, 1], EASE.inOut);
  const r = { x: mix(PEQ.x, GRANDE.x, e), y: mix(PEQ.y, GRANDE.y, e), w: mix(PEQ.w, GRANDE.w, e), h: mix(PEQ.h, GRANDE.h, e) };
  const stageW = Math.round(r.w - 32);
  const stageH = Math.round(r.h - 32 - 40 - 12);
  const es3d = f >= T.btn3d + 2;
  const vistaMoto = f >= T.cross + 2;
  const p = progreso(f);
  const llego = f >= T.llega;
  const chip = sp(f, T.llega - 4, SPRING.pop);
  return (
    <>
      {e > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(10,10,10,${0.18 * e})` }} />}
      <div
        style={{
          position: 'absolute',
          left: r.x,
          top: r.y,
          width: r.w,
          height: r.h,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 16,
          borderRadius: 24,
          background: e > 0 ? `rgba(251,250,247,${0.55 + 0.45 * e})` : U.surfaceMuted,
          boxShadow: e > 0 ? '0 25px 50px -12px rgb(0 0 0 / .25)' : '0 1px 3px 0 rgb(0 0 0 / .1)',
          outline: '1px solid rgba(255,255,255,.6)',
          outlineOffset: -1,
          zIndex: 10
        }}
      >
        <div style={{ height: 40, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: U.strong, whiteSpace: 'nowrap' }}>
              Ruta de entrega <span style={{ fontWeight: 400, color: U.faint }}>#{PEDIDO.numero}</span>
            </div>
            <div style={{ fontSize: 12, color: U.faint, whiteSpace: 'nowrap' }}>Distancia: 0.6 km · Bodega UVGO → {DESTINO}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <Boton>
              <Layers size={17} />
            </Boton>
            <Boton active={es3d}>
              <Box size={17} />
            </Boton>
            <Boton active={!vistaMoto}>
              <MapIcon size={17} />
            </Boton>
            <Boton active={vistaMoto}>
              <Crosshair size={17} />
            </Boton>
            <Boton active={e > 0.5}>{e > 0.5 ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</Boton>
          </div>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 16, overflow: 'hidden', background: '#eef0ec' }}>
          <MapaCIT width={stageW} height={stageH} vista={vista(f)} progreso={p} altura={kf(f, T.grow, [0, 1], EASE.out)} modelo={modelo} rotulos={kf(f, [176, 196], [0, 1])} nombre={NOMBRE} />
          <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 99, fontSize: 11, fontWeight: 600, color: U.text, ...flotante }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: U.coral, boxShadow: `0 0 0 ${4 + 3 * Math.abs(Math.sin(f / 9))}px rgba(224,122,95,.16)` }} />
            En vivo
          </span>
          {/* ficha del repartidor: nombre, coordenadas y lugar */}
          {chip > 0.01 && e > 0.5 && (
            <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px 10px 10px', borderRadius: 18, ...flotante, opacity: Math.min(1, chip * 1.5), transform: `translateY(${(1 - chip) * -16}px) scale(${0.9 + 0.1 * chip})`, transformOrigin: '100% 0' }}>
              <span style={{ width: 40, height: 40, borderRadius: 99, background: U.strong, color: '#fff', display: 'grid', placeItems: 'center' }}>
                <DeliveryIcon size={22} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <b style={{ fontSize: 15, color: U.strong }}>{NOMBRE}</b>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: U.muted }}>
                  <MapPin size={12} color={U.coral} /> En el CIT de la UVG · {COORD}
                </span>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', justifyContent: 'space-between', maxWidth: 520, padding: '10px 16px', borderRadius: 16, ...flotante }}>
            {[
              ['0.6 km', 'Distancia'],
              [llego ? 'Llegó' : `${Math.max(1, Math.round(3 * (1 - p) / 0.45))} min`, 'Tiempo estimado'],
              [PEDIDO.limite, 'Fecha límite']
            ].map(([v, l]) => (
              <span key={l} style={{ display: 'flex', flexDirection: 'column', fontSize: 11, color: U.faint }}>
                <b style={{ fontSize: 15, fontWeight: 700, color: U.strong }}>{v}</b>
                {l}
              </span>
            ))}
          </div>
          <span style={{ position: 'absolute', right: 8, bottom: 4, fontSize: 9, color: 'rgba(23,23,23,.55)' }}>© colaboradores de OpenStreetMap</span>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- cámara del video y cursor

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
// La tarjeta Conductor (columna 3) queda en x 899..1153, y ~428..760 del viewport
const CAM: CamKey[] = [C(0, 960, 545, 0.98), C(22, 960, 545, 1.0), C(46, 1266, 690, 1.6), C(74, 1266, 690, 1.6), C(98, 868, 746, 1.75), C(114, 868, 746, 1.75), C(138, 960, 545, 1.12), C(470, 960, 545, 1.12)];

const btn = (r: { x: number; w: number; y: number }, i: number) => ({ x: r.x + r.w - 16 - 18 - (4 - i) * 40, y: r.y + 16 + 18 });

const CURSOR: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  at(92, { x: 700, y: 560 });
  at(T.maxClick, btn(PEQ, 4), true);
  at(T.maxClick + 26, btn(GRANDE, 4));
  at(T.btn3d, btn(GRANDE, 1), true);
  at(T.btn3d + 30, btn(GRANDE, 1));
  at(T.cross, btn(GRANDE, 3), true);
  at(T.cross + 24, { x: 1300, y: 200 });
  return w;
})();

const Body: FC<{ solo?: boolean }> = ({ solo }) => {
  const f = useCurrentFrame();
  const moto = useModeloMoto();
  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...(solo ? {} : windowMotion(f, 0, T.winOut)) }}>
            <BrowserFrame route="/admin" routeFlash={0}>
              <AdminScreen st={ADMIN} ocultarMapa />
              <TarjetaMapa f={f} modelo={moto.modelo} />
            </BrowserFrame>
          </div>
        </div>
        {f >= 90 && f < 262 && <Cursor path={CURSOR} scale={0.8} />}
      </Camera>

      <Caption at={26} out={86} text={`${NOMBRE} lleva el pedido`} />
      <Caption at={96} out={150} text="Abre el mapa en pantalla completa" />
      <Caption at={154} out={226} text="Activa la vista 3D" />
      <Caption at={234} out={300} text="Centra la moto del repartidor" />
      <Caption at={306} out={464} text={`${NOMBRE} ya está en el CIT de la UVG`} />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const MapaCit: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Repartidor en el CIT" badge="EN VIVO" icon={<DeliveryIcon size={64} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Luis Rodas llegó al CIT." highlight={['CIT']} subtitle="Ruta de entrega · Vista 3D · UVG" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={116} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};


/** Misma pieza sin entrada ni cierre: arranca directo en el panel y termina en el CIT. */
export const DURATION_SOLO = BODY - 20;

export const MapaCitSolo: FC = () => {
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Body solo />
    </AbsoluteFill>
  );
};
