// El mundo del video: paradas, rutas y la caja de UVGo que viaja entre ellas.
// Se dibuja en coordenadas del mundo; la camara del video lo recorre.
import type { FC } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';
import { KeyRound } from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { C, LAYER, mono } from '../../components/ui';
import {
  AzureRegion,
  AzureTile,
  CampusMap,
  DataVault,
  GithubNode,
  Laptop,
  Moto,
  Phone,
  Satellite,
  ServerBuilding,
  Station
} from '../../components/Illustrations';
import { AZURE, P, R, T } from './layout';

const lengths: Record<string, number> = Object.fromEntries(Object.entries(R).map(([k, d]) => [k, getLength(d)]));
const pointOn = (key: keyof typeof R, t: number) => {
  const pt = getPointAtLength(R[key], lengths[key] * Math.max(0, Math.min(1, t)));
  return { x: pt?.x ?? 0, y: pt?.y ?? 0 };
};

/** Ruta que se dibuja entre `at` y `at + dur`; punteada para eventos y con puntos que fluyen. */
const Route: FC<{ k: keyof typeof R; at: number; color: string; dashed?: boolean; dur?: number; width?: number; flow?: [number, number]; reverse?: boolean; label?: string; labelT?: number }> = ({
  k,
  at,
  color,
  dashed,
  dur = 40,
  width = 10,
  flow,
  reverse,
  label,
  labelT = 0.5
}) => {
  const frame = useCurrentFrame();
  const len = lengths[k];
  const p = kf(frame, [at, at + dur], [0, 1], EASE.out);
  if (frame < at) return null;
  const flowing = flow && frame >= flow[0] && frame <= flow[1];
  const lp = label ? pointOn(k, labelT) : null;
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
        <path d={R[k]} stroke="rgba(255,255,255,.75)" strokeWidth={width + 10} fill="none" strokeLinecap="round" strokeDasharray={`${len * p} ${len}`} />
        <path
          d={R[k]}
          stroke={color}
          strokeWidth={width}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashed ? `${p >= 1 ? '18 18' : `${len * p} ${len}`}` : `${len * p} ${len}`}
          strokeDashoffset={dashed && p >= 1 ? -frame * 1.5 : 0}
          opacity={0.9}
        />
        {flowing &&
          [0, 1, 2].map((i) => {
            const t = ((frame - flow[0]) / 45 + i / 3) % 1;
            const pt = pointOn(k, reverse ? 1 - t : t);
            return <circle key={i} cx={pt.x} cy={pt.y} r={width * 1.25} fill={color} stroke="#fff" strokeWidth={4} />;
          })}
      </svg>
      {lp && p >= 1 && (
        <div
          style={{
            position: 'absolute',
            left: lp.x,
            top: lp.y,
            transform: 'translate(-50%, -50%)',
            padding: '8px 18px',
            borderRadius: 999,
            background: '#fff',
            color,
            fontFamily: mono,
            fontSize: 22,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            boxShadow: `0 10px 22px -14px rgba(0,0,0,.5), inset 0 0 0 2.5px ${color}`
          }}
        >
          {label}
        </div>
      )}
    </>
  );
};

/** Posicion de la caja en cada momento del video. */
const boxState = (f: number) => {
  // Vista general: recorre las dos rutas rapido.
  if (f >= T.overview + 230 && f < T.overview + 330) {
    const t = kf(f, [T.overview + 230, T.overview + 320], [0, 2], EASE.inOut);
    const pt = t < 1 ? pointOn('main1', t) : pointOn('main2', t - 1);
    return { ...pt, s: 0.9, show: true };
  }
  if (f < T.overview + 230) return { x: 760, y: 690, s: 0.9, show: f >= T.overview + 120 };
  // Parada web: la caja descansa sobre la laptop.
  if (f < T.bridge + 50) return { x: 740, y: 690, s: 0.9, show: true };
  // Puente: viaja al servidor.
  if (f < T.server) {
    const t = kf(f, [T.bridge + 50, T.bridge + 210], [0, 1], EASE.inOut);
    const pt = pointOn('main1', t);
    return { ...pt, s: 0.9, show: true };
  }
  // Servidor: baja piso por piso durante las capas.
  if (f < T.data) {
    const floors = [600, 682, 778, 874, 970];
    const steps = [T.srvLayers + 15, T.srvLayers + 57, T.srvLayers + 100, T.srvLayers + 142];
    let y = floors[0];
    steps.forEach((s, i) => {
      y = y + (floors[i + 1] - floors[i]) * kf(f, [s, s + 18], [0, 1], EASE.inOut);
    });
    const back = kf(f, [T.srvFolders, T.srvFolders + 30], [0, 1], EASE.inOut);
    return { x: 1420, y: y + (600 - y) * back, s: 0.75, show: true };
  }
  // Datos: viaja a la boveda.
  if (f < T.pilot) {
    const t = kf(f, [T.data + 10, T.data + 100], [0, 1], EASE.inOut);
    const pt = pointOn('main2', t);
    const settle = kf(f, [T.data + 100, T.data + 120], [0, 1], EASE.out);
    return { x: pt.x + (2860 - pt.x) * settle, y: pt.y + (500 - pt.y) * settle, s: 0.85, show: true };
  }
  // Resumen: da vueltas por la ruta principal.
  if (f >= T.summary && f < T.summary + 200) {
    const t = ((f - T.summary) / 100) % 2;
    const pt = t < 1 ? pointOn('main1', t) : pointOn('main2', t - 1);
    return { ...pt, s: 0.9, show: true };
  }
  return { x: 0, y: 0, s: 0, show: false };
};

