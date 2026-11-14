// Réplicas de reactive para el video del Modo Delivery (reactive#1788, WD-5127; solo lectura):
//  1. Jobs (JobsHubScreen) con el botón de Configuración de Jobs del PageHeader.
//  2. JobsSettingsPane > pestaña General: FormCard con los dos switches (WD-4577 y WD-5127).
//  3. Jobs > Ajustes de Usuario (BulkUserManagement): indicadores, toolbar y tabla con la
//     columna nueva "Modo Delivery" (StatusBadge con los colores del PR).
//  4. SlidingPane "Gestión de Preferencias" (BulkPreferencesManagement): Configuraciones
//     Generales con el RadioButtonGroupInput de Modo Delivery y el diálogo de conflictos.
// Textos del i18n real del PR; datos ficticios. Simplificado: la tabla muestra solo algunas
// columnas y el menú lateral no se dibuja. Lo que el cursor toca está montado desde el frame 0.
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  CalendarCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Circle,
  Gauge,
  Info,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Settings2,
  Shapes,
  TriangleAlert,
  Truck,
  X
} from 'lucide-react';
import '@webtrack/assets/css/vendor/sliding-pane.css';
import '@webtrack/views/components/FormActions/FormActions.css';
import '@webtrack/views/components/UnderlineTabSelector/UnderlineTabSelector.css';
import '../politica-contrasenas/pane.css';
import { Button, IconTile, KpiCards, StatusBadge, ToolbarButton, TourHelpButton, cn, monitorCards } from '../../components/jobshub-kit';
import { IcoIcon } from '../../components/IcoIcon';

// ── Piezas de shadcn de reactive (mismas clases) ─────────────────────────────────────────

export const Switch: FC<{ checked: boolean; disabled?: boolean; anchor?: string; press?: number }> = ({ checked, disabled, anchor, press = 0 }) => (
  <button
    type="button"
    role="switch"
    data-slot="switch"
    data-size="default"
    data-anchor={anchor}
    data-state={checked ? 'checked' : 'unchecked'}
    disabled={disabled}
    className="peer group/switch mt-0.5 inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
    style={{ transform: press > 0 ? `scale(${1 - press * 0.12})` : undefined }}
  >
    <span
      data-slot="switch-thumb"
      data-state={checked ? 'checked' : 'unchecked'}
      className="pointer-events-none block rounded-full bg-background ring-0 group-data-[size=default]/switch:size-4 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
    />
  </button>
);

/** Resalte del elemento del que habla la voz (anillo de marca). */
const ring = (v: number): CSSProperties =>
  v > 0.01 ? { boxShadow: `0 0 0 ${3 * v}px rgba(4,14,255,${0.18 * v}), 0 0 0 ${1.5 * v}px rgba(4,14,255,${0.7 * v})`, borderRadius: 10 } : {};

// ── 1. Jobs: PageHeader con el botón de Configuración de Jobs ────────────────────────────

export const JobsHubBg: FC<{ settingsPress?: number; settingsGlow?: number }> = ({ settingsPress = 0, settingsGlow = 0 }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header" data-testid="page-header">
      <nav aria-label="breadcrumb" data-slot="breadcrumb" className="page-breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm break-words text-inherit">
          <li className="inline-flex items-center gap-1.5">
            <span>Jobs</span>
          </li>
          <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
            <ChevronRight />
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span data-slot="breadcrumb-page" className="font-normal text-foreground">
              Monitor
            </span>
          </li>
        </ol>
      </nav>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">Lo que está pasando en el periodo: trabajo en curso, atrasado y por cerrar.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TourHelpButton />
          <span style={{ display: 'inline-flex', ...ring(settingsGlow) }}>
            <Button variant="outline" size="icon-field" anchor="hub-settings" press={settingsPress}>
              <Settings className="size-4" />
            </Button>
          </span>
          <Button variant="outline" size="icon-field">
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="gradient" size="cta">
            <Plus className="size-4" />
            Nuevo Job
          </Button>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 18 }}>
      <KpiCards items={monitorCards} />
    </div>
  </div>
);

// ── SlidingPane de reactive (.slide-pane__*) ─────────────────────────────────────────────

