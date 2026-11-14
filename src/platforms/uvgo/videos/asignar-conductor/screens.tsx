// Pantallas del video "Asignar conductor":
// - Web: Panel de administración (/admin), bento real de AdminHome con la tarjeta "Conductor"
//   (ConductorPedido), "Pedidos" y "Ruta de entrega" (MapaEntrega) del repo UVGo.
// - Móvil: pantalla del piloto de la app Android UVGO (ui/screens/piloto/PilotoScreen.kt):
//   cabina con radar, indicadores, "Mis entregas" y la tarjeta con "Iniciar ruta".
// Ambos repos son solo lectura. Viewport web 1440x900; teléfono 390x844 dp. Datos ficticios.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Clock, Layers, LogOut, MapPin, Maximize2, Package, Play, UserPlus } from 'lucide-react';
import { Rail, U } from '../crear-cuenta/screens';

const HAIR = 'rgba(82,82,82,0.1)';
const SHADOW_MD = '0 1px 3px 0 rgb(0 0 0 / 0.1)';
const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';
const VERDE_CLARO = '#b8d4b6';

export const PEDIDO = { numero: 'UVG-3F9A1C2B', curso: 'Robótica Móvil', catedratico: 'Ing. Carlos Méndez', destino: 'Edificio J, lobby', limite: '25/11/2026' };
export const PILOTOS = ['Carlos Pérez', 'María Gómez', 'Luis Ramírez'];
export const PILOTO = PILOTOS[0];

/** Ícono MdDeliveryDining (react-icons/md), el que usa la web para el conductor. */
export const DeliveryIcon: FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1" />
    <path d="M5 6h5v2H5zM19 13c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3m0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1" />
  </svg>
);

// ------------------------------------------------------------------ web: piezas del bento

const Card: FC<{ titulo: ReactNode; extra?: ReactNode; grow?: boolean; children: ReactNode; style?: CSSProperties }> = ({ titulo, extra, grow, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', flex: grow ? '1 1 auto' : '0 0 auto', minWidth: 0, padding: 16, borderRadius: 24, background: U.surfaceMuted, boxShadow: SHADOW_MD, outline: '1px solid rgba(255,255,255,.6)', outlineOffset: -1, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>{titulo}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: U.faint }}>
        {extra}
        <span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', color: U.muted }}>
          <ChevronRight size={18} />
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0, marginTop: 12 }}>{children}</div>
  </div>
);

const Tile: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div style={{ display: 'flex', minWidth: 0, padding: 12, borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(255,255,255,.75)', ...style }}>{children}</div>
);

type Tone = 'neutral' | 'accent' | 'success';
const TONES: Record<Tone, [string, string]> = {
  neutral: [U.muted, 'rgba(82,82,82,.08)'],
  accent: ['#a34f3a', 'rgba(224,122,95,.14)'],
  success: [U.green, 'rgba(29,65,27,.1)']
};
const Badge: FC<{ tone: Tone; children: ReactNode }> = ({ tone, children }) => (
  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', color: TONES[tone][0], background: TONES[tone][1] }}>{children}</span>
);

const Bars: FC<{ values: number[]; hl: number; h?: number }> = ({ values, hl, h = 70 }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h }}>
    {values.map((v, i) => (
      <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 6, background: i === hl ? U.green : VERDE_CLARO }} />
    ))}
  </div>
);

// ------------------------------------------------------------------ mapa de la ruta

/** Ruta de Bodega UVGO al destino en coordenadas del área del mapa (477x400). */
export const RUTA: [number, number][] = [
  [70, 330],
  [70, 250],
  [190, 250],
  [190, 150],
  [330, 150],
  [330, 80],
  [410, 80]
];
const ruta = RUTA.map(([x, y]) => `${x},${y}`).join(' ');
const largos = RUTA.slice(1).map(([x, y], i) => Math.hypot(x - RUTA[i][0], y - RUTA[i][1]));
const LARGO = largos.reduce((a, b) => a + b, 0);

