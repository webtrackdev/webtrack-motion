// Pantallas reales de UVGo para el video "Crear cuenta": acceso (pestañas Iniciar sesión / Crear
// cuenta con el formulario de registro) e Inicio de una cuenta recién creada (sin pedidos).
// Estructura, textos, medidas e iconos (Feather -> lucide) tomados del repo UVGo (solo lectura):
// pages/Login, pages/Inicio, pages/Pedidos y layout/SideRail. Viewport de 1440x900. Datos ficticios.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Img, staticFile } from 'remotion';
import {
  ArrowUpRight,
  Bell,
  Box,
  ChartNoAxesColumn,
  ChevronDown,
  CircleCheck,
  CreditCard,
  Eye,
  FileText,
  Home,
  Inbox,
  Lock,
  Navigation,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  User
} from 'lucide-react';

export const VW = 1440;
export const VH = 900;

// Tokens de src/styles/theme.ts
export const U = {
  text: '#171717',
  strong: '#0a0a0a',
  muted: '#525252',
  faint: '#737373',
  disabled: '#a3a3a3',
  border: '#d4d4d4',
  coral: '#e07a5f',
  green: '#1d411b',
  sky: '#0ea5e9',
  amber: '#fbbf24',
  bg: '#dfe6dc',
  surfaceMuted: 'rgba(255,255,255,0.55)'
};
const LAYOUT_BG = 'linear-gradient(180deg, #b8d4b6 0%, #f7eee1 55%, #fbf4ea 100%)';
const SHADOW_MD = '0 1px 3px 0 rgb(0 0 0 / 0.1)';

// ------------------------------------------------------------------ ventana del navegador

export const CHROME_H = 40;

/** Marco de navegador mínimo con la ruta actual (para que se vea el salto /login -> /dashboard). */
export const BrowserFrame: FC<{ route: string; routeFlash: number; children: ReactNode; style?: CSSProperties }> = ({ route, routeFlash, children, style }) => (
  <div
    style={{
      position: 'absolute',
      width: VW,
      height: VH + CHROME_H,
      borderRadius: 18,
      overflow: 'hidden',
      background: '#f4f5f2',
      boxShadow: '0 60px 120px -40px rgba(16,24,16,.55), 0 0 0 1px rgba(16,24,16,.08)',
      ...style
    }}
  >
    <div style={{ height: CHROME_H, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, borderBottom: '1px solid rgba(16,24,16,.08)' }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <span key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c }} />
      ))}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: 420,
            height: 26,
            padding: '0 12px',
            borderRadius: 8,
            background: '#fff',
            boxShadow: `0 0 0 ${routeFlash * 3}px rgba(224,122,95,${0.35 * routeFlash})`,
            fontSize: 13,
            color: U.faint
          }}
        >
          <Lock size={12} />
          <span style={{ fontWeight: 600, color: U.text }}>UVGo</span>
          <span>{route}</span>
        </div>
      </div>
      <div style={{ width: 52 }} />
    </div>
    <div style={{ position: 'relative', width: VW, height: VH, overflow: 'hidden' }}>{children}</div>
  </div>
);

// ------------------------------------------------------------------ acceso

// Medidas de pages/Login/Login.styles.ts (1rem = 10px)
export const CARD_X = 440;
export const CARD_W = 560;
const PAD_X = 56;
export const FIELD_X = CARD_X + PAD_X; // 496
export const FIELD_W = CARD_W - 2 * PAD_X; // 448
/** Alto de la tarjeta con cada formulario y su borde superior (centrada en el área útil 80..872). */
export const CARD = { login: { h: 404, top: 274 }, registro: { h: 671, top: 141 } };
/** Inicio del formulario dentro de la tarjeta: padding 28 + pestañas 47 + margen 28. */
export const FORM_TOP = 103;

/** Centros de los campos del registro en px del viewport (tarjeta en `top`). */
export const registroTargets = (top = CARD.registro.top) => {
  const f = top + FORM_TOP;
  return {
    nombre: { x: FIELD_X + FIELD_W / 2, y: f + 43 },
    correo: { x: FIELD_X + FIELD_W / 2, y: f + 126 },
    telefono: { x: FIELD_X + 109, y: f + 227 },
    carne: { x: FIELD_X + FIELD_W - 109, y: f + 227 },
    carrera: { x: FIELD_X + FIELD_W / 2, y: f + 310 },
    contrasena: { x: FIELD_X + FIELD_W / 2, y: f + 393 },
    submit: { x: FIELD_X + FIELD_W / 2, y: f + 465 }
  };
};
/** Pestaña "Crear cuenta" con la tarjeta de acceso. */
export const TAB_REGISTRO = { x: 836, y: CARD.login.top + 28 + 20 };

