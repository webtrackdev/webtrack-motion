// Piezas de la pantalla Jobs (hub de Monitor, Backlog y Calendario) compartidas por los videos
// jobs-calendario y jobs-novedades. Son replicas del HTML y de las clases Tailwind reales de
// reactive (PR #1754 y #1751, solo lectura): PageHeader, TabButton, ViewButton, JobsFilterBar,
// KpiCards sobre IndicatorsCard, UserInitials, StatusBadge, tarjeta de job y Toolbar.
// Los textos salen del i18n real de Jobs (es.json del PR).
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  AlarmClock,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CirclePlay,
  CircleQuestionMark,
  Columns3,
  Gauge,
  Inbox,
  List,
  Monitor,
  Plus,
  RefreshCw,
  Tag,
  UserRound
} from 'lucide-react';
import { IcoIcon } from './IcoIcon';
import './jobshub.css';

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ Button */
// Receta real de src/components/ui/button.tsx (solo las variantes y tallas que usa Jobs).
const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const BUTTON_VARIANT = {
  outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
  gradient: 'bg-(image:--brand-gradient) text-primary-foreground shadow-primary hover:brightness-[1.03]',
  'soft-primary': 'border border-primary-tint-border bg-primary-tint text-primary-ink hover:bg-primary-tint-strong',
  'soft-secondary': 'border border-neutral-tint-border bg-control-muted text-label-foreground hover:bg-surface-hover',
  'soft-info': 'border border-info-tint-border bg-info-tint text-info-ink hover:brightness-[0.97]'
};
const BUTTON_SIZE = {
  default: 'h-9 px-4 py-2 has-[>svg]:px-3',
  icon: 'size-9',
  field: 'h-(--app-control-h) px-4 has-[>svg]:px-3.5',
  cta: 'h-(--app-control-h) rounded-control px-5 has-[>svg]:px-4',
  'icon-field': 'size-(--app-control-h) rounded-control'
};

export const Button: FC<{
  variant?: keyof typeof BUTTON_VARIANT;
  size?: keyof typeof BUTTON_SIZE;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  anchor?: string;
  press?: number;
  style?: CSSProperties;
}> = ({ variant = 'outline', size = 'default', className, children, disabled, anchor, press = 0, style }) => (
  <button
    type="button"
    data-slot="button"
    data-variant={variant}
    data-size={size}
    data-anchor={anchor}
    disabled={disabled}
    className={cn(BUTTON_BASE, BUTTON_VARIANT[variant], BUTTON_SIZE[size], disabled && 'disabled:opacity-50', className)}
    style={{ transform: press > 0 ? `scale(${1 - press * 0.06})` : undefined, ...style }}
  >
    {children}
  </button>
);

/** DefaultButton del toolbar: botón-icono IcoMoon (variante soft-*, `btn-icon`). */
export const ToolbarButton: FC<{ icon: string; variant?: 'soft-secondary' | 'soft-primary' | 'soft-info'; disabled?: boolean; anchor?: string; press?: number }> = ({
  icon,
  variant = 'soft-secondary',
  disabled,
  anchor,
  press
}) => (
  <Button variant={variant} className={cn('btn-icon', disabled && 'disabled')} disabled={disabled} anchor={anchor} press={press}>
    <IcoIcon name={icon} size={16} />
  </Button>
);

/* ---------------------------------------------------------------- IconTile */
const TILE_TONE: Record<string, string> = {
  primary: '',
  success: 'icon-tile--success',
  warning: 'icon-tile--warning',
  danger: 'icon-tile--danger',
  info: 'icon-tile--info',
  violet: 'icon-tile--violet',
  neutral: 'icon-tile--neutral'
};
export const IconTile: FC<{ tone?: string; size?: 'sm' | 'md' | 'lg'; icon: ReactNode; anchor?: string }> = ({ tone = 'primary', size = 'md', icon, anchor }) => (
  <div data-slot="icon-tile" data-anchor={anchor} className={cn('icon-tile', TILE_TONE[tone], size === 'sm' && 'icon-tile--sm', size === 'lg' && 'icon-tile--lg')}>
    {icon}
  </div>
);

/* ----------------------------------------------------------- UserInitials */
const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const UserInitials: FC<{ name: string; muted?: boolean; className?: string }> = ({ name, muted = false, className }) => (
  <span
    title={name}
    className={cn(
      'inline-flex size-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full border text-badge font-extrabold',
      muted ? 'border-dashed border-input bg-card text-muted-foreground' : 'border-primary-tint-border bg-primary-tint text-primary-ink',
      className
    )}
  >
    {initialsOf(name)}
  </span>
);

