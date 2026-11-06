// Replica del panel "Nueva Ruta" en modo creacion, con las clases y el CSS reales de la
// app. Las dos pestanas viven siempre en el DOM (una oculta) para medir las anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import {
  Bell,
  ChevronDown,
  CircleDot,
  FileText,
  Flag,
  GitBranch,
  MapPin,
  Plus,
  Repeat,
  Settings,
  Shuffle,
  Spline,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { Img, staticFile } from 'remotion';
import '@webtrack/views/components/PillSelector/PillSelector.css';
import '@webtrack/views/screens/ReactiveMapRoute/components/RouteEditorPanel/RouteEditorPanel.css';
import { caretOn } from '../../../../core/typing';

export type FieldKey = 'name' | 'abbr' | 'customer' | 'time' | 'window' | 'speed';

export type CreatePanelState = {
  frame: number;
  tab: 'general' | 'design';
  values: Record<FieldKey, string>;
  focus: FieldKey | null;
  /** Por checkpoint: 0 vacio, 1 ubicado (con el progreso de su entrada). */
  cps: number[];
  cpNames: string[];
  distance: string;
  /** Fila resaltada (al colocar su pin). */
  activeRow: number | null;
  savePress: number;
  /** 0..1 superposicion de guardado. */
  saving: number;
  savingStep: number;
};

const Field: FC<{ label: string; required?: boolean; anchor: string; focused: boolean; children: ReactNode; style?: CSSProperties }> = ({
  label,
  required,
  anchor,
  focused,
  children,
  style
}) => (
  <div className="rep-field">
    <label className="rep-field__label">
      {label}
      {required && <span className="rep-field__required"> *</span>}
    </label>
    <div
      data-anchor={anchor}
      className="rep-input"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderColor: focused ? 'var(--primary)' : undefined,
        boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : undefined,
        ...style
      }}
    >
      {children}
    </div>
  </div>
);

const Caret: FC<{ on: boolean }> = ({ on }) => (
  <span style={{ display: 'inline-block', width: 1.5, height: 16, background: 'var(--primary)', opacity: on ? 1 : 0, marginLeft: 1 }} />
);

const TextValue: FC<{ value: string; placeholder?: string; focused: boolean; frame: number; suffix?: string }> = ({
  value,
  placeholder,
  focused,
  frame,
  suffix
}) => (
  <>
    <span style={{ flex: 1, display: 'flex', alignItems: 'center', color: value ? 'var(--foreground)' : 'var(--placeholder)' }}>
      {value || (focused ? '' : placeholder)}
      {focused && <Caret on={caretOn(frame)} />}
    </span>
    {suffix && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>{suffix}</span>}
  </>
);

const SelectValue: FC<{ value: string; placeholder: string }> = ({ value, placeholder }) => (
  <>
    <span style={{ flex: 1, color: value ? 'var(--foreground)' : 'var(--placeholder)' }}>{value || placeholder}</span>
    <ChevronDown size={14} style={{ color: 'var(--chevron)' }} />
  </>
);

const AddRow: FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>
    <Plus size={13} />
    {label}
  </div>
);

const KIND = ['origin', 'mid', 'dest'] as const;
const PIN_COLOR = { origin: '#22c55e', mid: 'var(--primary)', dest: '#ef4444' };