const Caret: FC<{ on: boolean }> = ({ on }) => <span style={{ display: 'inline-block', width: 2, height: 18, marginLeft: 1, background: on ? U.text : 'transparent', verticalAlign: 'middle' }} />;

export type FieldState = { value: string; focus: boolean; caret: boolean };

const Field: FC<{ label: ReactNode; ph: string; st: FieldState; hint?: string; eye?: boolean; mask?: boolean }> = ({ label, ph, st, hint, eye, mask }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, fontSize: 12, fontWeight: 500, color: U.muted }}>
    {label}
    <div
      style={{
        position: 'relative',
        height: 48,
        padding: `0 ${eye ? 48 : 16}px 0 16px`,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        fontWeight: st.value ? 500 : 400,
        letterSpacing: mask && st.value ? '0.12em' : undefined,
        color: st.value ? U.text : U.disabled,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        background: st.focus ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.55)',
        border: `1px solid ${st.focus ? U.coral : 'rgba(255,255,255,.85)'}`,
        boxShadow: st.focus ? '0 0 0 3px rgba(224,122,95,.16)' : undefined
      }}
    >
      {st.value ? (mask ? '•'.repeat(st.value.length) : st.value) : st.focus ? '' : ph}
      {st.focus && <Caret on={st.caret} />}
      {st.focus && !st.value && <span style={{ color: U.disabled, fontWeight: 400 }}>{ph}</span>}
      {eye && <Eye size={18} color={U.faint} style={{ position: 'absolute', right: 15 }} />}
    </div>
    {hint && <span style={{ fontSize: 11, fontWeight: 400, color: U.faint }}>{hint}</span>}
  </label>
);

const Submit: FC<{ label: string; disabled?: boolean; press?: number }> = ({ label, disabled, press = 1 }) => (
  <div
    style={{
      height: 48,
      marginTop: 8,
      borderRadius: 999,
      background: U.strong,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      transform: `scale(${press})`
    }}
  >
    {label}
  </div>
);

const Switch: FC<{ q: string; link: string }> = ({ q, link }) => (
  <p style={{ margin: 0, fontSize: 12, color: U.faint, textAlign: 'center' }}>
    {q} <span style={{ fontWeight: 600, color: U.strong, textDecoration: 'underline', textUnderlineOffset: 2 }}>{link}</span>
  </p>
);

export type RegistroState = {
  nombre: FieldState;
  correo: FieldState;
  telefono: FieldState;
  carne: FieldState;
  carrera: FieldState;
  contrasena: FieldState;
  pending: boolean;
  press: number;
};

const RegistroForm: FC<{ st: RegistroState }> = ({ st }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Field label="Nombre completo" ph="" st={st.nombre} />
    <Field label="Correo institucional" ph="usuario@uvg.edu.gt" st={st.correo} hint="Solo se aceptan correos @uvg.edu.gt" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <Field label="Teléfono" ph="5555 0000" st={st.telefono} />
      <Field label="Carné" ph="" st={st.carne} />
    </div>
    <Field
      label={
        <span>
          Carrera <span style={{ fontSize: 11, fontWeight: 400, color: U.faint }}>(opcional)</span>
        </span>
      }
      ph=""
      st={st.carrera}
    />
    <Field label="Contraseña" ph="Al menos 12 caracteres" st={st.contrasena} eye mask />
    <Submit label={st.pending ? 'Creando cuenta…' : 'Crear cuenta'} disabled={st.pending} press={st.press} />
    <Switch q="¿Ya tienes cuenta?" link="Inicia sesión" />
  </div>
);

const EMPTY: FieldState = { value: '', focus: false, caret: false };

const LoginForm: FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Field label="Correo institucional" ph="usuario@uvg.edu.gt" st={EMPTY} />
    <Field label="Contraseña" ph="Tu contraseña" st={EMPTY} eye />
    <Submit label="Iniciar sesión" disabled />
    <Switch q="¿No tienes cuenta?" link="Crea una" />
  </div>
);

