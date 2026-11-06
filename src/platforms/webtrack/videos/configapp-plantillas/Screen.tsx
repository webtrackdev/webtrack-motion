// Replica de "Nueva task" de ConfigApp (rama production): filtros con Buscar y la seccion
// Comandos en modo Plantilla. Clases y tokens reales de reactive (solo lectura). Lo que el
// cursor toca esta montado desde el frame 0 para medir sus anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight, Filter, Loader2, Search, Terminal, Truck } from 'lucide-react';

export type ScreenState = {
  frame: number;
  division: string;
  divisionOpen: number;
  divisionHover: number | null;
  searching: boolean;
  searchPress: number;
  templateOpen: number;
  templateHover: number | null;
  templates: string[];
  /** 0..1 resalte de "recien actualizado" en las opciones. */
  fresh: number;
};

export const DIVISIONS = ['Zona Norte', 'Zona Sur', 'Zona Centro'];

const Label: FC<{ children: ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="form-label">
    {children}
    {required && <span style={{ color: 'var(--destructive)' }}>&nbsp;*</span>}
  </label>
);

const Field: FC<{ value: string; placeholder?: string; anchor?: string; open?: boolean; children?: ReactNode }> = ({ value, placeholder, anchor, open, children }) => (
  <div style={{ position: 'relative' }}>
    <div
      data-anchor={anchor}
      style={{
        height: 'var(--app-control-h)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        border: `1px solid ${open ? 'var(--primary)' : 'var(--input)'}`,
        boxShadow: open ? '0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)' : undefined,
        borderRadius: 'var(--radius-control)',
        background: 'var(--card)',
        fontSize: 13,
        color: value ? 'var(--foreground)' : 'var(--placeholder)'
      }}
    >
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{value || placeholder}</span>
      <ChevronDown size={15} style={{ color: 'var(--chevron)' }} />
    </div>
    {children}
  </div>
);

const Menu: FC<{ open: number; options: string[]; prefix: string; hover: number | null; selected?: string; fresh?: number }> = ({ open, options, prefix, hover, selected, fresh = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 'calc(100% + 4px)',
      padding: 4,
      borderRadius: 10,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--elevation-overlay)',
      zIndex: 30,
      opacity: open,
      transform: `translateY(${(1 - open) * -6}px)`,
      visibility: open > 0.01 ? 'visible' : 'hidden'
    }}
  >
    {options.map((o, i) => (
      <div
        key={o}
        data-anchor={`${prefix}-${i}`}
        style={{
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          borderRadius: 7,
          fontSize: 13,
          fontWeight: selected === o ? 700 : 500,
          color: 'var(--foreground)',
          background: hover === i ? 'var(--primary-tint)' : fresh > 0 ? `color-mix(in srgb, #22c55e ${Math.round(fresh * 14)}%, transparent)` : 'transparent'
        }}
      >
        {o}
        {selected === o && <Check size={14} style={{ color: 'var(--primary)' }} />}
      </div>
    ))}
  </div>
);

const Card: FC<{ title: string; icon: ReactNode; children: ReactNode; style?: CSSProperties; right?: ReactNode }> = ({ title, icon, children, style, right }) => (
  <div className="surface-card" style={{ padding: '18px 22px', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-control)', display: 'grid', placeItems: 'center', background: 'var(--primary-tint)', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--heading-foreground)', flex: 1 }}>{title}</span>
      {right}
    </div>
    {children}
  </div>
);

const Btn: FC<{ children: ReactNode; variant?: 'primary' | 'outline'; anchor?: string; press?: number; small?: boolean }> = ({ children, variant = 'primary', anchor, press = 0, small }) => (
  <button
    type="button"
    data-anchor={anchor}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: small ? 32 : 'var(--app-control-h)',
      padding: small ? '0 14px' : '0 18px',
      borderRadius: 'var(--radius-control)',
      border: variant === 'primary' ? 'none' : '1px solid var(--primary)',
      background: variant === 'primary' ? 'var(--primary)' : 'var(--card)',
      color: variant === 'primary' ? 'var(--primary-foreground)' : 'var(--primary)',
      fontSize: 13,
      fontWeight: 700,
      transform: `scale(${1 - 0.06 * press})`
    }}
  >
    {children}
  </button>
);

export const ConfigAppScreen: FC<{ s: ScreenState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px' }}>
    <div className="page-header">
      <nav className="page-breadcrumb">
        <span>Config App</span>
        <ChevronRight />
        <span data-slot="breadcrumb-page">Nueva task</span>
      </nav>
      <h1 className="page-title">Nueva task</h1>
    </div>

    <Card title="Filtros" icon={<Filter size={16} />} style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <Btn anchor="search" press={s.searchPress}>
          {s.searching ? <Loader2 size={15} style={{ transform: `rotate(${s.frame * 20}deg)` }} /> : <Search size={15} />}
          Buscar
        </Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div>
          <Label>Operador</Label>
          <Field value="Webtrack GT" />
        </div>
        <div>
          <Label>Organización</Label>
          <Field value="Transportes Demo" />
        </div>
        <div>
          <Label>División</Label>
          <Field value={s.division} anchor="division" open={s.divisionOpen > 0.5}>
            <Menu open={s.divisionOpen} options={DIVISIONS} prefix="division-opt" hover={s.divisionHover} selected={s.division} />
          </Field>
        </div>
        <div>
          <Label>Subdivisión</Label>
          <Field value="" placeholder="Todas" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 12 }}>
        <div>
          <Label required>Marca</Label>
          <Field value="Teltonika" />
        </div>
        <div>
          <Label>Modelo</Label>
          <Field value="" placeholder="Todos" />
        </div>
        <div>
          <Label>Nombre de unidad de rastreo</Label>
          <Field value="" placeholder="" />
        </div>
      </div>
    </Card>

    <Card title="Comandos" icon={<Terminal size={16} />} style={{ marginBottom: 16, position: 'relative', zIndex: 5 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Btn variant="outline" small>
          Comandos
        </Btn>
        <Btn small>Plantilla</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <Label required>Plantilla</Label>
          <Field value="" placeholder="Seleccionar..." anchor="template" open={s.templateOpen > 0.5}>
            <Menu open={s.templateOpen} options={s.templates} prefix="template-opt" hover={s.templateHover} fresh={s.fresh} />
          </Field>
        </div>
        <div>
          <Label required>Fecha límite</Label>
          <Field value="06/11/2026 18:00" />
        </div>
      </div>
    </Card>

    <Card title="Unidades" icon={<Truck size={16} />}>
      <div style={{ height: 120, borderRadius: 10, background: 'var(--muted)' }} />
    </Card>
  </div>
);
