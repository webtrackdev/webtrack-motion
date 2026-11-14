// Pantallas reales de UVGo para el video "Crear pedido": /cotizar (categorías), /cotizar/electronica
// (Stock + Buscador de productos + barra de selección) y el diálogo "Solicitar cotización".
// Estructura, textos, medidas e iconos (Feather -> lucide) tomados del repo UVGo (solo lectura):
// pages/CotizarInicio, pages/CotizarCategoria (StockPanel, ExternalSearchPanel, ExternalResultCard,
// CrearSolicitudDialog), components/Dialog y styles/shared.styles. Viewport 1440x900. Datos ficticios:
// productos, tiendas, curso y catedrático son inventados; las fotos son ilustraciones 2D.
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Cpu,
  Droplet,
  FileText,
  Globe,
  LayoutGrid,
  Minus,
  Plus,
  Search,
  Settings,
  SquareCheckBig,
  Upload,
  Wrench,
  X
} from 'lucide-react';
import { Rail, U } from '../crear-cuenta/screens';

const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';
export const HAIR = 'rgba(82,82,82,0.1)';
export const ACCENT_WASH = 'rgba(224,122,95,0.16)';
const SUCCESS_WASH = 'rgba(29,65,27,0.1)';
const SHADOW_MD = '0 1px 3px 0 rgb(0 0 0 / 0.1)';

// ------------------------------------------------------------------ piezas compartidas (shared.styles)

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  padding: 16,
  borderRadius: 24,
  background: U.surfaceMuted,
  boxShadow: SHADOW_MD,
  outline: '1px solid rgba(255,255,255,.6)',
  outlineOffset: -1
};

export const IconBadge: FC<{ children: ReactNode; size?: number }> = ({ children, size = 32 }) => (
  <span style={{ width: size, height: size, flexShrink: 0, borderRadius: 99, background: ACCENT_WASH, color: U.coral, display: 'grid', placeItems: 'center' }}>{children}</span>
);

export const PanelHeader: FC<{ icon: ReactNode; title: string; hint: string; right?: ReactNode }> = ({ icon, title, hint, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '0 4px 12px', borderBottom: `1px solid ${HAIR}` }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: U.strong }}>
        <IconBadge>{icon}</IconBadge>
        {title}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: U.faint }}>{hint}</div>
    </div>
    {right}
  </div>
);

const Count: FC<{ children: ReactNode }> = ({ children }) => (
  <span style={{ padding: '4px 8px', borderRadius: 99, background: '#fff', fontSize: 12, fontWeight: 500, color: U.muted, whiteSpace: 'nowrap' }}>{children}</span>
);

export type TextState = { value: string; focus: boolean; caret: boolean };

export const Caret: FC<{ on: boolean; h?: number }> = ({ on, h = 17 }) => <span style={{ display: 'inline-block', width: 2, height: h, marginLeft: 1, background: on ? U.text : 'transparent', verticalAlign: 'middle' }} />;

/** Campo de búsqueda con lupa (Field de shared.styles). */
const SearchField: FC<{ st: TextState; ph: string }> = ({ st, ph }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 12px',
      borderRadius: 12,
      background: '#fff',
      border: `1px solid ${st.focus ? U.coral : HAIR}`,
      boxShadow: st.focus ? `0 0 0 3px ${ACCENT_WASH}` : undefined,
      color: U.faint
    }}
  >
    <Search size={16} />
    <span style={{ fontSize: 14, color: st.value ? U.text : U.disabled, whiteSpace: 'nowrap', overflow: 'hidden' }}>
      {st.value}
      {st.focus && <Caret on={st.caret} />}
      {!st.value && ph}
    </span>
  </div>
);

export const Primary: FC<{ children: ReactNode; disabled?: boolean; press?: number; style?: CSSProperties }> = ({ children, disabled, press = 1, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexShrink: 0,
      height: 44,
      padding: '0 24px',
      borderRadius: 999,
      background: U.strong,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      opacity: disabled ? 0.5 : 1,
      transform: `scale(${press})`,
      ...style
    }}
  >
    {children}
  </div>
);

export const Ghost: FC<{ children: ReactNode; disabled?: boolean }> = ({ children, disabled }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, padding: '4px 8px', fontSize: 12, fontWeight: 500, color: U.muted, opacity: disabled ? 0.5 : 1 }}>{children}</span>
);

