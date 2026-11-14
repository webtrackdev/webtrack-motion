// Paneles de cada parada (lado derecho de la pantalla): lenguaje y justificacion, carpetas,
// patrones, capas y seguridad del servidor, base de datos, avisos y piloto.
import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Archive,
  ArrowRight,
  Bike,
  Check,
  Database,
  KeyRound,
  Layers,
  LayoutPanelLeft,
  Mail,
  MapPin,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Shuffle,
  Smartphone,
  Table2
} from 'lucide-react';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { C, FolderTree, InfoRow, LAYER, PatternChip, Pill, StationPanel, Step, TechLogo, mono } from '../../components/ui';
import { T } from './layout';

const ICO = { size: 28, strokeWidth: 2.3 };

/** Encabezado de tecnologia: logos + nombre + apoyo. */
const TechHead: FC<{ at: number; logos: { name: string; color: string }[]; title: string; sub: string }> = ({ at, logos, title, sub }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
      {logos.map((l, i) => {
        const p = sp(frame, at + i * 5, SPRING.pop);
        return (
          <div key={l.name} style={{ transform: `scale(${p}) rotate(${(1 - p) * -20}deg)` }}>
            <TechLogo name={l.name} color={l.color} size={78} />
          </div>
        );
      })}
      <div style={{ marginLeft: 8, opacity: sp(frame, at + 8) }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>{title}</div>
        <div style={{ fontSize: 23, fontWeight: 600, color: C.faint }}>{sub}</div>
      </div>
    </div>
  );
};

const Rows: FC<{ children: ReactNode; gap?: number }> = ({ children, gap = 14 }) => <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>;

// ---------------------------------------------------------------- 1. App web

export const WebPanel: FC = () => (
  <StationPanel
    at={T.web + 20}
    out={T.bridge - 8}
    num="01"
    eyebrow="Parada 1 · lo que ve el usuario"
    title="La app web"
    color={LAYER.web}
    tabs={[
      { label: 'Lenguaje', from: 0 },
      { label: 'Carpetas', from: T.webFolders },
      { label: 'Patrones', from: T.webPatterns }
    ]}
  >
    <Step at={T.webLang} out={T.webFolders - 12}>
      <TechHead
        at={T.webLang}
        logos={[
          { name: 'typescript', color: '#3178c6' },
          { name: 'react', color: '#149eca' },
          { name: 'vite', color: '#646cff' }
        ]}
        title="TypeScript + React"
        sub="Aplicación de una sola página, con Vite"
      />
      <Rows>
        <InfoRow at={T.webLang + 25} label="Qué es" color={LAYER.web} text="La interfaz del navegador donde estudiantes y administradores cotizan, piden y siguen sus materiales." />
        <InfoRow
          at={T.webLang + 55}
          label="Por qué"
          color={C.green}
          text="Componentes reutilizables, mucha documentación y experiencia previa del equipo. TypeScript avisa errores de tipos antes de ejecutar."
        />
        <InfoRow at={T.webLang + 85} label="Dónde" color={C.deepSky} text="En el repositorio del frontend. Habla con el servidor por REST (JSON) y por WebSocket." />
      </Rows>
    </Step>
    <Step at={T.webFolders} out={T.webPatterns - 12}>
      <FolderTree
        at={T.webFolders}
        root="UVGo/src"
        color={LAYER.web}
        items={[
          { name: 'pages/', text: 'Una carpeta por pantalla: Login, Cotizar, Seguimiento, Admin' },
          { name: 'components/', text: 'Piezas visuales reutilizables' },
          { name: 'hooks/', text: 'Piden datos y los guardan en caché' },
          { name: 'services/', text: 'Hablan con el servidor (api.ts)' },
          { name: 'store/', text: 'Recuerdan la sesión: token y usuario' },
          { name: 'models/', text: 'Tipos: Pedido, Perfil, Producto' },
          { name: 'router/', text: 'Las rutas de la app' },
          { name: 'layout/', text: 'El marco de la app y el guardián de sesión' }
        ]}
      />
    </Step>
    <Step at={T.webPatterns} out={T.bridge}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
        {[
          { name: 'Route Guard', text: 'Sin sesión te manda a /login', where: 'RequireAuth', icon: <ShieldCheck {...ICO} /> },
          { name: 'Container / Presentational', text: 'La página decide, el componente muestra', where: 'pages/ · components/', icon: <LayoutPanelLeft {...ICO} /> },
          { name: 'Custom Hooks', text: 'Piden datos y los guardan en caché', where: 'usePedidos', icon: <RefreshCw {...ICO} /> },
          { name: 'Store', text: 'La sesión sigue aunque recargues', where: 'useAuthStore', icon: <Archive {...ICO} /> },
          { name: 'Adapter', text: 'Traduce el pedido del servidor a la pantalla', where: 'adapter.ts', icon: <Shuffle {...ICO} /> },
          { name: 'Service Layer + Singleton', text: 'Una sola conexión axios para todo', where: 'services/ · api.ts', icon: <Server {...ICO} /> },
          { name: 'Interceptor', text: 'Pega el JWT; un 401 cierra la sesión', where: 'api.ts', icon: <KeyRound {...ICO} /> },
          { name: 'Observer', text: 'Escucha la ubicación del piloto', where: 'useUbicacionRepartidor', icon: <Radio {...ICO} /> }
        ].map((c, i) => (
          <PatternChip key={c.name} at={T.webPatterns + 10 + i * 9} color={LAYER.web} {...c} />
        ))}
      </div>
    </Step>
  </StationPanel>
);

