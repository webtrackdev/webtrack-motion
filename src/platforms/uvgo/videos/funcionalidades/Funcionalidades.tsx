// Video "UVGo web: funcionalidades". Solo la lista, enumerada y animada, sin voz.
// 32 funcionalidades en 7 secciones, tomadas de las rutas y componentes del repo UVGo (solo lectura):
// Login/registro, Inicio, Cotizar, Mis solicitudes, Seguimiento de pedidos, Panel admin y Solicitudes admin.
// Iconos Feather (react-icons/fi en la app) -> lucide. Paleta de src/styles/theme.ts.
import type { FC } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import {
  Activity,
  ArrowUpRight,
  Bell,
  Calendar,
  ChartNoAxesColumn,
  Check,
  CircleCheck,
  Clipboard,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Globe,
  History,
  Home,
  Inbox,
  LayoutGrid,
  List,
  LogIn,
  LogOut,
  Mail,
  Map,
  Navigation,
  Package,
  PackagePlus,
  Receipt,
  RefreshCw,
  Shield,
  Smartphone,
  SquareCheckBig,
  Tag,
  TrendingUp,
  Truck,
  UploadCloud,
  User,
  UserPlus,
  XCircle,
  type LucideIcon
} from 'lucide-react';
import { EndCard } from '../../../../core/templates/EndCard';
import { LaunchIntro, launchIntroLength } from '../../../../core/templates/LaunchIntro';
import { EASE, SPRING, kf, sp } from '../../../../core/anim';
import { useBrand } from '../../../../core/theme';

const C = {
  ink: '#0a0a0a',
  text: '#171717',
  muted: '#525252',
  faint: '#737373',
  disabled: '#a3a3a3',
  coral: '#e07a5f',
  green: '#1d411b',
  sky: '#0ea5e9',
  amber: '#fbbf24'
};
const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';

type Quien = 'Todos' | 'Estudiante' | 'Admin';
type Item = { t: string; d: string; I: LucideIcon };
type Seccion = { name: string; quien: Quien; I: LucideIcon; items: Item[] };