const Pane: FC<{ title: string; subtitle?: string; width: number; p: number; children: ReactNode; footer?: ReactNode }> = ({
  title,
  subtitle,
  width,
  p,
  children,
  footer
}) => (
  <>
    <div className="slide-pane__overlay pp-overlay" style={{ backgroundColor: `rgba(0,0,0,${0.3 * p})` }} />
    <div
      className="slide-pane slide-pane_from_right pp-pane custom-sliding-pane-form"
      style={{ width, transform: `translateX(${(1 - p) * (width + 40)}px)`, transition: 'none', zIndex: 1051 }}
    >
      <div className="slide-pane__header">
        <div className="slide-pane__title-wrapper">
          <div className="slide-pane__title">{title}</div>
          {subtitle ? <div className="slide-pane__subtitle">{subtitle}</div> : null}
        </div>
        <button type="button" className="slide-pane__close">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
      </div>
      <div className="slide-pane__content">{children}</div>
      {footer}
    </div>
  </>
);

const FormActionsFooter: FC<{ savePress?: number; saveAnchor?: string; disabled?: boolean }> = ({ savePress = 0, saveAnchor, disabled }) => (
  <div className="form-actions form-actions--lg form-actions--footer">
    <button type="button" className="form-actions__save" data-anchor={saveAnchor} disabled={disabled} style={{ transform: `scale(${1 - 0.06 * savePress})`, minWidth: 100 }}>
      <Save size={15} />
      Guardar
    </button>
    <button type="button" className="form-actions__cancel">
      Cancelar
    </button>
  </div>
);

// ── 2. Configuración de Jobs > General ───────────────────────────────────────────────────

export type SettingsState = {
  pane: number;
  /** Modo Delivery de la organización. */
  delivery: boolean;
  /** Resaltes 0..1: switch de reprogramación, fila del Modo Delivery, botón Guardar. */
  glowReschedule: number;
  glowDelivery: number;
  togglePress: number;
  savePress: number;
  /** Sin permiso de edición: aviso de solo lectura y switches deshabilitados. */
  readOnly: number;
};

const TABS = [
  { id: 'general', label: 'General', icon: <Settings2 size={16} /> },
  { id: 'types', label: 'Tipos de tarea', icon: <Shapes size={16} /> },
  { id: 'compliance', label: 'Cumplimiento', icon: <CalendarCheck size={16} /> },
  { id: 'load', label: 'Carga', icon: <Gauge size={16} /> }
];

const SwitchRow: FC<{ checked: boolean; disabled: boolean; icon: ReactNode; title: string; hint: string; glow: number; anchor?: string; press?: number; rowAnchor?: string }> = ({
  checked,
  disabled,
  icon,
  title,
  hint,
  glow,
  anchor,
  press,
  rowAnchor
}) => (
  <label className="mb-4 flex cursor-pointer items-start gap-3" data-anchor={rowAnchor} style={{ padding: 6, margin: '-6px -6px 10px', ...ring(glow) }}>
    <Switch checked={checked} disabled={disabled} anchor={anchor} press={press} />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </span>
  </label>
);

export const SettingsPane: FC<{ s: SettingsState }> = ({ s }) => {
  const disabled = s.readOnly > 0.5;
  return (
    <Pane title="Configuración de Jobs" subtitle="Organización: Distribuidora Ejemplo" width={736} p={s.pane} footer={<FormActionsFooter savePress={s.savePress} saveAnchor="save" disabled={disabled} />}>
      <div className="mb-6">
        <div className="underline-tab underline-tab--lg">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={`underline-tab__btn${t.id === 'general' ? ' underline-tab__btn--active' : ''}`}>
              <span className="underline-tab__icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      {s.readOnly > 0.01 && (
        <div
          data-slot="alert"
          role="alert"
          className="relative mb-6 grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border border-primary/30 bg-primary/15 px-4 py-3 text-sm text-primary has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5"
          style={{ opacity: s.readOnly }}
          data-anchor="readonly"
        >
          <Info />
          <div data-slot="alert-description">Puedes ver la configuración, pero no editarla.</div>
        </div>
      )}
      <div data-slot="card" data-anchor="general-card" className="mb-6 flex flex-col gap-0 rounded-xl border bg-card py-0 text-card-foreground shadow-hairline">
        <div data-slot="card-header" className="flex flex-row items-start gap-3 border-b px-6 py-5">
          <IconTile size="lg" icon={<Settings2 size={18} />} />
          <div className="min-w-0 flex-1">
            <div className="text-(length:--text-card-title) font-(--text-card-title--font-weight) leading-(--text-card-title--line-height) text-heading-foreground">General</div>
            <div className="mt-1 text-sm text-muted-foreground">Ajustes de Jobs que aplican a toda la organización, en la web y en la app de Jobs.</div>
          </div>
        </div>
        <div data-slot="card-content" className="px-6 py-6">
          <SwitchRow
            checked
            disabled={disabled}
            icon={<CalendarClock className="size-4 text-muted-foreground" />}
            title="Permitir solicitudes de reprogramación"
            hint={'Si se desactiva, la web y la app de Jobs dejan de ofrecer el estado "Solicitud de Reprogramación". Los jobs que ya están en ese estado se quedan así.'}
            glow={s.glowReschedule}
            rowAnchor="row-reschedule"
          />
          <SwitchRow
            checked={s.delivery}
            disabled={disabled}
            icon={<Truck className="size-4 text-muted-foreground" />}
            title="Modo Delivery en la app de Jobs"
            hint="La pantalla Hoy de la app se enfoca en entregar las órdenes de cada job con un toque. Es el valor de la organización: cada usuario puede tener su excepción en Preferencias de Jobs."
            glow={s.glowDelivery}
            anchor="sw-delivery"
            press={s.togglePress}
            rowAnchor="row-delivery"
          />
        </div>
      </div>
    </Pane>
  );
};

