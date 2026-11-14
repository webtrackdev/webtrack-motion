// Video "Cómo está construido UVGo": infraestructura, lenguajes, carpetas y patrones de diseño,
// contado como el viaje de la caja de UVGo por un mapa propio (no el diagrama del PDF). Sin voz.
// Fuente: Docs UVGO/uvgo-panorama.pdf, repos UVGo (frontend) y UVGo_backend; justificaciones de
// UVGo_Segunda_Entrega.docx (tabla 8). Solo lectura de esos repos.
import type { FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useBrand } from '../../../../core/theme';
import { Camera, type CamKey } from '../../../../core/Camera';
import { Caption } from '../../../../core/Caption';
import { EndCard } from '../../../../core/templates/EndCard';
import { LAYOUT_BG } from '../../components/ui';
import { BridgeOverlay, DeployOverlay, Intro, OopBoard, OverviewLegend, SatsOverlay, SummaryBoard } from './Boards';
import { DataPanel, EventsPanel, PilotPanel, ServerPanel, WebPanel } from './Panels';
import { World } from './World';
import { OVERVIEW, P, T, leftOf } from './layout';

export const DURATION = T.total;

const at = (f: number, v: { fx: number; fy: number; z: number }, extra: Partial<CamKey> = {}): CamKey => ({ f, ...v, ...extra });

const CAM: CamKey[] = [
  at(0, { ...OVERVIEW, z: 0.4 }),
  at(T.overview, { ...OVERVIEW, z: 0.43 }),
  at(T.web - 10, OVERVIEW),
  // 1. App web
  at(T.web + 45, leftOf(P.web.x, P.web.y + 30, 1.05, 480), { ry: 6 }),
  at(T.bridge - 10, leftOf(P.web.x, P.web.y + 30, 1.1, 480), { ry: 3 }),
  // Puente: web y servidor a la vez
  at(T.bridge + 40, { fx: 1130, fy: 720, z: 0.72 }, { ry: 0 }),
  at(T.server - 10, { fx: 1300, fy: 720, z: 0.74 }),
  // 2. Servidor
  at(T.server + 45, leftOf(P.server.x, P.server.y + 40, 0.98, 470), { ry: -5 }),
  at(T.srvLayers, leftOf(P.server.x, P.server.y + 40, 1.02, 470), { ry: -3 }),
  at(T.oop - 10, leftOf(P.server.x, P.server.y + 40, 1.08, 470), { ry: 0 }),
  // POO: la camara entra al edificio detras de la pizarra
  at(T.oop + 40, { fx: P.server.x, fy: P.server.y, z: 1.6 }),
  at(T.data - 10, { fx: P.server.x + 60, fy: P.server.y, z: 1.7 }),
  // 3. Datos: sigue a la caja y luego encuadra la boveda
  at(T.data + 40, { fx: 2300, fy: 760, z: 0.85 }),
  at(T.data + 110, leftOf(P.data.x, P.data.y + 60, 1.05, 470), { ry: 5 }),
  at(T.events - 10, leftOf(P.data.x, P.data.y + 60, 1.1, 470), { ry: 2 }),
  // 4. Avisos: fila de Azure y la ruta al piloto
  at(T.events + 45, leftOf(1600, 1250, 0.7, 470), { ry: 0 }),
  at(T.pilot - 10, leftOf(1640, 1280, 0.68, 470)),
  // 5. Piloto: primero la moto, luego el mapa
  at(T.pilot + 45, leftOf(2830, 1760, 0.9, 470)),
  at(T.pilot + 220, leftOf(2830, 1760, 0.93, 470)),
  at(T.pilot + 270, leftOf(P.map.x, P.map.y - 20, 1.05, 470)),
  at(T.sats - 10, leftOf(P.map.x, P.map.y - 20, 1.08, 470)),
  // Satelites
  at(T.sats + 45, { fx: 1500, fy: 690, z: 0.6 }),
  at(T.deploy - 10, { fx: 1560, fy: 690, z: 0.62 }),
  // Despliegue
  at(T.deploy + 45, { fx: 2900, fy: 920, z: 0.55 }),
  at(T.summary - 10, { fx: 2950, fy: 920, z: 0.57 }),
  // Resumen
  at(T.summary + 50, OVERVIEW),
  at(T.end, { ...OVERVIEW, z: 0.5 })
];

export const InfraestructuraUvgo: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: LAYOUT_BG, overflow: 'hidden', fontFamily: brand.font }}>
      {frame >= T.overview - 25 && frame < T.end + 20 && (
        <Camera keys={CAM}>
          <World />
        </Camera>
      )}

      <OverviewLegend />

      <WebPanel />
      <BridgeOverlay />
      <Caption at={T.bridge + 120} out={T.server - 15} text="Lo que es en vivo viaja por WebSocket" />
      <ServerPanel />
      <OopBoard />
      <DataPanel />
      <EventsPanel />
      <PilotPanel />
      <SatsOverlay />
      <DeployOverlay />
      <Caption at={T.summary + 20} out={T.summary + 140} text="Todo junto: web, servidor, datos y nube" />
      <SummaryBoard />

      <Intro />
      {frame >= T.end - 5 && (
        <AbsoluteFill style={{ background: LAYOUT_BG, opacity: Math.min(1, (frame - T.end + 5) / 12) }}>
          <EndCard title="Así se construye UVGo" highlight={['UVGo']} subtitle="Infraestructura y patrones de diseño" at={{ title: T.end + 5, subtitle: T.end + 30, logo: T.end + 45 }} fontSize={130} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
