// Videos de Webtrack. Un <Composition> por video; el id es el nombre del archivo final.
import { Composition } from 'remotion';
import { withBrand } from '../../core/platform';
import { BRAND } from './platform';
import { RutasInversas, DURATION as RUTAS_INVERSAS } from './videos/rutas-inversas/RutasInversas';
import { CrearRutaLogistica, DURATION as CREAR_RUTA } from './videos/crear-ruta-logistica/CrearRutaLogistica';
import { TramosParadaAutorizada, DURATION as TRAMOS } from './videos/tramos-parada-autorizada/TramosParadaAutorizada';
import { GeocercaAsignarUnidad, DURATION as GEOCERCA } from './videos/geocerca-asignar-unidad/GeocercaAsignarUnidad';
import { WebiMcpSeguro, DURATION as WEBI_MCP } from './videos/webi-mcp-seguro/WebiMcpSeguro';
import { ConfigAppPlantillas, DURATION as CONFIGAPP } from './videos/configapp-plantillas/ConfigAppPlantillas';
import { UsuariosLicencias, DURATION as USUARIOS_LIC } from './videos/usuarios-licencias/UsuariosLicencias';
import { ContactosRuta, DURATION as CONTACTOS } from './videos/contactos-ruta/ContactosRuta';
import { JobsSinAsignar, DURATION as JOBS_SIN_ASIGNAR } from './videos/jobs-sin-asignar/JobsSinAsignar';
import { ReferenciasPublicas, DURATION as REFERENCIAS } from './videos/referencias-publicas/ReferenciasPublicas';

const video = { fps: 30, width: 1920, height: 1080 };

export const RemotionRoot = () => (
  <>
    <Composition id="rutas-inversas" component={withBrand(BRAND, RutasInversas)} durationInFrames={RUTAS_INVERSAS} {...video} />
    <Composition id="crear-ruta-logistica" component={withBrand(BRAND, CrearRutaLogistica)} durationInFrames={CREAR_RUTA} {...video} />
    <Composition id="tramos-parada-autorizada" component={withBrand(BRAND, TramosParadaAutorizada)} durationInFrames={TRAMOS} {...video} />
    <Composition id="geocerca-asignar-unidad" component={withBrand(BRAND, GeocercaAsignarUnidad)} durationInFrames={GEOCERCA} {...video} />
    <Composition id="webi-mcp-seguro" component={withBrand(BRAND, WebiMcpSeguro)} durationInFrames={WEBI_MCP} {...video} />
    <Composition id="configapp-plantillas" component={withBrand(BRAND, ConfigAppPlantillas)} durationInFrames={CONFIGAPP} {...video} />
    <Composition id="jobs-sin-asignar" component={withBrand(BRAND, JobsSinAsignar)} durationInFrames={JOBS_SIN_ASIGNAR} {...video} />
    <Composition id="referencias-publicas" component={withBrand(BRAND, ReferenciasPublicas)} durationInFrames={REFERENCIAS} {...video} />
    <Composition id="contactos-ruta" component={withBrand(BRAND, ContactosRuta)} durationInFrames={CONTACTOS} {...video} />
    <Composition id="usuarios-licencias" component={withBrand(BRAND, UsuariosLicencias)} durationInFrames={USUARIOS_LIC} {...video} />
  </>
);
