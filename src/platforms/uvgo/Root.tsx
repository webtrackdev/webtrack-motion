// Videos de UVGo. Un <Composition> por video; el id es el nombre del archivo final.
import { Composition } from 'remotion';
import { withBrand } from '../../core/platform';
import { BRAND } from './platform';
import { InfraestructuraUvgo, DURATION as INFRA } from './videos/infraestructura-uvgo/InfraestructuraUvgo';
import { BocetoPrototipo, DURATION as BOCETO } from './videos/boceto-prototipo/BocetoPrototipo';
import { CrearCuenta, DURATION as CREAR } from './videos/crear-cuenta/CrearCuenta';
import { CrearPedido, DURATION as PEDIDO } from './videos/crear-pedido/CrearPedido';
import { EstadosPedido, DURATION as ESTADOS } from './videos/estados-pedido/EstadosPedido';
import { Funcionalidades, DURATION as FUNCS } from './videos/funcionalidades/Funcionalidades';
import { PedidoPdf, DURATION as PDF } from './videos/pedido-pdf/PedidoPdf';
import { AsignarConductor, DURATION as CONDUCTOR } from './videos/asignar-conductor/AsignarConductor';
import { MapaTresD, DURATION as MAPA3D } from './videos/mapa-3d/MapaTresD';
import { MapaCit, MapaCitSolo, DURATION as MAPACIT, DURATION_SOLO as MAPACIT_SOLO } from './videos/mapa-cit/VideoCit';

const video = { fps: 30, width: 1920, height: 1080 };

export const RemotionRoot = () => (
  <>
    <Composition id="infraestructura-uvgo" component={withBrand(BRAND, InfraestructuraUvgo)} durationInFrames={INFRA} {...video} />
    <Composition id="boceto-prototipo" component={withBrand(BRAND, BocetoPrototipo)} durationInFrames={BOCETO} {...video} />
    <Composition id="crear-cuenta" component={withBrand(BRAND, CrearCuenta)} durationInFrames={CREAR} {...video} />
    <Composition id="crear-pedido" component={withBrand(BRAND, CrearPedido)} durationInFrames={PEDIDO} {...video} />
    <Composition id="estados-pedido" component={withBrand(BRAND, EstadosPedido)} durationInFrames={ESTADOS} {...video} />
    <Composition id="funcionalidades" component={withBrand(BRAND, Funcionalidades)} durationInFrames={FUNCS} {...video} />
    <Composition id="pedido-pdf" component={withBrand(BRAND, PedidoPdf)} durationInFrames={PDF} {...video} />
    <Composition id="asignar-conductor" component={withBrand(BRAND, AsignarConductor)} durationInFrames={CONDUCTOR} {...video} />
    <Composition id="mapa-3d" component={withBrand(BRAND, MapaTresD)} durationInFrames={MAPA3D} {...video} />
    <Composition id="mapa-cit" component={withBrand(BRAND, MapaCit)} durationInFrames={MAPACIT} {...video} />
    <Composition id="mapa-cit-solo" component={withBrand(BRAND, MapaCitSolo)} durationInFrames={MAPACIT_SOLO} {...video} />
  </>
);
