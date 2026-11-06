// Replicas del flujo de geocercas con las clases y el CSS reales de reactive (solo lectura):
// barra del mapa (MapToolbar.css), formulario "Nueva Geocerca" (GeofenceEditor.css) y la
// pantalla de asignacion (PageHeader + wizard). Todo lo que el cursor toca esta montado
// desde el frame 0 para medir sus anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Circle, Crosshair, Eye, Hexagon, House, MapPin, Minus, Plus, Square, X } from 'lucide-react';
import '@webtrack/views/screens/ReactiveMap/components/MapToolbar/MapToolbar.css';
import '@webtrack/views/screens/ReactiveMap/features/geofences/GeofenceEditor.css';
import { caretOn } from '../../../../core/typing';
import { IcoIcon } from '../../components/IcoIcon';
import { GEOFENCE_OPTIONS, NOTIFY_OPTIONS, ORG, UNIT_OPTIONS } from './data';

// ── Barra del mapa ─────────────────────────────────────────────────────────────
export const MapToolbarMock: FC<{ geoActive: boolean; flyout: number; circleActive: boolean }> = ({ geoActive, flyout, circleActive }) => (
  <div className="map-sidebar">
    <div className="map-sidebar__top">
      <div className="map-sidebar__zoom-group">
        <button type="button" className="map-sidebar__btn map-sidebar__btn--zoom">
          <Plus size={15} />
        </button>
        <button type="button" className="map-sidebar__btn map-sidebar__btn--zoom">
          <Minus size={15} />
        </button>
      </div>
      <div className="map-sidebar__divider" />
      <div className="map-sidebar__item">
        <button type="button" className="map-sidebar__btn">
          <House size={15} />
        </button>
      </div>
      <div className="map-sidebar__item">
        <button type="button" className="map-sidebar__btn">
          <MapPin size={15} />
        </button>
      </div>
      <div className="map-sidebar__item">
        <button type="button" data-anchor="btn-geofences" className={`map-sidebar__btn${geoActive ? ' map-sidebar__btn--active' : ''}`}>
          <IcoIcon name="Geofences" size={22} style={{ transform: 'translateY(1.5px)' }} />
        </button>
        <div className="map-sidebar__flyout" style={{ opacity: flyout, transform: `translateX(${(1 - flyout) * -8}px)`, visibility: flyout > 0.01 ? 'visible' : 'hidden' }}>
          <span className="map-sidebar__flyout-label">Geocercas</span>
          <div className="map-sidebar__flyout-body map-sidebar__flyout-body--row">
            <button type="button" className="geofences-toolbar__btn geofences-toolbar__btn--active">
              <Eye size={14} />
            </button>
            <button type="button" data-anchor="btn-circle" className={`geofences-toolbar__btn${circleActive ? ' geofences-toolbar__btn--active' : ''}`}>
              <Circle size={14} />
            </button>
            <button type="button" className="geofences-toolbar__btn">
              <Square size={14} />
            </button>
            <button type="button" className="geofences-toolbar__btn">
              <Hexagon size={14} />
            </button>
            <button type="button" className="geofences-toolbar__btn">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="map-sidebar__item">
        <button type="button" className="map-sidebar__btn">
          <Crosshair size={15} />
        </button>
      </div>
    </div>
  </div>
);

// ── Formulario "Nueva Geocerca" ────────────────────────────────────────────────
const Caret: FC<{ frame: number }> = ({ frame }) => (
  <span style={{ display: 'inline-block', width: 1.5, height: 16, background: 'var(--primary)', opacity: caretOn(frame) ? 1 : 0, marginLeft: 1, verticalAlign: 'middle' }} />
);

const focusRing = (on: boolean): CSSProperties =>
  on ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent)' } : {};

const FakeInput: FC<{ anchor?: string; focused?: boolean; children?: ReactNode; frame: number }> = ({ anchor, focused, children, frame }) => (
  <div
    data-anchor={anchor}
    style={{
      border: '1px solid var(--input)',
      borderRadius: 6,
      padding: '8px 10px',
      minHeight: 'var(--app-control-h)',
      fontSize: 13,
      lineHeight: 1.4,
      color: 'var(--foreground)',
      background: 'var(--card)',
      display: 'flex',
      alignItems: 'center',
      ...focusRing(!!focused)
    }}
  >
    {children}
    {focused && <Caret frame={frame} />}
  </div>
);

