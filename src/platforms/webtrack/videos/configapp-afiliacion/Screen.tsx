// Replica de ConfigApp > "Nueva task" (CreateConfigAppTaskScreen) con los cambios del PR
// reactive#1786: el boton MembershipPopover y la barra de filtros activos dentro de la
// tarjeta de unidades, y el dropdown de Plantilla con la marca de cada plantilla.
// Clases Tailwind, tokens y textos del componente real (solo lectura). Lo que el cursor toca
// esta montado desde el frame 0 para medir sus anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Building2, Calendar, ChevronDown, ChevronRight, Check, Loader2, Play, Search, Terminal, Truck, X } from 'lucide-react';
import { IcoIcon } from '../../components/IcoIcon';

export type ScreenState = {
  frame: number;
  /** Desplazamiento vertical de la pagina (px de UI). */
  scroll: number;
  /** 0..1 menu de plantillas. */
  tplOpen: number;
  tplSearch: string;
  /** Indice (dentro de la lista filtrada) resaltado. */
  tplHover: number | null;
  tplSelected: boolean;
  /** 0..1 popover de afiliacion. */
  msOpen: number;
  /** 0..1 menu de division dentro del popover. */
  divOpen: number;
  divHover: number | null;
  /** Division en el borrador del popover (null = Todos). */
  draftDivision: string | null;
  /** Division aplicada (null = la del usuario). */
  appliedDivision: string | null;
  applyPress: number;
  /** Spinner de la tabla mientras se recargan unidades. */
  fetching: boolean;
};

export const OPERATOR = 'Operador Demo';
export const ORGANIZATION = 'Transportes Demo';
export const DIVISIONS = ['Zona Norte', 'Zona Sur', 'Zona Centro'];

type Template = { name: string; brand: string; lines: string[] };
export const TEMPLATES: Template[] = [
  { name: 'Reporte cada 30 s', brand: 'Teltonika', lines: ['setparam 1000:30', 'setparam 1001:30'] },
  { name: 'Odómetro inicial', brand: 'Teltonika', lines: [] },
  { name: 'Modo ahorro de energía', brand: 'Concox', lines: [] },
  { name: 'Reinicio de equipo', brand: 'Suntech', lines: [] },
  { name: 'Servidor y APN', brand: 'Queclink', lines: [] }
];

type Unit = { id: number; name: string; code: string; model: string; imei: string; division: string };
const UNITS: Unit[] = [
  { id: 1042, name: 'Camión 04', code: 'C-104', model: 'FMB920', imei: '356307042441013', division: 'Zona Norte' },
  { id: 1043, name: 'Camión 07', code: 'C-107', model: 'FMB120', imei: '356307042441021', division: 'Zona Sur' },
  { id: 1051, name: 'Pick-up 02', code: 'P-102', model: 'FMC130', imei: '356307042441039', division: 'Zona Sur' },
  { id: 1058, name: 'Furgón 11', code: 'F-111', model: 'FMB920', imei: '356307042441047', division: 'Zona Centro' },
  { id: 1064, name: 'Camión 12', code: 'C-112', model: 'FMB120', imei: '356307042441054', division: 'Zona Sur' }
];

const matches = (t: Template, q: string) => `${t.name} ${t.brand}`.toLowerCase().includes(q.toLowerCase());

/* ------------------------------ piezas de formulario ------------------------------ */

const Label: FC<{ children: ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="form-label">
    {children}
    {required && <span className="text-danger">&nbsp;*</span>}
  </label>
);

const Badge: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-primary-tint-border bg-primary-tint px-2 py-0.5 text-(length:--text-badge) [line-height:var(--text-badge--line-height)] [font-weight:var(--text-badge--font-weight)] whitespace-nowrap text-primary-ink">
    {children}
  </span>
);

const TemplateLabel: FC<{ t: Template }> = ({ t }) => (
  <span className="flex items-center gap-2">
    <span className="truncate">{t.name}</span>
    <Badge>{t.brand}</Badge>
  </span>
);

