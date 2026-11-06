// Replica del panel de ruta, seccion Notificaciones: ContactsSelect con VirtualizedCombobox
// creable (PR reactive#1760). Clases y CSS reales de la app (solo lectura). La lista de
// opciones y la fila "Crear: ..." viven siempre en el DOM para medir sus anclas.
import type { FC, ReactNode } from 'react';
import { Bell, ChevronDown, FileText, GitBranch, Pencil, Shuffle, X } from 'lucide-react';
import '@webtrack/views/components/PillSelector/PillSelector.css';
import '@webtrack/views/screens/ReactiveMapRoute/components/RouteEditorPanel/RouteEditorPanel.css';
import { caretOn } from '../../../../core/typing';
import { Btn, glowStyle } from '../../components/FormKit';

export type ContactsState = {
  frame: number;
  /** 0..1 entrada del panel. */
  panel: number;
  /** 0..1 lista abierta. */
  menu: number;
  focus: boolean;
  /** Texto que se esta escribiendo en el campo de eventos. */
  query: string;
  /** Fila de la lista resaltada por el cursor (indice, o 'create'). */
  hover: number | 'create' | null;
  /** Chips seleccionados del campo "por Evento". */
  chips: { text: string; contact: boolean }[];
  /** 0..1 resalte del chip recien creado. */
  glow: number;
  savePress: number;
};

export const CONTACTS = ['Operaciones Norte', 'despacho@ejemplo.com', 'gerencia.logistica@ejemplo.com', 'soporte.flota@ejemplo.com'];

const Chip: FC<{ text: string; edit?: boolean; glow?: number }> = ({ text, edit = true, glow = 0 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '0 4px 0 6px',
      borderRadius: 6,
      background: 'var(--primary-tint)',
      border: `1px solid ${glow > 0.01 ? `color-mix(in srgb, #22c55e ${Math.round(glow * 100)}%, transparent)` : 'color-mix(in srgb, var(--primary) 18%, transparent)'}`,
      boxShadow: glow > 0.01 ? `0 0 0 ${3 * glow}px rgba(34,197,94,${0.3 * glow})` : undefined,
      color: 'var(--foreground)'
    }}
  >
    <span className="rep-contact-tag__label">
      <span className="rep-contact-tag__text">{text}</span>
      {edit && (
        <span className="rep-contact-tag__edit">
          <Pencil size={10} />
        </span>
      )}
    </span>
  </span>
);

const FieldShell: FC<{ label: string; children: ReactNode; z?: number }> = ({ label, children, z }) => (
  <div className="rep-field" style={{ position: 'relative', zIndex: z }}>
    <label className="rep-field__label">{label}</label>
    {children}
  </div>
);

const inputBox = (focused: boolean, glow = 0) => ({
  height: 'auto',
  minHeight: 'var(--app-control-h)',
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  ...glowStyle(glow, focused)
});

const Row: FC<{ children: ReactNode; hover: boolean; anchor?: string }> = ({ children, hover, anchor }) => (
  <div
    data-slot="command-item"
    data-anchor={anchor}
    style={{
      height: 34,
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      borderRadius: 7,
      fontSize: 13,
      color: 'var(--foreground)',
      background: hover ? 'var(--primary-tint)' : 'transparent'
    }}
  >
    {children}
  </div>
);

export const ContactsPanel: FC<{ s: ContactsState }> = ({ s }) => {
  const typing = s.query.length > 0;
  const listH = 4 * 34 + 8;
  const createH = 34 + 8;
  return (
    <div
      className="route-editor-panel surface-card"
      style={{
        position: 'absolute',
        left: 24,
        top: 24,
        width: 440,
        height: 640,
        maxHeight: 'none',
        transform: `translateX(${(1 - s.panel) * -520}px)`,
        opacity: Math.min(1, s.panel * 1.6)
      }}
    >
      <div className="route-editor-panel__header">
        <div className="route-editor-panel__title">
          <Pencil size={14} />
          <span>Editar Ruta</span>
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
          <button key={t.key} type="button" className={`route-editor-panel__tab${t.key === 'general' ? ' route-editor-panel__tab--active' : ''}`}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="route-editor-panel__content" style={{ position: 'relative', overflow: 'hidden', padding: '14px 16px', flex: 1 }}>
        <div className="route-editor-panel__section-header">
          <Bell size={11} />
          <span>Notificaciones</span>
        </div>

        <FieldShell label="Email para Notificación por Tiempo">
          <div className="rep-input" style={inputBox(false)}>
            <Chip text="gerencia.logistica@ejemplo.com" />
          </div>
        </FieldShell>

        <FieldShell label="Frecuencia de Notificación">
          <div className="rep-input" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>Cada 30 minutos</span>
            <ChevronDown size={14} style={{ color: 'var(--chevron)' }} />
          </div>
        </FieldShell>

        <FieldShell label="Email para Notificación por Evento" z={20}>
          <div data-anchor="field-event" className="rep-input" style={inputBox(s.focus)}>
            {s.chips.map((c, i) => (
              <Chip key={c.text} text={c.text} edit={c.contact} glow={i === s.chips.length - 1 && s.chips.length > 1 ? s.glow : 0} />
            ))}
            <span style={{ display: 'flex', alignItems: 'center', minWidth: 40, flex: 1, color: s.query ? 'var(--foreground)' : 'var(--placeholder)' }}>
              {s.query || (s.chips.length ? '' : 'Buscar contacto')}
              {s.focus && <span style={{ display: 'inline-block', width: 1.5, height: 16, background: 'var(--primary)', opacity: caretOn(s.frame) ? 1 : 0, marginLeft: 1 }} />}
            </span>
          </div>

          {/* Lista del combobox: opciones existentes o, al escribir, la opcion de crear */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 'calc(100% + 4px)',
              height: typing ? createH : listH,
              padding: 4,
              borderRadius: 10,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--elevation-overlay)',
              overflow: 'hidden',
              zIndex: 40,
              opacity: s.menu,
              transform: `translateY(${(1 - s.menu) * -6}px)`,
              visibility: s.menu > 0.01 ? 'visible' : 'hidden'
            }}
          >
            <div style={{ visibility: typing ? 'hidden' : 'visible' }}>
              {CONTACTS.map((c, i) => (
                <Row key={c} hover={s.hover === i}>
                  <span className="rep-contact-tag__label" style={{ flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
                    <span className="rep-contact-tag__text" style={{ flex: 1, minWidth: 0, maxWidth: 'none', fontSize: 13 }}>
                      {c}
                    </span>
                    <span className="rep-contact-tag__edit">
                      <Pencil size={11} />
                    </span>
                  </span>
                </Row>
              ))}
            </div>
            <div style={{ position: 'absolute', left: 4, right: 4, top: 4, visibility: typing ? 'visible' : 'hidden' }}>
              <Row hover={s.hover === 'create'} anchor="opt-create">
                <span style={{ fontWeight: 700 }}>Crear: {s.query || 'bodega.norte@ejemplo.com'}</span>
              </Row>
            </div>
          </div>
        </FieldShell>

        <FieldShell label="Eventos para Notificación">
          <div className="rep-input" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1, color: 'var(--placeholder)' }}>Seleccionar...</span>
            <ChevronDown size={14} style={{ color: 'var(--chevron)' }} />
          </div>
        </FieldShell>
      </div>

      <div style={{ height: 62, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Btn press={s.savePress} minWidth={110}>
          Guardar
        </Btn>
        <Btn variant="outline" minWidth={110}>
          Cancelar
        </Btn>
      </div>
    </div>
  );
};