export const CreateRoutePanel: FC<{ s: CreatePanelState }> = ({ s }) => {
  const f = s.frame;
  const layer = (visible: boolean): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    padding: '14px 16px',
    visibility: visible ? 'visible' : 'hidden'
  });
  return (
    <div className="route-editor-panel surface-card route-editor-panel--wide" style={{ maxHeight: 'none', height: '100%' }}>
      <div className="route-editor-panel__header">
        <div className="route-editor-panel__title">
          <Plus size={14} />
          <span>Nueva Ruta</span>
        </div>
        <button className="route-editor-panel__close" type="button">
          <X size={14} />
        </button>
      </div>

      <div className="route-editor-panel__tabs">
        {[
          { key: 'general', label: 'Información General', icon: <FileText size={12} /> },
          { key: 'design', label: 'Diseño de la Ruta', icon: <GitBranch size={12} /> },
          { key: 'alternate', label: 'Rutas Alternas', icon: <Shuffle size={12} /> }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            data-anchor={`tab-${t.key}`}
            className={`route-editor-panel__tab${t.key === s.tab ? ' route-editor-panel__tab--active' : ''}`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="route-editor-panel__content" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
        {/* ── Informacion General ── */}
        <div style={layer(s.tab === 'general')}>
          <div className="route-editor-panel__section-header">
            <Tag size={11} />
            <span>Identificación</span>
          </div>
          <Field label="Nombre de la ruta" required anchor="field-name" focused={s.focus === 'name'}>
            <TextValue value={s.values.name} focused={s.focus === 'name'} frame={f} />
          </Field>
          <Field label="Abreviatura" required anchor="field-abbr" focused={s.focus === 'abbr'}>
            <TextValue value={s.values.abbr} focused={s.focus === 'abbr'} frame={f} />
          </Field>
          <Field label="Código privado" anchor="field-code" focused={false}>
            <TextValue value="" focused={false} frame={f} />
          </Field>
          <Field label="Cliente" anchor="field-customer" focused={s.focus === 'customer'}>
            <SelectValue value={s.values.customer} placeholder="Seleccionar..." />
          </Field>
          <div className="route-editor-panel__section-header route-editor-panel__section-header--mt">
            <Settings size={11} />
            <span>Configuración</span>
          </div>
          <Field label="Tiempo para llegar al destino" anchor="field-time" focused={s.focus === 'time'}>
            <TextValue value={s.values.time} focused={s.focus === 'time'} frame={f} suffix="min" />
          </Field>
          <Field label="Permanencia en origen" required anchor="field-window" focused={s.focus === 'window'}>
            <SelectValue value={s.values.window} placeholder="Seleccionar..." />
          </Field>
          <Field label="Límite de velocidad" anchor="field-speed" focused={s.focus === 'speed'}>
            <TextValue value={s.values.speed} focused={s.focus === 'speed'} frame={f} suffix="km/h" />
          </Field>
          <div className="route-editor-panel__section-header route-editor-panel__section-header--mt">
            <Bell size={11} />
            <span>Notificaciones</span>
          </div>
        </div>

        {/* ── Diseno de la Ruta ── */}
        <div style={layer(s.tab === 'design')}>
          <div className="route-editor-panel__route-base">
            <div className="route-editor-panel__section-header" style={{ paddingTop: 12 }}>
              <span>Base de la ruta</span>
            </div>
            <div className="pill-selector pill-selector--sm">
              <button type="button" className="pill-selector__btn pill-selector__btn--active">
                <span>Normal</span>
              </button>
              <button type="button" className="pill-selector__btn">
                <span className="pill-selector__icon">
                  <GitBranch size={12} />
                </span>
                <span>Maestra</span>
              </button>
              <button type="button" className="pill-selector__btn">
                <span className="pill-selector__icon">
                  <Repeat size={12} />
                </span>
                <span>Inversa</span>
              </button>
            </div>
          </div>

          <div className="route-editor-panel__row route-editor-panel__row--mt">
            <span className="route-editor-panel__row-label">Distancia</span>
            <span className="route-editor-panel__row-value">{s.distance}</span>
          </div>

          <div className="route-editor-panel__section-header" style={{ paddingTop: 12 }}>
            <GitBranch size={11} />
            <span>Checkpoints</span>
          </div>

          <AddRow label="Agregar nuevo origen" />
          <ul className="rdi-list" style={{ margin: 0, padding: 0 }}>
            {KIND.map((kind, i) => {
              const placed = s.cps[i];
              const color = placed > 0 ? PIN_COLOR[kind] : '#9ca3af';
              return (
                <li key={kind} className={`rdi${s.activeRow === i ? ' rdi--highlighted' : ''}`}>
                  <div className="rdi__row">
                    <div className="rdi__icon rdi__pin-icon">
                      <div
                        className="rdi__pin-marker"
                        style={{ backgroundColor: color, transform: `rotate(-45deg) scale(${placed > 0 ? 0.7 + 0.3 * placed : 1})` }}
                      >
                        {placed > 0 &&
                          (kind === 'origin' ? (
                            <CircleDot size={11} color="#fff" />
                          ) : kind === 'dest' ? (
                            <Flag size={10} color="#fff" />
                          ) : (
                            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>1</span>
                          ))}
                      </div>
                    </div>
                    <div className="rdi__location-input" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', height: 32, border: '1px solid #d8d6de', borderRadius: 6, overflow: 'hidden', background: 'var(--card)' }}>
                        <span style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 13, color: placed > 0 ? 'var(--foreground)' : 'var(--placeholder)' }}>
                          <span style={{ opacity: placed > 0 ? placed : 1 }}>{placed > 0 ? s.cpNames[i] : 'Seleccionar ubicación'}</span>
                        </span>
                        <span
                          data-anchor={`pin-btn-${i}`}
                          className="rdi__pin-btn"
                          style={{ width: 34, display: 'grid', placeItems: 'center', borderLeft: '1px solid #d8d6de', color: 'var(--primary)', background: 'var(--control-muted)' }}
                        >
                          <MapPin size={13} />
                        </span>
                      </div>
                    </div>
                    <button type="button" className="rdi__delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {i < KIND.length - 1 && (
                    <div className="rdi__below">
                      <button type="button" className="rdi__segment-btn" data-anchor={`seg-btn-${i}`}>
                        <Spline size={12} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <AddRow label="Agregar nuevo destino" />
        </div>

        {/* Guardado: misma composicion que SavingOverlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,.97)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            opacity: s.saving,
            visibility: s.saving > 0 ? 'visible' : 'hidden'
          }}
        >
          <Img
            src={staticFile('webtrack/brand/webtrack-mark.png')}
            style={{ width: 90, height: 90, marginTop: -60, transform: `scale(${1 + 0.06 * Math.sin(f / 5)})` }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', width: 220 }}>
            {['Validando checkpoints...', 'Calculando el recorrido...', 'Guardando la ruta...', 'Actualizando los registros...'].map((t, i) => {
              const done = i < s.savingStep;
              const active = i === s.savingStep;
              return (
                <div key={t} style={{ height: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: done ? '#aaa' : active ? 'var(--primary)' : '#e0e0e0' }} />
                  <span style={{ fontSize: 13, color: done ? '#bbb' : active ? '#111' : '#ccc', fontWeight: active ? 600 : 400 }}>{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="route-editor-panel__footer">
        <button
          type="button"
          data-anchor="save"
          className="route-editor-panel__action-btn route-editor-panel__action-btn--primary"
          style={{ transform: `scale(${1 - 0.06 * s.savePress})` }}
        >
          Guardar
        </button>
        <button type="button" className="route-editor-panel__action-btn">
          Cancelar
        </button>
      </div>
    </div>
  );
};
