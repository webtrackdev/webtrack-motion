// Replica del panel "Nueva Ruta" del editor de rutas, con las clases y el CSS reales
// de la app (RouteEditorPanel.css, PillSelector.css). Todo el estado llega por props:
// la composicion decide que se ve en cada frame.
import type { FC } from 'react';
import {
  Building2,
  ChevronDown,
  CircleDot,
  FileText,
  Flag,
  GitBranch,
  Loader2,
  MapPin,
  Plus,
  Repeat,
  Shuffle,
  Spline,
  Trash2,
  X
} from 'lucide-react';
import '@webtrack/views/components/PillSelector/PillSelector.css';
import '@webtrack/views/screens/ReactiveMapRoute/components/RouteEditorPanel/RouteEditorPanel.css';
import { ROUTE_OPTIONS } from './data';

export type PanelState = {
  mode: 'normal' | 'reverse';
  /** 0..1 aparicion del combobox (al pasar a Inversa). */
  combo: number;
  /** 0..1 menu del combobox abierto. */
  menu: number;
  hoverOption: number | null;
  value: string | null;
  loading: boolean;
  spin: number;
  /** Progreso de entrada de cada checkpoint de la lista (orden de la inversa). */
  items: number[];
  distance: string;
  /** 0..1 el selector de base "salta" de la interfaz. */
  breakout: number;
  /** 0..1 pulsacion del boton Guardar. */
  savePress: number;
  /** Escala de la pastilla recien activada. */
  activePop: number;
};

const ITEMS = [
  { name: 'CEDI Villa Nueva', kind: 'origin' as const },
  { name: 'Gasolinera Petapa', kind: 'mid' as const, n: 1 },
  { name: 'Calzada Aguilar Batres', kind: 'mid' as const, n: 2 },
  { name: 'Bodega Zona 12', kind: 'dest' as const }
];

const pinColor = { origin: '#22c55e', dest: '#ef4444', mid: 'var(--primary)' };

const AddRow: FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 4px',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--muted-foreground)'
    }}
  >
    <Plus size={13} />
    {label}
  </div>
);