const Skeleton: FC = () => <div style={{ height: 64, flexShrink: 0, borderRadius: 16, background: 'rgba(255,255,255,.5)' }} />;

const Empty: FC<{ icon?: ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '28px 16px', textAlign: 'center', color: U.faint }}>
    {icon}
    <div style={{ fontSize: 15, fontWeight: 600, color: U.text }}>{title}</div>
    <div style={{ maxWidth: 320, fontSize: 14 }}>{text}</div>
  </div>
);

const PageHeader: FC<{ title: string; right?: ReactNode }> = ({ title, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, padding: '8px 4px 0' }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>Cotizar</div>
      <div style={{ marginTop: 4, fontSize: 36, lineHeight: 1.1, fontWeight: 700, color: U.strong }}>{title}</div>
    </div>
    {right}
  </div>
);

/** Layout real: menú lateral + área principal. */
const Frame: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 16, padding: 16, background: '#fff', backgroundImage: LAYOUT_BG, color: U.text }}>
    <Rail initials="AL" active={1} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, minHeight: 0 }}>{children}</div>
  </div>
);

// ------------------------------------------------------------------ ilustraciones de productos (2D)

const Svg: FC<{ children: ReactNode; size: number }> = ({ children, size }) => (
  <svg width={size} height={size} viewBox="0 0 56 56">
    {children}
  </svg>
);

/** Servomotor visto de frente: cuerpo, orejas de montaje, corona con brazo y cables. */
export const ServoArt: FC<{ body: string; size?: number; horn?: string }> = ({ body, size = 56, horn = '#f8fafc' }) => (
  <Svg size={size}>
    <path d="M10 44 C 6 48, 4 52, 2 54" stroke="#7c4a1e" strokeWidth={2} fill="none" />
    <path d="M12 44 C 9 49, 8 52, 7 55" stroke="#dc2626" strokeWidth={2} fill="none" />
    <path d="M14 44 C 12 49, 12 52, 12 55" stroke="#f59e0b" strokeWidth={2} fill="none" />
    <rect x={6} y={22} width={44} height={6} rx={2} fill={body} opacity={0.85} />
    <rect x={11} y={16} width={34} height={30} rx={4} fill={body} />
    <rect x={14} y={36} width={28} height={6} rx={2} fill="rgba(255,255,255,.18)" />
    <circle cx={8.5} cy={25} r={1.6} fill="#e5e7eb" />
    <circle cx={47.5} cy={25} r={1.6} fill="#e5e7eb" />
    <circle cx={34} cy={16} r={7} fill={horn} />
    <rect x={20} y={13.5} width={22} height={5} rx={2.5} fill={horn} />
    <circle cx={34} cy={16} r={2.2} fill="#94a3b8" />
    <text x={20} y={33} fontSize={5} fontWeight={700} fill="rgba(255,255,255,.75)" fontFamily="Inter, sans-serif">
      360°
    </text>
  </Svg>
);

const StockArt: FC<{ kind: number }> = ({ kind }) => {
  if (kind === 0)
    return (
      <Svg size={40}>
        <rect x={6} y={12} width={44} height={32} rx={3} fill="#0f7c8c" />
        <rect x={10} y={14} width={30} height={3} fill="#1e293b" />
        <rect x={16} y={39} width={30} height={3} fill="#1e293b" />
        <rect x={4} y={20} width={9} height={8} rx={1} fill="#cbd5e1" />
        <rect x={24} y={24} width={14} height={9} rx={1} fill="#1e293b" />
        <circle cx={44} cy={24} r={2} fill="#fbbf24" />
      </Svg>
    );
  if (kind === 1)
    return (
      <Svg size={40}>
        <rect x={4} y={12} width={48} height={32} rx={3} fill="#f8fafc" stroke="#cbd5e1" />
        <line x1={8} y1={16} x2={48} y2={16} stroke="#ef4444" strokeWidth={1.4} />
        <line x1={8} y1={40} x2={48} y2={40} stroke="#3b82f6" strokeWidth={1.4} />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} cx={10 + (i % 10) * 4} cy={22 + Math.floor(i / 10) * 6} r={0.9} fill="#64748b" />
        ))}
      </Svg>
    );
  if (kind === 2)
    return (
      <Svg size={40}>
        <line x1={4} y1={28} x2={52} y2={28} stroke="#94a3b8" strokeWidth={1.6} />
        <rect x={16} y={22} width={24} height={12} rx={6} fill="#e7c9a0" />
        {['#92400e', '#111827', '#dc2626', '#d4a017'].map((c, i) => (
          <rect key={c} x={20 + i * 5} y={22} width={2.4} height={12} fill={c} />
        ))}
      </Svg>
    );
  if (kind === 3)
    return (
      <Svg size={40}>
        <rect x={4} y={16} width={48} height={24} rx={2} fill="#1d4ed8" />
        <circle cx={17} cy={28} r={9} fill="#cbd5e1" />
        <circle cx={39} cy={28} r={9} fill="#cbd5e1" />
        <circle cx={17} cy={28} r={5} fill="#475569" />
        <circle cx={39} cy={28} r={5} fill="#475569" />
      </Svg>
    );
  return (
    <Svg size={40}>
      {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'].map((c, i) => (
        <path key={c} d={`M8 ${14 + i * 8} C 24 ${6 + i * 8}, 32 ${26 + i * 8}, 48 ${14 + i * 8}`} stroke={c} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ))}
    </Svg>
  );
};

