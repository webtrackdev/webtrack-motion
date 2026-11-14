// Video "UVGo: mapa en 3D". Funcionalidad, sin voz.
// Panel admin -> zoom a "Ruta de entrega" -> Pantalla completa -> "Alternar vista 3D" (el mapa se inclina
// 60° y aparecen los edificios) -> "Centrar en el repartidor" -> la cámara sigue a la moto 3D entre los
// edificios -> "Ver ruta completa". Herramientas y estilos de RouteOverview/DeliveryMap del repo UVGo.
import type { FC, ReactNode } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Box, Crosshair, Layers, Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { Cursor, type Waypoint } from '../../../../core/Cursor';
import { windowMotion } from '../../../../core/AppWindow';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, kf } from '../../../../core/anim';
import { useBrand } from '../../../../core/theme';
import { BrowserFrame, CHROME_H, U, VW } from '../crear-cuenta/screens';
import { AdminScreen, PEDIDO, type AdminState } from '../asignar-conductor/screens';
import { Mapa3D, RUTA, enRuta, useModeloMoto, type Vista } from './Mapa3D';
import type * as THREE from 'three';

const SHIFT = launchIntroLength(0) - 8;
const BODY = 520;
const END = SHIFT + BODY;
export const DURATION = END + 100;

const WX = (1920 - VW) / 2;
const WY = 70;
const ui = (p: { x: number; y: number }) => ({ x: WX + p.x, y: WY + CHROME_H + p.y });

// ---------------------------------------------------------------- tiempos

const T = {
  maxClick: 76,
  expand: [80, 100],
  btn3d: 118,
  tilt: [120, 146],
  grow: [120, 158],
  cross: 196,
  fly: [198, 228],
  verRuta: 446,
  back: [448, 478],
  winOut: 500
};

// Rectángulo de la tarjeta "Ruta de entrega" en el bento y en pantalla completa (inset 16)
const PEQ = { x: 374, y: 365, w: 509, h: 519 };
const GRANDE = { x: 16, y: 16, w: 1408, h: 868 };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const ADMIN: AdminState = { dropdown: false, hover: -1, elegido: 'Carlos Pérez', asignando: false, asignado: true, press: 1, progreso: 0.2, enVivo: true, ping: 0 };

const progreso = (f: number) => kf(f, [40, 470], [0.08, 0.94], (t) => t);

/** Rumbo de brújula de la moto suavizado (promedio de los últimos tramos) para que la cámara gire suave. */
const rumboSuave = (p: number) => {
  let sx = 0;
  let sy = 0;
  for (let k = 0; k < 6; k++) {
    const r = enRuta(Math.max(0, p - k * 0.008)).rot;
    sx += Math.cos(r);
    sy += Math.sin(r);
  }
  const rot = Math.atan2(sy, sx);
  return 90 - (rot * 180) / Math.PI; // brújula: 0 = norte, 90 = este
};

const RUTA_CX = (Math.min(...RUTA.map((r) => r[0])) + Math.max(...RUTA.map((r) => r[0]))) / 2;
const RUTA_CZ = (Math.min(...RUTA.map((r) => r[1])) + Math.max(...RUTA.map((r) => r[1]))) / 2;