const TravelBox: FC = () => {
  const frame = useCurrentFrame();
  const b = boxState(frame);
  if (!b.show) return null;
  const bob = Math.sin(frame / 6) * 6;
  const jwt = frame >= T.bridge + 30 && frame < T.data + 130;
  const jp = sp(frame, T.bridge + 30, SPRING.pop);
  return (
    <div style={{ position: 'absolute', left: b.x, top: b.y + bob, transform: `translate(-50%, -62%) scale(${b.s})`, zIndex: 20 }}>
      <Img src={staticFile('uvgo/caja.png')} style={{ width: 150, filter: 'drop-shadow(0 18px 18px rgba(0,0,0,.28))' }} />
      {jwt && (
        <div
          style={{
            position: 'absolute',
            right: -46,
            top: -18,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 999,
            background: C.amber,
            color: '#422006',
            fontFamily: mono,
            fontSize: 22,
            fontWeight: 900,
            transform: `scale(${jp}) rotate(8deg)`,
            boxShadow: '0 10px 18px -10px rgba(0,0,0,.5)'
          }}
        >
          <KeyRound size={20} strokeWidth={3} /> JWT
        </div>
      )}
    </div>
  );
};

/** Halo de una parada mientras la camara esta en ella. */
const glowBetween = (f: number, a: number, b: number) => Math.min(kf(f, [a, a + 20], [0, 1]), 1 - kf(f, [b - 10, b + 10], [0, 1]));

