// Replica del panel de diseno de ruta y del subpanel "Editar Tramo" (RouteSegmentFormPanel),
// con las clases y el CSS reales de la app. Todo lo que el cursor toca esta montado desde el
// frame 0 (oculto con opacity/visibility) para medir sus anclas.
import type { CSSProperties, FC, ReactNode } from 'react';
import { CircleDot, FileText, Flag, GitBranch, Plus, Repeat, Save, Scissors, Shuffle, Spline, Trash2, X } from 'lucide-react';
import '@webtrack/views/components/PillSelector/PillSelector.css';
import '@webtrack/views/screens/ReactiveMapRoute/components/RouteEditorPanel/RouteEditorPanel.css';
import { caretOn } from '../../../../core/typing';
import { CPS } from './data';

export type SegPanelState = {
  frame: number;
  /** Entrada de cada checkpoint en la lista (0..1). */
  cps: number[];
  distance: string;
  /** Fila resaltada cuyo boton de tramo se usa. */
  activeRow: number | null;
  savePress: number;
  /** 0..1 subpanel "Editar Tramo" visible. */
  sub: number;
  stopAuthorized: boolean;
  withoutStopTime: boolean;
  /** 0..1 aparicion de "Sin limite de tiempo" y de "Tiempo de parada permitido". */
  noLimitIn: number;
  stopTimeIn: number;
  stopTime: string;
  stopTimeFocus: boolean;
  subSavePress: number;
};

const AddRow: FC<{ label: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 4px', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>
    <Plus size={13} />
    {label}
  </div>
);

const FormField: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="rep-field">
    <label className="rep-field__label">{label}</label>
    {children}
  </div>
);

const Duration: FC<{ label: string }> = ({ label }) => (
  <FormField label={label}>
    <div className="rep-duration__row">
      <div className="rep-duration__cell">
        <div className="rep-input rep-input--center" style={{ width: '100%' }}>0</div>
        <span className="rep-duration__unit">Día(s)</span>
      </div>
      <div className="rep-duration__cell rep-duration__cell--hm">
        <div className="rep-duration__hm">
          <div className="rep-duration__cell">
            <div className="rep-input rep-input--center" style={{ width: '100%' }}>0</div>
            <span className="rep-duration__unit">Hora(s)</span>
          </div>
          <span className="rep-duration__sep">:</span>
          <div className="rep-duration__cell">
            <div className="rep-input rep-input--center" style={{ width: '100%' }}>0</div>
            <span className="rep-duration__unit">Minuto(s)</span>
          </div>
        </div>
      </div>
    </div>
  </FormField>
);

const Toggle: FC<{ checked: boolean; label: string; anchor: string; style?: CSSProperties }> = ({ checked, label, anchor, style }) => (
  <label className="rep-toggle" style={style}>
    <input type="checkbox" checked={checked} readOnly />
    <span className="rep-toggle__track" data-anchor={anchor} />
    <span className="rep-toggle__label">{label}</span>
  </label>
);

const KIND = (i: number) => (i === 0 ? 'origin' : i === CPS.length - 1 ? 'dest' : 'mid');
const PIN = { origin: '#22c55e', mid: 'var(--primary)', dest: '#ef4444' };