const Tabs: FC<{ registro: number }> = ({ registro }) => {
  // registro: 0 = Iniciar sesión activa, 1 = Crear cuenta activa
  const tab = (label: string, on: number) => (
    <div style={{ position: 'relative', paddingBottom: 12, fontSize: 32, lineHeight: 1.1, fontWeight: on > 0.5 ? 700 : 400, color: on > 0.5 ? U.strong : U.disabled }}>
      {label}
      <div style={{ position: 'absolute', left: '50%', bottom: 0, width: 44, height: 4, marginLeft: -22, borderRadius: 99, background: U.coral, opacity: on, transform: `scaleX(${on})` }} />
    </div>
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 28 }}>
      {tab('Iniciar sesión', 1 - registro)}
      {tab('Crear cuenta', registro)}
    </div>
  );
};

const Orb: FC<{ c: string; style: CSSProperties }> = ({ c, style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(60px)', background: `radial-gradient(circle, ${c} 0%, transparent 70%)`, ...style }} />
);

/**
 * Pantalla de acceso. `morph` 0..1 pasa de la tarjeta de login a la de registro
 * (la app cambia de pestaña al instante; aquí dura unos frames para que se lea el cambio).
 */
export const AccessScreen: FC<{ morph: number; reg: RegistroState }> = ({ morph, reg }) => {
  const h = CARD.login.h + (CARD.registro.h - CARD.login.h) * morph;
  const top = CARD.login.top + (CARD.registro.top - CARD.login.top) * morph;
  const vmax = VW / 100;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: U.bg, backgroundImage: LAYOUT_BG }}>
      <Orb c="#9cc79a" style={{ width: 62 * vmax, height: 62 * vmax, top: -22 * vmax, left: -18 * vmax }} />
      <Orb c="rgba(224,122,95,.55)" style={{ width: 48 * vmax, height: 48 * vmax, top: '18%', right: -16 * vmax }} />
      <Orb c="rgba(253,230,138,.8)" style={{ width: 44 * vmax, height: 44 * vmax, bottom: -20 * vmax, left: '12%' }} />
      <Orb c="rgba(29,65,27,.28)" style={{ width: 40 * vmax, height: 40 * vmax, bottom: -18 * vmax, right: '6%' }} />

      <Img src={staticFile('uvgo/brand/logo.png')} style={{ position: 'absolute', left: 24, top: 24, height: 28, zIndex: 3 }} />

      {/* tarjeta grande desenfocada detrás del formulario */}
      <div style={{ position: 'absolute', left: 186, top: 124, width: 1160, height: 680, borderRadius: 40, background: 'rgba(255,255,255,.26)', outline: '1px solid rgba(255,255,255,.5)', outlineOffset: -1, boxShadow: '0 40px 120px -40px rgb(16 24 16/.35)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '6%', top: '8%', width: '30%', height: '7%', borderRadius: 24, background: 'rgba(255,255,255,.7)', filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', right: '6%', top: '8%', width: '34%', height: '34%', borderRadius: 24, background: 'rgba(29,65,27,.12)', filter: 'blur(10px)' }} />
      </div>

      {/* Stage: caja de atrás, tarjeta y caja de adelante */}
      <div style={{ position: 'absolute', left: CARD_X, top, width: CARD_W, height: h, zIndex: 2 }}>
        <Img src={staticFile('uvgo/caja.png')} style={{ position: 'absolute', right: -120, bottom: -90, width: 200, transform: 'rotate(12deg)', opacity: 0.95, filter: 'drop-shadow(0 24px 32px rgb(16 24 16/.28))' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '28px 56px 48px',
            borderRadius: 32,
            overflow: 'hidden',
            background: 'linear-gradient(140deg, rgba(255,255,255,.72) 0%, rgba(255,255,255,.4) 100%)',
            outline: '1px solid rgba(255,255,255,.75)',
            outlineOffset: -1,
            boxShadow: '0 32px 80px -24px rgb(16 24 16/.35), 0 1px 2px rgb(16 24 16/.06)',
            backdropFilter: 'blur(28px) saturate(1.6)'
          }}
        >
          <Tabs registro={morph} />
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: 1 - Math.min(1, morph * 2.5) }}>
              <LoginForm />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: Math.max(0, morph * 2 - 1) }}>
              <RegistroForm st={reg} />
            </div>
          </div>
        </div>
        <Img src={staticFile('uvgo/caja.png')} style={{ position: 'absolute', left: -170, top: -120, width: 210, transform: 'rotate(-14deg)', filter: 'drop-shadow(0 24px 32px rgb(16 24 16/.28))' }} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ inicio de una cuenta nueva