const vista = (f: number): Vista => {
  const p = progreso(f);
  const m = enRuta(p);
  const tilt = kf(f, T.tilt, [0, 1], EASE.inOut);
  const fly = kf(f, T.fly, [0, 1], EASE.inOut);
  const back = kf(f, T.back, [0, 1], EASE.inOut);
  // vista de ruta (2D y luego 3D)
  const ruta: Vista = { cx: RUTA_CX, cz: RUTA_CZ, dist: mix(640, 600, tilt), pitch: 60 * tilt, bearing: -22 * tilt - kf(f, [146, 196], [0, 14]) };
  // siguiendo a la moto desde atrás
  const sigue: Vista = { cx: m.x, cz: m.z, dist: 210, pitch: 50, bearing: rumboSuave(p) };
  const v1: Vista = {
    cx: mix(ruta.cx, sigue.cx, fly),
    cz: mix(ruta.cz, sigue.cz, fly),
    dist: mix(ruta.dist, sigue.dist, fly),
    pitch: mix(ruta.pitch, sigue.pitch, fly),
    bearing: mix(ruta.bearing, sigue.bearing, fly)
  };
  // de vuelta a la ruta completa (en 3D)
  const final: Vista = { cx: RUTA_CX, cz: RUTA_CZ, dist: 600, pitch: 58, bearing: -30 };
  return {
    cx: mix(v1.cx, final.cx, back),
    cz: mix(v1.cz, final.cz, back),
    dist: mix(v1.dist, final.dist, back),
    pitch: mix(v1.pitch, final.pitch, back),
    bearing: mix(v1.bearing, final.bearing, back)
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
  const vistaMoto = f >= T.cross + 2 && f < T.verRuta + 2;
  const p = progreso(f);
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
            <div style={{ fontSize: 12, color: U.faint, whiteSpace: 'nowrap' }}>Distancia: 1.2 km · Bodega UVGO → {PEDIDO.destino}</div>
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
          <Mapa3D width={stageW} height={stageH} vista={vista(f)} progreso={p} altura={kf(f, T.grow, [0, 1], EASE.out)} modelo={modelo} />
          <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 99, fontSize: 11, fontWeight: 600, color: U.text, ...flotante }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: U.coral, boxShadow: `0 0 0 ${4 + 3 * Math.abs(Math.sin(f / 9))}px rgba(224,122,95,.16)` }} />
            En vivo
          </span>
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', justifyContent: 'space-between', maxWidth: 520, padding: '10px 16px', borderRadius: 16, ...flotante }}>
            {[
              ['1.2 km', 'Distancia'],
              [`${Math.max(1, Math.round(6 * (1 - p)))} min`, 'Tiempo estimado'],
              [PEDIDO.limite, 'Fecha límite']
            ].map(([v, l]) => (
              <span key={l} style={{ display: 'flex', flexDirection: 'column', fontSize: 11, color: U.faint }}>
                <b style={{ fontSize: 15, fontWeight: 700, color: U.strong }}>{v}</b>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- cámara del video y cursor

const C = (f: number, x: number, y: number, z: number): CamKey => ({ f, fx: x, fy: y, z });
const CAM: CamKey[] = [C(0, 960, 545, 0.98), C(30, 960, 545, 1.0), C(58, 868, 746, 1.75), C(78, 868, 746, 1.75), C(102, 960, 545, 1.12), C(500, 960, 545, 1.12)];

const btn = (r: { x: number; w: number; y: number }, i: number) => ({ x: r.x + r.w - 16 - 18 - (4 - i) * 40, y: r.y + 16 + 18 });

const CURSOR_A: Waypoint[] = (() => {
  const w: Waypoint[] = [];
  const at = (f: number, p: { x: number; y: number }, click = false) => w.push({ f, ...ui(p), click });
  at(56, { x: 700, y: 560 });
  at(T.maxClick, btn(PEQ, 4), true);
  at(T.maxClick + 26, btn(GRANDE, 4));
  at(T.btn3d, btn(GRANDE, 1), true);
  at(T.btn3d + 30, btn(GRANDE, 1));
  at(T.cross, btn(GRANDE, 3), true);
  at(T.cross + 24, { x: 1300, y: 160 });
  return w;
})();

const CURSOR_B: Waypoint[] = [
  { f: 426, ...ui({ x: 1200, y: 200 }) },
  { f: T.verRuta, ...ui(btn(GRANDE, 2)), click: true },
  { f: T.verRuta + 30, ...ui(btn(GRANDE, 2)) }
];

const Body: FC = () => {
  const f = useCurrentFrame();
  const moto = useModeloMoto();
  return (
    <AbsoluteFill>
      <Camera keys={CAM}>
        <div style={{ position: 'absolute', left: WX, top: WY, perspective: 2400 }}>
          <div style={{ position: 'relative', ...windowMotion(f, 0, T.winOut) }}>
            <BrowserFrame route="/admin" routeFlash={0}>
              <AdminScreen st={ADMIN} ocultarMapa />
              <TarjetaMapa f={f} modelo={moto.modelo} />
            </BrowserFrame>
          </div>
        </div>
        {f >= 54 && f < 224 && <Cursor path={CURSOR_A} scale={0.8} />}
        {f >= 424 && f < 482 && <Cursor path={CURSOR_B} scale={0.8} />}
      </Camera>

      {moto.error && <div style={{ position: 'absolute', left: 20, top: 20, color: 'red', fontSize: 30 }}>{moto.error}</div>}
      <Caption at={36} out={104} text="Abre el mapa en pantalla completa" />
      <Caption at={112} out={188} text="Activa la vista 3D" />
      <Caption at={200} out={300} text="Centra la moto del repartidor" />
      <Caption at={306} out={436} text="Síguela entre los edificios, en vivo" />
      <Caption at={444} out={496} text="Vuelve a la ruta completa" />
    </AbsoluteFill>
  );
};

const BACKDROP = 'radial-gradient(circle at 18% 12%, #3d6b39 0%, transparent 45%), radial-gradient(circle at 88% 90%, rgba(224,122,95,.35) 0%, transparent 40%), linear-gradient(160deg, #245021 0%, #1d411b 50%, #132c12 100%)';

export const MapaTresD: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: BACKDROP, overflow: 'hidden', fontFamily: brand.font }}>
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Mapa en 3D" badge="SEGUIMIENTO" icon={<Box size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)', opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title="Tu pedido, en 3D y en vivo." highlight={['3D']} subtitle="Ruta de entrega · Vista 3D · Repartidor en vivo" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={116} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