/** Punto de la ruta en la fracción `t` (0..1). */
export const puntoRuta = (t: number): [number, number] => {
  let d = Math.max(0, Math.min(1, t)) * LARGO;
  for (let i = 0; i < largos.length; i++) {
    if (d <= largos[i]) {
      const [x0, y0] = RUTA[i];
      const [x1, y1] = RUTA[i + 1];
      const k = largos[i] === 0 ? 0 : d / largos[i];
      return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
    }
    d -= largos[i];
  }
  return RUTA[RUTA.length - 1];
};

const MapaRuta: FC<{ progreso: number; enVivo: boolean; ping: number }> = ({ progreso, enVivo, ping }) => {
  const [mx, my] = puntoRuta(progreso);
  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 16, overflow: 'hidden', background: '#f2efe9' }}>
      <svg width="100%" height="100%" viewBox="0 0 477 400" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        {/* parques y manzanas */}
        <rect x={230} y={190} width={130} height={90} rx={10} fill="#cfe5c4" />
        <rect x={20} y={20} width={120} height={70} rx={10} fill="#cfe5c4" />
        <path d="M380 260 Q 430 240 477 270 L 477 400 L 400 400 Z" fill="#c6dff0" />
        {/* calles */}
        {[40, 110, 190, 270, 330, 400].map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={400} stroke="#fff" strokeWidth={x % 2 ? 9 : 12} />
        ))}
        {[80, 150, 250, 330].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={477} y2={y} stroke="#fff" strokeWidth={12} />
        ))}
        <line x1={0} y1={360} x2={477} y2={200} stroke="#fde8b0" strokeWidth={14} />
        {/* ruta: borde blanco, tramo pendiente y recorrido */}
        <polyline points={ruta} fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={ruta} fill="none" stroke={U.coral} strokeOpacity={0.35} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={ruta} fill="none" stroke={U.coral} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${LARGO * progreso} ${LARGO}`} />
        {/* bodega y destino */}
        <circle cx={RUTA[0][0]} cy={RUTA[0][1]} r={9} fill={U.green} stroke="#fff" strokeWidth={3} />
        <circle cx={RUTA[RUTA.length - 1][0]} cy={RUTA[RUTA.length - 1][1]} r={9} fill={U.coral} stroke="#fff" strokeWidth={3} />
      </svg>
      {/* moto del repartidor (MotoPin) */}
      <div style={{ position: 'absolute', left: `${(mx / 477) * 100}%`, top: `${(my / 400) * 100}%`, transform: 'translate(-50%, -50%)' }}>
        {enVivo && <span style={{ position: 'absolute', left: '50%', top: '50%', width: 38 + ping * 40, height: 38 + ping * 40, marginLeft: -(19 + ping * 20), marginTop: -(19 + ping * 20), borderRadius: 99, border: `2px solid ${U.coral}`, opacity: 1 - ping }} />}
        <span style={{ position: 'relative', width: 38, height: 38, borderRadius: 99, border: `3px solid ${U.coral}`, background: '#fff', display: 'grid', placeItems: 'center', color: U.coral, boxShadow: '0 6px 14px -4px rgb(0 0 0/.35)' }}>
          <DeliveryIcon size={20} />
        </span>
      </div>
      {/* controles */}
      <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[Layers, Maximize2].map((I, i) => (
          <span key={i} style={{ width: 30, height: 30, borderRadius: 99, background: '#fff', boxShadow: '0 1px 2px rgb(0 0 0/.15)', display: 'grid', placeItems: 'center', color: U.text }}>
            <I size={14} />
          </span>
        ))}
      </div>
      {/* barra de cifras al pie (BarraRuta) */}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 16, background: 'rgba(255,255,255,.92)', boxShadow: '0 6px 18px -8px rgba(0,0,0,.35)' }}>
        {[
          ['1.2 km', 'Distancia'],
          [enVivo ? `${Math.max(1, Math.round(6 * (1 - progreso)))} min` : '~6 min', 'Tiempo estimado'],
          [PEDIDO.limite, 'Fecha límite']
        ].map(([v, l]) => (
          <span key={l} style={{ display: 'flex', flexDirection: 'column', fontSize: 11, color: U.faint }}>
            <b style={{ fontSize: 15, fontWeight: 700, color: U.strong }}>{v}</b>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ web: panel admin

export type AdminState = {
  dropdown: boolean;
  hover: number; // opción resaltada en el desplegable (-1 ninguna)
  elegido: string; // '' = Elige un conductor
  asignando: boolean;
  asignado: boolean;
  press: number;
  progreso: number;
  enVivo: boolean;
  ping: number;
  /** Conductor y destino de este pedido (por defecto, los del video de asignación). */
  piloto?: string;
  destino?: string;
};

/** Coordenadas (viewport) de la tarjeta Conductor y del mapa. */
export const W = {
  select: { x: 1026, y: 600 },
  opcion: (i: number) => ({ x: 1000, y: 645 + i * 24 }),
  asignar: { x: 1026, y: 651 },
  mapa: { x: 374 + 16, y: 459, w: 477, h: 400 }
};

const Conductor: FC<{ st: AdminState }> = ({ st }) => {
  const opciones = ['Elige un conductor', ...PILOTOS];
  const cambio = st.elegido !== '' && !st.asignado;
  return (
    <Card titulo="Conductor">
      <Tile style={{ alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 99, background: U.strong, color: '#fff', display: 'grid', placeItems: 'center' }}>
          <DeliveryIcon size={24} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <small style={{ fontSize: 12, color: U.faint }}>Conductor</small>
          <strong style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>{st.asignado ? (st.piloto ?? PILOTO) : 'Sin asignar'}</strong>
        </div>
      </Tile>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>{st.asignado ? 'Cambiar de conductor' : 'Asignar conductor'}</span>
        <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderRadius: 12, border: `1px solid ${st.dropdown ? U.coral : HAIR}`, boxShadow: st.dropdown ? '0 0 0 3px rgba(224,122,95,.16)' : undefined, background: '#fff', fontSize: 14, color: U.text }}>
          {st.elegido || 'Elige un conductor'}
          <ChevronDown size={14} color={U.muted} />
        </div>
        {/* lista nativa del <select> */}
        {st.dropdown && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 75, zIndex: 5, padding: 4, borderRadius: 8, background: '#f7f7f7', boxShadow: '0 12px 30px -6px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.08)' }}>
            {opciones.map((o, i) => (
              <div key={o} style={{ height: 24, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', borderRadius: 4, fontSize: 13, color: i === st.hover ? '#fff' : U.text, background: i === st.hover ? '#0a63d1' : 'transparent' }}>
                <span style={{ width: 12 }}>{o === (st.elegido || 'Elige un conductor') ? <Check size={12} /> : null}</span>
                {o}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ flex: 1, height: 44, borderRadius: 99, background: U.strong, color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cambio && !st.asignando ? 1 : 0.5, transform: `scale(${st.press})` }}>
            {st.asignando ? 'Asignando…' : st.asignado ? 'Cambiar conductor' : 'Asignar conductor'}
          </span>
          {st.asignado && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', fontSize: 12, fontWeight: 500, color: U.muted }}>Quitar</span>}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 12, fontWeight: 500, color: U.muted }}>
          <UserPlus size={14} /> Nuevo conductor
        </span>
      </div>
      {st.asignado && <div style={{ marginTop: 4, fontSize: 12, color: U.muted }}>{st.piloto ?? PILOTO} recibe el pedido al instante en la app de UVGo y su posición aparece en el mapa.</div>}
    </Card>
  );
};

const PEDIDOS = [
  { n: 'UVG-3F9A1C2B', c: 'Robótica Móvil', d: 'Edificio J, lobby', pago: ['Por validar', 'accent'] as const },
  { n: 'UVG-8C21D4E0', c: 'Física II', d: 'Edificio CIT', pago: ['Pagado', 'success'] as const },
  { n: 'UVG-51B9A7F3', c: 'Química General', d: 'Biblioteca', pago: ['Sin pagar', 'neutral'] as const }
];

export const AdminScreen: FC<{ st: AdminState; ocultarMapa?: boolean }> = ({ st, ocultarMapa }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 16, padding: 16, background: '#fff', backgroundImage: LAYOUT_BG, color: U.text }}>
    <Rail initials="DR" active={0} admin />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ padding: '8px 4px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>Vista admin</div>
        <div style={{ marginTop: 4, fontSize: 36, lineHeight: 1.1, fontWeight: 700, color: U.strong }}>Panel de administración</div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 16 }}>
        {/* columna 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card titulo="Horario de solicitudes" extra="4 sem.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} style={{ height: 18, borderRadius: 4, background: [3, 8, 9, 14, 15, 20].includes(i) ? U.green : (i * 7) % 5 < 2 ? VERDE_CLARO : 'rgba(255,255,255,.7)' }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: U.faint }}>Más pedidos entre 10:00 y 12:00</span>
          </Card>
          <Card titulo="Entregas">
            <Tile style={{ flexDirection: 'column', gap: 2 }}>
              <b style={{ fontSize: 24, fontWeight: 700, color: U.strong }}>3</b>
              <span style={{ fontSize: 12, color: U.faint }}>por entregar · 4.8 km</span>
            </Tile>
            <span style={{ fontSize: 12, color: st.asignado ? U.green : U.coral, fontWeight: 600 }}>{st.asignado ? '1 sin conductor' : '2 sin conductor'}</span>
          </Card>
          <Card titulo="Actividad" extra="7 días" grow>
            <Bars values={[0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7]} hl={6} />
          </Card>
        </div>
        {/* columna 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card titulo={`Pedidos (${PEDIDOS.length})`}>
            {PEDIDOS.map((p, i) => (
              <div key={p.n} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto auto', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 14, border: `1px solid ${i === 0 ? 'rgba(224,122,95,.5)' : HAIR}`, background: i === 0 ? '#fff' : 'rgba(255,255,255,.45)' }}>
                <span style={{ width: 36, height: 36, borderRadius: 99, display: 'grid', placeItems: 'center', background: i === 0 ? U.coral : 'rgba(224,122,95,.14)', color: i === 0 ? '#fff' : U.coral }}>
                  <Package size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: U.strong }}>#{p.n}</div>
                  <div style={{ fontSize: 11, color: U.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.c} · {i === 0 && st.destino ? st.destino : p.d}
                  </div>
                </div>
                <Badge tone={p.pago[1]}>{p.pago[0]}</Badge>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: i === 0 ? U.coral : U.muted }}>
                  {i === 0 ? <MapPin size={13} /> : <Play size={13} />}
                  {i === 0 ? 'En mapa' : 'Ver ruta'}
                </span>
              </div>
            ))}
          </Card>
          <Card
            titulo={
              <span>
                Ruta de entrega <span style={{ fontWeight: 400, color: U.faint }}>#{PEDIDO.numero}</span>
                <div style={{ fontSize: 12, fontWeight: 400, color: U.faint }}>Distancia: 1.2 km · Bodega UVGO → {PEDIDO.destino}</div>
              </span>
            }
            grow
            style={ocultarMapa ? { opacity: 0 } : undefined}
          >
            <div style={{ height: 6 }} />
            <MapaRuta progreso={st.progreso} enVivo={st.enVivo} ping={st.ping} />
          </Card>
        </div>
        {/* columna 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card titulo="Pedido seleccionado">
            <div style={{ position: 'relative', overflow: 'hidden', padding: 14, borderRadius: 16, background: U.green, color: '#fff', height: 96 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{PEDIDO.curso}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>#{PEDIDO.numero}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{PEDIDO.catedratico}</div>
              <Package size={72} style={{ position: 'absolute', right: -8, bottom: -10, opacity: 0.2 }} />
            </div>
            <Tile style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <b style={{ fontSize: 14, color: U.strong }}>Quedan 13 días</b>
                <span style={{ fontSize: 11, color: U.faint }}>Fecha límite: {PEDIDO.limite}</span>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: U.green }}>
                <Clock size={14} /> 13 d
              </span>
            </Tile>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tile style={{ flex: 1, flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: U.faint }}>Total</span>
                <b style={{ fontSize: 15, color: U.strong }}>Q215.00</b>
              </Tile>
              <Tile style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} style={{ flex: 1, height: 5, borderRadius: 9, background: k < 3 ? U.green : VERDE_CLARO }} />
                  ))}
                </div>
                <Badge tone="success">Confirmada</Badge>
              </Tile>
            </div>
          </Card>
          <Conductor st={st} />
        </div>
        {/* columna 4 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card titulo="Cobros" extra="Semana">
            <Tile style={{ flexDirection: 'column', gap: 2 }}>
              <b style={{ fontSize: 22, fontWeight: 700, color: U.strong }}>Q1,860.00</b>
              <span style={{ fontSize: 11, color: U.faint }}>cobrado de Q2,075.00</span>
            </Tile>
            <Bars values={[0.3, 0.5, 0.2, 0.7, 0.9, 0.1, 0.4]} hl={4} h={56} />
          </Card>
          <Card titulo="Pendientes">
            {[
              ['Por cotizar', '2'],
              ['Pagos por validar', '1']
            ].map(([l, v]) => (
              <Tile key={l} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: U.muted }}>{l}</span>
                <b style={{ fontSize: 18, color: U.strong }}>{v}</b>
              </Tile>
            ))}
          </Card>
          <Card titulo="Seguimiento de entrega" grow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: U.muted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: U.green }} /> Bodega UVGO
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: U.coral }} /> {st.destino ?? PEDIDO.destino}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------------ móvil: pantalla del piloto (Compose)

const C = {
  cabinaArriba: '#0F2A12',
  agregado: '#1D411B',
  menta: '#B8D4B6',
  acento: '#E07A5F',
  verdeSuave: '#D1FAE5',
  borde: '#D4D4D4',
  fuerte: '#0A0A0A',
  suave: '#525252',
  tenue: '#737373'
};

/** Moto de reparto de `IlustracionMoto` (Canvas -> SVG). */
const Moto: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={6} y={18} width={36} height={34} rx={3} fill={C.agregado} />
    <rect x={6} y={30} width={36} height={7} fill="#00A443" />
    <path d="M10 62 L58 62 L70 36 L80 36 L90 70 L62 76 L12 76 Z" fill="#00913C" />
    <rect x={20} y={54} width={30} height={8} rx={4} fill="#262626" />
    <line x1={72} y1={36} x2={66} y2={18} stroke="#262626" strokeWidth={3} strokeLinecap="round" />
    <line x1={60} y1={18} x2={72} y2={18} stroke="#262626" strokeWidth={3} strokeLinecap="round" />
    {[24, 80].map((x) => (
      <g key={x}>
        <circle cx={x} cy={80} r={17} fill="#262626" />
        <circle cx={x} cy={80} r={8.5} fill="#BFC5C2" />
      </g>
    ))}
  </svg>
);

/** Caja de cartón de `dibujarCaja` (Canvas -> SVG). */
const Caja: FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 6 L96 28 L50 50 L4 28 Z" fill="#E8C391" />
    <path d="M4 28 L50 50 L50 96 L4 74 Z" fill="#D7A86E" />
    <path d="M50 50 L96 28 L96 74 L50 96 Z" fill="#B98A52" />
    <line x1={27} y1={17} x2={73} y2={39} stroke="#F1E3C8" strokeWidth={7} />
    <line x1={73} y1={39} x2={73} y2={60} stroke="#F1E3C8" strokeWidth={7} />
  </svg>
);

const Radar: FC<{ activo: boolean; fase: number }> = ({ activo, fase }) => (
  <div style={{ position: 'relative', width: 132, height: 132, flexShrink: 0 }}>
    <svg width={132} height={132} viewBox="0 0 132 132" style={{ position: 'absolute', inset: 0 }}>
      {[1, 2, 3].map((i) => (
        <circle key={i} cx={66} cy={66} r={(66 * i) / 3 - 1} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={1.5} />
      ))}
      {activo &&
        [0, 1, 2].map((i) => {
          const t = (fase + i / 3) % 1;
          return <circle key={i} cx={66} cy={66} r={66 * (0.35 + 0.65 * t)} fill="none" stroke={C.acento} strokeOpacity={(1 - t) * 0.8} strokeWidth={3} />;
        })}
      <circle cx={66} cy={66} r={66 * 0.36} fill={activo ? C.acento : 'rgba(255,255,255,.16)'} />
    </svg>
    <div style={{ position: 'absolute', left: 40, top: 40 }}>
      <Moto size={52} />
    </div>
  </div>
);

export type PilotoState = {
  asignada: number; // 0..1 aparición de la tarjeta
  compartiendo: boolean;
  enviadas: number;
  fase: number;
  tap: number; // 0..1 onda del toque
};

/** Coordenadas (dp del teléfono) del botón "Iniciar ruta". */
export const BTN_RUTA = { x: 195, y: 650 };

const Indicador: FC<{ v: string; l: string; coral?: boolean }> = ({ v, l, coral }) => (
  <div style={{ flex: 1, padding: 16, borderRadius: 24, background: coral ? C.acento : '#fff', color: coral ? '#fff' : C.fuerte }}>
    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: '30px' }}>{v}</div>
    <div style={{ fontSize: 12, opacity: 0.7 }}>{l}</div>
  </div>
);

export const PilotoScreen: FC<{ st: PilotoState }> = ({ st }) => {
  const ruta = st.compartiendo;
  const lat = (14.60412 + st.enviadas * 0.00011).toFixed(5);
  const lon = (-90.48903 + st.enviadas * 0.00009).toFixed(5);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: LAYOUT_BG, fontFamily: 'Roboto, Inter, sans-serif', color: C.fuerte }}>
      {/* Cabina */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '44px 24px 24px', borderRadius: '0 0 36px 36px', background: `linear-gradient(${C.cabinaArriba}, ${C.agregado})` }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: C.menta }}>Buen turno,</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{PILOTO}</div>
          </div>
          <span style={{ width: 48, height: 48, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center', color: C.agregado }}>
            <LogOut size={20} />
          </span>
        </div>
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 14, fontWeight: 500 }}>
          <span style={{ width: 10, height: 10, borderRadius: 99, background: '#6EE7A0' }} /> Conectado
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Radar activo={ruta} fase={st.fase} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: 2, color: ruta ? C.acento : C.menta }}>{ruta ? 'EN RUTA HACIA' : 'EN ESPERA'}</div>
            <div style={{ fontSize: 30, lineHeight: '34px', fontWeight: 700, color: '#fff' }}>{ruta ? PEDIDO.destino : 'Listo para salir'}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.75)' }}>{ruta ? PEDIDO.curso : 'Elige una entrega e inicia la ruta'}</div>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'flex', gap: 12, margin: '16px 16px 0' }}>
        <Indicador v={st.asignada > 0.5 ? '1' : '0'} l="Entregas" />
        <Indicador v={String(st.enviadas)} l="Posiciones" coral />
        <Indicador v={ruta && st.enviadas > 0 ? 'NE' : '—'} l="Rumbo" />
      </div>

      <div style={{ margin: '16px 24px 0', fontSize: 20, fontWeight: 600, color: C.fuerte }}>Mis entregas</div>

      <div style={{ position: 'relative', margin: '16px 16px 0' }}>
        {/* sin pedidos */}
        {st.asignada < 1 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: 24, borderRadius: 24, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 1 - st.asignada }}>
            <Moto size={96} />
            <div style={{ fontSize: 15, lineHeight: '22px', color: C.suave, textAlign: 'center' }}>No tienes pedidos asignados por ahora. Aparecerán aquí en cuanto el administrador te asigne uno.</div>
          </div>
        )}
        {/* TarjetaAsignacion */}
        {st.asignada > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: 16,
              borderRadius: 28,
              background: '#fff',
              border: `2px solid ${ruta ? C.acento : 'transparent'}`,
              boxShadow: ruta ? '0 18px 30px -12px rgba(0,0,0,.3)' : '0 1px 2px rgba(0,0,0,.08)',
              opacity: st.asignada,
              transform: `translateY(${(1 - st.asignada) * 40}px) scale(${0.94 + 0.06 * st.asignada})`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 99, background: C.verdeSuave, display: 'grid', placeItems: 'center' }}>
                <Caja size={30} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{PEDIDO.curso}</div>
                <div style={{ fontSize: 12, color: C.tenue }}>{PEDIDO.numero}</div>
              </div>
              <span style={{ padding: '6px 12px', borderRadius: 99, fontSize: 14, fontWeight: 500, background: ruta ? C.acento : C.verdeSuave, color: ruta ? '#fff' : C.agregado }}>{ruta ? 'En ruta' : 'Confirmada'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 12, height: 12, borderRadius: 99, background: C.agregado }} />
                <span style={{ width: 0, height: 26, borderLeft: `2px dashed ${C.borde}` }} />
                <span style={{ width: 12, height: 12, borderRadius: 99, background: C.acento }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 14, color: C.suave }}>Bodega UVGo</span>
                <span style={{ fontSize: 18, fontWeight: 600 }}>{PEDIDO.destino}</span>
              </div>
            </div>
            {ruta ? (
              <>
                <div style={{ padding: 12, borderRadius: 16, background: C.verdeSuave, color: C.agregado, fontSize: 14, lineHeight: '20px' }}>
                  {st.enviadas === 0 ? 'Esperando señal de GPS…' : `Enviando ubicación · ${lat}, ${lon} · ${st.enviadas} enviadas`}
                </div>
                <div style={{ height: 54, borderRadius: 99, border: `1px solid ${C.borde}`, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 500, color: '#171717' }}>Terminar ruta</div>
              </>
            ) : (
              <div style={{ position: 'relative', height: 54, borderRadius: 99, background: C.agregado, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 600, overflow: 'hidden' }}>
                Iniciar ruta <span style={{ fontSize: 18 }}>→</span>
                {st.tap > 0 && st.tap < 1 && <span style={{ position: 'absolute', left: '50%', top: '50%', width: 400 * st.tap, height: 400 * st.tap, marginLeft: -200 * st.tap, marginTop: -200 * st.tap, borderRadius: 999, background: 'rgba(255,255,255,.3)', opacity: 1 - st.tap }} />}
              </div>
            )}
          </div>
        )}
        {ruta && <div style={{ marginTop: 16, padding: '0 8px', fontSize: 12, lineHeight: '16px', color: C.tenue }}>Puedes bloquear el teléfono o usar otras apps: tu ubicación se sigue enviando hasta que termines la ruta.</div>}
      </div>
    </div>
  );
};

/** Marco de teléfono Android (390x844 dp de pantalla). */
export const PHONE_W = 390;
export const PHONE_H = 844;
export const BEZEL = 12;
export const Phone: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', width: PHONE_W + BEZEL * 2, height: PHONE_H + BEZEL * 2, borderRadius: 56, background: '#111', boxShadow: '0 60px 120px -40px rgba(0,0,0,.7), inset 0 0 0 2px #333', ...style }}>
    <div style={{ position: 'absolute', left: BEZEL, top: BEZEL, width: PHONE_W, height: PHONE_H, borderRadius: 44, overflow: 'hidden', background: '#fff' }}>
      {children}
      {/* barra de estado */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
        <span>10:42</span>
        <span style={{ width: 14, height: 14, borderRadius: 99, background: '#000', boxShadow: '0 0 0 2px #222' }} />
        <span>5G ▮</span>
      </div>
    </div>
  </div>
);