const SECCIONES: Seccion[] = [
  {
    name: 'Acceso y cuenta',
    quien: 'Todos',
    I: User,
    items: [
      { t: 'Crear cuenta', d: 'Solo con correo @uvg.edu.gt', I: UserPlus },
      { t: 'Iniciar sesión', d: 'Correo institucional y contraseña', I: LogIn },
      { t: 'Inicio según tu rol', d: 'Estudiante al Inicio, admin al Panel', I: Home },
      { t: 'Menú de cuenta', d: 'Cambia de vista o cierra sesión', I: LogOut },
      { t: 'Aviso para conductores', d: 'Los envía a la app móvil', I: Smartphone }
    ]
  },
  {
    name: 'Inicio',
    quien: 'Estudiante',
    I: Home,
    items: [
      { t: 'Resumen de pedidos', d: 'Cotización, preparación y entregados', I: Package },
      { t: 'Pedidos activos', d: 'Con días a la fecha límite', I: Clock },
      { t: 'Gráfica de solicitudes', d: 'Por mes o por semana', I: ChartNoAxesColumn },
      { t: 'Gasto del semestre', d: 'Productos y cargo por servicio', I: TrendingUp },
      { t: 'Atajos y avisos', d: 'Novedades de pedidos y del staff', I: Bell }
    ]
  },
  {
    name: 'Cotizar',
    quien: 'Estudiante',
    I: FileText,
    items: [
      { t: 'Importar desde PDF', d: 'Claude arma la lista de materiales', I: FileText },
      { t: 'Stock de UVGo', d: 'Catálogo por categoría', I: SquareCheckBig },
      { t: 'Buscador de productos', d: 'Busca en tiendas externas', I: Globe },
      { t: 'Crear pedido', d: 'Curso, fecha límite y entrega', I: PackagePlus }
    ]
  },
  {
    name: 'Mis solicitudes',
    quien: 'Estudiante',
    I: Inbox,
    items: [
      { t: 'Ver la cotización', d: 'Precios, cargo por servicio y total', I: Clipboard },
      { t: 'Pagar con comprobante', d: 'Transferencia y foto o PDF', I: UploadCloud },
      { t: 'Rechazar o cancelar', d: 'Antes de confirmar el pedido', I: XCircle },
      { t: 'Reemplazar comprobante', d: 'Si te equivocaste de archivo', I: RefreshCw }
    ]
  },
  {
    name: 'Seguimiento de pedidos',
    quien: 'Estudiante',
    I: Navigation,
    items: [
      { t: 'Recibo del pedido', d: 'Datos, productos y total', I: Receipt },
      { t: 'Pago y fecha límite', d: 'Cuánto falta y qué está pendiente', I: Calendar },
      { t: 'Historial de fases', d: 'De Solicitado a Entregado', I: History }
    ]
  },
  {
    name: 'Panel de administración',
    quien: 'Admin',
    I: LayoutGrid,
    items: [
      { t: 'Pendientes', d: 'Por cotizar y pagos por validar', I: Inbox },
      { t: 'Cobros de la semana', d: 'Lo cobrado y lo que falta', I: DollarSign },
      { t: 'Horario y actividad', d: 'Cuándo piden los estudiantes', I: Activity },
      { t: 'Mapa de entrega', d: 'Ruta y repartidor en vivo', I: Map },
      { t: 'Asignar conductor', d: 'A cada pedido confirmado', I: Truck },
      { t: 'Nuevo conductor', d: 'Crea su cuenta para la app móvil', I: UserPlus }
    ]
  },
  {
    name: 'Solicitudes',
    quien: 'Admin',
    I: Shield,
    items: [
      { t: 'Filtrar por estado', d: 'Por cotizar, cotizadas, pagadas…', I: Filter },
      { t: 'Cotizar', d: 'Precios y cargo por servicio', I: Tag },
      { t: 'Validar pago', d: 'Revisa el comprobante y confirma', I: CircleCheck },
      { t: 'Cancelar solicitud', d: 'Con aviso al estudiante', I: XCircle },
      { t: 'Avisos por correo', d: 'Cada cambio le llega al estudiante', I: Mail }
    ]
  }
];

const TOTAL = SECCIONES.reduce((s, x) => s + x.items.length, 0);
const QUIEN_COLOR: Record<Quien, [string, string]> = {
  Todos: [C.text, 'rgba(82,82,82,.1)'],
  Estudiante: ['#a34f3a', 'rgba(224,122,95,.16)'],
  Admin: [C.green, 'rgba(29,65,27,.12)']
};

// ---------------------------------------------------------------- medidas y tiempos

const LIST_X = 640;
const LIST_W = 1200;
const CARD_H = 124;
const GAP = 18;
const HEAD_H = 96;
const SEC_GAP = 56;
const TOP = 70;

const secHeight = (s: Seccion) => HEAD_H + Math.ceil(s.items.length / 2) * (CARD_H + GAP) - GAP + SEC_GAP;
const SEC_Y = SECCIONES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + secHeight(SECCIONES[i - 1])], []);
const LIST_H = SEC_Y[SEC_Y.length - 1] + secHeight(SECCIONES[SECCIONES.length - 1]) - SEC_GAP;

const S0 = 24;
const PER = 104;
const secStart = (i: number) => S0 + i * PER;
const itemAt = (i: number, k: number) => secStart(i) + 16 + k * 7;
const OVERVIEW = secStart(SECCIONES.length) + 6;
const BODY = OVERVIEW + 150;
const SHIFT = launchIntroLength(0) - 8;
const END = SHIFT + BODY;
export const DURATION = END + 100;

/** Cuántas funcionalidades se han mostrado hasta el frame. */
const shown = (f: number) => SECCIONES.reduce((n, s, i) => n + s.items.filter((_, k) => f >= itemAt(i, k)).length, 0);