export const World: FC = () => {
  const frame = useCurrentFrame();
  const o = T.overview;
  const lit = frame >= T.srvLayers ? Math.floor(kf(frame, [T.srvLayers + 30, T.srvLayers + 200], [0, 3.999], (t) => t)) : -1;
  const floorLit = frame >= T.srvLayers + 30 && frame < T.srvFolders ? lit : -1;
  const events = frame >= T.events;
  const motoSpeed = frame >= T.pilot && frame < T.sats ? 1 : 0;
  const phoneOn = sp(frame, T.pilot + 60, SPRING.pop);
  const mapProg = kf(frame, [T.pilot + 250, T.pilot + 430], [0, 1], EASE.inOut);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      {/* trama de puntos del suelo */}
      <div
        style={{
          position: 'absolute',
          left: -600,
          top: -500,
          width: 5200,
          height: 3200,
          backgroundImage: 'radial-gradient(rgba(29,65,27,.13) 2.5px, transparent 2.5px)',
          backgroundSize: '56px 56px'
        }}
      />
      <AzureRegion {...AZURE} at={o + 60} />

      {/* rutas */}
      <Route k="main1" at={o + 120} color={LAYER.web} width={12} flow={[T.bridge + 40, T.bridge + 260]} />
      <Route k="main2" at={o + 140} color={LAYER.data} width={12} label="JPA · JDBC 5432" labelT={0.5} />
      <Route k="mail" at={o + 170} color={C.sky} dashed flow={events ? [T.events + 60, T.events + 400] : undefined} />
      <Route k="blob" at={o + 175} color={C.sky} dashed flow={events ? [T.events + 150, T.events + 400] : undefined} />
      <Route k="pilot" at={o + 185} color={LAYER.pilot} dashed flow={[T.events + 240, T.pilot + 140]} />
      <Route k="pilot" at={o + 185} color={LAYER.pilot} dashed label="WSS · GPS" labelT={0.45} flow={[T.pilot + 150, T.pilot + 300]} reverse />
      <Route k="toMap" at={o + 190} color={LAYER.pilot} dashed label="WSS · STOMP" labelT={0.42} flow={[T.pilot + 230, T.pilot + 440]} />
      <Route k="claude" at={o + 200} color={C.amberDeep} dashed flow={[T.sats + 40, T.sats + 380]} />
      <Route k="serp" at={o + 205} color={C.amberDeep} dashed flow={[T.sats + 90, T.sats + 380]} />
      <Route k="bright" at={o + 210} color={C.amberDeep} dashed flow={[T.sats + 140, T.sats + 380]} />
      <Route k="mapbox" at={o + 215} color={C.amberDeep} dashed flow={[T.sats + 190, T.sats + 380]} />
      <Route k="deploy" at={o + 220} color="#24292f" dashed label="despliega el JAR" labelT={0.62} flow={[T.deploy + 150, T.deploy + 300]} />
      <Route k="oidc" at={o + 225} color="#24292f" dashed label="OIDC" labelT={0.5} flow={[T.deploy + 90, T.deploy + 300]} reverse />

      {/* paradas */}
      <Station
        x={P.web.x}
        y={P.web.y}
        w={560}
        h={370}
        at={o + 20}
        glow={glowBetween(frame, T.web, T.bridge + 60)}
        color={LAYER.web}
        label="App web"
        sub="React · TypeScript"
      >
        <Laptop highlight={frame >= T.web && frame < T.bridge + 50 ? 1 : 0} />
      </Station>
      <Station x={P.server.x} y={P.server.y} w={460} h={560} at={o + 40} glow={glowBetween(frame, T.server, T.data)} color={LAYER.server}>
        <ServerBuilding lit={floorLit} />
      </Station>
      <Station x={P.data.x} y={P.data.y} w={360} h={420} at={o + 60} glow={glowBetween(frame, T.data, T.events)} color={LAYER.data} label="PostgreSQL" sub="uvgodatabase · 5432">
        <DataVault />
      </Station>
      <Station x={P.mail.x} y={P.mail.y} w={240} h={210} at={o + 80} glow={glowBetween(frame, T.events + 60, T.pilot)} color={C.sky}>
        <AzureTile icon="mail" title="Email" sub="Communication Services" pulse={events ? Math.max(0, Math.sin((frame - T.events) / 7)) : 0} />
      </Station>
      <Station x={P.blob.x} y={P.blob.y} w={240} h={210} at={o + 90} glow={glowBetween(frame, T.events + 150, T.pilot)} color={C.sky}>
        <AzureTile icon="blob" title="Blob Storage" sub="comprobantes de pago" />
      </Station>
      <Station x={P.azsql.x} y={P.azsql.y} w={240} h={210} at={o + 100}>
        <AzureTile icon="sql" title="Azure SQL" sub="creada, el código usa PostgreSQL" ghost />
      </Station>
      <Station x={P.ident.x} y={P.ident.y} w={240} h={210} at={o + 110} glow={glowBetween(frame, T.deploy, T.summary)} color={C.sky}>
        <AzureTile icon="id" title="Identidad" sub="administrada (OIDC)" />
      </Station>
      <Station x={P.pilot.x} y={P.pilot.y} w={460} h={300} at={o + 120} glow={glowBetween(frame, T.events + 240, T.sats)} color={LAYER.pilot} label="App del piloto" sub="otro repositorio">
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${motoSpeed * Math.sin(frame / 20) * 10}px)` }}>
          <Moto speed={motoSpeed} />
        </div>
      </Station>
      <Station x={P.phone.x} y={P.phone.y} w={210} h={370} at={o + 125}>
        <Phone text="Nueva asignación" sub="Pedido #A-1042 · Edificio CIT" on={frame >= T.pilot + 60 ? phoneOn : 0} />
      </Station>
      <Station x={P.map.x} y={P.map.y} w={420} h={300} at={o + 130} glow={glowBetween(frame, T.pilot + 240, T.sats)} color={LAYER.pilot} label="Mapa en vivo" sub="Mapbox">
        <CampusMap progress={mapProg} />
      </Station>
      <Station x={P.mapbox.x} y={P.mapbox.y} w={260} h={160} at={o + 140} glow={glowBetween(frame, T.sats + 190, T.deploy)} color={C.amberDeep} label="Mapbox">
        <Satellite logo="mapbox" color="#000" seed={1} />
      </Station>
      <Station x={P.claude.x} y={P.claude.y} w={260} h={160} at={o + 150} glow={glowBetween(frame, T.sats + 40, T.deploy)} color={C.amberDeep} label="Claude API">
        <Satellite logo="claude" color="#d97757" seed={2} />
      </Station>
      <Station x={P.serp.x} y={P.serp.y} w={260} h={160} at={o + 160} glow={glowBetween(frame, T.sats + 90, T.deploy)} color={C.amberDeep} label="SerpApi">
        <Satellite icon="cart" color={C.amberDeep} seed={3} />
      </Station>
      <Station x={P.bright.x} y={P.bright.y} w={260} h={160} at={o + 170} glow={glowBetween(frame, T.sats + 140, T.deploy)} color={C.amberDeep} label="BrightData">
        <Satellite icon="store" color={C.amberDeep} seed={4} />
      </Station>
      <Station x={P.github.x} y={P.github.y} w={200} h={200} at={o + 180} glow={glowBetween(frame, T.deploy, T.summary)} color="#24292f" label="GitHub Actions">
        <GithubNode />
      </Station>

      <TravelBox />
    </div>
  );
};