const STOCK = [
  { name: 'Arduino UNO R3', desc: 'Placa de desarrollo ATmega328P con cable USB', price: 'Q145.00' },
  { name: 'Protoboard 830 puntos', desc: 'Placa de pruebas sin soldadura', price: 'Q35.00' },
  { name: 'Kit de resistencias 1/4 W', desc: '600 piezas, 30 valores de 10 Ω a 1 MΩ', price: 'Q48.00' },
  { name: 'Sensor ultrasónico HC-SR04', desc: 'Medición de distancia de 2 a 400 cm', price: 'Q22.00' },
  { name: 'Cables jumper macho-macho', desc: '40 piezas de 20 cm', price: 'Q18.00' }
];

export const RESULTS = [
  { title: 'Servomotor MG996R de rotación continua 360°, 11 kg·cm', store: 'RoboMarket GT', body: '#1f2937' },
  { title: 'Micro servo FS90R 360° de rotación continua', store: 'Electrónica Central', body: '#2563eb' },
  { title: 'Servomotor DS04-NFC 360° con engranajes plásticos', store: 'MakerShop', body: '#0f766e' },
  { title: 'Servo SG90 360° para robots y carros', store: 'Tienda Maker', body: '#1d4ed8' },
  { title: 'Servomotor 360° de alto torque 20 kg·cm', store: 'RoboMarket GT', body: '#7c3aed' },
  { title: 'Kit de 2 servos 360° con ruedas', store: 'Electrónica Central', body: '#b45309' }
];

// ------------------------------------------------------------------ /cotizar

const Categoria: FC<{ Icon: typeof Cpu; label: string; on?: boolean; hover?: number }> = ({ Icon, label, on, hover = 0 }) =>
  on ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        background: hover > 0.5 ? U.strong : '#fff',
        color: hover > 0.5 ? '#fff' : U.strong,
        boxShadow: SHADOW_MD,
        fontSize: 18,
        fontWeight: 600
      }}
    >
      <Icon size={32} />
      {label}
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 16, border: `1px solid ${HAIR}`, background: U.surfaceMuted }}>
      <div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 600, color: U.strong }}>
        <span style={{ width: 56, height: 56, borderRadius: 99, background: '#fff', display: 'grid', placeItems: 'center' }}>
          <Icon size={28} />
        </span>
        {label}
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 99, background: ACCENT_WASH, fontSize: 12, fontWeight: 600, color: U.strong }}>
        <Clock size={12} /> Muy pronto
      </span>
    </div>
  );

/** Coordenadas (viewport) del video. */
export const P = {
  elec: { x: 858, y: 360 },
  stockField: { x: 330, y: 221 },
  extField: { x: 1020, y: 221 },
  buscar: { x: 1358, y: 221 },
  add: { x: 1352, y: 296 },
  crear: { x: 1340, y: 850 }
};

