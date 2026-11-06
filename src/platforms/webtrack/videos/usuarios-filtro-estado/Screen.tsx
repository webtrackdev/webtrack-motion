// Replica de Usuarios > Catalogo de Usuarios (/users/list, reactive/src/views/screens/Users/views/
// listUser): PageHeader, SmartFilter (SimpleCollapse + FilterSummary), Toolbar y la tabla.
// HTML y clases de los componentes reales (Card, Badge, Button, ButtonDropdown, combobox del
// DropdownInput); textos del i18n real. Lo que el cursor toca esta montado desde el frame 0.
// Simplificado: la tabla real es un Syncfusion Grid; aqui se dibuja con los valores de
// style.css (.e-grid) y sin barra de paginacion.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Funnel, Pencil, Plus, Search, Trash, X } from 'lucide-react';
import { IcoIcon } from '../../components/IcoIcon';
import '@webtrack/views/components/Toolbar/Toolbar.css';

export type StatusValue = -1 | 0;

export type UsersListState = {
  /** 0..1 cuerpo del SmartFilter (0 = colapsado con chips, 1 = abierto). */
  open: number;
  /** 0..1 menu "Filtros" (ButtonDropdown). */
  menu: number;
  menuHover: number | null;
  /** 0..1 aparicion del campo Estado. */
  addEstado: number;
  /** 0..1 lista del combobox de Estado. */
  statusOpen: number;
  statusHover: number | null;
  /** Valor del filtro Estado que ya se aplico (el chip). */
  applied: StatusValue;
  /** Valor elegido en el campo (puede ir por delante del aplicado). */
  value: StatusValue;
  /** El filtro Estado esta agregado (checkbox marcado). */
  estadoOn: boolean;
  searchPress: number;
  headerPress: number;
  /** 0..1 resalte del chip de Estado. */
  chipGlow: number;
  /** 0..1 recarga de la tabla. */
  reload: number;
  /** Filas que muestra la tabla. */
  dataset: 'activos' | 'desactivados';
};

const STATUS_COLORS: Record<number, string> = { 0: 'gray', 1: 'yellow', 2: 'lightCoral', 3: 'skyBlue' };
export const STATUS_OPTIONS = [
  { value: -1, label: 'Todos Activos' },
  { value: 0, label: 'Desactivado' },
  { value: 1, label: 'Activo' },
  { value: 2, label: 'Suspendido' },
  { value: 3, label: 'Invitado' }
];
const CHIP_LABEL: Record<number, string> = { [-1]: 'Todos Activos', 0: 'Desactivado' };

// --- Clases reales (copiadas de components/ui y de los componentes de la pantalla) ---
const BADGE =
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-(length:--text-badge) [line-height:var(--text-badge--line-height)] [font-weight:var(--text-badge--font-weight)] whitespace-nowrap';
const BTN =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4';
const BTN_FIELD = 'h-(--app-control-h) px-4 has-[>svg]:px-3.5';
const BTN_VARIANT = {
  secondary: 'bg-secondary text-secondary-foreground',
  gradient: 'bg-(image:--brand-gradient) text-primary-foreground shadow-primary'
};
const COMBO_TRIGGER =
  'flex h-(--app-control-h) w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-transparent px-3.5 py-1 text-sm outline-none border-input';

const Label: FC<{ children: ReactNode }> = ({ children }) => <label className="form-label">{children}</label>;

/** DropdownInput real: label + combobox (VirtualizedCombobox). */
const Dropdown: FC<{ label: string; value?: ReactNode; placeholder?: string; anchor?: string; open?: boolean; triggerStyle?: CSSProperties; children?: ReactNode }> = ({
  label,
  value,
  placeholder = 'Todos',
  anchor,
  open,
  triggerStyle,
  children
}) => (
  <div className="mb-4">
    <Label>{label}</Label>
    <div className="relative flex w-full items-stretch">
      <button
        type="button"
        data-anchor={anchor}
        data-slot="combobox-trigger"
        className={COMBO_TRIGGER}
        style={{ ...(open ? { borderColor: 'var(--ring)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--ring) 50%, transparent)' } : null), ...triggerStyle }}
      >
        {value != null ? (
          <span className="flex min-w-0 flex-1 items-center overflow-hidden text-left">{value}</span>
        ) : (
          <span className="flex-1 truncate text-left text-muted-foreground">{placeholder}</span>
        )}
        <span className="flex shrink-0 items-center gap-1">
          <ChevronDown className="size-4 opacity-50" />
        </span>
      </button>
      {children}
    </div>
  </div>
);