// ── 3. Jobs > Ajustes de Usuario ─────────────────────────────────────────────────────────

/** Valor del Modo Delivery por usuario: 1 activado, 0 desactivado, -1 igual que la organización. */
export type DeliveryOpt = 1 | 0 | -1;
export type UserRow = { id: number; user: string; name: string; role: 'reparto' | 'mantenimiento'; delivery: DeliveryOpt };

export const USERS: UserRow[] = [
  { id: 4101, user: 'cmendez', name: 'Carlos Méndez', role: 'reparto', delivery: -1 },
  { id: 4102, user: 'lbarrios', name: 'Lucía Barrios', role: 'reparto', delivery: -1 },
  { id: 4103, user: 'dpaz', name: 'Diego Paz', role: 'mantenimiento', delivery: -1 },
  { id: 4104, user: 'sruiz', name: 'Sofía Ruiz', role: 'reparto', delivery: -1 },
  { id: 4105, user: 'mleon', name: 'Mario León', role: 'mantenimiento', delivery: 1 },
  { id: 4106, user: 'esoto', name: 'Elena Soto', role: 'reparto', delivery: -1 },
  { id: 4107, user: 'jrivas', name: 'Jorge Rivas', role: 'mantenimiento', delivery: 1 },
  { id: 4108, user: 'aflores', name: 'Ana Flores', role: 'reparto', delivery: -1 }
];

// Colores de la columna del PR: Habilitado #00D57E, Deshabilitado #677187, Igual que la organización #00EAD5.
export const DeliveryBadge: FC<{ v: DeliveryOpt }> = ({ v }) => (
  <StatusBadge color={v === 1 ? '#00D57E' : v === 0 ? '#677187' : '#00EAD5'}>{v === 1 ? 'Habilitado' : v === 0 ? 'Deshabilitado' : 'Igual que la organización'}</StatusBadge>
);

export type UsersState = {
  /** Usuarios seleccionados (por id). */
  selected: number[];
  /** Valor del Modo Delivery de cada usuario (por id). */
  values: Record<number, DeliveryOpt>;
  settingsPress: number;
  settingsGlow: number;
  /** Resalte de la columna Modo Delivery. */
  columnGlow: number;
  /** Fila que cambió (pulso verde). */
  flashId: number | null;
  flash: number;
};

const COLS = '44px 70px 120px 1.25fr 110px 1.35fr';
const Check: FC<{ on: boolean; anchor?: string }> = ({ on, anchor }) => (
  <span
    data-anchor={anchor}
    style={{
      width: 16,
      height: 16,
      borderRadius: 4,
      border: on ? 'none' : '1.5px solid var(--input)',
      background: on ? 'var(--primary)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 11,
      fontWeight: 900
    }}
  >
    {on ? '✓' : ''}
  </span>
);

const INDICATORS = [
  ['Total Usuarios', '20'],
  ['Usuarios Web', '4'],
  ['Usuarios App', '20'],
  ['Licencias', '20 / 25']
];