/* ------------------------------------------------------------ StatusBadge */
export const StatusBadge: FC<{ color: string; children: ReactNode; className?: string }> = ({ color, children, className }) => (
  <span
    data-slot="status-badge"
    data-tone="custom"
    className={cn('status-badge status-badge--custom', className)}
    style={{ '--status-badge-color': color } as CSSProperties}
  >
    <span className="status-dot" aria-hidden="true" />
    {children}
  </span>
);

/* -------------------------------------------------------------- PageHeader */
export type HubTab = 'monitor' | 'backlog' | 'calendar';
export const TAB_LABEL: Record<HubTab, string> = { monitor: 'Monitor', backlog: 'Backlog', calendar: 'Calendario' };
export const SUBTITLE: Record<HubTab, string> = {
  monitor: 'Lo que está pasando en el periodo: trabajo en curso, atrasado y por cerrar.',
  backlog: 'Lo que viene: trabajo sin programar y programado a partir de mañana.',
  calendar: 'Carga y cumplimiento por responsable y día.'
};

export const TourHelpButton: FC<{ anchor?: string; press?: number }> = ({ anchor, press = 0 }) => (
  <span className="inline-flex" data-tour="helpButton">
    <button
      id="jobsHubHelpButton"
      data-anchor={anchor}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1.5px solid #040EFF',
        background: press > 0.5 ? '#040EFF' : 'transparent',
        color: press > 0.5 ? '#fff' : '#040EFF',
        padding: 0,
        flexShrink: 0
      }}
    >
      <CircleQuestionMark size={16} />
    </button>
  </span>
);