/** renderIconLabel de DropdownInput: icono (me-4) + texto. */
const IconLabel: FC<{ icon?: ReactNode; text: string }> = ({ icon, text }) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    {icon != null && (
      <div className="me-4" style={{ flexShrink: 0 }}>
        {icon}
      </div>
    )}
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
  </div>
);

const statusIcon = (v: number) => (v === -1 ? <span style={{ display: 'inline-block', width: 20, height: 20 }} /> : <IcoIcon name="Alert-11" size={20} color={STATUS_COLORS[v]} />);

/** Lista del combobox de Estado (PopoverContent + filas de 36 px). */
const StatusList: FC<{ open: number; hover: number | null; value: StatusValue }> = ({ open, hover, value }) => (
  <div
    className="rounded-lg border bg-popover text-popover-foreground shadow-overlay"
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 'calc(100% + 4px)',
      zIndex: 60,
      opacity: open,
      transform: `translateY(${(1 - open) * -6}px)`,
      visibility: open > 0.01 ? 'visible' : 'hidden'
    }}
  >
    <div className="flex h-(--app-control-h-sm) items-center gap-2 border-b px-3">
      <Search className="size-4 shrink-0 opacity-50" />
      <span className="text-sm text-placeholder">Todos</span>
    </div>
    <div className="p-1">
      {STATUS_OPTIONS.map((o, i) => (
        <div
          key={o.value}
          data-anchor={`status-opt-${o.value}`}
          className={`flex items-center gap-2 px-2 text-sm ${hover === i ? 'bg-accent text-accent-foreground' : ''}`}
          style={{ height: 36 }}
        >
          <Check className={`size-4 shrink-0 ${value === o.value ? 'opacity-100' : 'opacity-0'}`} />
          <span className="min-w-0 flex-1 truncate">
            <IconLabel icon={statusIcon(o.value)} text={o.label} />
          </span>
        </div>
      ))}
    </div>
  </div>
);

/** Chip de FilterSummary: Badge light-primary con <strong>label:</strong> valor. */
const Chip: FC<{ label: string; value: string; glow?: number; anchor?: string; removable?: boolean }> = ({ label, value, glow = 0, anchor, removable = true }) => (
  <span
    data-anchor={anchor}
    data-slot="badge"
    className={`${BADGE} border-primary-tint-border bg-primary-tint text-primary-ink flex items-center mx-2 filter-summary-badge`}
    style={{
      padding: '0.4rem 0.6rem',
      maxWidth: 250,
      boxShadow: glow > 0.01 ? `0 0 0 ${4 * glow}px color-mix(in srgb, #22c55e ${Math.round(45 * glow)}%, transparent)` : undefined,
      borderColor: glow > 0.01 ? `color-mix(in srgb, #22c55e ${Math.round(glow * 100)}%, var(--primary-tint-border))` : undefined
    }}
  >
    <span className="me-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      <strong>{label}:</strong> {value}
    </span>
    {removable && (
      <button type="button" className="ms-1 inline-flex items-center justify-center rounded-full p-1 cursor-pointer">
        <X size={14} className="pointer-events-none" />
      </button>
    )}
  </span>
);

const AndBadge: FC = () => (
  <span className={`${BADGE} border-neutral-tint-border bg-neutral-tint text-secondary-foreground mx-1`} style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
    AND
  </span>
);

