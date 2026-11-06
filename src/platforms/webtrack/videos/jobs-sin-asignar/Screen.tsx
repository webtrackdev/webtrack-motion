// Replica de Jobs > Calendario (reactive PR #1754, front de DevDatabase#365, solo lectura):
// filtro Responsable con "Sin asignar", fila "Sin asignar" agrupando por responsable y su
// detalle del dia. HTML, clases Tailwind y textos reales; datos ficticios.
// La matriz filtrada vive siempre en el DOM (encima de la completa) para medir sus anclas.
import type { FC, ReactNode } from 'react';
import {
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  MapPin,
  RotateCw,
  Search,
  Tag,
  Timer,
  UserRound,
  X
} from 'lucide-react';
import { IcoIcon } from '../../components/IcoIcon';
import {
  HubTabsRow,
  JOB_CARD_CLASS,
  JobsPageHeader,
  KpiCards,
  PRIORITY_DOT,
  STATUS_COLOR,
  STATUS_LABEL,
  StatusBadge,
  SwitchUI,
  ToolbarButton,
  UserInitials,
  cn,
  type KpiItem
} from '../../components/jobshub-kit';

export type SinAsignarState = {
  frame: number;
  /** Desplazamiento vertical de la pagina (px de UI). */
  scroll: number;
  /** 0..1 resalte de la fila "Sin asignar" en la matriz completa. */
  rowGlow: number;
  /** 0..1 popover del filtro Responsable. */
  popover: number;
  /** Fila del popover bajo el cursor. */
  hoverOption: number | null;
  /** Ya se eligio "Sin asignar". */
  filtered: boolean;
  /** 0..1 aparicion de la fila de chips activos (empuja la pagina CHIPS_H px). */
  chips: number;
  triggerPress: number;
  /** Celda elegida (abre el detalle) y 0..1 de su despliegue. */
  cellPicked: boolean;
  detail: number;
};

type Level = 'red' | 'orange' | 'yellow' | 'green';
type Cell = { jobs: number; pct: number | null };

const LEVEL_CELL: Record<Level, string> = {
  green: 'bg-level-green-tint text-level-green-text',
  yellow: 'bg-level-yellow-tint text-level-yellow-text',
  orange: 'bg-level-orange-tint text-level-orange-text',
  red: 'bg-level-red-tint text-level-red-text'
};
const LEVEL_SWATCH: Record<Level, string> = {
  green: 'bg-level-green-border',
  yellow: 'bg-level-yellow-border',
  orange: 'bg-level-orange-border',
  red: 'bg-level-red-border'
};
const LEVEL_PILL: Record<Level, string> = {
  green: 'border-level-green-border bg-level-green-tint text-level-green-text',
  yellow: 'border-level-yellow-border bg-level-yellow-tint text-level-yellow-text',
  orange: 'border-level-orange-border bg-level-orange-tint text-level-orange-text',
  red: 'border-level-red-border bg-level-red-tint text-level-red-text'
};
// Umbrales por defecto de cumplimiento (DEFAULT_THRESHOLDS.compliance = 70, 85, 95)
const levelOf = (pct: number): Level => (pct < 70 ? 'red' : pct < 85 ? 'orange' : pct < 95 ? 'yellow' : 'green');

export const DAYS = [
  { key: 'mon', label: 'lun 2' },
  { key: 'tue', label: 'mar 3' },
  { key: 'wed', label: 'mié 4' },
  { key: 'thu', label: 'jue 5' },
  { key: 'fri', label: 'vie 6', today: true }
];

type Row = { name: string; unassigned?: boolean; cells: Cell[] };
const c = (jobs: number, pct: number | null): Cell => ({ jobs, pct });
const ROWS: Row[] = [
  { name: 'Andrea López', cells: [c(5, 100), c(6, 83), c(4, 100), c(5, 100), c(6, null)] },
  { name: 'Bruno Castillo', cells: [c(6, 100), c(5, 100), c(7, 86), c(6, 100), c(5, null)] },
  { name: 'Carla Méndez', cells: [c(4, 75), c(5, 60), c(4, 50), c(3, 67), c(4, null)] },
  { name: 'Diego Ramírez', cells: [c(5, 100), c(4, 100), c(6, 100), c(5, 80), c(5, null)] },
  { name: 'Sin asignar', unassigned: true, cells: [c(3, 33), c(2, 50), c(4, 75), c(1, 100), c(2, null)] }
];
const ROW_TOTAL: Record<string, Cell> = {
  'Andrea López': c(26, 95),
  'Bruno Castillo': c(29, 92),
  'Carla Méndez': c(20, 69),
  'Diego Ramírez': c(25, 95),
  'Sin asignar': c(12, 60)
};
const TOTALS_ALL: Cell[] = [c(23, 87), c(22, 82), c(25, 84), c(20, 90), c(22, null)];
const TOTAL_ALL = c(112, 86);
export const PICK_DAY = 1; // mar 3
/** Alto que suma la fila de chips activos (chip de 26 px + gap de 12 px). */
export const CHIPS_H = 38;