export const JobsPageHeader: FC<{ tab: HubTab; refreshing?: boolean; helpAnchor?: string; helpPress?: number }> = ({ tab, refreshing, helpAnchor, helpPress }) => (
  <div className="page-header" data-testid="page-header">
    <nav aria-label="breadcrumb" data-slot="breadcrumb" className="page-breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm break-words text-inherit sm:gap-1.5">
        <li className="inline-flex items-center gap-1.5">
          <span>Jobs</span>
        </li>
        <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
          <ChevronRight />
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span data-slot="breadcrumb-page" role="link" aria-current="page" aria-disabled="true" className="font-normal text-foreground">
            {TAB_LABEL[tab]}
          </span>
        </li>
      </ol>
    </nav>
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0">
          <h1 className="page-title" data-testid="page-title">
            Jobs
          </h1>
          <p className="page-subtitle">{SUBTITLE[tab]}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2">
          <TourHelpButton anchor={helpAnchor} press={helpPress} />
          <Button variant="outline" size="icon-field" disabled={refreshing}>
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="gradient" size="cta">
            <Plus className="size-4" />
            Nuevo Job
          </Button>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------ Tabs y vista */
export const TabButton: FC<{ active: boolean; icon: ReactNode; label: string; count?: number; anchor?: string; press?: number; hover?: boolean }> = ({
  active,
  icon,
  label,
  count,
  anchor,
  press = 0,
  hover
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    data-anchor={anchor}
    className={cn(
      'inline-flex h-(--app-control-h) items-center gap-2 rounded-control px-4 text-sm font-bold transition-colors',
      active ? 'bg-primary-tint text-primary-ink' : hover ? 'bg-surface-hover text-label-foreground' : 'text-label-foreground hover:bg-surface-hover'
    )}
    style={{ transform: press > 0 ? `scale(${1 - press * 0.05})` : undefined }}
  >
    {icon}
    {label}
    {count != null && (
      <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold tabular-nums', active ? 'bg-card text-primary-ink' : 'bg-surface-hover text-muted-foreground')}>{count}</span>
    )}
  </button>
);

export const ViewButton: FC<{ active: boolean; icon?: ReactNode; label: string; disabled?: boolean; anchor?: string; press?: number }> = ({ active, icon, label, disabled, anchor, press = 0 }) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    aria-disabled={disabled}
    data-anchor={anchor}
    className={cn(
      'inline-flex h-8 items-center gap-1.5 rounded-nav px-3 text-sm font-semibold transition-colors',
      disabled ? 'cursor-not-allowed text-muted-foreground opacity-60' : active ? 'bg-primary-tint text-primary-ink' : 'text-label-foreground hover:bg-surface-hover'
    )}
    style={{ transform: press > 0 ? `scale(${1 - press * 0.06})` : undefined }}
  >
    {icon}
    {label}
  </button>
);

export const Segmented: FC<{ children: ReactNode; className?: string; anchor?: string }> = ({ children, className, anchor }) => (
  <div role="radiogroup" data-anchor={anchor} className={cn('flex items-center gap-1 rounded-control border border-input bg-card p-0.5', className)}>
    {children}
  </div>
);

/** Fila de pestañas del hub (con el selector de vista del Calendario a la derecha). */
export const HubTabsRow: FC<{
  tab: HubTab;
  lens: 'compliance' | 'load';
  tabPress?: number;
  tabHover?: boolean;
  lensPress?: number;
  monitorView?: 'list' | 'board';
  right?: 'auto' | 'none';
  tabsAnchor?: string;
}> = ({ tab, lens, tabPress = 0, tabHover, lensPress = 0, monitorView = 'list', tabsAnchor }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div role="tablist" className="flex items-center gap-1" data-tour="tabs" data-anchor={tabsAnchor}>
      <TabButton active={tab === 'monitor'} icon={<Monitor className="size-4" />} label="Monitor" count={42} anchor="tab-monitor" />
      <TabButton active={tab === 'backlog'} icon={<Inbox className="size-4" />} label="Backlog" count={31} anchor="tab-backlog" />
      <TabButton active={tab === 'calendar'} icon={<CalendarDays className="size-4" />} label="Calendario" anchor="tab-calendar" press={tabPress} hover={tabHover} />
    </div>
    {tab === 'monitor' && (
      <div className="flex items-center gap-2">
        <span className="form-label mb-0">Vista</span>
        <Segmented>
          <ViewButton active={monitorView === 'list'} icon={<List className="size-4" />} label="Lista" />
          <ViewButton active={monitorView === 'board'} icon={<Columns3 className="size-4" />} label="Tablero" />
        </Segmented>
      </div>
    )}
    {tab === 'calendar' && (
      <div className="flex items-center gap-2">
        <span className="form-label mb-0">Vista</span>
        <Segmented>
          <ViewButton active={lens === 'compliance'} icon={<CalendarCheck className="size-4" />} label="Cumplimiento" anchor="lens-compliance" />
          <ViewButton active={lens === 'load'} icon={<Gauge className="size-4" />} label="Carga" anchor="lens-load" press={lensPress} />
        </Segmented>
      </div>
    )}
  </div>
);

/* --------------------------------------------------------------- FilterBar */
const filterTrigger =
  'inline-flex h-(--app-control-h-sm) items-center gap-2 rounded-control border px-3 text-sm font-semibold transition-colors border-input bg-card text-label-foreground hover:bg-surface-hover';

const FilterTrigger: FC<{ icon: ReactNode; label: string }> = ({ icon, label }) => (
  <button type="button" className={filterTrigger}>
    <span className="flex size-4 items-center justify-center [&_svg]:size-4">{icon}</span>
    <span>{label}</span>
    <ChevronDown className="size-4 opacity-70" />
  </button>
);

export const JobsFilterBar: FC<{ period: ReactNode; anchor?: string }> = ({ period, anchor }) => (
  <section className="surface-card flex flex-col gap-3 p-4" data-tour="filters" data-anchor={anchor} aria-label="Filtros">
    <div className="flex flex-wrap items-center gap-2">
      {period}
      <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
      <button type="button" className={filterTrigger}>
        <Building2 className="size-4" />
        <span className="max-w-56 truncate">Afiliación</span>
        <ChevronDown className="size-4 opacity-70" />
      </button>
      <FilterTrigger icon={<UserRound />} label="Responsable" />
      <FilterTrigger icon={<Tag />} label="Tipo" />
    </div>
  </section>
);

/* ---------------------------------------------------------------- KpiCards */
export type KpiItem = { key: string; title: string; icon: ReactNode; tone: string; value: string | number; detail?: ReactNode; alert?: boolean };
const ALERT_SURFACE: Record<string, string> = {
  primary: 'border-primary-tint-border bg-primary-tint',
  success: 'border-success-tint-border bg-success-tint',
  info: 'border-info-tint-border bg-info-tint',
  violet: 'border-primary-tint-border bg-primary-tint',
  warning: 'border-warning-tint-border bg-warning-tint',
  danger: 'border-danger-tint-border bg-danger-tint'
};
const TONE_INK: Record<string, string> = {
  primary: 'var(--primary-ink)',
  success: 'var(--success-ink)',
  warning: 'var(--warning-ink)',
  danger: 'var(--destructive)',
  info: 'var(--info-ink)',
  violet: 'var(--accent-violet)',
  neutral: 'var(--label-foreground)'
};

export const KpiCards: FC<{ items: KpiItem[] }> = ({ items }) => (
  <div data-slot="row" className="flex flex-wrap -mx-4 mt-0">
    {items.map((item) => (
      <div key={item.key} data-slot="col" className="relative w-full min-w-0 px-4 grow basis-0 max-w-full">
        <div
          data-slot="card"
          className={cn(
            'flex flex-col rounded-lg border border-panel-border bg-panel text-card-foreground shadow-hairline gap-0 py-0 mb-3 webtrack h-full',
            item.alert && ALERT_SURFACE[item.tone]
          )}
          style={{ cursor: 'pointer' }}
        >
          <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 mb-2">
            <div className="flex min-w-0 items-center gap-2">
              <div data-slot="card-title" className="leading-none font-semibold mb-0 min-w-0">
                {item.title}
              </div>
            </div>
            <IconTile tone={item.tone} icon={item.icon} />
          </div>
          <div data-slot="card-content" className="px-6 indicator">
            <div className="flex items-center justify-start">
              <p className="big-number" style={{ color: TONE_INK[item.tone] }}>
                {item.value}
              </p>
              <div />
            </div>
            {item.detail != null && <p>{item.detail}</p>}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Indicadores del Monitor (hub-index: monitorCards) con datos ficticios. */
export const monitorCards: KpiItem[] = [
  { key: 'total', title: 'Total', icon: <Briefcase />, tone: 'primary', value: 42, detail: 'Prom. ejecución 1 h 12 min' },
  { key: 'finalized', title: 'Finalizadas', icon: <CircleCheck />, tone: 'success', value: 18, detail: '15 a tiempo · 3 tarde' },
  { key: 'active', title: 'En ejecución', icon: <CirclePlay />, tone: 'violet', value: 9, detail: '6 programadas · 2 pausadas' },
  { key: 'incomplete', title: 'Incompletas', icon: <CircleAlert />, tone: 'danger', value: 5, detail: '2 canceladas · 3 solicitudes de reprog.' },
  { key: 'overdue', title: 'Atrasados', icon: <AlarmClock />, tone: 'danger', value: 4, alert: true, detail: 'Abiertos y fuera de plazo' }
];

/* ----------------------------------------------------------------- Switch */
export const SwitchUI: FC<{ checked: boolean }> = ({ checked }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    data-slot="switch"
    data-size="default"
    data-state={checked ? 'checked' : 'unchecked'}
    className="peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
  >
    <span
      data-slot="switch-thumb"
      data-state={checked ? 'checked' : 'unchecked'}
      className="pointer-events-none block rounded-full bg-background ring-0 group-data-[size=default]/switch:size-4 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
    />
  </button>
);

/* ---------------------------------------------------------------- Toolbar */
/** Toolbar de listados: multiselección a la izquierda y acciones del cluster (todas sin selección). */
export const ActionsToolbar: FC<{ actions: string[]; anchor?: string }> = ({ actions, anchor }) => (
  <div data-tour="toolbar" data-anchor={anchor}>
    <div role="toolbar" className="btn-toolbar justify-end" style={{ margin: 0 }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <div className="btn-filter-toolbar">
          <div className="flex items-center multiselect-toolbar">
            <ToolbarButton icon="multiple" />
          </div>
        </div>
        <div className="group-btn-toolbar">
          {actions.map((icon) => (
            <ToolbarButton key={icon} icon={icon} disabled />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------ Tarjeta de job */
export const PRIORITY_DOT: Record<number, string> = {
  1: 'status-dot status-dot--danger',
  2: 'status-dot status-dot--warning',
  3: 'status-dot status-dot--success'
};
export const STATUS_COLOR: Record<number, string> = {
  1: '#7d39f6',
  2: '#ff7a00',
  3: '#22a06b',
  4: '#ff4459',
  5: '#1aa6fb',
  6: '#fd9800',
  7: '#490002',
  8: '#00ead5'
};
export const STATUS_LABEL: Record<number, string> = {
  1: 'En Ejecución',
  2: 'Pausado',
  3: 'Finalizado',
  4: 'Incompleto',
  5: 'Solicitud de Reprogramación',
  6: 'Programado',
  7: 'Cancelado',
  8: 'En Backlog'
};
export const TYPE_ICON: Record<number, string> = {
  1: 'Pickup',
  2: 'Delivery',
  3: 'PickupAndDelivery',
  4: 'LongProcess',
  5: 'Maintainance',
  6: 'Repair',
  7: 'Assistance',
  8: 'Visit',
  9: 'Emergency',
  10: 'Other',
  11: 'Meeting'
};
export const TYPE_LABEL: Record<number, string> = {
  1: 'Recoger',
  2: 'Entregar',
  3: 'Recoger y Entregar',
  4: 'Proceso Largo',
  5: 'Mantenimiento',
  6: 'Reparación',
  7: 'Asistencia',
  8: 'Visita',
  9: 'Emergencia',
  10: 'Otro',
  11: 'Reunión'
};
// Contenedor de la tarjeta de job (BoardCard.tsx)
export const JOB_CARD_CLASS =
  'flex flex-col gap-1.5 rounded-tile border bg-card p-3 text-start shadow-hairline transition-[opacity,box-shadow] outline-none hover:shadow-primary-sm focus-visible:ring-2 focus-visible:ring-ring';

export const MONITOR_TABS_ICON = { Monitor, Inbox, CalendarDays };
