// Las 4 pantallas de UVGo (Login, Inicio, Cotizar, Seguimiento) armadas por bloques.
// Estructura, textos, iconos (Feather -> lucide) y medidas segun el repo UVGo (solo lectura).
// Coordenadas en px de la mesa de 1440x900 (un viewport de escritorio). Datos ficticios.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bike,
  Box,
  Calendar,
  ChartColumn,
  Check,
  ChevronDown,
  CircleCheck,
  Clock,
  Cpu,
  CreditCard,
  Download,
  Droplet,
  Eye,
  FileText,
  Flag,
  Home,
  Inbox,
  Info,
  LayoutGrid,
  List,
  MapPin,
  Navigation,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  Upload,
  User,
  Wrench,
  X
} from 'lucide-react';
import { kf } from '../../../../core/anim';
import { Block, type BlockSpec, stagger } from '../../components/build';
import type { Stages } from '../../components/artboard';

// Tokens de src/styles/theme.ts y shared.styles.ts
export const U = {
  text: '#171717',
  strong: '#0a0a0a',
  muted: '#525252',
  faint: '#737373',
  disabled: '#a3a3a3',
  border: '#d4d4d4',
  hair: 'rgba(82,82,82,0.1)',
  coral: '#e07a5f',
  coralInk: '#a34f3a',
  coralWash: 'rgba(224,122,95,0.16)',
  green: '#1d411b',
  greenWash: 'rgba(29,65,27,0.1)',
  sky: '#0ea5e9',
  amber: '#fbbf24',
  tint: '#f2f4f0',
  bg: '#dfe6dc'
};
export const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';
export const LOGIN_BG =
  'radial-gradient(circle at 4% 0%, #9cc79a 0, transparent 42%), radial-gradient(circle at 104% 38%, rgba(224,122,95,.42) 0, transparent 34%), radial-gradient(circle at 26% 112%, rgba(253,230,138,.75) 0, transparent 38%), radial-gradient(circle at 86% 112%, rgba(29,65,27,.22) 0, transparent 32%), ' +
  LAYOUT_BG;

const glass: CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 24,
  background: 'rgba(255,255,255,.55)',
  outline: '1px solid rgba(255,255,255,.6)',
  outlineOffset: -1,
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / .1)',
  padding: 16
};
const white: CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 18,
  background: '#fff',
  border: `1px solid ${U.hair}`,
  boxShadow: '0 1px 2px rgb(16 24 16/.04), 0 8px 24px -12px rgb(16 24 16/.12)'
};
const fill: CSSProperties = { position: 'absolute', inset: 0 };

const IconBadge: FC<{ children: ReactNode; size?: number }> = ({ children, size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 99, background: U.coralWash, color: U.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{children}</div>
);
const Badge: FC<{ children: ReactNode; tone: 'accent' | 'success' | 'neutral' | 'warning' | 'primary'; dot?: boolean }> = ({ children, tone, dot }) => {
  const t = {
    accent: [U.coralInk, 'rgba(224,122,95,.12)'],
    success: [U.green, 'rgba(29,65,27,.1)'],
    neutral: [U.muted, 'rgba(82,82,82,.08)'],
    warning: ['#b45309', 'rgba(251,191,36,.18)'],
    primary: ['#0369a1', 'rgba(14,165,233,.13)']
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, color: t[0], background: t[1], whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9, background: 'currentColor' }} />}
      {children}
    </span>
  );
};