const glass: CSSProperties = {
  borderRadius: 16,
  background: U.surfaceMuted,
  boxShadow: SHADOW_MD,
  padding: 16
};

export const Rail: FC<{ initials: string; active?: number; admin?: boolean }> = ({ initials, active = 0, admin }) => {
  // Menú de SideRail: la vista admin solo tiene Inicio y Solicitudes
  const items = admin ? [Home, Inbox] : [Home, FileText, Inbox, Navigation, User, CreditCard, ChartNoAxesColumn];
  return (
    <div style={{ ...glass, borderRadius: 24, padding: '16px 0', boxShadow: '0 1px 2px 0 rgb(0 0 0/.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ paddingBottom: 16, borderBottom: '1px solid rgba(82,82,82,.1)' }}>
        <Img src={staticFile('uvgo/brand/logo.png')} style={{ width: 52 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((I, i) => (
          <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: i === active ? U.strong : 'transparent', color: i === active ? '#fff' : U.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I size={19} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, color: U.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={19} />
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 99, border: '2px solid #fff', background: 'linear-gradient(to bottom right, #fde68a, #d4d4d4)', boxShadow: '0 0 0 1px rgba(82,82,82,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: U.text }}>
          {initials}
        </div>
      </div>
    </div>
  );
};

const Stat: FC<{ label: string; detail: string; Icon: typeof Tag; color: string; bg: string }> = ({ label, detail, Icon, color, bg }) => (
  <div style={{ ...glass, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.01em', color: U.strong }}>0</div>
      <div style={{ marginTop: 2, fontSize: 14, color: U.muted }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: U.green }}>{detail}</div>
    </div>
    <div style={{ width: 46, height: 46, borderRadius: 99, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} />
    </div>
  </div>
);

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Coordenadas (viewport) de piezas del Inicio que la cámara y el cursor usan. */
export const INICIO = {
  greeting: { x: 330, y: 64 },
  newButton: { x: 949, y: 66 },
  stats: { x: 586, y: 156 },
  emptyOrder: { x: 332, y: 350 },
  pedidos: { x: 1230, y: 520 }
};

/** `enter` 0..1: el panel de Pedidos entra desde la derecha como en la app (motion, 0.25 s). */
export const InicioScreen: FC<{ nombre: string; initials: string; enter: number; hoverNew: number }> = ({ nombre, initials, enter, hoverNew }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 16, padding: 16, background: '#fff', backgroundImage: LAYOUT_BG, color: U.text }}>
    <Rail initials={initials} />
    <div style={{ display: 'flex', gap: 16, padding: 24, minWidth: 0 }}>
      {/* columna principal */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: U.strong }}>Buenos días, {nombre}</div>
            <div style={{ marginTop: 2, fontSize: 14, color: U.muted }}>Jueves, 12 de noviembre · Todo al día con tus pedidos</div>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 999,
              background: hoverNew > 0.5 ? '#262626' : U.strong,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: '0 8px 20px -10px rgb(0 0 0/.5)',
              transform: `translateY(${-hoverNew}px)`
            }}
          >
            <Plus size={16} /> Nueva cotización
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Stat label="En cotización" detail="Esperando precio" Icon={Tag} color={U.amber} bg="rgba(251,191,36,.18)" />
          <Stat label="En preparación" detail="Pagos al día" Icon={Package} color={U.sky} bg="rgba(14,165,233,.15)" />
          <Stat label="Entregados" detail="Q 0.00 este semestre" Icon={CircleCheck} color={U.coral} bg="rgba(224,122,95,.18)" />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* OrderStatusCard vacío */}
          <div style={{ flex: 1, minWidth: 0, borderRadius: 24, background: '#fff', boxShadow: SHADOW_MD, padding: '16px 24px' }}>
            <div style={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 99, background: 'rgba(224,122,95,.16)', color: U.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box size={20} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: U.strong }}>No tienes pedidos activos</div>
              <div style={{ maxWidth: 340, fontSize: 14, color: U.muted }}>Sube la lista de materiales de tu curso o arma tu pedido y te enviamos una cotización.</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: `1px solid ${U.border}`, background: '#fff', fontSize: 12, fontWeight: 600, color: U.text }}>
                <Plus size={14} /> Nueva cotización
              </div>
            </div>
          </div>
          {/* OrderTrendsChart sin solicitudes: barras mínimas (minPointSize 5) */}
          <div style={{ ...glass, flex: 1.2, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>Mis solicitudes</div>
                <div style={{ marginTop: 2, fontSize: 12, color: U.green }}>0 solicitudes este año</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 999, border: `1px solid ${U.border}`, background: '#fff', fontSize: 12, color: U.muted }}>
                Mensual <ChevronDown size={12} />
              </div>
            </div>
            <div style={{ height: 140, marginTop: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
              {MESES.map((m, i) => (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 5, borderRadius: 6, background: i === 10 ? U.coral : U.border }} />
                  <div style={{ fontSize: 12, fontWeight: i === 10 ? 600 : 500, color: i === 10 ? U.strong : U.faint }}>{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)', gap: 16 }}>
          {/* SpendSummary sin pagos */}
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: U.strong }}>
              <TrendingUp size={15} color={U.green} /> Gasto del semestre
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', color: U.strong }}>Q 0.00</div>
              <div style={{ fontSize: 12, color: U.muted }}>Aún no tienes pedidos pagados este semestre</div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'rgba(82,82,82,.12)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: U.faint }}>
              {[
                ['Productos', U.green],
                ['Servicio', U.coral]
              ].map(([l, c]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />
                  {l} <b style={{ fontWeight: 600, color: U.text }}>Q 0.00</b>
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
              {[
                ['Promedio por pedido', 'Q 0.00'],
                ['Unidades compradas', '0']
              ].map(([l, v]) => (
                <div key={l} style={{ borderRadius: 12, padding: '8px 10px', background: '#fff' }}>
                  <div style={{ fontSize: 10.5, color: U.faint }}>{l}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* QuickActions */}
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>Atajos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(
                [
                  [FileText, 'Cotizar con PDF', 'Sube la lista de tu curso'],
                  [ShoppingBag, 'Catálogo', 'Arma tu pedido a mano'],
                  [Inbox, 'Mis solicitudes', 'Cotizaciones y pagos'],
                  [Navigation, 'Seguimiento', 'Estado de tus pedidos']
                ] as const
              ).map(([I, t, sub]) => (
                <div key={t} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, padding: 12, background: '#fff' }}>
                  <div style={{ width: 32, height: 32, marginBottom: 6, borderRadius: 99, background: 'rgba(224,122,95,.14)', color: U.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <I size={17} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: U.strong }}>{t}</div>
                  <div style={{ fontSize: 11.5, color: U.faint }}>{sub}</div>
                  <ArrowUpRight size={15} color={U.disabled} style={{ position: 'absolute', top: 12, right: 12 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* columna derecha */}
      <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={glass}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: U.strong }}>
              <div style={{ width: 32, height: 32, borderRadius: 99, background: U.bg, color: U.faint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={16} />
              </div>
              Avisos
            </div>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: U.green, boxShadow: '0 0 0 4px rgba(29,65,27,.14)' }} />
          </div>
          <div style={{ marginTop: 16, minHeight: 90, borderRadius: 12, background: '#fff', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center' }}>
            <span style={{ padding: '2px 8px', borderRadius: 99, background: U.bg, fontSize: 10.5, fontWeight: 600, color: U.muted }}>Staff UVGo</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: U.strong }}>Entregas de lunes a viernes, de 8:00 a 17:00</div>
            <div style={{ fontSize: 12, color: U.faint }}>Horario de entregas</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: U.coral }} />
            <span style={{ width: 8, height: 8, borderRadius: 99, background: U.border }} />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', opacity: enter, transform: `translateX(${(1 - enter) * 40}px)` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 0 0', background: U.surfaceMuted, fontSize: 20, fontWeight: 700, color: U.strong }}>Pedidos</div>
            <div style={{ marginLeft: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 5px 5px 16px', borderRadius: 99, border: `1px solid ${U.border}`, fontSize: 14, color: U.muted }}>
              Recientes
              <span style={{ width: 24, height: 24, borderRadius: 99, background: U.amber, color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</span>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: '0 24px 24px 24px', background: U.surfaceMuted, boxShadow: SHADOW_MD, padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '24px 12px', textAlign: 'center', fontSize: 14, color: U.muted }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: U.strong }}>Aún no tienes solicitudes</div>
              <div>Cuando pidas una cotización aparecerá aquí.</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontWeight: 600, color: U.coral }}>
                <Plus size={13} /> Nueva cotización
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