// --- Toolbar ---
const SOLID: Record<string, CSSProperties> = {
  'soft-secondary': { background: 'var(--secondary)', color: 'var(--secondary-foreground)' },
  'soft-success': { background: 'var(--success)', color: 'var(--success-foreground)' },
  'soft-warning': { background: 'var(--warning)', color: 'var(--warning-foreground)' },
  'soft-danger': { background: 'var(--danger)', color: 'var(--danger-foreground, #fff)' }
};
const ToolBtn: FC<{ variant: string; children: ReactNode; disabled?: boolean }> = ({ variant, children, disabled }) => (
  <button
    type="button"
    data-variant={variant}
    className={`${BTN} btn-icon`}
    style={{ width: 36, height: 36, borderRadius: 'var(--radius-nav)', border: '1px solid transparent', opacity: disabled ? 0.5 : 1, ...SOLID[variant] }}
  >
    {children}
  </button>
);

// --- Tabla (valores de style.css .e-grid) ---
type Row = { id: number; user: string; name: string; email: string; verified: boolean; twofa: boolean; status: string; last: string; level: string };
const ACTIVOS: Row[] = [
  { id: 1021, user: 'cmendez', name: 'Carlos Méndez', email: 'cmendez@ejemplo.com', verified: true, twofa: true, status: 'Activo', last: '2026-11-05 08:12', level: 'Organización' },
  { id: 1034, user: 'lbarrios', name: 'Lucía Barrios', email: 'lbarrios@ejemplo.com', verified: true, twofa: false, status: 'Activo', last: '2026-11-05 07:48', level: 'División' },
  { id: 1047, user: 'dpaz', name: 'Diego Paz', email: 'dpaz@ejemplo.com', verified: true, twofa: true, status: 'Suspendido', last: '2026-10-29 16:20', level: 'Subdivisión' },
  { id: 1052, user: 'sruiz', name: 'Sofía Ruiz', email: 'sruiz@ejemplo.com', verified: false, twofa: false, status: 'Activo', last: '2026-11-04 18:03', level: 'GPS' },
  { id: 1068, user: 'mleon', name: 'Mario León', email: 'mleon@ejemplo.com', verified: true, twofa: true, status: 'Activo', last: '2026-11-05 09:30', level: 'Organización' },
  { id: 1073, user: 'esoto', name: 'Elena Soto', email: 'esoto@ejemplo.com', verified: true, twofa: false, status: 'Suspendido', last: '2026-10-21 11:45', level: 'GPS' },
  { id: 1089, user: 'jcastro', name: 'Julio Castro', email: 'jcastro@ejemplo.com', verified: true, twofa: false, status: 'Activo', last: '2026-11-03 13:16', level: 'División' }
];
const DESACTIVADOS: Row[] = [
  { id: 1011, user: 'pgomez', name: 'Paola Gómez', email: 'pgomez@ejemplo.com', verified: true, twofa: false, status: 'Desactivado', last: '2026-08-14 10:02', level: 'GPS' },
  { id: 1016, user: 'rvega', name: 'Rodrigo Vega', email: 'rvega@ejemplo.com', verified: false, twofa: false, status: 'Desactivado', last: '2026-07-30 15:41', level: 'Subdivisión' },
  { id: 1029, user: 'anavas', name: 'Ana Navas', email: 'anavas@ejemplo.com', verified: true, twofa: false, status: 'Desactivado', last: '2026-06-18 09:27', level: 'GPS' },
  { id: 1038, user: 'hortiz', name: 'Hugo Ortiz', email: 'hortiz@ejemplo.com', verified: true, twofa: true, status: 'Desactivado', last: '2026-05-09 17:55', level: 'División' }
];
const COLS: { h: string; w: string; k: (r: Row) => ReactNode; center?: boolean }[] = [
  { h: 'ID', w: '0.55fr', k: (r) => r.id },
  { h: 'Usuario', w: '0.9fr', k: (r) => r.user },
  { h: 'Nombre Completo', w: '1.3fr', k: (r) => r.name },
  { h: 'Correo', w: '1.7fr', k: (r) => r.email },
  { h: 'Correo verificado', w: '0.95fr', center: true, k: (r) => <FlagBadge ok={r.verified} neutral={false} /> },
  { h: '2FA', w: '0.5fr', center: true, k: (r) => <FlagBadge ok={r.twofa} neutral /> },
  { h: 'Estado', w: '1fr', k: (r) => r.status },
  { h: 'Último Login', w: '1.2fr', k: (r) => r.last },
  { h: 'Nivel de Acceso', w: '1.1fr', k: (r) => r.level }
];
const GRID: CSSProperties = { display: 'grid', gridTemplateColumns: COLS.map((c) => c.w).join(' ') };