export const RouteEditorPanelMock: FC<{ s: PanelState }> = ({ s }) => {
  const pills = [
    { id: 'normal', label: 'Normal' },
    { id: 'master', label: 'Maestra', icon: <GitBranch size={12} /> },
    { id: 'reverse', label: 'Inversa', icon: <Repeat size={12} /> }
  ];
  const listStarted = s.items[0] > 0;
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
          <button key={t.key} type="button" className={`route-editor-panel__tab${t.key === 'design' ? ' route-editor-panel__tab--active' : ''}`}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="route-editor-panel__content" style={{ overflow: 'visible' }}>
        <div className="route-editor-panel__route-base" style={{ position: 'relative', zIndex: 20 }}>
          <div className="route-editor-panel__section-header" style={{ paddingTop: 12 }}>
            <span>Base de la ruta</span>
          </div>

          {/* Selector de base: en el breakout se despega de la tarjeta */}
          <div style={{ position: 'relative', display: 'inline-block' }} data-anchor="pills">
            <div
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: 18,
                background: 'var(--card)',
                boxShadow: '0 24px 50px -14px rgba(16,24,40,.35), 0 0 0 1px rgba(16,24,40,.06)',
                opacity: s.breakout,
                transform: `scale(${1 + 0.6 * s.breakout})`,
                transformOrigin: '0% 50%'
              }}
            />
            <div
              className="pill-selector pill-selector--sm"
              style={{ position: 'relative', transform: `scale(${1 + 0.6 * s.breakout}) translateY(${-4 * s.breakout}px)`, transformOrigin: '0% 50%' }}
            >
              {pills.map((p) => {
                const active = s.mode === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    data-anchor={`pill-${p.id}`}
                    className={`pill-selector__btn${active ? ' pill-selector__btn--active' : ''}`}
                    style={active && p.id === 'reverse' ? { transform: `scale(${s.activePop})` } : undefined}
                  >
                    {p.icon && <span className="pill-selector__icon">{p.icon}</span>}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Combobox "Selecciona la ruta a invertir" */}
          <div style={{ height: 46 * s.combo, overflow: s.combo < 0.98 ? 'hidden' : 'visible', opacity: s.combo }}>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <div
                data-anchor="combo"
                style={{
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 10px 0 12px',
                  borderRadius: 'var(--radius-control)',
                  border: `1px solid ${s.menu > 0.5 ? 'var(--primary)' : 'var(--input)'}`,
                  background: 'var(--card)',
                  fontSize: 13,
                  color: s.value ? 'var(--heading-foreground)' : 'var(--placeholder)',
                  fontWeight: s.value ? 600 : 500
                }}
              >
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{s.value ?? 'Selecciona la ruta a invertir'}</span>
                {s.loading && <Loader2 size={15} style={{ color: 'var(--primary)', transform: `rotate(${s.spin}deg)` }} />}
                <ChevronDown size={15} style={{ color: 'var(--chevron)' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 44,
                  padding: 4,
                  borderRadius: 12,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--elevation-overlay)',
                  opacity: s.menu,
                  transform: `translateY(${(1 - s.menu) * -8}px)`,
                  zIndex: 30
                }}
              >
                {ROUTE_OPTIONS.map((o, i) => (
                  <div
                    key={o}
                    data-anchor={`option-${i}`}
                    style={{
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0 10px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--heading-foreground)',
                      background: s.hoverOption === i ? 'var(--primary-tint)' : 'transparent'
                    }}
                  >
                    {i === 1 ? (
                      <GitBranch size={12} className="text-accent-violet" style={{ flex: 'none' }} />
                    ) : (
                      <span style={{ display: 'inline-block', width: 12 }} />
                    )}
                    {o}
                  </div>
                ))}
              </div>
            </div>
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

        {!listStarted ? (
          <div className="route-editor-panel__empty-state" style={{ marginTop: 16 }}>
            <MapPin size={24} className="route-editor-panel__empty-icon" />
            <p className="route-editor-panel__empty-hint">Agrega los checkpoints en el mapa para definir el recorrido.</p>
          </div>
        ) : (
          <div data-anchor="list">
            <div style={{ opacity: s.items[0] }}>
              <AddRow label="Agregar nuevo origen" />
            </div>
            <ul className="rdi-list" style={{ margin: 0, padding: 0 }}>
              {ITEMS.map((it, i) => {
                const p = s.items[i];
                return (
                  <li
                    key={it.name}
                    className="rdi"
                    style={{ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 18}px)` }}
                  >
                    <div className="rdi__row">
                      <div className="rdi__icon rdi__pin-icon">
                        <div className="rdi__pin-marker" style={{ backgroundColor: pinColor[it.kind] }}>
                          {it.kind === 'origin' ? (
                            <CircleDot size={11} color="#fff" />
                          ) : it.kind === 'dest' ? (
                            <Flag size={10} color="#fff" />
                          ) : (
                            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>{it.n}</span>
                          )}
                        </div>
                      </div>
                      <div className="rdi__location-input" style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            height: 32,
                            border: '1px solid #d8d6de',
                            borderRadius: 6,
                            overflow: 'hidden',
                            background: 'var(--card)'
                          }}
                        >
                          <span
                            style={{
                              width: 34,
                              display: 'grid',
                              placeItems: 'center',
                              borderRight: '1px solid #d8d6de',
                              background: 'var(--control-muted)',
                              color: 'var(--primary)'
                            }}
                          >
                            <Building2 size={14} />
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: 13, color: 'var(--muted-foreground)' }}>
                            {it.name}
                          </span>
                        </div>
                      </div>
                      <button type="button" className="rdi__delete-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {i < ITEMS.length - 1 && (
                      <div className="rdi__below">
                        <button type="button" className="rdi__segment-btn">
                          <Spline size={12} />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div style={{ opacity: s.items[3] }}>
              <AddRow label="Agregar nuevo destino" />
            </div>
          </div>
        )}
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