const activeSection = (f: number) => {
  let a = 0;
  SECCIONES.forEach((_, i) => {
    if (f >= secStart(i) - 10) a = i;
  });
  return f >= OVERVIEW ? -1 : a;
};

// ---------------------------------------------------------------- piezas

const Card: FC<{ it: Item; n: number; at: number; f: number; tint: string }> = ({ it, n, at, f, tint }) => {
  const p = sp(f, at, SPRING.pop);
  const check = kf(f, [at + 10, at + 22], [0, 1], EASE.out);
  if (f < at - 1) return <div style={{ height: CARD_H }} />;
  return (
    <div
      style={{
        height: CARD_H,
        display: 'grid',
        gridTemplateColumns: 'auto auto minmax(0,1fr) auto',
        alignItems: 'center',
        gap: 18,
        padding: '0 24px 0 20px',
        borderRadius: 26,
        background: 'rgba(255,255,255,.82)',
        outline: '1px solid rgba(255,255,255,.9)',
        outlineOffset: -1,
        boxShadow: `0 20px 40px -26px rgba(16,24,16,.45), inset 4px 0 0 ${check > 0.5 ? tint : 'transparent'}`,
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 40}px) scale(${0.92 + 0.08 * p})`
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 800, color: C.disabled, fontVariantNumeric: 'tabular-nums', width: 34 }}>{String(n).padStart(2, '0')}</span>
      <span style={{ width: 58, height: 58, borderRadius: 99, background: 'rgba(224,122,95,.16)', color: C.coral, display: 'grid', placeItems: 'center' }}>
        <it.I size={28} strokeWidth={2.2} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.t}</div>
        <div style={{ marginTop: 4, fontSize: 20, fontWeight: 500, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.d}</div>
      </div>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 99,
          display: 'grid',
          placeItems: 'center',
          border: `2.5px solid ${check > 0 ? C.green : 'rgba(82,82,82,.2)'}`,
          background: check >= 1 ? C.green : 'transparent',
          transform: `scale(${1 + 0.25 * Math.sin(check * Math.PI)})`
        }}
      >
        <svg width={22} height={22} viewBox="0 0 24 24">
          <path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={check >= 1 ? '#fff' : C.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - check)} />
        </svg>
      </span>
    </div>
  );
};

const SectionBlock: FC<{ i: number; f: number; base: number }> = ({ i, f, base }) => {
  const s = SECCIONES[i];
  const h = sp(f, secStart(i) - 4, SPRING.smooth);
  const [qc, qb] = QUIEN_COLOR[s.quien];
  const dim = i < SECCIONES.length - 1 ? kf(f, [secStart(i + 1) - 14, secStart(i + 1) + 6], [1, 0.5]) : 1;
  return (
    <div style={{ position: 'absolute', left: 0, top: SEC_Y[i], width: LIST_W, opacity: dim }}>
      <div style={{ height: HEAD_H, display: 'flex', alignItems: 'center', gap: 18, opacity: h, transform: `translateX(${(1 - h) * -30}px)` }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', background: C.ink, borderRadius: 14, padding: '6px 12px', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
        <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>{s.name}</span>
        <span style={{ padding: '6px 16px', borderRadius: 99, background: qb, color: qc, fontSize: 20, fontWeight: 700 }}>{s.quien}</span>
        <span style={{ flex: 1, height: 2, background: 'rgba(23,23,23,.1)', marginLeft: 8 }} />
        <span style={{ fontSize: 20, fontWeight: 600, color: C.faint }}>{s.items.length} funciones</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: GAP }}>
        {s.items.map((it, k) => (
          <Card key={it.t} it={it} n={base + k + 1} at={itemAt(i, k)} f={f} tint={s.quien === 'Admin' ? C.green : C.coral} />
        ))}
      </div>
    </div>
  );
};

const Nav: FC<{ f: number }> = ({ f }) => {
  const active = activeSection(f);
  const count = shown(f);
  const enter = sp(f, 0, SPRING.smooth);
  return (
    <div style={{ position: 'absolute', left: 70, top: 70, width: 470, opacity: enter, transform: `translateX(${(1 - enter) * -40}px)` }}>
      <Img src={staticFile('uvgo/brand/logo.png')} style={{ height: 46 }} />
      <div style={{ marginTop: 26, fontSize: 22, fontWeight: 600, color: C.muted }}>UVGo web</div>
      <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1, color: C.ink }}>Funcionalidades</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 18 }}>
        <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.04em', color: C.coral, fontVariantNumeric: 'tabular-nums' }}>{String(count).padStart(2, '0')}</span>
        <span style={{ fontSize: 30, fontWeight: 700, color: C.faint }}>/ {TOTAL}</span>
      </div>
      <div style={{ height: 8, borderRadius: 9, background: 'rgba(23,23,23,.08)', overflow: 'hidden', marginTop: 4 }}>
        <div style={{ width: `${(count / TOTAL) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.coral}, ${C.green})`, borderRadius: 9 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 30 }}>
        {SECCIONES.map((s, i) => {
          const on = i === active;
          const done = active === -1 || i < active;
          return (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '11px 16px',
                borderRadius: 18,
                background: on ? C.ink : done ? 'rgba(255,255,255,.55)' : 'transparent',
                color: on ? '#fff' : done ? C.text : C.disabled,
                transform: `translateX(${on ? 10 : 0}px)`,
                boxShadow: on ? '0 18px 30px -18px rgba(0,0,0,.6)' : undefined
              }}
            >
              <s.I size={22} strokeWidth={2.3} />
              <span style={{ flex: 1, fontSize: 22, fontWeight: on ? 700 : 600 }}>{s.name}</span>
              {done ? (
                <span style={{ width: 26, height: 26, borderRadius: 99, background: C.green, color: '#fff', display: 'grid', placeItems: 'center' }}>
                  <Check size={16} strokeWidth={3} />
                </span>
              ) : (
                <span style={{ fontSize: 18, fontWeight: 700, opacity: 0.8 }}>{s.items.length}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- composición

const Body: FC = () => {
  const f = useCurrentFrame();
  // Desplazamiento de la lista: cada sección sube hasta quedar arriba
  const steps = SECCIONES.map((sec, i) => ({ f: secStart(i), y: Math.max(0, SEC_Y[i] + secHeight(sec) - SEC_GAP - (1080 - TOP - 70)) }));
  let scroll = 0;
  steps.forEach((s, i) => {
    if (i === 0) return;
    scroll += kf(f, [s.f - 18, s.f + 6], [0, s.y - steps[i - 1].y], EASE.inOut);
  });
  // Vista final: la lista sale y entra la cuadrícula con las 32
  const ov = kf(f, [OVERVIEW, OVERVIEW + 16], [0, 1], EASE.in);
  const y = TOP - scroll - ov * 300;
  const sumary = sp(f, OVERVIEW + 70, SPRING.pop);

  let base = 0;
  const bases = SECCIONES.map((s) => {
    const b = base;
    base += s.items.length;
    return b;
  });

  return (
    <AbsoluteFill>
      {ov < 1 && (
        <div style={{ position: 'absolute', left: LIST_X, top: y, width: LIST_W, height: LIST_H, opacity: 1 - ov }}>
          {SECCIONES.map((_, i) => (f >= secStart(i) - 10 ? <SectionBlock key={i} i={i} f={f} base={bases[i]} /> : null))}
        </div>
      )}
      {f >= OVERVIEW + 10 && <Overview f={f} />}
      {/* degradados para que la lista entre y salga suave arriba y abajo */}
      <div style={{ position: 'absolute', left: LIST_X - 40, right: 0, top: 0, height: 60, background: 'linear-gradient(#bfd8bc, rgba(191,216,188,0))', opacity: 1 - ov }} />
      <div style={{ position: 'absolute', left: LIST_X - 40, right: 0, bottom: 0, height: 80, background: 'linear-gradient(rgba(251,244,234,0), #fbf4ea)', opacity: 1 - ov }} />
      <Nav f={f} />
      {sumary > 0.01 && (
        <div style={{ position: 'absolute', left: 70, bottom: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 99, background: C.ink, color: '#fff', fontSize: 28, fontWeight: 700, opacity: Math.min(1, sumary * 1.5), transform: `scale(${0.85 + 0.15 * sumary})`, transformOrigin: '0 50%' }}>
          <List size={26} /> {TOTAL} funcionalidades · 7 secciones
          <ArrowUpRight size={24} color={C.coral} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// Colores por sección para la cuadrícula final
const SEC_TINT = ['#525252', '#e07a5f', '#d97706', '#0ea5e9', '#7c3aed', '#1d411b', '#2f7d32'];

const Overview: FC<{ f: number }> = ({ f }) => {
  const all = SECCIONES.flatMap((s, i) => s.items.map((it) => ({ it, i })));
  const COLS = 4;
  const W = 290;
  const H = 92;
  const G = 14;
  return (
    <div style={{ position: 'absolute', left: LIST_X - 20, top: 96, display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${W}px)`, gap: G }}>
      {all.map(({ it, i }, n) => {
        const at = OVERVIEW + 12 + (n % COLS) * 3 + Math.floor(n / COLS) * 4;
        const p = sp(f, at, SPRING.pop);
        return (
          <div
            key={n}
            style={{
              height: H,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 16px',
              borderRadius: 20,
              background: 'rgba(255,255,255,.85)',
              boxShadow: `0 14px 26px -18px rgba(16,24,16,.5), inset 5px 0 0 ${SEC_TINT[i]}`,
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * 30}px) scale(${0.85 + 0.15 * p})`
            }}
          >
            <span style={{ width: 26, fontSize: 16, fontWeight: 800, color: C.disabled, fontVariantNumeric: 'tabular-nums' }}>{String(n + 1).padStart(2, '0')}</span>
            <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 99, background: 'rgba(224,122,95,.16)', color: SEC_TINT[i] === '#525252' ? C.coral : SEC_TINT[i], display: 'grid', placeItems: 'center' }}>
              <it.I size={20} strokeWidth={2.3} />
            </span>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', color: C.ink, lineHeight: 1.1 }}>{it.t}</span>
          </div>
        );
      })}
    </div>
  );
};

const Orb: FC<{ c: string; x: number; y: number; r: number }> = ({ c, x, y, r }) => (
  <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', filter: 'blur(70px)', background: `radial-gradient(circle, ${c} 0%, transparent 70%)` }} />
);

export const Funcionalidades: FC = () => {
  const frame = useCurrentFrame();
  const brand = useBrand();
  return (
    <AbsoluteFill style={{ background: LAYOUT_BG, overflow: 'hidden', fontFamily: brand.font }}>
      <Orb c="#9cc79a" x={140} y={80} r={620} />
      <Orb c="rgba(224,122,95,.4)" x={1900} y={420} r={520} />
      <Orb c="rgba(253,230,138,.7)" x={700} y={1180} r={520} />
      <Sequence from={SHIFT} durationInFrames={BODY + 10}>
        <Body />
      </Sequence>
      <LaunchIntro title="Todo UVGo web" badge="FUNCIONALIDADES" icon={<List size={64} strokeWidth={2.2} />} />
      {frame >= END - 4 && (
        <AbsoluteFill style={{ background: LAYOUT_BG, opacity: Math.min(1, (frame - END + 4) / 12) }}>
          <EndCard title={`${TOTAL} funciones, una sola UVGo.`} highlight={['UVGo']} subtitle="Estudiantes · Administración" at={{ title: END + 4, subtitle: END + 28, logo: END + 40 }} fontSize={120} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