/** StatusBadge real (dot=false) con Check / X de IcoMoon. */
const FlagBadge: FC<{ ok: boolean; neutral: boolean }> = ({ ok, neutral }) => (
  <span className={`status-badge status-badge--${ok ? 'success' : neutral ? 'neutral' : 'danger'}`} data-slot="status-badge" style={{ padding: '2px 10px' }}>
    <IcoIcon name={ok ? 'Check' : 'X'} size={15} />
  </span>
);

const Table: FC<{ rows: Row[]; reload: number; glowStatus: number }> = ({ rows, reload, glowStatus }) => (
  <div className="e-control e-grid" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--card)' }}>
    <div style={{ ...GRID, height: 42, alignItems: 'center', background: 'var(--table-head)', borderBottom: '1px solid var(--border)', padding: '0 21px', gap: 12 }}>
      {COLS.map((c) => (
        <span key={c.h} style={{ fontSize: 'var(--text-th)', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--muted-foreground)', textAlign: c.center ? 'center' : 'left', whiteSpace: 'nowrap' }}>
          {c.h}
        </span>
      ))}
    </div>
    <div style={{ opacity: 1 - 0.55 * reload }}>
      {rows.map((r) => (
        <div key={r.id} style={{ ...GRID, alignItems: 'center', minHeight: 37, padding: '8px 21px', gap: 12, borderBottom: '1px solid var(--table-row-border)', fontSize: 13, lineHeight: '20px', color: 'var(--foreground)' }}>
          {COLS.map((c) => (
            <span key={c.h} style={{ textAlign: c.center ? 'center' : 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: c.h === 'Estado' && glowStatus > 0.01 ? 800 : undefined }}>
              {c.k(r)}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const UsersListScreen: FC<{ s: UsersListState }> = ({ s }) => {
  const collapsed = s.open < 0.5;
  const rows = s.dataset === 'activos' ? ACTIVOS : DESACTIVADOS;
  // La altura natural del cuerpo la mide el DOM; aqui se anima con max-height.
  const bodyH = 296;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px', overflow: 'hidden' }}>
      {/* PageHeader */}
      <div className="page-header">
        <nav className="page-breadcrumb">
          <span>Usuarios</span>
          <ChevronRight />
          <span data-slot="breadcrumb-page">Catálogo de Usuarios</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="page-title">Catálogo de Usuarios</h1>
            <p className="page-subtitle">Administra los usuarios de la plataforma, sus accesos y su membresía.</p>
          </div>
        </div>
      </div>

      {/* SmartFilter > SimpleCollapse (Card app-collapse) */}
      <div
        data-slot="card"
        className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-hairline app-collapse collapse-border mb-4"
        style={{ paddingTop: 12, paddingBottom: collapsed ? 12 : 16, gap: collapsed ? 0 : 16 }}
      >
        <div data-slot="card-header" data-anchor="filter-header" className="flex flex-row items-center cursor-pointer px-6" style={{ transform: `scale(${1 - 0.01 * s.headerPress})`, transformOrigin: '30% 50%' }}>
          {collapsed ? (
            <div className="flex w-full items-center">
              <div className="flex items-center gap-3" style={{ minWidth: 'fit-content' }}>
                <div data-slot="icon-tile" className="icon-tile icon-tile--sm">
                  <Funnel />
                </div>
                <div data-slot="card-title" className="leading-none font-semibold collapse-title text-card-title mb-0 whitespace-nowrap text-heading-foreground">
                  Filtros
                </div>
              </div>
              <div className="grow mx-6">
                <div className="filter-summary flex flex-wrap items-center">
                  <Chip label="Organización" value="Transportes Alfa" />
                  {s.estadoOn && s.applied !== undefined && (
                    <>
                      <AndBadge />
                      <Chip label="Estado" value={CHIP_LABEL[s.applied]} glow={s.chipGlow} anchor="chip-estado" />
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center" style={{ minWidth: 'fit-content' }}>
                <ChevronDown size={16} className="text-subtle-foreground" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div data-slot="icon-tile" className="icon-tile icon-tile--sm">
                  <Funnel />
                </div>
                <div data-slot="card-title" className="leading-none font-semibold collapse-title text-card-title mb-0 text-heading-foreground">
                  Filtros
                </div>
              </div>
              <ChevronDown size={16} className="text-subtle-foreground" style={{ transform: 'rotate(180deg)' }} />
            </div>
          )}
        </div>

        <div style={{ maxHeight: s.open * bodyH, overflow: s.open >= 0.999 ? 'visible' : 'hidden', opacity: Math.min(1, s.open * 1.6), position: 'relative', zIndex: 20 }}>
          <div data-slot="card-content" className="px-6" style={{ paddingTop: 2 }}>
            {/* Row con los Col sm=3 de MembershipFilter y de los filtros opcionales */}
            <div data-slot="row" className="flex flex-wrap -mx-4">
              {[
                ['Organización', 'Transportes Alfa'],
                ['División', ''],
                ['Subdivisión', ''],
                ['Grupo', '']
              ].map(([l, v]) => (
                <div key={l} data-slot="col" className="relative w-full min-w-0 px-4 sm:w-3/12">
                  <Dropdown label={l} value={v ? <IconLabel text={v} /> : undefined} />
                </div>
              ))}
              {/* Filtro opcional Estado: StatusDropdown con addAllActivateOption */}
              <div data-slot="col" className="relative w-full min-w-0 px-4 sm:w-3/12" style={{ maxHeight: 96 * s.addEstado, opacity: s.addEstado, overflow: s.statusOpen > 0.01 ? 'visible' : 'hidden', zIndex: 30 }}>
                <div data-anchor="estado-inner">
                  <Dropdown label="Estado" value={<IconLabel icon={statusIcon(s.value)} text={STATUS_OPTIONS.find((o) => o.value === s.value)!.label} />} anchor="estado-field" open={s.statusOpen > 0.5}>
                    <StatusList open={s.statusOpen} hover={s.statusHover} value={s.value} />
                  </Dropdown>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap smart-filter-actions">
              <div className="flex items-center">
                <button type="button" data-anchor="search-btn" data-slot="button" data-variant="gradient" className={`${BTN} ${BTN_FIELD} ${BTN_VARIANT.gradient} flex items-center`} style={{ transform: `scale(${1 - 0.06 * s.searchPress})` }}>
                  <IcoIcon name="Search" size={16} />
                  <span className="ms-4">Buscar</span>
                </button>
                <button type="button" data-variant="secondary" className={`${BTN} ${BTN_FIELD} ${BTN_VARIANT.secondary} flex items-center justify-between ms-4`} style={{ color: '#7D7D7D' }}>
                  <div style={{ marginRight: 6 }}>
                    <IcoIcon name="List" size={18} />
                  </div>
                  <span>Numero de resultados</span>
                  <IcoIcon name="ChevronDown" size={14} />
                </button>
                <div className="flex items-center gap-2 ms-4">
                  <span data-slot="switch" data-state="checked" className="inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs bg-primary" style={{ height: '1.15rem', width: '2rem' }}>
                    <span className="pointer-events-none block rounded-full bg-background" style={{ width: 16, height: 16, transform: 'translateX(calc(100% - 2px))' }} />
                  </span>
                  <span className="text-sm font-medium">Búsqueda automática</span>
                </div>
              </div>
              <div className="flex justify-end items-center">
                <button type="button" data-variant="secondary" className={`${BTN} ${BTN_FIELD} ${BTN_VARIANT.secondary} filter-and-or-button`}>
                  Coincide con todos los filtros
                </button>
                <div data-slot="separator" className="shrink-0 bg-border mx-2" style={{ width: 1, height: 36 }} />
                <div className="relative ms-4">
                  <button type="button" data-anchor="filters-btn" data-variant="secondary" className={`${BTN} ${BTN_FIELD} ${BTN_VARIANT.secondary} flex items-center justify-between`} style={{ color: '#7D7D7D' }}>
                    <div style={{ marginRight: 6 }}>
                      <IcoIcon name="Sliders" size={18} />
                    </div>
                    <span>Filtros</span>
                    <IcoIcon name="ChevronDown" size={14} />
                  </button>
                  {/* DropdownMenuContent del ButtonDropdown (multiSelect) */}
                  <div
                    data-slot="dropdown-menu-content"
                    className="min-w-[8rem] rounded-lg border bg-popover p-1 text-popover-foreground shadow-overlay"
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 70, minWidth: 250, opacity: s.menu, transform: `translateY(${(1 - s.menu) * -6}px)`, visibility: s.menu > 0.01 ? 'visible' : 'hidden' }}
                  >
                    <div className="px-2 py-1.5 text-sm font-medium">Seleccione una opción...</div>
                    <div className="-mx-1 my-1 h-px bg-border" />
                    {[
                      ['toggle_on', 'Estado', s.estadoOn],
                      ['Tag', 'ID Usuario', false],
                      ['QuotationUser', 'Nombre de Usuario', false]
                    ].map(([icon, title, checked], i) => (
                      <div
                        key={title as string}
                        data-anchor={`opt-${i}`}
                        className={`relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none justify-between ${s.menuHover === i ? 'bg-accent text-accent-foreground' : ''}`}
                      >
                        <div className="flex items-center">
                          <IcoIcon name={icon as string} size={14} />
                          <span style={{ marginLeft: 6, marginRight: 4, flexGrow: 1 }}>{title as string}</span>
                        </div>
                        <div className="flex ms-6">
                          <span style={{ width: 13, height: 13, borderRadius: 3, border: '1px solid var(--input)', background: checked ? 'var(--primary)' : 'var(--card)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                            {checked && <Check size={10} strokeWidth={4} />}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="-mx-1 my-1 h-px bg-border" />
                    <div className="relative flex items-center rounded-sm px-2 py-1.5 text-sm select-none justify-center">Deseleccionar Todos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div role="toolbar" className="btn-toolbar justify-end" style={{ margin: '24px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <div className="btn-filter-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="flex items-center multiselect-toolbar">
              <ToolBtn variant="soft-secondary">
                <IcoIcon name="multiple" size={16} />
              </ToolBtn>
            </div>
          </div>
          <div className="group-btn-toolbar" style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
            <ToolBtn variant="soft-secondary">
              <IcoIcon name="ChevronLeft" size={16} />
            </ToolBtn>
            <ToolBtn variant="soft-secondary" disabled>
              <IcoIcon name="UserPlus" size={16} />
            </ToolBtn>
            <ToolBtn variant="soft-success">
              <Plus size={16} />
            </ToolBtn>
            <ToolBtn variant="soft-success">
              <IcoIcon name="PlusCircle" size={16} />
            </ToolBtn>
            <ToolBtn variant="soft-warning" disabled>
              <Pencil size={16} />
            </ToolBtn>
            <ToolBtn variant="soft-danger" disabled>
              <Trash size={16} />
            </ToolBtn>
          </div>
        </div>
      </div>

      <Table rows={rows} reload={s.reload} glowStatus={s.chipGlow} />
    </div>
  );
};