export const UsersPage: FC<{ s: UsersState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header">
      <nav className="page-breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-inherit">
          <li className="inline-flex items-center gap-1.5">
            <span>Jobs</span>
          </li>
          <li role="presentation" className="[&>svg]:size-3.5">
            <ChevronRight />
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span data-slot="breadcrumb-page" className="font-normal text-foreground">
              Ajustes de Usuario
            </span>
          </li>
        </ol>
      </nav>
      <div className="flex items-start justify-between gap-4">
        <h1 className="page-title">Ajustes de Usuario</h1>
        <TourHelpButton />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
      {INDICATORS.map(([t, v]) => (
        <div key={t} className="surface-card" style={{ padding: '14px 18px' }}>
          <div className="text-xs font-semibold text-muted-foreground">{t}</div>
          <div className="text-2xl font-bold text-foreground" style={{ marginTop: 4 }}>
            {v}
          </div>
        </div>
      ))}
    </div>
    <div className="surface-card" style={{ marginTop: 14, padding: '10px 0 4px' }}>
      <div className="flex items-center gap-2" style={{ padding: '4px 16px 10px' }}>
        <span style={{ display: 'inline-flex', ...ring(s.settingsGlow) }}>
          <ToolbarButton icon="Settings" variant="soft-primary" disabled={s.selected.length === 0} anchor="tb-settings" press={s.settingsPress} />
        </span>
        <ToolbarButton icon="Key" variant="soft-info" disabled={s.selected.length !== 1} />
        <span className="text-xs text-muted-foreground" style={{ marginLeft: 8 }}>
          {s.selected.length ? `${s.selected.length} seleccionado${s.selected.length > 1 ? 's' : ''}` : ''}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}>
        <span />
        <span>ID</span>
        <span>Usuario</span>
        <span>Nombre Completo</span>
        <span>Estado</span>
        <span data-anchor="col-delivery" style={{ ...ring(s.columnGlow), padding: '0 6px', margin: '0 -6px' }}>
          Modo Delivery
        </span>
      </div>
      {USERS.map((u) => {
        const sel = s.selected.includes(u.id);
        const fl = s.flashId === u.id ? s.flash : 0;
        return (
          <div
            key={u.id}
            data-anchor={`row-${u.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              alignItems: 'center',
              padding: '10px 16px',
              fontSize: 13.5,
              borderTop: '1px solid var(--border)',
              background: fl > 0 ? `rgba(0,213,126,${0.14 * fl})` : sel ? 'var(--primary-tint)' : 'transparent'
            }}
          >
            <Check on={sel} anchor={`chk-${u.id}`} />
            <span className="text-muted-foreground">{u.id}</span>
            <span className="text-foreground">{u.user}</span>
            <span className="font-semibold text-foreground">{u.name}</span>
            <span>
              <StatusBadge color="#00D57E">Activo</StatusBadge>
            </span>
            <span data-anchor={`cell-${u.id}`}>
              <DeliveryBadge v={s.values[u.id] ?? u.delivery} />
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

// ── 4. Gestión de Preferencias (BulkPreferencesManagement) ───────────────────────────────

export type PrefsState = {
  pane: number;
  /** Valor elegido en el RadioButtonGroupInput. */
  value: DeliveryOpt;
  /** Resalte por opción (-1, 1, 0) y del bloque Modo Delivery. */
  glowOpt: Record<string, number>;
  glowBlock: number;
  applyPress: number;
  count: number;
  /** 0..1 diálogo de conflictos. */
  conflicts: number;
};

const SectionHeader: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-foreground)', paddingBottom: 8, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>{children}</div>
);

const SwitchInput: FC<{ checked: boolean; label: string }> = ({ checked, label }) => (
  <div className="mt-2 mb-2 flex items-center gap-2" style={{ marginBottom: 14 }}>
    <Switch checked={checked} />
    <label className="cursor-pointer text-sm text-foreground select-none">{label}</label>
  </div>
);

const RadioItem: FC<{ checked: boolean; label: string; glow: number; anchor: string }> = ({ checked, label, glow, anchor }) => (
  <div className="flex items-center gap-2" style={{ marginBottom: 14, padding: '4px 8px', marginLeft: -8, width: 'fit-content', ...ring(glow) }} data-anchor={anchor}>
    <span
      data-slot="radio-group-item"
      data-state={checked ? 'checked' : 'unchecked'}
      className="relative aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs"
      style={checked ? { borderColor: 'var(--primary)' } : undefined}
    >
      {checked && <Circle className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />}
    </span>
    <label className="form-label mb-0 cursor-pointer" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13.5, color: 'var(--foreground)', fontWeight: 500 }}>
      {label}
    </label>
  </div>
);

const OPTIONS: { v: DeliveryOpt; label: string }[] = [
  { v: -1, label: 'Igual que la organización' },
  { v: 1, label: 'Activado' },
  { v: 0, label: 'Desactivado' }
];

export const PrefsPane: FC<{ s: PrefsState }> = ({ s }) => (
  <Pane title="Gestión de Preferencias" width={608} p={s.pane}>
    <div className="bulk-preferences-management">
      <SectionHeader>Configuraciones Generales</SectionHeader>
      <SwitchInput checked label="Check-in automático" />
      <SwitchInput checked={false} label="Check-out automático por horario" />
      <SwitchInput checked={false} label="Modo sin ubicación en segundo plano" />
      <div data-anchor="delivery-block" style={{ marginTop: 18, padding: 8, marginLeft: -8, ...ring(s.glowBlock) }}>
        <div className="form-label" title="La pantalla Hoy de la app se enfoca en entregar las órdenes de cada job. Por defecto usa el valor de la organización (Configuración de Jobs).">
          Modo Delivery
        </div>
        <div className="grid gap-3" style={{ marginTop: 10 }}>
          {OPTIONS.map((o) => (
            <RadioItem key={o.v} checked={s.value === o.v} label={o.label} glow={s.glowOpt[String(o.v)] ?? 0} anchor={`opt-${o.v}`} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        <SectionHeader>Configuraciones de Check-in</SectionHeader>
        <div className="form-label">Ubicaciones permitidas para check-in:</div>
      </div>
      <div className="flex justify-end gap-2" style={{ marginTop: 28 }}>
        <Button variant="soft-secondary">Restablecer</Button>
        <button
          type="button"
          data-anchor="apply"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground"
          style={{ transform: `scale(${1 - 0.06 * s.applyPress})` }}
        >
          Aplicar a Todos los Usuarios ({s.count})
        </button>
      </div>
    </div>
  </Pane>
);

/** Diálogo "Conflictos Detectados" del PR, con la diferencia del Modo Delivery. */
export const ConflictsDialog: FC<{ p: number; groups: { v: DeliveryOpt; users: string[] }[] }> = ({ p, groups }) => {
  if (p <= 0.01) return null;
  const badge = (v: DeliveryOpt) => (v === 1 ? 'bg-success text-success-foreground' : v === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground');
  const label = (v: DeliveryOpt) => (v === 1 ? 'Activado' : v === 0 ? 'Desactivado' : 'Igual que la organización');
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.45 * p})`, zIndex: 1100 }} />
      <div
        data-slot="dialog-content"
        data-anchor="conflicts"
        className="grid w-full gap-4 rounded-card border bg-popover p-6 shadow-float"
        style={{ position: 'absolute', left: '50%', top: '50%', width: 512, transform: `translate(-50%, -50%) scale(${0.95 + 0.05 * p})`, opacity: p, zIndex: 1101 }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-lg leading-none font-semibold">
            <TriangleAlert size={20} className="me-2" style={{ marginRight: 8 }} />
            Conflictos Detectados
          </div>
        </div>
        <div className="relative w-full rounded-lg border border-warning/30 bg-warning/15 px-4 py-3 text-sm text-warning">Se detectaron diferencias en las configuraciones entre usuarios.</div>
        <div style={{ border: '2px solid #dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', borderRadius: 8, padding: 12 }}>
          <div className="flex items-center" style={{ paddingBottom: '0.5rem', marginBottom: 6 }}>
            <strong style={{ color: '#721c24', marginRight: '0.75rem' }}>Modo Delivery</strong>
            <span className="inline-flex items-center rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">Conflicto</span>
          </div>
          {groups.map((g) => (
            <div key={g.v} className="text-sm" style={{ marginBottom: 6 }}>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badge(g.v))} style={{ marginRight: '0.75rem' }}>
                {label(g.v)}
              </span>
              <span style={{ color: '#000', fontWeight: 500 }}>
                {g.users.length} usuario{g.users.length !== 1 ? 's' : ''}: {g.users.join(', ')}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="inline-flex h-9 items-center rounded-md bg-warning px-4 text-sm font-medium text-warning-foreground">
            Aplicar Valores Mayoritarios
          </button>
          <button type="button" data-anchor="understood" className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground">
            Entendido
          </button>
        </div>
      </div>
    </>
  );
};

export { IcoIcon, X };