const Select: FC<{ value: string; placeholder?: string; anchor?: string; open?: boolean; children?: ReactNode; chips?: string[] }> = ({ value, placeholder, anchor, open, children, chips }) => (
  <div style={{ position: 'relative' }}>
    <div
      data-anchor={anchor}
      style={{
        minHeight: 'var(--app-control-h)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        padding: '4px 10px',
        border: '1px solid var(--input)',
        borderRadius: 'var(--radius-control)',
        background: 'var(--card)',
        fontSize: 13,
        color: value || chips?.length ? 'var(--foreground)' : 'var(--placeholder)',
        ...focusRing(!!open)
      }}
    >
      {chips && chips.length > 0
        ? chips.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'var(--primary-tint)', color: 'var(--primary-ink)', fontSize: 12, fontWeight: 600 }}>
              {c}
              <X size={11} />
            </span>
          ))
        : <span style={{ flex: 1 }}>{value || placeholder}</span>}
      <span style={{ flex: chips?.length ? 1 : 'none' }} />
      <ChevronDown size={15} style={{ color: 'var(--chevron)' }} />
    </div>
    {children}
  </div>
);

const Menu: FC<{ open: number; options: string[]; prefix: string; hover?: number | null; selected?: string[] }> = ({ open, options, prefix, hover, selected = [] }) => (
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
          fontWeight: selected.includes(o) ? 700 : 500,
          color: 'var(--foreground)',
          background: hover === i ? 'var(--primary-tint)' : 'transparent'
        }}
      >
        {o}
        {selected.includes(o) && <Check size={14} style={{ color: 'var(--primary)' }} />}
      </div>
    ))}
  </div>
);

export type FormState = { frame: number; name: string; address: string; focus: 'name' | 'address' | null; savePress: number };

export const GeofenceForm: FC<{ s: FormState; style?: CSSProperties }> = ({ s, style }) => (
  <div className="geofence-editor-form surface-card" style={{ display: 'flex', flexDirection: 'column', ...style }}>
    <div className="geofence-editor-form__header">
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-foreground)' }}>Nueva Geocerca</span>
      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)' }}>
        <X size={16} />
      </button>
    </div>
    <div className="geofence-editor-form__body">
      <div className="geofence-editor-form__field">
        <label>
          Nombre <span className="geofence-editor-form__required-star">*</span>
        </label>
        <FakeInput anchor="field-name" focused={s.focus === 'name'} frame={s.frame}>
          {s.name}
        </FakeInput>
      </div>
      <div className="geofence-editor-form__field">
        <label>Código Privado</label>
        <FakeInput frame={s.frame} />
      </div>
      <div className="geofence-editor-form__field">
        <label>Dirección</label>
        <FakeInput anchor="field-address" focused={s.focus === 'address'} frame={s.frame}>
          {s.address}
        </FakeInput>
      </div>
      <div className="geofence-editor-form__field geofence-editor-form__field--color">
        <label>Color</label>
        <div className="geofence-editor-form__color-input" style={{ display: 'grid', placeItems: 'center' }}>
          <span style={{ width: '100%', height: '100%', borderRadius: 4, background: 'var(--primary)' }} />
        </div>
      </div>
      <div className="geofence-editor-form__field">
        <label>
          Radio (m) <span className="geofence-editor-form__required-star">*</span>
        </label>
        <FakeInput frame={s.frame}>250</FakeInput>
      </div>
      <div className="geofence-editor-form__field">
        <label>Organización</label>
        <Select value={ORG} />
      </div>
    </div>
    <div className="geofence-editor-form__footer" style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        data-anchor="form-save"
        style={{ flex: 1, height: 'var(--app-control-h)', borderRadius: 'var(--radius-control)', border: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 700, transform: `scale(${1 - 0.06 * s.savePress})` }}
      >
        Guardar
      </button>
      <button
        type="button"
        style={{ flex: 1, height: 'var(--app-control-h)', borderRadius: 'var(--radius-control)', border: '1px solid var(--input)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
      >
        Cancelar
      </button>
    </div>
  </div>
);

// ── Pantalla "Asignacion de Unidades a Geocercas" ──────────────────────────────
export type AssignState = {
  step: 0 | 1 | 2;
  notifyOpen: number;
  notifyHover: number | null;
  notify: string;
  geoOpen: number;
  geoHover: number | null;
  geofences: string[];
  unitOpen: number;
  unitHover: number | null;
  units: string[];
  assigned: number;
  press: Record<string, number>;
};

const Label: FC<{ children: ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="form-label">
    {children}
    {required && <span style={{ color: 'var(--destructive)' }}>&nbsp;*</span>}
  </label>
);

const Btn: FC<{ anchor?: string; variant?: 'primary' | 'secondary'; press?: number; children: ReactNode }> = ({ anchor, variant = 'primary', press = 0, children }) => (
  <button
    type="button"
    data-anchor={anchor}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 'var(--app-control-h)',
      padding: '0 16px',
      borderRadius: 'var(--radius-control)',
      border: variant === 'primary' ? 'none' : '1px solid var(--input)',
      background: variant === 'primary' ? 'var(--primary)' : 'var(--card)',
      color: variant === 'primary' ? 'var(--primary-foreground)' : 'var(--foreground)',
      fontSize: 13,
      fontWeight: 700,
      transform: `scale(${1 - 0.06 * press})`
    }}
  >
    {children}
  </button>
);