/** Barra lateral real (SideRail) con el item activo. */
const Rail: FC<{ active: number }> = ({ active }) => {
  const items = [Home, FileText, Inbox, Navigation, User, CreditCard, ChartColumn];
  return (
    <div style={{ ...glass, padding: '16px 0', boxShadow: '0 1px 2px 0 rgb(0 0 0/.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${U.hair}` }}>
        <Img src={staticFile('uvgo/brand/logo.png')} style={{ width: 52 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((I, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: i === active ? U.strong : 'transparent', color: i === active ? '#fff' : U.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I size={19} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, color: U.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={19} />
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            border: '2px solid #fff',
            background: 'linear-gradient(to bottom right, #fde68a, #d4d4d4)',
            boxShadow: '0 0 0 1px rgba(82,82,82,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: U.text
          }}
        >
          AL
        </div>
      </div>
    </div>
  );
};
const RAIL: BlockSpec = { id: 'rail', x: 16, y: 16, w: 72, h: 868, kind: 'nav', radius: 24, note: 'menú' };

/** Renderiza una lista de bloques con sus fases escalonadas. */
const Blocks: FC<{ s: Stages; items: { b: BlockSpec; el: ReactNode; order?: number }[] }> = ({ s, items }) => (
  <>
    {items.map((it, i) => (
      <Block key={it.b.id} b={it.b} t={stagger({ sketch: s.sketch, wire: s.wire, paint: s.paint }, it.order ?? i)}>
        {it.el}
      </Block>
    ))}
  </>
);

// ---------------------------------------------------------------- 1. Login

export const LOGIN_HOT = { x: 496, y: 545, w: 448, h: 48 };

export const LoginScreen: FC<{ s: Stages }> = ({ s }) => {
  const frame = useCurrentFrame();
  const email = 'ana.lopez@uvg.edu.gt';
  const typed = email.slice(0, Math.round(kf(frame, [s.proto + 10, s.proto + 40], [0, email.length], (t) => t)));
  const dots = Math.round(kf(frame, [s.proto + 44, s.proto + 58], [0, 12], (t) => t));
  const field = (label: string, value: string, ph: string, focus: boolean, eye?: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>{label}</div>
      <div
        style={{
          height: 48,
          borderRadius: 12,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 500,
          color: value ? U.text : U.disabled,
          background: focus ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.55)',
          border: `1px solid ${focus ? U.coral : 'rgba(255,255,255,.85)'}`,
          boxShadow: focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined,
          position: 'relative'
        }}
      >
        {value || ph}
        {eye && <Eye size={18} color={U.faint} style={{ position: 'absolute', right: 16 }} />}
      </div>
    </div>
  );
  const ready = dots > 0;
  return (
    <Blocks
      s={s}
      items={[
        { b: { id: 'l-logo', x: 24, y: 24, w: 90, h: 30, kind: 'image', radius: 6 }, el: <Img src={staticFile('uvgo/brand/logo.png')} style={{ height: 28 }} /> },
        {
          b: { id: 'l-back', x: 186, y: 124, w: 1160, h: 680, kind: 'box', radius: 40, note: 'fondo difuminado', noteTop: true },
          el: (
            <div style={{ ...fill, borderRadius: 40, background: 'rgba(255,255,255,.26)', outline: '1px solid rgba(255,255,255,.5)', boxShadow: '0 40px 120px -40px rgb(16 24 16/.35)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '6%', top: '8%', width: '30%', height: '7%', borderRadius: 24, background: 'rgba(255,255,255,.7)', filter: 'blur(10px)' }} />
              <div style={{ position: 'absolute', right: '6%', top: '8%', width: '34%', height: '34%', borderRadius: 24, background: 'rgba(29,65,27,.12)', filter: 'blur(10px)' }} />
            </div>
          )
        },
        { b: { id: 'l-box2', x: 920, y: 600, w: 200, h: 155, kind: 'image', radius: 20, note: 'caja 3D' }, el: <Img src={staticFile('uvgo/caja.png')} style={{ width: 200, transform: 'rotate(12deg)', opacity: 0.95, filter: 'drop-shadow(0 24px 32px rgb(16 24 16/.28))' }} /> },
        {
          b: { id: 'l-card', x: 440, y: 250, w: 560, h: 460, kind: 'box', radius: 32 },
          el: (
            <div
              style={{
                ...fill,
                borderRadius: 32,
                background: 'linear-gradient(140deg, rgba(255,255,255,.72), rgba(255,255,255,.4))',
                outline: '1px solid rgba(255,255,255,.75)',
                boxShadow: '0 32px 80px -24px rgb(16 24 16/.35), 0 1px 2px rgb(16 24 16/.06)'
              }}
            />
          )
        },
        {
          b: { id: 'l-tabs', x: 496, y: 278, w: 448, h: 50, kind: 'title', radius: 8, note: 'pestañas' },
          el: (
            <div style={{ ...fill, display: 'flex', justifyContent: 'center', gap: 28, fontSize: 32, lineHeight: 1.1 }}>
              <div style={{ position: 'relative', fontWeight: 700, color: U.strong, paddingBottom: 12 }}>
                Iniciar sesión
                <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 44, height: 4, marginLeft: -22, borderRadius: 9, background: U.coral }} />
              </div>
              <div style={{ fontWeight: 400, color: U.disabled }}>Crear cuenta</div>
            </div>
          )
        },
        { b: { id: 'l-mail', x: 496, y: 356, w: 448, h: 70, kind: 'input', radius: 12, note: 'correo' }, el: <div style={fill}>{field('Correo institucional', typed, 'usuario@uvg.edu.gt', frame >= s.proto + 8 && frame < s.proto + 42)}</div> },
        { b: { id: 'l-pass', x: 496, y: 442, w: 448, h: 70, kind: 'input', radius: 12, note: 'contraseña' }, el: <div style={fill}>{field('Contraseña', '•'.repeat(dots), 'Tu contraseña', frame >= s.proto + 42 && frame < s.proto + 62, true)}</div> },
        {
          b: { id: 'l-btn', x: LOGIN_HOT.x, y: LOGIN_HOT.y, w: LOGIN_HOT.w, h: LOGIN_HOT.h, kind: 'button', radius: 99, note: 'botón' },
          el: (
            <div style={{ ...fill, borderRadius: 99, background: U.strong, color: '#fff', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ready ? 1 : 0.5 }}>
              Iniciar sesión
            </div>
          )
        },
        { b: { id: 'l-google', x: 496, y: 607, w: 448, h: 44, kind: 'button', radius: 99, stay: 'entrar con Google · próximamente' }, el: null },
        {
          b: { id: 'l-foot', x: 496, y: 664, w: 448, h: 22, kind: 'text', radius: 6 },
          el: (
            <div style={{ ...fill, textAlign: 'center', fontSize: 12, color: U.faint }}>
              ¿No tienes cuenta? <span style={{ fontWeight: 600, color: U.strong, textDecoration: 'underline' }}>Crea una</span>
            </div>
          )
        },
        { b: { id: 'l-box1', x: 270, y: 130, w: 210, h: 163, kind: 'image', radius: 20, note: 'caja 3D' }, el: <Img src={staticFile('uvgo/caja.png')} style={{ width: 210, transform: 'rotate(-14deg)', filter: 'drop-shadow(0 24px 32px rgb(16 24 16/.28))' }} /> }
      ]}
    />
  );
};

// ---------------------------------------------------------------- 2. Inicio

export const INICIO_HOT = { x: 854, y: 46, w: 190, h: 44 };

const Stat: FC<{ v: string; label: string; detail: string; action?: boolean; Icon: typeof Tag; color: string; bg: string }> = ({ v, label, detail, action, Icon, color, bg }) => (
  <div style={{ ...glass, borderRadius: 16, display: 'flex', justifyContent: 'space-between' }}>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, fontStyle: 'italic', color: U.strong }}>{v}</div>
      <div style={{ fontSize: 14, color: U.muted }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, color: action ? U.coral : U.green }}>{detail}</div>
    </div>
    <div style={{ width: 46, height: 46, borderRadius: 99, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} />
    </div>
  </div>
);

export const InicioScreen: FC<{ s: Stages }> = ({ s }) => {
  const bars = [2, 1, 3, 2, 0, 1, 2, 3, 1, 2, 3, 0];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const W = (916 - 32) / 3;
  return (
    <Blocks
      s={s}
      items={[
        { b: RAIL, el: <Rail active={0} /> },
        {
          b: { id: 'i-hi', x: 128, y: 40, w: 600, h: 56, kind: 'title', radius: 8, note: 'saludo' },
          el: (
            <div style={fill}>
              <div style={{ fontSize: 24, fontWeight: 700, color: U.strong, letterSpacing: '-0.02em' }}>Buenos días, Ana</div>
              <div style={{ fontSize: 14, color: U.muted, marginTop: 2 }}>Miércoles, 12 de noviembre · Tienes 2 pedidos que esperan tu respuesta</div>
            </div>
          )
        },
        {
          b: { id: 'i-new', ...INICIO_HOT, kind: 'button', radius: 99 },
          el: (
            <div style={{ ...fill, borderRadius: 99, background: U.strong, color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 8px 20px -10px rgb(0 0 0/.5)' }}>
              <Plus size={16} /> Nueva cotización
            </div>
          )
        },
        { b: { id: 'i-s1', x: 128, y: 112, w: W, h: 108, kind: 'box', note: 'KPIs' }, el: <Stat v="3" label="En cotización" detail="1 lista para aceptar" action Icon={Tag} color={U.amber} bg="rgba(251,191,36,.18)" /> },
        { b: { id: 'i-s2', x: 128 + W + 16, y: 112, w: W, h: 108, kind: 'box' }, el: <Stat v="2" label="En preparación" detail="1 por pagar" action Icon={Package} color={U.sky} bg="rgba(14,165,233,.15)" /> },
        { b: { id: 'i-s3', x: 128 + 2 * (W + 16), y: 112, w: W, h: 108, kind: 'box' }, el: <Stat v="5" label="Entregados" detail="Q 1,240.00 este semestre" Icon={CircleCheck} color={U.coral} bg="rgba(224,122,95,.18)" /> },
        {
          b: { id: 'i-order', x: 128, y: 236, w: 409, h: 300, kind: 'box', radius: 24, note: 'pedido activo' },
          el: (
            <div style={{ ...fill, borderRadius: 24, background: '#fff', boxShadow: '0 1px 3px rgb(0 0 0/.1)', padding: '16px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBadge size={40}>
                  <Box size={20} />
                </IconBadge>
                <div style={{ fontSize: 16, fontWeight: 700, color: U.strong, lineHeight: 1.2 }}>Electrónica Digital - Edificio J</div>
              </div>
              <div style={{ fontSize: 13, color: U.muted, marginTop: 6 }}>
                12 artículos · <b style={{ color: U.strong, fontSize: 15 }}>Q 845.00</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 99, background: 'rgba(224,122,95,.14)', color: U.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: U.coral }}>Por pagar</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: U.strong }}>Sube tu comprobante</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: U.muted }}>Fecha límite</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: U.strong }}>30 nov 2026</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                {[1, 1, 1, 0, 0].map((f, i) => (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 9, background: f ? U.coral : U.border }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: U.strong }}>Días para la fecha límite</div>
                  <div style={{ fontSize: 11, color: U.faint }}>Faltan 18 días · #UVG-3F9A1C2B</div>
                </div>
                {['1', '8'].map((d) => (
                  <div key={d} style={{ width: 32, height: 38, borderRadius: 12, border: `1px solid ${U.border}`, fontSize: 19, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, background: U.strong, color: '#fff', fontSize: 12, fontWeight: 600 }}>
                Subir comprobante <ArrowRight size={14} />
              </div>
            </div>
          )
        },
        {
          b: { id: 'i-chart', x: 553, y: 236, w: 491, h: 300, kind: 'chart', note: 'gráfica' },
          el: (
            <div style={{ ...glass, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: U.text }}>Mis solicitudes</div>
                  <div style={{ fontSize: 12, color: U.green }}>9 solicitudes este año</div>
                </div>
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 99, background: '#fff', border: `1px solid ${U.border}`, fontSize: 12, color: U.muted }}>
                  Mensual <ChevronDown size={12} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 170, marginTop: 28, padding: '0 8px' }}>
                {bars.map((v, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 18, height: 5 + v * 42, borderRadius: 6, background: i === 10 ? U.coral : U.border }} />
                    <div style={{ fontSize: 12, fontWeight: i === 10 ? 600 : 500, color: i === 10 ? U.strong : U.faint }}>{months[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        { b: { id: 'i-spend', x: 128, y: 552, w: 409, h: 308, kind: 'box', stay: 'gasto · en construcción' }, el: null },
        {
          b: { id: 'i-quick', x: 553, y: 552, w: 491, h: 308, kind: 'box', note: 'atajos' },
          el: (
            <div style={{ ...glass, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: U.text }}>Atajos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {[
                  [FileText, 'Cotizar con PDF', 'Sube la lista de tu curso'],
                  [ShoppingBag, 'Catálogo', 'Arma tu pedido a mano'],
                  [Inbox, 'Mis solicitudes', 'Cotizaciones y pagos'],
                  [Navigation, 'Seguimiento', 'Estado de tus pedidos']
                ].map(([I, t, sub], i) => {
                  const Ico = I as typeof Tag;
                  return (
                    <div key={i} style={{ position: 'relative', height: 108, borderRadius: 12, background: '#fff', padding: 12 }}>
                      <IconBadge>
                        <Ico size={17} />
                      </IconBadge>
                      <div style={{ fontSize: 14, fontWeight: 600, color: U.text, marginTop: 10 }}>{t as string}</div>
                      <div style={{ fontSize: 11.5, color: U.faint }}>{sub as string}</div>
                      <ArrowUpRight size={15} color={U.disabled} style={{ position: 'absolute', right: 10, top: 10 }} />
                      {i === 2 && <div style={{ position: 'absolute', right: 32, top: 9, height: 20, minWidth: 20, borderRadius: 99, background: U.coral, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        },
        {
          b: { id: 'i-news', x: 1060, y: 40, w: 340, h: 170, kind: 'text', note: 'avisos' },
          el: (
            <div style={{ ...glass, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconBadge>
                  <Bell size={16} />
                </IconBadge>
                <div style={{ fontSize: 15, fontWeight: 600, color: U.text, flex: 1 }}>Avisos</div>
                <div style={{ width: 9, height: 9, borderRadius: 9, background: '#ef4444', boxShadow: '0 0 0 4px rgba(239,68,68,.18)' }} />
              </div>
              <div style={{ marginTop: 12, borderRadius: 12, background: '#fff', padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99, color: U.coral, background: U.coralWash }}>Requiere tu acción</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>Tu cotización de Física II está lista</div>
                <div style={{ fontSize: 12, color: U.faint }}>hace 3 h</div>
              </div>
            </div>
          )
        },
        {
          b: { id: 'i-orders', x: 1060, y: 226, w: 340, h: 634, kind: 'list', radius: 24, note: 'pedidos' },
          el: (
            <div style={fill}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ padding: '10px 16px', borderRadius: '16px 16px 0 0', background: 'rgba(255,255,255,.55)', fontSize: 20, fontWeight: 700, color: U.strong }}>Pedidos</div>
                <div style={{ marginLeft: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 4px 14px', borderRadius: 99, border: `1px solid ${U.border}`, fontSize: 14, color: U.muted }}>
                  Recientes
                  <span style={{ width: 24, height: 24, borderRadius: 99, background: U.amber, color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>6</span>
                </div>
              </div>
              <div style={{ height: 584, borderRadius: '0 24px 24px 24px', background: 'rgba(255,255,255,.55)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Química General', '4 productos · 9 unidades', 'Por pagar', 'accent', 'Q 312.00', 3, true],
                  ['Física II', '3 productos · 5 unidades', 'Cotización lista', 'accent', 'Q 198.50', 2, true],
                  ['Electrónica Digital', '6 productos · 14 unidades', 'En revisión', 'primary', 'Q 845.00', 3, false],
                  ['Circuitos I', '2 productos · 6 unidades', 'Cotizando', 'warning', 'Por cotizar', 1, false]
                ].map(([n, m, tag, tone, total, steps, urgent]) => (
                  <div key={n as string} style={{ borderRadius: 16, background: '#fff', padding: '11px 14px', boxShadow: `0 1px 2px rgb(0 0 0/.05)${urgent ? `, inset 3px 0 0 ${U.coral}` : ''}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: U.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Img src={staticFile('uvgo/caja.png')} style={{ width: 32 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>{n as string}</div>
                        <div style={{ fontSize: 11, color: U.faint }}>{m as string}</div>
                      </div>
                      <Badge tone={tone as 'accent'}>{tag as string}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                      {[0, 1, 2, 3, 4].map((k) => (
                        <div key={k} style={{ flex: 1, height: 4, borderRadius: 9, background: k < (steps as number) ? U.coral : U.border }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: U.strong }}>{total as string}</div>
                        <div style={{ fontSize: 10.5, color: U.faint, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={11} /> 30 nov 2026 · hace 2 h
                        </div>
                      </div>
                      <div style={{ width: 30, height: 30, borderRadius: 99, border: `1px solid ${U.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]}
    />
  );
};

// ---------------------------------------------------------------- 3. Cotizar

export const COTIZAR_HOT = { x: 30, y: 258, w: 44, h: 44 };

const Category: FC<{ Icon: typeof Cpu; label: string; on?: boolean }> = ({ Icon, label, on }) =>
  on ? (
    <div style={{ ...fill, borderRadius: 16, background: '#fff', boxShadow: '0 1px 3px rgb(0 0 0/.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Icon size={32} color={U.strong} />
      <div style={{ fontSize: 18, fontWeight: 600, color: U.strong }}>{label}</div>
    </div>
  ) : (
    <div style={{ ...fill, borderRadius: 16, background: 'rgba(255,255,255,.55)', border: `1px solid ${U.hair}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={28} color={U.strong} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: U.strong }}>{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: U.coralWash, fontSize: 12, fontWeight: 600, color: U.strong }}>
        <Clock size={12} /> Muy pronto
      </div>
    </div>
  );

const PanelHead: FC<{ Icon: typeof Cpu; title: string; hint: string }> = ({ Icon, title, hint }) => (
  <div style={{ padding: '0 4px 12px', borderBottom: `1px solid ${U.hair}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 600, color: U.strong }}>
      <IconBadge>
        <Icon size={16} />
      </IconBadge>
      {title}
    </div>
    <div style={{ fontSize: 12, color: U.faint, marginTop: 4 }}>{hint}</div>
  </div>
);

export const CotizarScreen: FC<{ s: Stages }> = ({ s }) => {
  const cw = (761 - 32 - 12) / 2;
  const ch = (674 - 12) / 2;
  return (
    <Blocks
      s={s}
      items={[
        { b: RAIL, el: <Rail active={1} /> },
        {
          b: { id: 'c-head', x: 108, y: 24, w: 620, h: 70, kind: 'title', radius: 8, note: 'título' },
          el: (
            <div style={fill}>
              <div style={{ fontSize: 12, fontWeight: 500, color: U.muted }}>Cotizar</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: U.strong, lineHeight: 1.1, marginTop: 4 }}>¿Qué necesitas cotizar?</div>
            </div>
          )
        },
        {
          b: { id: 'c-left', x: 104, y: 110, w: 543, h: 774, kind: 'box', radius: 24, note: 'subir PDF' },
          el: (
            <div style={{ ...glass, display: 'flex', flexDirection: 'column' }}>
              <PanelHead Icon={FileText} title="Subir documento" hint="Tienes una lista de materiales en PDF" />
              <div
                style={{
                  flex: 1,
                  marginTop: 12,
                  borderRadius: 16,
                  border: `2px dashed rgba(82,82,82,.18)`,
                  background: 'rgba(255,255,255,.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  textAlign: 'center'
                }}
              >
                <IconBadge size={64}>
                  <Upload size={28} />
                </IconBadge>
                <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>Seleccionar PDF</div>
                <div style={{ maxWidth: 260, fontSize: 14, color: U.muted }}>Claude lee el documento y arma la lista de productos por ti. La revisas antes de continuar.</div>
              </div>
            </div>
          )
        },
        {
          b: { id: 'c-right', x: 663, y: 110, w: 761, h: 774, kind: 'box', radius: 24, note: 'categorías' },
          el: (
            <div style={glass}>
              <PanelHead Icon={LayoutGrid} title="Categorías" hint="Elige una para ver el stock y buscar productos" />
            </div>
          )
        },
        { b: { id: 'c-elec', x: 679, y: 194, w: cw, h: ch, kind: 'box', note: 'Electrónica' }, el: <Category Icon={Cpu} label="Electrónica" on /> },
        { b: { id: 'c-meca', x: 679 + cw + 12, y: 194, w: cw, h: ch, kind: 'box' }, el: <Category Icon={Settings} label="Mecatrónica" /> },
        { b: { id: 'c-quim', x: 679, y: 194 + ch + 12, w: cw, h: ch, kind: 'box' }, el: <Category Icon={Droplet} label="Química" /> },
        { b: { id: 'c-mec', x: 679 + cw + 12, y: 194 + ch + 12, w: cw, h: ch, kind: 'box', stay: 'Mecánica · en construcción' }, el: <Category Icon={Wrench} label="Mecánica" /> }
      ]}
    />
  );
};

// ---------------------------------------------------------------- 4. Seguimiento

export const SeguimientoScreen: FC<{ s: Stages }> = ({ s }) => {
  const label: CSSProperties = { fontSize: 10.5, color: U.faint };
  const val: CSSProperties = { fontSize: 12, fontWeight: 600, color: U.strong };
  const phases: [typeof Tag, string, string, 'done' | 'cur' | 'pend'][] = [
    [FileText, 'Solicitado', '16 oct', 'done'],
    [Tag, 'Cotizado', '17 oct', 'done'],
    [CircleCheck, 'Confirmado', '18 oct', 'cur'],
    [Bike, 'En ruta', '—', 'pend'],
    [Flag, 'Entregado', '—', 'pend']
  ];
  return (
    <Blocks
      s={s}
      items={[
        { b: RAIL, el: <Rail active={3} /> },
        {
          b: { id: 's-orders', x: 104, y: 16, w: 340, h: 868, kind: 'list', radius: 18, note: 'tus pedidos' },
          el: (
            <div style={{ ...white, padding: '24px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: U.strong, letterSpacing: '-0.015em' }}>Tus pedidos</div>
                <span style={{ height: 24, minWidth: 24, borderRadius: 99, background: U.coral, color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              </div>
              <div style={{ marginTop: 16, height: 40, borderRadius: 12, background: U.tint, border: `1px solid ${U.hair}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', fontSize: 12, color: U.disabled }}>
                <Search size={16} color={U.faint} /> Buscar curso, pedido o edificio
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 99, background: U.strong, color: '#fff', fontSize: 11, fontWeight: 500 }}>
                  Este semestre <X size={12} />
                </span>
                {['En ruta', 'Pago pendiente'].map((c) => (
                  <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 99, border: `1px solid ${U.hair}`, color: U.muted, fontSize: 11, fontWeight: 500 }}>
                    <Plus size={12} /> {c}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: U.faint, marginTop: 18 }}>RECOMENDADO</div>
              <div style={{ marginTop: 10, borderRadius: 16, background: '#fff', padding: 16, border: `1px solid ${U.coral}`, boxShadow: '0 0 0 3px rgba(224,122,95,.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: U.text }}>Electrónica Digital</div>
                    <div style={{ fontSize: 11, color: U.faint }}>#UVG-3F9A1C2B · Confirmado</div>
                  </div>
                  <Badge tone="neutral">6 productos</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 12, fontWeight: 600, color: U.text }}>
                  <span style={{ width: 8, height: 8, borderRadius: 9, border: `2px solid ${U.strong}` }} />
                  Bodega UVGO
                  <div style={{ flex: 1, borderTop: `2px dashed ${U.disabled}`, opacity: 0.55 }} />
                  <Bike size={18} color={U.disabled} />
                  <div style={{ flex: 1, borderTop: `2px dashed ${U.disabled}`, opacity: 0.55 }} />
                  <MapPin size={12} color={U.coral} /> Edificio J
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <div>
                    <div style={label}>Solicitado</div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: U.muted }}>16 oct, 9:12 a. m.</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={label}>Entrega estimada</div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: U.muted }}>Para el 30 nov 2026</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', marginTop: 12, borderRadius: 12, background: U.tint }}>
                  {[
                    ['Distancia', '0.6 km'],
                    ['Tiempo est.', '6 min'],
                    ['Servicio', 'Q 25.00']
                  ].map(([a, b], i) => (
                    <div key={a} style={{ padding: '8px 10px', borderLeft: i ? `1px solid ${U.hair}` : undefined }}>
                      <div style={label}>{a}</div>
                      <div style={val}>{b}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: U.strong, letterSpacing: '-0.02em' }}>Q 845.00</div>
                  <div style={{ padding: '9px 16px', borderRadius: 12, background: U.coral, color: '#fff', fontSize: 12, fontWeight: 600 }}>Pagar</div>
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: U.faint, marginTop: 18 }}>OTROS PEDIDOS</div>
              {[
                ['Química General', '#UVG-8B21D04E', 'Confirmado', 'neutral', 'Edificio C', 'Q 312.00'],
                ['Física II', '#UVG-51C9E7A0', 'Entregado', 'success', 'Edificio F', 'Q 198.50']
              ].map(([n, id, st, tone, ed, q]) => (
                <div key={n} style={{ marginTop: 10, borderRadius: 16, border: `1px solid ${U.hair}`, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: U.text }}>{n}</div>
                      <div style={{ fontSize: 11, color: U.faint }}>{id}</div>
                    </div>
                    <Badge tone={tone as 'neutral'} dot>
                      {st}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: U.faint }}>
                    Bodega UVGO → {ed}
                    <b style={{ fontSize: 12, color: U.strong }}>{q}</b>
                  </div>
                </div>
              ))}
            </div>
          )
        },
        {
          b: { id: 's-receipt', x: 460, y: 16, w: 474, h: 330, kind: 'box', radius: 18, note: 'comprobante' },
          el: (
            <div style={{ ...white, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: U.coral, color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.85 }}>Comprobante</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>#UVG-3F9A1C2B</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: 'rgba(255,255,255,.2)', fontSize: 11.5, fontWeight: 600 }}>
                  <Download size={14} /> Descargar
                </div>
              </div>
              <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    ['Pedido', 'Electrónica Digital'],
                    ['Cliente', 'Ana López · 23145'],
                    ['Entrega', 'Edificio J'],
                    ['Solicitado', '16 oct, 9:12 a. m.'],
                    ['Repartidor', 'Por asignar'],
                    ['Entrega estimada', 'Para el 30 nov 2026']
                  ].map(([a, b]) => (
                    <div key={a}>
                      <div style={label}>{a}</div>
                      <div style={val}>{b}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '2px dashed rgba(82,82,82,.16)', paddingTop: 12 }}>
                  <Package size={16} color={U.coral} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: U.strong }}>6 productos · 14 unidades</div>
                    <div style={{ fontSize: 11, color: U.faint }}>74LS08N, Arduino UNO R3 y 4 más</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, border: `1px solid ${U.hair}`, fontSize: 11, fontWeight: 600, color: U.coralInk }}>
                    <List size={13} /> Ver lista
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', borderRadius: 12, background: 'rgba(224,122,95,.12)', padding: '8px 12px' }}>
                  <div style={{ flex: 1, fontSize: 11, color: U.faint }}>
                    Productos <b style={{ color: U.strong }}>Q 820.00</b>
                    <br />
                    Servicio <b style={{ color: U.strong }}>Q 25.00</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: U.coralInk }}>Total</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: U.strong }}>Q 845.00</div>
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          b: { id: 's-pay', x: 950, y: 16, w: 474, h: 330, kind: 'box', radius: 18, note: 'estado de pago' },
          el: (
            <div style={{ ...white, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: U.strong }}>
                <FileText size={16} color={U.faint} /> Estado de pago
                <span style={{ marginLeft: 'auto' }}>
                  <Badge tone="accent" dot>
                    Pendiente
                  </Badge>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', color: U.strong }}>Q 845.00</div>
                <div style={{ fontSize: 12, color: U.muted }}>Saldo pendiente Q 845.00</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderRadius: 12, background: U.tint, padding: '10px 4px' }}>
                {[
                  ['Cotización aceptada', '18 oct, 3:40 p. m.', 'done'],
                  ['Comprobante enviado', 'Pendiente', 'cur'],
                  ['Pago validado', 'Pendiente', 'pend']
                ].map(([t, d, st], i) => (
                  <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 99,
                        border: `2px solid ${st === 'pend' ? U.border : U.coral}`,
                        background: st === 'done' ? U.coral : '#fff',
                        boxShadow: st === 'cur' ? `0 0 0 4px ${U.coralWash}` : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: U.disabled
                      }}
                    >
                      {st === 'done' ? <Check size={12} color="#fff" /> : st === 'cur' ? <Clock size={12} color={U.coral} /> : i + 1}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: U.text }}>{t}</div>
                    <div style={{ fontSize: 10.5, color: st === 'cur' ? U.coralInk : U.faint }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '8px 12px', background: 'rgba(224,122,95,.12)', color: U.coralInk, fontSize: 11.5, fontWeight: 500 }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>Sube tu comprobante de pago para que empecemos a preparar tu pedido.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 11px', borderRadius: 99, background: U.coral, color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <Upload size={12} /> Subir comprobante
                </div>
              </div>
              <div style={{ display: 'flex', borderTop: `1px solid ${U.hair}`, paddingTop: 10, fontSize: 11, color: U.faint }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={12} /> Cotizado <b style={{ color: U.strong }}>17 oct 2026</b>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, borderLeft: `1px solid ${U.hair}`, paddingLeft: 10 }}>
                  <Calendar size={12} /> Fecha límite <b style={{ color: U.strong }}>30 nov 2026</b>
                  <span style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(82,82,82,.08)', color: U.muted, fontSize: 10.5, fontWeight: 600 }}>Faltan 18 días</span>
                </div>
              </div>
            </div>
          )
        },
        {
          b: { id: 's-hist', x: 460, y: 362, w: 964, h: 200, kind: 'chart', radius: 18, note: 'historial' },
          el: (
            <div style={{ ...white, padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 600, color: U.strong }}>
                Historial del pedido <Info size={15} color={U.disabled} />
                <div style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: 12, border: `1px solid ${U.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronDown size={17} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginTop: 16 }}>
                {phases.map(([I, t, h, st], i) => (
                  <div key={t} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {i > 0 && (
                      <div style={{ position: 'absolute', top: 21, right: '50%', width: '100%', borderTop: `2px ${st === 'pend' ? 'dashed' : 'solid'} ${st === 'pend' ? U.border : U.coral}`, zIndex: 0 }} />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 44,
                        borderRadius: 99,
                        border: `2px solid ${st === 'pend' ? U.border : U.coral}`,
                        background: st === 'done' ? U.coral : '#fff',
                        color: st === 'done' ? '#fff' : st === 'cur' ? U.coral : U.disabled,
                        boxShadow: st === 'cur' ? '0 0 0 5px rgba(224,122,95,.12)' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <I size={18} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: U.text }}>{t}</div>
                    <div style={{ fontSize: 10.5, color: U.faint }}>{h}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        { b: { id: 's-table', x: 460, y: 578, w: 964, h: 306, kind: 'list', radius: 18, stay: 'tabla de fases · en construcción' }, el: null }
      ]}
    />
  );
};