/** Trigger del combobox (VirtualizedCombobox de reactive). */
const ComboTrigger: FC<{ children?: ReactNode; placeholder?: string; anchor?: string; clearable?: boolean; trailing?: ReactNode }> = ({
  children,
  placeholder,
  anchor,
  clearable,
  trailing
}) => (
  <div
    data-anchor={anchor}
    className="flex h-(--app-control-h) w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3.5 py-1 text-sm"
  >
    {children ? (
      <span className="flex min-w-0 flex-1 items-center overflow-hidden text-left">{children}</span>
    ) : (
      <span className="flex-1 truncate text-left text-muted-foreground">{placeholder}</span>
    )}
    <span className="flex shrink-0 items-center gap-1">
      {trailing}
      {clearable && <X className="size-4 opacity-50" />}
      <ChevronDown className="size-4 opacity-50" />
    </span>
  </div>
);

/** Menu del combobox: buscador arriba y opciones de 36 px. */
const ComboMenu: FC<{
  open: number;
  search: string;
  placeholder: string;
  caret: boolean;
  options: { key: string; label: ReactNode; selected?: boolean }[];
  hover: number | null;
  prefix: string;
}> = ({ open, search, placeholder, caret, options, hover, prefix }) => (
  <div
    className="absolute right-0 left-0 z-50 rounded-lg border bg-popover p-0 text-popover-foreground shadow-overlay"
    style={{
      top: 'calc(100% + 4px)',
      opacity: open,
      transform: `translateY(${(1 - open) * -6}px)`,
      visibility: open > 0.01 ? 'visible' : 'hidden'
    }}
  >
    <div className="flex h-(--app-control-h-sm) items-center gap-2 border-b px-3">
      <Search className="size-4 shrink-0 opacity-50" />
      <span className={`flex h-(--app-control-h-sm) w-full items-center py-2 text-sm ${search ? '' : 'text-placeholder'}`}>
        {search || placeholder}
        {caret && <span className="ms-px inline-block h-4 w-px bg-foreground" />}
      </span>
    </div>
    <div className="p-1">
      {options.map((o, i) => (
        <div
          key={o.key}
          data-anchor={`${prefix}-${i}`}
          className={`flex h-9 items-center gap-2 px-2 text-sm ${hover === i ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <Check className={`size-4 shrink-0 ${o.selected ? 'opacity-100' : 'opacity-0'}`} />
          <span className="min-w-0 flex-1 truncate">{o.label}</span>
        </div>
      ))}
    </div>
  </div>
);

/** Boton `Button` de reactive (variantes y tamanos reales). */
const BTN_BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4';

const FormCard: FC<{ title: string; icon: ReactNode; children: ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <div className={`mb-6 flex flex-col gap-0 rounded-xl border bg-card py-0 text-card-foreground shadow-hairline ${className ?? ''}`}>
    <div className="flex flex-row items-center gap-2.5 px-6 pt-5 pb-0">
      <div className="icon-tile icon-tile--sm">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-(length:--text-card-title) leading-(--text-card-title--line-height) font-(--text-card-title--font-weight) text-heading-foreground">{title}</div>
      </div>
    </div>
    <div className="px-6 py-6 pt-4">{children}</div>
  </div>
);

/** Boton-icono del Toolbar (DefaultButton + Icon de IcoMoon), en el relleno solido por defecto. */
const ToolbarBtn: FC<{ icon: string; bg: string; fg: string; disabled?: boolean }> = ({ icon, bg, fg, disabled }) => (
  <span
    className="inline-flex shrink-0 items-center justify-center"
    style={{ width: 40, height: 39, borderRadius: 'var(--radius-nav)', background: bg, color: fg, opacity: disabled ? 0.5 : 1 }}
  >
    <IcoIcon name={icon} size={16} />
  </span>
);

const UnitToolbar: FC<{ addIcon: 'ChevronRight' | 'Trash2' }> = ({ addIcon }) => (
  <div className="mb-3 flex items-center">
    <ToolbarBtn icon="multiple" bg="var(--secondary)" fg="var(--secondary-foreground)" />
    <div className="flex flex-1 justify-end">
      {addIcon === 'ChevronRight' ? (
        <ToolbarBtn icon="ChevronRight" bg="var(--primary)" fg="var(--primary-foreground)" disabled />
      ) : (
        <ToolbarBtn icon="Trash2" bg="var(--danger)" fg="var(--destructive-foreground)" disabled />
      )}
    </div>
  </div>
);

/* ------------------------------ tabla (Syncfusion) ------------------------------ */

const COLS = '56px 1fr 1fr 1fr 1fr 134px';
const TH: CSSProperties = {
  height: 42,
  display: 'flex',
  alignItems: 'center',
  padding: '0 14px',
  fontSize: 'var(--text-th)',
  fontWeight: 800,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)'
};
const TD: CSSProperties = {
  padding: '8px 14px',
  fontSize: 13,
  lineHeight: '20px',
  color: 'var(--foreground)',
  borderBottom: '1px solid var(--table-row-border)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const UnitTable: FC<{ rows: Unit[]; brand: string }> = ({ rows, brand }) => (
  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--card)' }}>
    <div style={{ display: 'grid', gridTemplateColumns: COLS, background: 'var(--table-head)', borderBottom: '1px solid var(--border)' }}>
      {['Id', 'Unidad', 'Código Privado', 'Marca', 'Modelo', 'IMEI'].map((h) => (
        <div key={h} style={TH}>
          {h}
        </div>
      ))}
    </div>
    {rows.length === 0 ? (
      <div style={{ ...TD, textAlign: 'center', borderBottom: 'none' }}>No hay elementos para mostrar</div>
    ) : (
      rows.map((u) => (
        <div key={u.id} style={{ display: 'grid', gridTemplateColumns: COLS }}>
          <div style={{ ...TD, textAlign: 'right' }}>{u.id}</div>
          <div style={TD}>{u.name}</div>
          <div style={TD}>{u.code}</div>
          <div style={TD}>{brand}</div>
          <div style={TD}>{u.model}</div>
          <div style={TD}>{u.imei}</div>
        </div>
      ))
    )}
  </div>
);

/* ------------------------------ MembershipPopover ------------------------------ */

const ACTIVE_CHIP =
  'inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-tint-border bg-primary-tint py-1 ps-3 pe-1.5 text-xs font-semibold text-primary-ink';

const MembershipLevel: FC<{ label: string; required?: boolean; children: ReactNode }> = ({ label, required, children }) => (
  <div className="mb-4">
    <Label required={required}>{label}</Label>
    <div className="flex w-full items-stretch">{children}</div>
  </div>
);

const MembershipPopover: FC<{ s: ScreenState }> = ({ s }) => {
  const shortLabel = s.appliedDivision ?? ORGANIZATION;
  const divisionOptions = DIVISIONS.map((d) => ({ key: d, label: d, selected: s.draftDivision === d }));
  return (
    <div className="relative">
      <button
        type="button"
        data-anchor="ms-btn"
        className="inline-flex h-(--app-control-h-sm) items-center gap-2 rounded-control border border-input bg-card px-3 text-sm font-semibold text-label-foreground"
      >
        <Building2 className="size-4" />
        <span className="max-w-56 truncate">Afiliación{shortLabel ? `: ${shortLabel}` : ''}</span>
        <ChevronDown className="size-4 opacity-70" />
      </button>

      <div
        className="absolute right-0 z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-overlay"
        style={{
          top: 'calc(100% + 4px)',
          opacity: s.msOpen,
          transform: `translateY(${(1 - s.msOpen) * -8}px) scale(${0.97 + 0.03 * s.msOpen})`,
          transformOrigin: '100% 0%',
          visibility: s.msOpen > 0.01 ? 'visible' : 'hidden'
        }}
      >
        <p className="mb-0 text-card-title font-extrabold text-heading-foreground">Afiliación</p>
        <p className="mb-3 text-xs text-muted-foreground">Muestra solo las unidades de esta parte de la empresa.</p>
        <div className="flex flex-col gap-1">
          <MembershipLevel label="Operador" required>
            <ComboTrigger>{OPERATOR}</ComboTrigger>
          </MembershipLevel>
          <MembershipLevel label="Organización" required>
            <ComboTrigger>{ORGANIZATION}</ComboTrigger>
          </MembershipLevel>
          <MembershipLevel label="División">
            <div className="relative w-full" style={{ zIndex: 5 }}>
              <ComboTrigger anchor="ms-div" placeholder="Todos" clearable={!!s.draftDivision}>
                {s.draftDivision ?? undefined}
              </ComboTrigger>
              <ComboMenu open={s.divOpen} search="" placeholder="Todos" caret={false} options={divisionOptions} hover={s.divHover} prefix="ms-div-opt" />
            </div>
          </MembershipLevel>
          <MembershipLevel label="Subdivisión">
            <ComboTrigger placeholder="Todos" />
          </MembershipLevel>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className={`${BTN_BASE} h-(--app-control-h) px-4`}>Restablecer</span>
          <span
            data-anchor="ms-apply"
            className={`${BTN_BASE} h-(--app-control-h) flex-1 rounded-control bg-(image:--brand-gradient) px-5 text-primary-foreground shadow-primary`}
            style={{ transform: `scale(${1 - 0.06 * s.applyPress})` }}
          >
            Aplicar
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ pantalla ------------------------------ */

export const ConfigAppScreen: FC<{ s: ScreenState }> = ({ s }) => {
  const filtered = TEMPLATES.filter((t) => matches(t, s.tplSearch));
  const tplOptions = filtered.map((t) => ({ key: t.name, label: <TemplateLabel t={t} /> }));
  const template = TEMPLATES[0];
  const candidates = s.tplSelected ? UNITS.filter((u) => !s.appliedDivision || u.division === s.appliedDivision) : [];
  const labels = [OPERATOR, ORGANIZATION, ...(s.appliedDivision ? [s.appliedDivision] : [])];

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', overflow: 'hidden' }}>
      <div style={{ padding: '26px 32px 220px', transform: `translateY(${-s.scroll}px)` }}>
        <div className="page-header">
          <nav className="page-breadcrumb">
            <span>Config App</span>
            <ChevronRight />
            <span data-slot="breadcrumb-page">Nueva task</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <h1 className="page-title">Nueva task</h1>
          </div>
        </div>

        {/* Comandos: modo Plantilla */}
        <FormCard title="Comandos" icon={<Terminal />} className="relative z-10">
          <div className="mb-3 flex gap-2">
            <span className={`${BTN_BASE} h-8 gap-1.5 border border-primary bg-transparent px-3 text-primary`}>Comandos</span>
            <span className={`${BTN_BASE} h-8 gap-1.5 bg-primary px-3 text-primary-foreground`}>Plantilla</span>
          </div>
          <div className="-mx-4 flex flex-wrap">
            <div className="relative w-8/12 min-w-0 px-4">
              <div className="mb-4">
                <Label>
                  Plantilla<span className="text-danger"> *</span>
                </Label>
                <div className="relative w-full">
                  <ComboTrigger anchor="tpl-field" placeholder="Seleccione una opción...">
                    {s.tplSelected ? <TemplateLabel t={template} /> : undefined}
                  </ComboTrigger>
                  <ComboMenu
                    open={s.tplOpen}
                    search={s.tplSearch}
                    placeholder="Seleccione una opción..."
                    caret={s.tplOpen > 0.9 && Math.floor(s.frame / 8) % 2 === 0}
                    options={tplOptions}
                    hover={s.tplHover}
                    prefix="tpl-opt"
                  />
                </div>
              </div>
              {/* Vista previa de la plantilla elegida (siempre montada para medir; cerrada hasta elegir) */}
              <div style={{ height: s.tplSelected ? 'auto' : 0, overflow: 'hidden' }}>
                <div data-anchor="preview-inner" style={{ paddingTop: 12 }}>
                  <div className="form-label mb-1">Vista previa ({template.lines.length})</div>
                  <div className="max-h-[220px] overflow-auto rounded-md border border-border bg-muted/30">
                    {template.lines.map((line, i) => (
                      <div key={line} className="flex gap-3 border-b border-border px-3 py-1 font-mono text-xs last:border-b-0">
                        <span className="w-6 text-end text-muted-foreground select-none">{i + 1}</span>
                        <span className="whitespace-pre text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-4/12 min-w-0 px-4">
              <div className="mb-4">
                <Label>
                  Fecha límite<span className="text-danger"> *</span>
                </Label>
                <ComboTrigger trailing={<Calendar className="size-4 opacity-50" />}>2026-11-07 18:00:00</ComboTrigger>
              </div>
            </div>
          </div>
        </FormCard>

        {/* Unidades: barra de filtros activos + candidatas -> seleccionadas */}
        <FormCard title="Unidades" icon={<Truck />} className="relative z-0">
          <div data-anchor="bar" className="mb-5 flex flex-wrap items-center gap-2 rounded-control border border-border bg-surface-hover px-3 py-2">
            <MembershipPopover s={s} />
            <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
            <span className="form-label mb-0">Filtros activos</span>
            <span className={ACTIVE_CHIP}>
              <span>
                Afiliación:{' '}
                <strong className="truncate">{labels.join(' › ')}</strong>
              </span>
              {s.appliedDivision && (
                <span className="flex size-5 items-center justify-center rounded-full">
                  <X className="size-3.5" />
                </span>
              )}
            </span>
            {s.tplSelected && (
              <span className={ACTIVE_CHIP}>
                <span>
                  Marca: <strong>{template.brand}</strong>
                </span>
              </span>
            )}
          </div>
          <div className="-mx-4 flex flex-wrap">
            <div className="relative w-6/12 min-w-0 px-4">
              <Label>Unidades disponibles</Label>
              <UnitToolbar addIcon="ChevronRight" />
              {s.fetching ? (
                <div className="flex items-center justify-center" style={{ height: 150 }}>
                  <Loader2 className="size-8 text-primary" style={{ transform: `rotate(${s.frame * 18}deg)` }} />
                </div>
              ) : s.tplSelected ? (
                <UnitTable rows={candidates} brand={template.brand} />
              ) : (
                <p className="mb-0 text-muted-foreground">Elige una marca o una plantilla para ver sus unidades.</p>
              )}
            </div>
            <div className="relative w-6/12 min-w-0 px-4">
              <Label>
                Unidades seleccionadas<span className="text-danger"> *</span> (0)
              </Label>
              <UnitToolbar addIcon="Trash2" />
              <UnitTable rows={[]} brand="" />
            </div>
          </div>
        </FormCard>
      </div>

      {/* PageActionBar: pildora flotante con Cancelar y Ejecutar (deshabilitado sin unidades) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 40 }}>
        <div className="floating-action-bar__pill">
          <span className={`${BTN_BASE} h-(--app-control-h) border bg-background px-4 shadow-xs`}>Cancelar</span>
          <span className={`${BTN_BASE} h-(--app-control-h) rounded-control bg-(image:--brand-gradient) px-5 text-primary-foreground shadow-primary`} style={{ opacity: 0.5 }}>
            <Play size={16} />
            Ejecutar
          </span>
        </div>
      </div>
    </div>
  );
};