export const CotizarInicioScreen: FC<{ hoverElec: number; hoverPdf?: number }> = ({ hoverElec, hoverPdf = 0 }) => (
  <Frame>
    <PageHeader title="¿Qué necesitas cotizar?" />
    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16 }}>
      <div style={panel}>
        <PanelHeader icon={<FileText size={16} />} title="Subir documento" hint="Tienes una lista de materiales en PDF" />
        <div style={{ flex: 1, marginTop: 12, padding: 24, borderRadius: 16, border: `2px dashed ${hoverPdf > 0.5 ? U.coral : HAIR}`, background: hoverPdf > 0.5 ? ACCENT_WASH : 'rgba(255,255,255,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', color: U.muted }}>
          <IconBadge size={64}>
            <Upload size={28} />
          </IconBadge>
          <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>Seleccionar PDF</div>
          <div style={{ maxWidth: 260, fontSize: 14 }}>Claude lee el documento y arma la lista de productos por ti. La revisas antes de continuar.</div>
        </div>
      </div>
      <div style={panel}>
        <PanelHeader icon={<LayoutGrid size={16} />} title="Categorías" hint="Elige una para ver el stock y buscar productos" />
        <div style={{ flex: 1, marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 'minmax(140px, 1fr)', gap: 12 }}>
          <Categoria Icon={Cpu} label="Electrónica" on hover={hoverElec} />
          <Categoria Icon={Settings} label="Mecatrónica" />
          <Categoria Icon={Droplet} label="Química" />
          <Categoria Icon={Wrench} label="Mecánica" />
        </div>
      </div>
    </div>
  </Frame>
);

// ------------------------------------------------------------------ /cotizar/electronica

export type ElectronicaState = {
  stock: TextState & { query: string; loading: boolean };
  ext: TextState & { query: string; loading: boolean };
  buscarPress: number;
  added: boolean;
  addPress: number;
  crearPress: number;
  /** Materiales importados desde un PDF (ítems de texto). */
  pdf?: number;
};

const Tabs: FC = () => (
  <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 99, background: 'rgba(255,255,255,.4)', outline: '1px solid rgba(255,255,255,.6)', outlineOffset: -1 }}>
    {['Electrónica', 'Mecatrónica', 'Química', 'Mecánica'].map((t, i) => (
      <span key={t} style={{ padding: '8px 16px', borderRadius: 99, fontSize: 14, fontWeight: 500, color: i === 0 ? '#fff' : U.muted, background: i === 0 ? U.strong : 'transparent' }}>
        {t}
      </span>
    ))}
  </div>
);

const StockRow: FC<{ i: number }> = ({ i }) => {
  const p = STOCK[i];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto minmax(0,1fr) auto', alignItems: 'center', gap: 12, flexShrink: 0, padding: '12px 16px 12px 12px', borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(255,255,255,.45)' }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, border: '1.5px solid #9ca3af', background: '#fff' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <StockArt kind={i} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: U.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
        <div style={{ marginTop: 2, fontSize: 12, color: U.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.desc}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>{p.price}</div>
    </div>
  );
};

const ResultCard: FC<{ i: number; added: boolean; press?: number }> = ({ i, added, press = 1 }) => {
  const r = RESULTS[i];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0,1fr) auto',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        padding: 12,
        borderRadius: 16,
        border: `1px solid ${added ? 'rgba(29,65,27,.35)' : HAIR}`,
        background: added ? '#fff' : 'rgba(255,255,255,.45)'
      }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <ServoArt body={r.body} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: U.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</div>
        <div style={{ fontSize: 12, color: U.faint }}>{r.store}</div>
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 36,
          padding: '0 16px',
          borderRadius: 99,
          border: `1px solid ${added ? 'transparent' : HAIR}`,
          background: added ? SUCCESS_WASH : '#fff',
          color: added ? U.green : U.text,
          fontSize: 12,
          fontWeight: 600,
          transform: `scale(${press})`
        }}
      >
        {added ? <Check size={14} /> : <Plus size={14} />}
        {added ? 'Agregado' : 'Agregar'}
      </div>
    </div>
  );
};