export const SegmentsPanel: FC<{ s: SegPanelState }> = ({ s }) => {
  const appear = (p: number): CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * -8}px)` });
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Panel principal: Diseno de la Ruta */}
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
            <button key={t.key} type="button" className={`route-editor-panel__tab${t.key === 'design' ? ' route-editor-panel__tab--active' : ''}`}>
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <div className="route-editor-panel__content" style={{ overflow: 'hidden' }}>
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
            {CPS.map((cp, i) => {
              const p = s.cps[i];
              const kind = KIND(i);
              return (
                <li key={cp.name} className={`rdi${s.activeRow === i ? ' rdi--highlighted' : ''}`}>
                  <div className="rdi__row">
                    <div className="rdi__icon rdi__pin-icon">
                      <div className="rdi__pin-marker" style={{ backgroundColor: p > 0 ? PIN[kind] : '#9ca3af', transform: `rotate(-45deg) scale(${p > 0 ? 0.7 + 0.3 * p : 1})` }}>
                        {p > 0 &&
                          (kind === 'origin' ? (
                            <CircleDot size={11} color="#fff" />
                          ) : kind === 'dest' ? (
                            <Flag size={10} color="#fff" />
                          ) : (
                            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{i}</span>
                          ))}
                      </div>
                    </div>
                    <div className="rdi__location-input" style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 10px', border: '1px solid #d8d6de', borderRadius: 6, background: 'var(--card)', fontSize: 13, color: p > 0 ? 'var(--foreground)' : 'var(--placeholder)' }}>
                        {p > 0 ? cp.name : 'Seleccionar ubicación'}
                      </div>
                    </div>
                    <button type="button" className="rdi__delete-btn">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {i < CPS.length - 1 && (
                    <div className="rdi__below">
                      <button type="button" className="rdi__segment-btn" data-anchor={`seg-btn-${i}`} style={s.activeRow === i ? { color: 'var(--primary)' } : undefined}>
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
        <div className="route-editor-panel__footer">
          <button type="button" data-anchor="save" className="route-editor-panel__action-btn route-editor-panel__action-btn--primary" style={{ transform: `scale(${1 - 0.06 * s.savePress})` }}>
            Guardar
          </button>
          <button type="button" className="route-editor-panel__action-btn">
            Cancelar
          </button>
        </div>
      </div>

      {/* Subpanel "Editar Tramo" encima del panel principal */}
      <div
        className="rep-sub-panel rep-sub-panel--full surface-card"
        style={{
          height: '100%',
          maxHeight: 'none',
          opacity: s.sub,
          transform: `translateX(${(1 - s.sub) * 28}px)`,
          visibility: s.sub > 0.01 ? 'visible' : 'hidden'
        }}
      >
        <div className="rep-sub-panel__header">
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <div className="rep-sub-panel__title">
              <Scissors size={13} />
              <span>Editar Tramo</span>
            </div>
            <span className="rep-sub-panel__subtitle">
              {CPS[1].name} → {CPS[2].name}
            </span>
          </div>
          <button className="rep-sub-panel__close" type="button">
            <X size={13} />
          </button>
        </div>
        <div className="rep-sub-panel__content">
          <FormField label="Distancia">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333', padding: '6px 0' }}>4.80 km</div>
          </FormField>
          <FormField label="Límite de velocidad">
            <div className="rep-input-suffix-wrap">
              <div className="rep-input" />
              <span className="rep-input-suffix">km/h</span>
            </div>
          </FormField>
          <Duration label="Tiempo mínimo de recorrido en tramo" />
          <Duration label="Tiempo máximo de recorrido en tramo" />
          <Toggle checked={s.stopAuthorized} label="Parada Autorizada" anchor="toggle-stop" />
          <div style={appear(s.noLimitIn)}>
            <Toggle checked={s.withoutStopTime} label="Sin límite de tiempo" anchor="toggle-nolimit" />
          </div>
          <div style={appear(s.stopTimeIn)}>
            <FormField label="Tiempo de parada permitido">
              <div className="rep-input-suffix-wrap">
                <div
                  className="rep-input"
                  data-anchor="field-stoptime"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderColor: s.stopTimeFocus ? 'var(--primary)' : undefined,
                    boxShadow: s.stopTimeFocus ? '0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)' : undefined
                  }}
                >
                  {s.stopTime}
                  {s.stopTimeFocus && (
                    <span style={{ display: 'inline-block', width: 1.5, height: 16, background: 'var(--primary)', opacity: caretOn(s.frame) ? 1 : 0, marginLeft: 1 }} />
                  )}
                </div>
                <span className="rep-input-suffix">Minuto(s)</span>
              </div>
            </FormField>
          </div>
        </div>
        <div className="rep-sub-panel__footer">
          <button type="button" data-anchor="sub-save" className="route-editor-panel__action-btn route-editor-panel__action-btn--primary" style={{ transform: `scale(${1 - 0.06 * s.subSavePress})` }}>
            <Save size={12} />
            Guardar
          </button>
          <button type="button" className="route-editor-panel__action-btn">
            <X size={12} />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