// ---------------------------------------------------------------- 2. Servidor

const Gate: FC<{ name: string; on: number; color: string }> = ({ name, on, color }) => (
  // El nombre admite saltos de linea con \n.
  <div
    style={{
      width: 196,
      height: 132,
      borderRadius: 22,
      background: on > 0.5 ? color : '#fff',
      color: on > 0.5 ? '#fff' : C.ink,
      boxShadow: `inset 0 0 0 3px ${color}, 0 14px 28px -18px rgba(0,0,0,.5)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      textAlign: 'center',
      padding: 10,
      transform: `scale(${1 + 0.06 * Math.sin(on * Math.PI)})`
    }}
  >
    <ShieldCheck size={34} strokeWidth={2.4} />
    <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{name}</div>
  </div>
);

const SecurityStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.srvSecurity;
  const g1 = kf(frame, [a + 30, a + 45], [0, 1]);
  const g2 = kf(frame, [a + 60, a + 75], [0, 1]);
  const g3 = kf(frame, [a + 90, a + 105], [0, 1]);
  const checks = ['Token firmado y vigente', 'Sesión activa en la tabla sesiones', 'Usuario activo con el mismo rol'];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: sp(frame, a) }}>
        <Pill color={C.amberDeep} style={{ fontFamily: mono }}>
          <KeyRound size={20} /> JWT
        </Pill>
        <ArrowRight size={30} color={C.faint} />
        <Gate name={"SecurityFilter\nChain"} on={g1} color={C.green} />
        <ArrowRight size={30} color={C.faint} />
        <Gate name="JwtDecoder" on={g2} color={C.green} />
        <ArrowRight size={30} color={C.faint} />
        <Gate name="Controller" on={g3} color={LAYER.web} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        {checks.map((c, i) => {
          const p = sp(frame, a + 62 + i * 9, SPRING.pop);
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, fontWeight: 600, color: C.ink, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
              <div style={{ width: 36, height: 36, borderRadius: 99, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={22} color="#fff" strokeWidth={3.5} />
              </div>
              {c}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 26 }}>
        <InfoRow at={a + 120} label="Patrón" color={C.green} text="Chain of Responsibility: cada filtro revisa la petición y la pasa al siguiente." />
        <InfoRow at={a + 150} label="WebSocket" color={LAYER.pilot} text="La conexión en vivo se valida al conectar (AutenticacionStomp)." />
        <InfoRow at={a + 180} label="IoC / DI" color={C.deepSky} text="Spring crea cada pieza y la entrega por constructor: nadie hace new." />
      </div>
    </div>
  );
};

const LayersStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.srvLayers;
  const lit = Math.floor(kf(frame, [a + 30, a + 200], [0, 3.999], (t) => t));
  const rows = [
    { name: 'Controller', what: 'Recibe la petición HTTP', ex: 'PedidoController · /api/v1/pedidos' },
    { name: 'Service', what: 'Aplica las reglas del negocio', ex: 'PedidoService · crear, cotizar, aceptar' },
    { name: 'Entidad', what: 'El objeto con sus datos y reglas', ex: 'Pedido · ItemPedido' },
    { name: 'Repository', what: 'Guarda y lee de la base', ex: 'PedidoRepository · Spring Data JPA' }
  ];
  const fns = ['Cuentas', 'Pedidos', 'Lectura de PDF', 'Catálogo', 'Pilotos', 'Ubicación'];
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => {
          const p = sp(frame, a + 6 + i * 8, SPRING.pop);
          const on = lit === i;
          return (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '14px 20px',
                  borderRadius: 20,
                  background: on ? '#fff' : `${C.green}10`,
                  boxShadow: on ? `0 0 0 3.5px ${C.coral}, 0 16px 30px -18px ${C.coral}` : `inset 0 0 0 1.5px ${C.hair}`,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 40}px) scale(${on ? 1.02 : 1})`
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: C.green,
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <div style={{ fontSize: 27, fontWeight: 800, color: C.ink }}>{r.name}</div>
                    <div style={{ fontSize: 23, fontWeight: 600, color: C.muted }}>{r.what}</div>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.green, marginTop: 4 }}>{r.ex}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 26, fontSize: 24, fontWeight: 700, color: C.ink, opacity: sp(frame, a + 200) }}>Cada función del servidor repite este mismo camino:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        {fns.map((f, i) => {
          const p = sp(frame, a + 210 + i * 6, SPRING.pop);
          return (
            <div key={f} style={{ transform: `scale(${p})` }}>
              <Pill color={C.green} solid>
                <Layers size={18} /> {f}
              </Pill>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ServerPanel: FC = () => (
  <StationPanel
    at={T.server + 20}
    out={T.oop - 8}
    num="02"
    eyebrow="Parada 2 · donde se decide todo"
    title="El servidor"
    color={LAYER.server}
    tabs={[
      { label: 'Lenguaje', from: 0 },
      { label: 'Seguridad', from: T.srvSecurity },
      { label: 'Capas', from: T.srvLayers },
      { label: 'Carpetas', from: T.srvFolders }
    ]}
  >
    <Step at={T.srvLang} out={T.srvSecurity - 12}>
      <TechHead
        at={T.srvLang}
        logos={[
          { name: 'openjdk', color: '#ea7100' },
          { name: 'springboot', color: '#6db33f' }
        ]}
        title="Java 21 + Spring Boot 4"
        sub="Una API REST"
      />
      <Rows>
        <InfoRow at={T.srvLang + 25} label="Qué es" color={LAYER.server} text="La API que recibe cada petición, aplica las reglas del negocio y guarda los datos." />
        <InfoRow
          at={T.srvLang + 55}
          label="Por qué"
          color={C.coral}
          text="Java es orientado a objetos puro: herencia, encapsulamiento y polimorfismo. Spring Boot ya trae capas, persistencia y seguridad."
        />
        <InfoRow at={T.srvLang + 85} label="Dónde" color={C.deepSky} text="En Azure App Service (uvgospringboot). Lo compila Gradle y lo publica GitHub Actions." />
      </Rows>
    </Step>
    <Step at={T.srvSecurity} out={T.srvLayers - 12}>
      <SecurityStep />
    </Step>
    <Step at={T.srvLayers} out={T.srvFolders - 12}>
      <LayersStep />
    </Step>
    <Step at={T.srvFolders} out={T.oop}>
      <FolderTree
        at={T.srvFolders}
        root="com.UVGgo.backend"
        color={LAYER.server}
        gap={8}
        items={[
          { name: 'auth/', text: 'Login, registro y sesiones con JWT' },
          { name: 'usuario/', text: 'El usuario y sus tipos' },
          { name: 'pedido/', text: 'Solicitudes, ítems, estados y correos' },
          { name: 'piloto/ ubicacion/', text: 'Asignaciones y GPS en vivo' },
          { name: 'extraccion/', text: 'Lee el PDF de materiales' },
          { name: 'archivo/ correo/', text: 'Comprobantes y correos' },
          { name: 'config/ api/', text: 'Seguridad, WebSocket y errores' },
          { name: 'domain/ persistence/ web/', text: 'El catálogo, por capas' }
        ]}
      />
    </Step>
  </StationPanel>
);

// ---------------------------------------------------------------- 3. Datos

const OrmStep: FC = () => {
  const frame = useCurrentFrame();
  const a = T.dataOrm;
  const morph = kf(frame, [a + 30, a + 60], [0, 1], EASE.inOut);
  const tables = ['usuarios', 'sesiones', 'solicitudes', 'items_pedido', 'articulos'];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 250,
            padding: 18,
            borderRadius: 20,
            background: '#fff',
            boxShadow: `inset 0 0 0 3px ${C.green}`,
            opacity: sp(frame, a),
            transform: `translateX(${morph * 10}px)`
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>objeto Java</div>
          <div style={{ fontSize: 27, fontWeight: 800, color: C.ink }}>Pedido</div>
          <div style={{ fontFamily: mono, fontSize: 17, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
            estado = COTIZADO
            <br />
            version = 3
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: sp(frame, a + 15) }}>
          <Pill color={C.deepSky}>JPA / Hibernate</Pill>
          <ArrowRight size={40} color={C.deepSky} style={{ transform: `translateX(${Math.sin(frame / 5) * 5}px)` }} />
        </div>
        <div style={{ flex: 1, borderRadius: 20, overflow: 'hidden', boxShadow: `inset 0 0 0 3px ${C.deepSky}`, background: '#fff', opacity: sp(frame, a + 25) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: C.deepSky, color: '#fff', fontFamily: mono, fontSize: 19, fontWeight: 800 }}>
            <Table2 size={20} /> solicitudes
          </div>
          {[
            ['id', 'estado', 'version'],
            ['a3f…', morph > 0.5 ? 'COTIZADO' : '·····', morph > 0.5 ? '3' : '·']
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', padding: '8px 16px', fontFamily: mono, fontSize: 18, fontWeight: i ? 600 : 800, color: i ? C.ink : C.faint, background: i && morph > 0.5 ? `${C.sky}1a` : undefined }}>
              {r.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
        {tables.map((t, i) => (
          <div key={t} style={{ transform: `scale(${sp(frame, a + 70 + i * 5, SPRING.pop)})` }}>
            <Pill color={C.deepSky} style={{ fontFamily: mono }}>
              <Table2 size={18} /> {t}
            </Pill>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
        <InfoRow at={a + 100} label="Repository" color={C.deepSky} text="El servicio pide y guarda objetos; Spring Data JPA escribe el SQL." />
        <InfoRow at={a + 125} label="Flyway" color={C.green} text="21 migraciones (V1 a V21): cada cambio de la base queda versionado." />
        <InfoRow at={a + 150} label="@Version" color={C.coral} text="Si dos personas editan el mismo pedido, el segundo recibe un aviso (409)." />
      </div>
    </div>
  );
};

export const DataPanel: FC = () => (
  <StationPanel
    at={T.data + 100}
    out={T.events - 8}
    num="03"
    eyebrow="Parada 3 · donde vive la información"
    title="La base de datos"
    color={LAYER.data}
    tabs={[
      { label: 'Por qué', from: 0 },
      { label: 'Cómo se guarda', from: T.dataOrm }
    ]}
  >
    <Step at={T.dataWhy} out={T.dataOrm - 12}>
      <TechHead at={T.dataWhy} logos={[{ name: 'postgresql', color: '#336791' }]} title="PostgreSQL en Azure" sub="Base de datos relacional" />
      <Rows>
        <InfoRow at={T.dataWhy + 25} label="Qué es" color={LAYER.data} text="La base donde vive todo: usuarios, sesiones, solicitudes, ítems y artículos." />
        <InfoRow
          at={T.dataWhy + 55}
          label="Por qué"
          color={C.green}
          text="Los datos son relacionales y los montos exigen integridad. Transacciones confiables, uso libre y conexión directa con Spring Data JPA."
        />
        <InfoRow at={T.dataWhy + 85} label="Dónde" color={C.coral} text="Azure Database for PostgreSQL: servidor uvgoserver, base uvgodatabase." />
      </Rows>
    </Step>
    <Step at={T.dataOrm} out={T.events}>
      <OrmStep />
    </Step>
  </StationPanel>
);

// ---------------------------------------------------------------- 4. Avisos (Observer)

const EventCard: FC<{ at: number; icon: ReactNode; when: string; then: string; color: string }> = ({ at, icon, when, then, color }) => {
  const frame = useCurrentFrame();
  const p = sp(frame, at, SPRING.pop);
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        padding: 20,
        borderRadius: 24,
        background: '#fff',
        boxShadow: `0 16px 34px -22px rgba(0,0,0,.45), inset 0 0 0 1.5px ${C.hair}`,
        opacity: Math.min(1, p * 1.4),
        transform: `translateX(${(1 - p) * 60}px)`
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: 18, background: `${color}1c`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{when}</div>
        <div style={{ fontSize: 23, fontWeight: 500, color: C.muted, lineHeight: 1.35, marginTop: 4 }}>{then}</div>
      </div>
    </div>
  );
};

export const EventsPanel: FC = () => {
  const frame = useCurrentFrame();
  return (
    <StationPanel at={T.events + 20} out={T.pilot - 8} num="04" eyebrow="Parada 4 · lo que pasa solo" title="Avisos automáticos" color={C.sky}>
      <div style={{ fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.4, opacity: sp(frame, T.events + 30) }}>
        <b style={{ color: C.deepSky }}>Patrón Observer:</b> el servicio publica un evento y otras piezas lo escuchan, sin conocerse entre sí.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 26 }}>
        <EventCard at={T.events + 60} icon={<Mail size={34} />} color={C.sky} when="Cambia el estado del pedido" then="CorreoService envía un correo con Azure Communication Services." />
        <EventCard at={T.events + 150} icon={<Archive size={34} />} color={C.sky} when="El estudiante sube su comprobante" then="AlmacenAzureBlob lo guarda en Blob Storage." />
        <EventCard at={T.events + 240} icon={<Bike size={34} />} color={LAYER.pilot} when="El admin asigna un piloto" then="AsignacionNotificador lo avisa por WebSocket a la app del piloto." />
      </div>
      <div style={{ marginTop: 22, opacity: sp(frame, T.events + 330) }}>
        <Pill color={C.deepSky} style={{ fontFamily: mono, fontSize: 19 }}>
          @TransactionalEventListener · solo avisa si el cambio ya se guardó
        </Pill>
      </div>
    </StationPanel>
  );
};

// ---------------------------------------------------------------- 5. Piloto

export const PilotPanel: FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    { at: T.pilot + 60, icon: <Smartphone size={30} />, text: 'La app del piloto recibe la asignación' },
    { at: T.pilot + 150, icon: <Radio size={30} />, text: 'Publica su posición GPS por WebSocket (STOMP)' },
    { at: T.pilot + 230, icon: <Database size={30} />, text: 'El servidor guarda la última posición y la reenvía' },
    { at: T.pilot + 300, icon: <MapPin size={30} />, text: 'La web la escucha y mueve el pin en el mapa de Mapbox' }
  ];
  return (
    <StationPanel at={T.pilot + 20} out={T.sats - 8} num="05" eyebrow="Parada 5 · en la calle" title="El piloto en vivo" color={LAYER.pilot}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ position: 'absolute', left: 34, top: 40, bottom: 40, width: 4, borderRadius: 2, background: `${LAYER.pilot}33` }} />
        {steps.map((s, i) => {
          const p = sp(frame, s.at, SPRING.pop);
          const done = frame >= s.at;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: Math.max(0.25, Math.min(1, p * 1.4)), transform: `translateX(${(1 - p) * 30}px)` }}>
              <div
                style={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  background: done ? LAYER.pilot : '#fff',
                  color: done ? '#fff' : LAYER.pilot,
                  boxShadow: `inset 0 0 0 3px ${LAYER.pilot}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {s.icon}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>{s.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 34 }}>
        <InfoRow at={T.pilot + 340} label="Observer" color={LAYER.pilot} text="La web se suscribe a /topic/pedidos/{id} y reacciona a cada nueva posición." />
      </div>
    </StationPanel>
  );
};