export const ElectronicaScreen: FC<{ st: ElectronicaState }> = ({ st }) => {
  const { stock, ext } = st;
  const stockEmpty = !!stock.query && !stock.loading;
  const pdf = st.pdf ?? 0;
  const total = pdf > 0 ? pdf : st.added ? 1 : 0;
  return (
    <Frame>
      <PageHeader title="Electrónica" right={<Tabs />} />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* StockPanel */}
        <div style={panel}>
          <PanelHeader
            icon={<SquareCheckBig size={16} />}
            title="Stock"
            hint="Productos disponibles en UVGo"
            right={!stock.loading ? <Count>{stockEmpty ? '0 productos' : '5 productos'}</Count> : undefined}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <SearchField st={stock} ph="Buscar en el catálogo de UVGo" />
            <Ghost disabled={stockEmpty}>Seleccionar todos</Ghost>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, padding: 2, overflow: 'hidden' }}>
            {stock.loading ? (
              [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} />)
            ) : stockEmpty ? (
              <Empty title="Sin coincidencias" text={`Ningún producto de UVGo coincide con “${stock.query}”. Prueba buscarlo en tiendas externas.`} />
            ) : (
              STOCK.map((_, i) => <StockRow key={i} i={i} />)
            )}
          </div>
        </div>

        {/* ExternalSearchPanel */}
        <div style={panel}>
          <PanelHeader
            icon={<Globe size={16} />}
            title="Buscador de productos"
            hint="¿No está en stock? Busca una referencia y nosotros lo conseguimos"
            right={ext.query && !ext.loading ? <Count>{RESULTS.length} resultados</Count> : undefined}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <SearchField st={ext} ph="Ej. ESP32, sensor DHT22, motor paso a paso" />
            <Primary disabled={!ext.value || ext.loading} press={st.buscarPress}>
              {ext.loading ? 'Buscando…' : 'Buscar'}
            </Primary>
          </div>
          {ext.loading && (
            <div style={{ marginTop: 12, padding: '0 4px', fontSize: 12, color: U.faint }}>
              Buscando <b style={{ fontWeight: 600, color: U.text }}>“{ext.query}”</b> en tiendas externas, puede tardar unos segundos…
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, padding: 2, overflow: 'hidden' }}>
            {ext.loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} />)
            ) : !ext.query ? (
              <Empty icon={<Search size={24} />} title="¿No está en stock?" text="Escribe el nombre del producto, elige el que se parezca a lo que necesitas y nosotros lo conseguimos." />
            ) : (
              RESULTS.map((_, i) => <ResultCard key={i} i={i} added={i === 0 && st.added} press={i === 0 ? st.addPress : 1} />)
            )}
          </div>
        </div>
      </div>

      {/* SelectionBar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 12px 12px 24px', borderRadius: 999, background: U.surfaceMuted, boxShadow: SHADOW_MD, outline: '1px solid rgba(255,255,255,.6)', outlineOffset: -1 }}>
        <div style={{ fontSize: 14, color: U.muted }}>
          {total === 0 ? (
            'Selecciona productos del stock o agrégalos desde el buscador'
          ) : (
            <>
              {pdf > 0 ? (
                <>
                  <b style={{ fontWeight: 600, color: U.strong }}>{pdf} productos</b> para cotizar · 0 de stock · 0 externos · {pdf} del PDF
                </>
              ) : (
                <>
                  <b style={{ fontWeight: 600, color: U.strong }}>1 producto</b> para cotizar · 0 de stock · 1 externo
                </>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ghost>
            <FileText size={14} /> Importar desde PDF
          </Ghost>
          <Ghost disabled={total === 0}>Limpiar</Ghost>
          <Primary disabled={total === 0} press={st.crearPress}>
            Crear pedido <ArrowRight size={16} />
          </Primary>
        </div>
      </div>
    </Frame>
  );
};

// ------------------------------------------------------------------ diálogo "Solicitar cotización"

export type DialogState = {
  cantidad: number;
  plusPress: number;
  curso: TextState;
  catedratico: TextState;
  fecha: TextState;
  punto: TextState;
  obs: TextState;
  sending: boolean;
  sendPress: number;
  success: boolean;
};

/** Medidas del diálogo ancho (64rem) centrado en el viewport. */
export const DLG = { x: 400, w: 640, top: 184, successTop: 300 };
export const D = {
  plus: { x: 944, y: 326 },
  curso: { x: 569, y: 414 },
  catedratico: { x: 871, y: 414 },
  fecha: { x: 569, y: 489 },
  punto: { x: 871, y: 489 },
  obs: { x: 720, y: 586 },
  enviar: { x: 937, y: 672 }
};

export const FormField: FC<{ label: ReactNode; st: TextState; ph?: string; area?: boolean; date?: boolean }> = ({ label, st, ph = '', area, date }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 500, color: U.muted }}>
    {label}
    <div
      style={{
        height: area ? 80 : 44,
        padding: area ? '8px 12px' : '0 12px',
        display: 'flex',
        alignItems: area ? 'flex-start' : 'center',
        borderRadius: 12,
        border: `1px solid ${st.focus ? U.coral : HAIR}`,
        boxShadow: st.focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined,
        background: '#fff',
        fontSize: 14,
        fontWeight: st.value ? 500 : 400,
        color: st.value ? U.text : U.disabled,
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }}
    >
      <span style={{ flex: date ? 1 : undefined }}>
        {st.value}
        {st.focus && <Caret on={st.caret} />}
        {!st.value && (date ? 'dd/mm/aaaa' : ph)}
      </span>
      {date && <span style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px solid ${U.faint}`, borderTopWidth: 4 }} />}
    </div>
  </div>
);

export const Optional: FC = () => <span style={{ fontWeight: 400, color: U.faint }}>(opcional)</span>;

export const SolicitudDialog: FC<{ st: DialogState; open: number }> = ({ st, open }) => {
  const r = RESULTS[0];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,.32)', opacity: open }} />
      <div
        style={{
          position: 'absolute',
          left: DLG.x,
          top: st.success ? DLG.successTop : DLG.top,
          width: DLG.w,
          borderRadius: 24,
          background: '#fff',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          color: U.text,
          opacity: open,
          transform: `translateY(${(1 - open) * 24}px) scale(${0.97 + 0.03 * open})`
        }}
      >
        {st.success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0', textAlign: 'center' }}>
              <span style={{ width: 56, height: 56, marginBottom: 8, borderRadius: 99, background: SUCCESS_WASH, color: U.green, display: 'grid', placeItems: 'center' }}>
                <Check size={24} />
              </span>
              <div style={{ fontSize: 20, fontWeight: 700, color: U.strong }}>¡Solicitud enviada!</div>
              <div style={{ marginTop: 4, fontSize: 14, color: U.muted }}>
                Te enviamos un correo de confirmación. El equipo de UVGo revisará los productos y te mandará la cotización con el total. La podrás revisar y pagar en “Mis solicitudes”.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
              <Ghost>Seguir cotizando</Ghost>
              <Primary>Ver mis solicitudes</Primary>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: U.strong }}>Solicitar cotización</div>
              <div style={{ marginTop: 4, fontSize: 14, color: U.muted }}>Revisaremos los productos y te enviaremos la cotización por correo.</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: U.strong }}>
                Productos <span style={{ fontSize: 12, fontWeight: 500, color: U.faint }}>1</span>
              </div>
              <div style={{ marginTop: 8, padding: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto auto', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 16, border: `1px solid ${HAIR}`, background: 'rgba(242,244,240,.6)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                    <ServoArt body={r.body} size={40} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: U.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: U.faint }}>{r.store}</div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 99, border: `1px solid ${HAIR}`, background: '#fff' }}>
                    <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', opacity: st.cantidad <= 1 ? 0.5 : 1 }}>
                      <Minus size={14} />
                    </span>
                    <span style={{ width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600, color: U.strong }}>{st.cantidad}</span>
                    <span style={{ width: 32, height: 32, borderRadius: 99, display: 'grid', placeItems: 'center', background: st.plusPress < 1 ? 'rgba(82,82,82,.08)' : 'transparent', transform: `scale(${st.plusPress})` }}>
                      <Plus size={14} />
                    </span>
                  </div>
                  <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: U.faint }}>
                    <X size={16} />
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Curso" st={st.curso} />
              <FormField label="Catedrático" st={st.catedratico} />
              <FormField label="Fecha límite" st={st.fecha} date />
              <FormField
                label={
                  <span>
                    Punto de entrega <Optional />
                  </span>
                }
                st={st.punto}
                ph="Ej. Edificio CIT, lobby"
              />
            </div>
            <FormField
              label={
                <span>
                  Observaciones <Optional />
                </span>
              }
              st={st.obs}
              ph="Marca, modelo o cualquier detalle que nos ayude a conseguirlo"
              area
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, paddingTop: 8 }}>
              <Ghost disabled={st.sending}>Cancelar</Ghost>
              <Primary disabled={st.sending} press={st.sendPress}>
                {st.sending ? 'Enviando…' : 'Enviar solicitud'}
              </Primary>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