const STEPS = ['Notificaciones', 'Seleccione Unidades y Geocercas', 'Revisar Asignación'];

const Grid2: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, ...style }}>{children}</div>
);

const Th: FC<{ children: ReactNode }> = ({ children }) => (
  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--label-foreground)', borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
    {children}
  </th>
);
const Td: FC<{ children: ReactNode }> = ({ children }) => (
  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--foreground)', borderBottom: '1px solid var(--border)' }}>{children}</td>
);

export const AssignPage: FC<{ s: AssignState }> = ({ s }) => {
  const layer = (visible: boolean): CSSProperties => ({ position: 'absolute', inset: 0, visibility: visible ? 'visible' : 'hidden' });
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '30px 36px', fontFamily: 'inherit' }}>
      <div className="page-header">
        <nav className="page-breadcrumb">
          <span>General</span>
          <ChevronRight />
          <span>Puntos de Interés</span>
          <ChevronRight />
          <span>Geocercas</span>
          <ChevronRight />
          <span data-slot="breadcrumb-page">Asignar Unidad</span>
        </nav>
        <h1 className="page-title">Asignación de Unidades a Geocercas</h1>
      </div>

      <div className="wizard-stepper surface-card" style={{ display: 'flex', flexDirection: 'column', height: 640 }}>
        <div className="wizard-header border-b border-border px-6 py-5">
          <ol className="mx-auto flex w-full max-w-3xl flex-row" style={{ margin: '0 auto', padding: 0 }}>
            {STEPS.map((t, i) => {
              const status = i < s.step ? 'completed' : i === s.step ? 'active' : 'pending';
              return (
                <li key={t} className="step relative flex flex-1 flex-col items-center" style={{ listStyle: 'none' }}>
                  {i < STEPS.length - 1 && (
                    <span style={{ position: 'absolute', top: 20, left: '50%', width: '100%', height: 2, background: status === 'completed' ? 'var(--primary)' : 'var(--border)' }} />
                  )}
                  <span className="z-10 flex flex-col items-center gap-1.5" style={{ position: 'relative' }}>
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                      style={{
                        width: 40,
                        height: 40,
                        background: status === 'pending' ? 'var(--muted)' : 'var(--primary)',
                        color: status === 'pending' ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                        boxShadow: status === 'active' ? '0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent)' : undefined
                      }}
                    >
                      {status === 'completed' ? <Check size={16} /> : i + 1}
                    </span>
                    <span className="text-sm font-medium" style={{ fontSize: 13, fontWeight: 600, color: status === 'pending' ? 'var(--muted-foreground)' : 'var(--foreground)', textAlign: 'center', maxWidth: 170 }}>
                      {t}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div style={{ position: 'relative', flex: 1, padding: '24px 28px' }}>
          {/* Paso 1: Notificaciones */}
          <div style={{ ...layer(s.step === 0), padding: '24px 28px' }}>
            <Grid2>
              <div>
                <Label>Notificar por Email</Label>
                <Select value="" placeholder="Seleccionar..." />
              </div>
              <div>
                <Label>Notificar a Consola</Label>
                <Select value="" placeholder="Seleccionar notificaciones a consola" />
              </div>
            </Grid2>
            <Grid2 style={{ marginTop: 18 }}>
              <div>
                <Label required>Notificar</Label>
                <Select value={s.notify} placeholder="Seleccionar..." anchor="notify" open={s.notifyOpen > 0.5}>
                  <Menu open={s.notifyOpen} options={NOTIFY_OPTIONS} prefix="notify-opt" hover={s.notifyHover} selected={s.notify ? [s.notify] : []} />
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
                <span style={{ width: 36, height: 20, borderRadius: 10, background: 'var(--input)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 3, left: 3, width: 14, height: 14, borderRadius: 7, background: '#fff' }} />
                </span>
                <span style={{ fontSize: 13, color: 'var(--foreground)' }}>Usar Geocerca Hardware</span>
              </div>
            </Grid2>
            <div style={{ position: 'absolute', right: 28, bottom: 24 }}>
              <Btn anchor="next-1" press={s.press.next1}>
                Siguiente <ArrowRight size={14} />
              </Btn>
            </div>
          </div>

          {/* Paso 2: Seleccione Unidades y Geocercas */}
          <div style={{ ...layer(s.step === 1), padding: '24px 28px' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--heading-foreground)', marginBottom: 12 }}>Filtros de Unidades y Geocercas</div>
            <Grid2 style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div>
                <Label>Organización</Label>
                <Select value={ORG} />
              </div>
              <div>
                <Label>División</Label>
                <Select value="" placeholder="Todas" />
              </div>
              <div>
                <Label>Subdivisión</Label>
                <Select value="" placeholder="Todas" />
              </div>
            </Grid2>
            <Grid2 style={{ marginTop: 18 }}>
              <div>
                <Label>Geocercas</Label>
                <Select value="" placeholder="Selecciona las geocercas a asignar" anchor="geo" open={s.geoOpen > 0.5} chips={s.geofences}>
                  <Menu open={s.geoOpen} options={GEOFENCE_OPTIONS} prefix="geo-opt" hover={s.geoHover} selected={s.geofences} />
                </Select>
              </div>
              <div>
                <Label>Unidades</Label>
                <Select value="" placeholder="Selecciona las unidades a asignar" anchor="unit" open={s.unitOpen > 0.5} chips={s.units}>
                  <Menu open={s.unitOpen} options={UNIT_OPTIONS} prefix="unit-opt" hover={s.unitHover} selected={s.units} />
                </Select>
              </div>
            </Grid2>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 10px' }}>
              <Btn anchor="assign" press={s.press.assign}>Asignar</Btn>
            </div>
            <div style={{ opacity: s.assigned }}>
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 10 }}>
                Asignaciones preparadas correctamente: 2
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <thead>
                  <tr>
                    <Th>Unidad/Geocerca</Th>
                    <Th>ID</Th>
                    <Th>Bodega Central</Th>
                  </tr>
                </thead>
                <tbody>
                  {['P-118', 'C-204'].map((u, i) => (
                    <tr key={u} style={{ opacity: Math.min(1, s.assigned * 2 - i * 0.4) }}>
                      <Td>{u}</Td>
                      <Td>{4120 + i}</Td>
                      <Td>
                        <Check size={15} style={{ color: 'var(--success)' }} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="secondary">
                <ArrowLeft size={14} /> Anterior
              </Btn>
              <Btn anchor="next-2" press={s.press.next2}>
                Siguiente <ArrowRight size={14} />
              </Btn>
            </div>
          </div>

          {/* Paso 3: Revisar Asignacion */}
          <div style={{ ...layer(s.step === 2), padding: '24px 28px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
              <thead>
                <tr>
                  <Th>Unidad</Th>
                  <Th>Geocerca</Th>
                  <Th>Forma</Th>
                  <Th>Notificar</Th>
                  <Th>Correos de Notificación</Th>
                </tr>
              </thead>
              <tbody>
                {['P-118', 'C-204'].map((u) => (
                  <tr key={u}>
                    <Td>{u}</Td>
                    <Td>Bodega Central</Td>
                    <Td>Círculo</Td>
                    <Td>{s.notify || 'Entrada/Salida'}</Td>
                    <Td>—</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Btn variant="secondary">
                <ArrowLeft size={14} /> Anterior
              </Btn>
              <Btn anchor="finish" press={s.press.finish}>Asignar Geocercas a Unidades</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