const UNASSIGNED = ROWS[ROWS.length - 1];

const CellValue: FC<{ cell: Cell; compact?: boolean }> = ({ cell, compact }) => (
  <span className="inline-flex items-baseline gap-1 tabular-nums">
    <span className="text-sm font-bold">{cell.jobs}</span>
    {!compact && <span className="text-xs font-semibold opacity-80">{cell.jobs === 1 ? 'job' : 'jobs'}</span>}
  </span>
);

// Hoy (en curso) no se evalua: celda neutra con el numero de jobs
const cellClass = (cell: Cell) => (cell.pct == null ? 'bg-muted text-label-foreground' : LEVEL_CELL[levelOf(cell.pct)]);

const GRID = { gridTemplateColumns: '232px 96px repeat(5, minmax(84px, 1fr))' };

const Matrix: FC<{ rows: Row[]; totals: Cell[]; total: Cell; s: SinAsignarState; filteredView?: boolean; children?: ReactNode }> = ({
  rows,
  totals,
  total,
  s,
  filteredView,
  children
}) => (
  <div className="rounded-card border border-border bg-card" style={{ overflow: 'hidden' }}>
    <div className="grid" style={GRID}>
      <div className="flex items-center border-b border-border bg-table-head px-4 text-th text-label-foreground uppercase" style={{ height: 40 }}>
        Responsable
      </div>
      <div className="flex items-center border-r-2 border-b border-border bg-table-head px-2 text-th text-label-foreground uppercase" style={{ height: 40 }}>
        Total
      </div>
      {DAYS.map((day) => (
        <div
          key={day.key}
          className={cn(
            'flex items-center justify-center gap-1 border-b border-border text-th uppercase',
            day.today ? 'border-t-2 border-t-primary bg-primary-tint text-primary-ink' : 'bg-table-head text-label-foreground'
          )}
          style={{ height: 40 }}
        >
          {day.label}
          {day.today && <span className="rounded-full bg-primary px-1.5 text-badge text-primary-foreground normal-case">Hoy</span>}
        </div>
      ))}

      <div className="flex items-center border-b-2 border-border bg-muted px-4 text-th text-label-foreground uppercase">Total del día</div>
      <div className="border-r-2 border-b-2 border-border bg-muted p-1">
        <div className={cn('flex h-11 items-center justify-center rounded-inner px-2', cellClass(total))}>
          <CellValue cell={total} compact />
        </div>
      </div>
      {totals.map((cell, i) => (
        <div key={i} className="border-b-2 border-border bg-muted p-1">
          <div className={cn('flex h-11 items-center justify-center rounded-inner px-1', cellClass(cell))}>
            <CellValue cell={cell} />
          </div>
        </div>
      ))}

      {rows.map((row) => {
        const rowTotal = ROW_TOTAL[row.name];
        const glow = row.unassigned && !filteredView ? s.rowGlow : 0;
        const expanded = filteredView && row.unassigned && s.cellPicked;
        const rowBg = expanded ? 'bg-primary-tint' : '';
        const glowStyle = glow > 0.01 ? { boxShadow: `inset 0 0 0 2px rgba(4,14,255,${0.55 * glow})`, background: `rgba(4,14,255,${0.06 * glow})` } : undefined;
        return (
          <div key={row.name} className="contents">
            <div
              data-anchor={filteredView ? undefined : row.unassigned ? 'row-unassigned' : undefined}
              className={cn('flex min-w-0 items-center gap-2.5 border-b border-border-subtle bg-card px-4', rowBg)}
              style={{ height: 52, ...glowStyle }}
            >
              <UserInitials name={row.unassigned ? '-' : row.name} muted={row.unassigned} />
              <span className="min-w-0 py-1.5">
                <span className="block truncate text-sm font-bold text-heading-foreground">{row.name}</span>
                <span className="block truncate text-meta text-muted-foreground">{rowTotal.pct} % cumplido</span>
              </span>
            </div>
            <div className={cn('border-r-2 border-r-border border-b border-b-border-subtle bg-muted p-1', rowBg)} style={glowStyle}>
              <div className={cn('flex h-11 items-center justify-center rounded-inner px-2', cellClass(rowTotal))}>
                <CellValue cell={rowTotal} compact />
              </div>
            </div>
            {row.cells.map((cell, i) => {
              const selected = expanded && i === PICK_DAY;
              return (
                <div key={i} className={cn('border-b border-border-subtle p-1', rowBg)} style={glowStyle}>
                  <div
                    data-anchor={filteredView && row.unassigned ? `fcell-${i}` : undefined}
                    className={cn('relative flex h-11 w-full items-center justify-center rounded-inner px-2', cellClass(cell), selected && 'ring-2 ring-primary')}
                  >
                    <CellValue cell={cell} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      {children}
    </div>
  </div>
);

type DetailJob = { id: number; priority: 1 | 2 | 3; status: number; title: string; typeIcon: string; type: string; location: string; est: string; range: string };
const NOT_COMPLIANT: DetailJob[] = [
  { id: 4812, priority: 1, status: 4, title: 'Revisión de báscula', typeIcon: 'Maintainance', type: 'Mantenimiento', location: 'Bodega Central', est: 'Est. 45 min', range: '09:00 – 10:00' }
];
const COMPLIANT: DetailJob[] = [
  { id: 4809, priority: 3, status: 3, title: 'Entrega de repuestos', typeIcon: 'Delivery', type: 'Entregar', location: 'CEDI Norte', est: 'Est. 30 min (por tipo)', range: '11:30 – 12:00' }
];

const JobCard: FC<{ job: DetailJob }> = ({ job }) => (
  <div className={cn(JOB_CARD_CLASS, 'min-w-0', job.status === 4 ? 'border-danger-tint-border' : 'border-border')}>
    <div className="flex items-center gap-2 text-meta font-bold text-muted-foreground">
      <span className="tabular-nums">#{job.id}</span>
      <span className={PRIORITY_DOT[job.priority]} aria-hidden="true" />
      <StatusBadge color={STATUS_COLOR[job.status]} className="shrink-0">
        {STATUS_LABEL[job.status]}
      </StatusBadge>
    </div>
    <p className="mb-0 line-clamp-2 text-sm leading-snug font-bold text-heading-foreground">{job.title}</p>
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <IcoIcon name={job.typeIcon} size={12} />
        {job.type}
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{job.location}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Timer className="size-3" />
        {job.est}
      </span>
    </div>
    <div className="mt-0.5 flex items-center justify-end gap-2">
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
        <Clock className="size-3" />
        {job.range}
      </span>
    </div>
  </div>
);

const Detail: FC<{ s: SinAsignarState }> = ({ s }) => (
  <div className="border-b-2 border-primary-tint-border bg-background" style={{ gridColumn: '1 / -1', opacity: s.detail, visibility: s.detail > 0.01 ? 'visible' : 'hidden' }}>
    <section className="flex flex-col gap-4 p-4 sm:px-6" style={{ transform: `translateY(${(1 - s.detail) * -10}px)` }}>
      <div className="flex flex-wrap items-center gap-3">
        <UserInitials name="-" muted className="size-8 text-xs" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-card-title text-heading-foreground">Sin asignar</span>
          <span className="text-meta text-muted-foreground">martes, 3 de noviembre de 2026</span>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {[<ChevronLeft key="l" className="size-4" />, <ChevronRight key="r" className="size-4" />, <X key="x" className="size-4" />].map((icon, i) => (
            <span key={i} className="inline-flex size-9 items-center justify-center rounded-md border border-neutral-tint-border bg-control-muted text-label-foreground">
              {icon}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={cn('rounded-full border px-3 py-1 text-sm font-bold', LEVEL_PILL.red)}>50 % · Crítico</span>
        <span className="text-sm font-semibold text-label-foreground">1 de 2 cumplidos · 1 sin cumplir</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="form-label mb-0 inline-flex items-center gap-1.5">
            <CircleAlert className="size-3.5" />
            No cumplidos (1)
          </span>
          {NOT_COMPLIANT.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="form-label mb-0 inline-flex items-center gap-1.5">
            <CircleCheck className="size-3.5" />
            Cumplidos (1)
          </span>
          {COMPLIANT.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  </div>
);

const USERS = ['Andrea López', 'Bruno Castillo', 'Carla Méndez', 'Diego Ramírez', 'Elena Vargas'];
const triggerBase = 'inline-flex h-(--app-control-h-sm) items-center gap-2 rounded-control border px-3 text-sm font-semibold transition-colors';
const idle = 'border-input bg-card text-label-foreground';
const active = 'border-primary-tint-border bg-primary-tint text-primary-ink';

const CheckBox: FC<{ on: boolean }> = ({ on }) => (
  <span
    className={cn('inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card')}
  >
    {on && <Check className="size-3.5" strokeWidth={3} />}
  </span>
);

const ResponsiblePopover: FC<{ s: SinAsignarState }> = ({ s }) => (
  <div
    className="w-64 rounded-md border border-border bg-card p-0 shadow-overlay"
    style={{
      position: 'absolute',
      left: 0,
      top: 'calc(100% + 6px)',
      zIndex: 60,
      opacity: s.popover,
      transform: `translateY(${(1 - s.popover) * -6}px)`,
      visibility: s.popover > 0.01 ? 'visible' : 'hidden'
    }}
  >
    <div className="px-3 pt-3 pb-2 text-card-title text-heading-foreground">Responsable</div>
    <div className="px-3 pb-2">
      <label className="flex h-(--app-control-h-sm) items-center gap-2 rounded-control border border-input bg-field px-2.5">
        <Search className="size-4 text-muted-foreground" />
        <span className="text-sm text-placeholder">Buscar...</span>
      </label>
    </div>
    <div className="px-1.5 pb-1.5">
      {['Sin asignar', ...USERS].map((name, i) => {
        const checked = i === 0 && s.filtered;
        return (
          <div
            key={name}
            data-anchor={`opt-${i}`}
            className={cn(
              'flex items-center gap-2.5 rounded-nav px-2 py-1.5 text-sm font-medium tracking-normal text-foreground normal-case',
              checked ? 'bg-primary-tint' : s.hoverOption === i ? 'bg-surface-hover' : ''
            )}
          >
            <CheckBox on={checked} />
            <UserInitials name={i === 0 ? '-' : name} muted={i === 0} />
            <span className="truncate">{name}</span>
          </div>
        );
      })}
    </div>
    <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
      <span>{s.filtered ? '1 de 6' : 'Todos'}</span>
      <span className={cn('font-bold text-primary-ink', !s.filtered && 'opacity-50')}>Limpiar</span>
    </div>
  </div>
);

// Los chips no cambian el layout medido (las anclas se miden una vez, en cualquier frame):
// la superficie de la tarjeta crece con un fondo absoluto y lo de abajo baja con transform.
const FilterBar: FC<{ s: SinAsignarState }> = ({ s }) => (
  <section className="relative flex flex-col gap-3 p-4" style={{ zIndex: 20 }}>
    <div className="surface-card" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: -CHIPS_H * s.chips, zIndex: -1 }} />
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="form-label mb-0">Periodo</span>
        <div className="flex items-center gap-1 rounded-control border border-input bg-card p-0.5">
          <button type="button" className="h-8 rounded-nav bg-primary-tint px-3 text-sm font-semibold text-primary-ink">
            Semana
          </button>
          <button type="button" className="h-8 rounded-nav px-3 text-sm font-semibold text-label-foreground">
            Mes
          </button>
          <span className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
          <span className="flex h-8 items-center justify-center rounded-nav px-2 text-label-foreground">
            <ChevronLeft className="size-4" />
          </span>
          <span className="min-w-[150px] px-1 text-center text-sm font-bold text-heading-foreground">2 nov – 8 nov 2026</span>
          <span className="flex h-8 items-center justify-center rounded-nav px-2 text-label-foreground">
            <ChevronRight className="size-4" />
          </span>
          <span className="h-8 rounded-nav px-3 text-sm leading-8 font-semibold text-muted-foreground">Hoy</span>
        </div>
      </div>
      <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
      <button type="button" className={cn(triggerBase, idle)}>
        <Building2 className="size-4" />
        <span>Afiliación</span>
        <ChevronDown className="size-4 opacity-70" />
      </button>
      <span className="relative inline-flex">
        <button
          type="button"
          data-anchor="f-resp"
          className={cn(triggerBase, s.filtered ? active : s.popover > 0.5 ? 'border-input bg-surface-hover text-label-foreground' : idle)}
          style={{ transform: `scale(${1 - 0.05 * s.triggerPress})` }}
        >
          <span className="flex size-4 items-center justify-center [&_svg]:size-4">
            <UserRound />
          </span>
          <span>Responsable{s.filtered ? ': 1' : ''}</span>
          <ChevronDown className="size-4 opacity-70" />
        </button>
        <ResponsiblePopover s={s} />
      </span>
      <button type="button" className={cn(triggerBase, idle)}>
        <span className="flex size-4 items-center justify-center [&_svg]:size-4">
          <Tag />
        </span>
        <span>Tipo</span>
        <ChevronDown className="size-4 opacity-70" />
      </button>
    </div>
    {/* Chips activos: aparecen al filtrar y empujan la pagina, como en la app */}
    <div className="flex flex-wrap items-center gap-2" style={{ position: 'absolute', left: 16, top: 'calc(100% - 4px)', height: 26, opacity: s.chips, visibility: s.chips > 0.01 ? 'visible' : 'hidden' }}>
      <span className="form-label mb-0">Filtros activos</span>
      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-tint-border bg-primary-tint py-1 ps-3 pe-1.5 text-xs font-semibold text-primary-ink">
        <span className="truncate">
          Responsable: <strong>Sin asignar</strong>
        </span>
        <span className="flex size-5 items-center justify-center rounded-full">
          <X className="size-3.5" />
        </span>
      </span>
      <span className="text-xs font-bold text-primary-ink">Limpiar todo</span>
    </div>
  </section>
);

const CalendarToolbar: FC = () => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="form-label mb-0">Agrupar por</span>
    <div className="flex items-center gap-1 rounded-control border border-input bg-card p-0.5">
      {['Responsable', 'Sucursal', 'Tipo de job'].map((label, i) => (
        <button key={label} type="button" className={cn('h-8 rounded-nav px-3 text-sm font-semibold', i === 0 ? 'bg-primary-tint text-primary-ink' : 'text-label-foreground')}>
          {label}
        </button>
      ))}
    </div>
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-label-foreground">
      <SwitchUI checked={false} />
      Fines de semana
    </label>
    <div className="ms-auto flex items-center gap-2">
      <ToolbarButton icon="Settings" />
    </div>
  </div>
);

const kpis = (filtered: boolean): KpiItem[] => [
  {
    key: 'all',
    title: 'Cumplimiento',
    icon: <CalendarCheck />,
    tone: 'success',
    value: filtered ? '60 %' : '86 %',
    detail: filtered ? '6 de 10 jobs cumplidos' : '77 de 90 jobs cumplidos'
  },
  { key: 'incomplete', title: 'Incompletos', icon: <CircleAlert />, tone: 'danger', value: filtered ? 3 : 9 },
  { key: 'requests', title: 'Solicitudes de reprog.', icon: <RotateCw />, tone: 'info', value: filtered ? 1 : 3 },
  { key: 'canceled', title: 'Cancelados', icon: <X />, tone: 'warning', value: filtered ? 0 : 1 },
  {
    key: 'red',
    title: 'Responsables en rojo',
    icon: <CircleCheck />,
    tone: 'danger',
    value: filtered ? 0 : 1,
    alert: !filtered,
    detail: 'Crítico'
  }
];

const Legend: FC = () => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
    <span className="form-label mb-0">% de cumplimiento</span>
    <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs font-semibold text-label-foreground">
      {(
        [
          ['red', 'Crítico', '< 70 %'],
          ['orange', 'Bajo', '70–85 %'],
          ['yellow', 'Aceptable', '85–95 %'],
          ['green', 'Cumplido', '≥ 95 %']
        ] as [Level, string, string][]
      ).map(([color, name, range]) => (
        <li key={name} className="inline-flex items-center gap-1.5">
          <span className={cn('size-3 rounded-inner', LEVEL_SWATCH[color])} aria-hidden="true" />
          {name} <span className="font-normal text-muted-foreground">{range}</span>
        </li>
      ))}
      <li className="text-muted-foreground">Hoy y días futuros no se evalúan</li>
    </ul>
  </div>
);

export const SinAsignarScreen: FC<{ s: SinAsignarState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', overflow: 'hidden' }}>
    <div className="flex flex-col gap-4" style={{ padding: '22px 28px 40px', transform: `translateY(${-s.scroll}px)` }}>
      <JobsPageHeader tab="calendar" />
      <HubTabsRow tab="calendar" lens="compliance" />
      <FilterBar s={s} />
      <div className="flex flex-col gap-4" style={{ transform: `translateY(${CHIPS_H * s.chips}px)` }}>
      <CalendarToolbar />
      <KpiCards items={kpis(s.filtered)} />
      <Legend />
      <div style={{ position: 'relative' }}>
        <div style={{ visibility: s.filtered ? 'hidden' : 'visible' }}>
          <Matrix rows={ROWS} totals={TOTALS_ALL} total={TOTAL_ALL} s={s} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, visibility: s.filtered ? 'visible' : 'hidden' }}>
          <Matrix rows={[UNASSIGNED]} totals={UNASSIGNED.cells} total={ROW_TOTAL['Sin asignar']} s={s} filteredView>
            {s.filtered && <Detail s={s} />}
          </Matrix>
        </div>
      </div>
      </div>
    </div>
  </div>
);
