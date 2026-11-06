// Replica del Mapa de referencias publicas (/partner/references): la pantalla de error que
// salia antes (ErrorBoundary de reactive) y el mapa con su panel "Referencias" que abre ahora
// (PR reactive#1792). Clases y tokens reales (solo lectura). Datos ficticios.
import type { FC } from 'react';
import { ChevronDown, Layers, Minus, Plus, Search, SquareCheck, Square, Tag, TriangleAlert, X, House } from 'lucide-react';
import '@webtrack/views/screens/ReactiveMap/components/MapToolbar/MapToolbar.css';
import '@webtrack/views/screens/ReactiveMap/components/EntitiesPanel/EntitiesPanel.css';
import { MapBase } from '../../components/MapBase';
import { IcoIcon } from '../../components/IcoIcon';
import { AVENUES } from '../crear-ruta-logistica/data';
import { Btn } from '../../components/FormKit';

// Iconos de clase de ubicacion del set IcoMoon de la plataforma (locationClassIconName).
export type Place = { name: string; icon: string; color: string; x: number; y: number };
export const PLACES: Place[] = [
  { name: 'Bodega Central', icon: 'Warehouse', color: '#5b2bff', x: 330, y: 260 },
  { name: 'Gasolinera Km 12', icon: 'GasStation', color: '#f59e0b', x: 560, y: 470 },
  { name: 'Aduana Norte', icon: 'Frontier', color: '#0ea5e9', x: 760, y: 200 },
  { name: 'Parque Industrial', icon: 'Factory', color: '#22c55e', x: 430, y: 640 },
  { name: 'Centro de Distribución', icon: 'Distributor', color: '#ef4444', x: 780, y: 560 }
];
export const SELECTED = 1;

export type RefsState = {
  frame: number;
  /** El mapa ya esta a la vista (detras de la transicion). */
  showMap: boolean;
  /** Entrada de cada marcador, 0..1. */
  markers: number[];
  /** 0..1 panel Referencias abierto. */
  panel: number;
  btnPress: number;
  retryPress: number;
  /** Desplazamiento horizontal de la tarjeta de error (sacudida). */
  shake: number;
  hoverRow: number | null;
  /** 0..1 fila elegida (resalta fila y marcador). */
  picked: number;
};

// Pin real de la app (buildLocationIcon + .marker-pin): gota de 30 px con el icono de la clase.
const MarkerPin: FC<{ p: Place; scale: number; picked: number; frame: number }> = ({ p, scale, picked }) => {
  const ring = `0 0 0 ${3 * picked}px ${p.color}99, 0 0 0 ${6 * picked}px ${p.color}44`;
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, width: 0, height: 0, zIndex: picked > 0.01 ? 6 : 5 }}>
      <div style={{ position: 'absolute', left: -15, top: -42, width: 30, height: 42, transform: `scale(${scale * (1 + 0.12 * picked)})`, transformOrigin: '50% 100%', opacity: Math.min(1, scale * 2) }}>
        <div style={{ position: 'absolute', left: 0, top: 6, width: 30, height: 30, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: p.color, boxShadow: ring }} />
        <div style={{ position: 'absolute', left: 5, top: 11, width: 20, height: 20, display: 'grid', placeItems: 'center', color: '#fff' }}>
          <IcoIcon name={p.icon} size={20} color="#fff" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 8, transform: `translateX(-50%) scale(${scale})`, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,.94)', fontSize: 11, fontWeight: 700, color: 'var(--foreground)', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(15,23,40,.18)', opacity: Math.min(1, scale * 2) }}>
        {p.name}
      </div>
    </div>
  );
};

const ErrorPage: FC<{ s: RefsState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', display: 'grid', placeItems: 'center' }}>
    <div style={{ width: 460, textAlign: 'center', transform: `translateX(${s.shake}px)` }}>
      <div style={{ width: 92, height: 92, margin: '0 auto 22px', borderRadius: 26, display: 'grid', placeItems: 'center', background: 'rgba(239,68,68,.12)', color: '#ef4444' }}>
        <TriangleAlert size={46} strokeWidth={2.2} />
      </div>
      <h2 style={{ margin: '0 0 14px', fontSize: 26, fontWeight: 800, color: 'var(--heading-foreground)' }}>La aplicación no pudo continuar</h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted-foreground)' }}>No pudimos completar la acción. Nuestro equipo ya fue notificado.</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button
          type="button"
          data-anchor="retry"
          style={{ height: 'var(--app-control-h)', padding: '0 20px', border: 'none', borderRadius: 'var(--radius-control)', background: 'linear-gradient(135deg, var(--primary), #5b2bff)', color: '#fff', fontSize: 13, fontWeight: 700, transform: `scale(${1 - 0.06 * s.retryPress})` }}
        >
          Reintentar
        </button>
        <Btn variant="outline">Recargar Página</Btn>
      </div>
      <p style={{ margin: '18px 0 0', fontSize: 11, color: 'var(--muted-foreground)' }}>ID de seguimiento: err_1762358400000_k3x9a2m1q</p>
    </div>
  </div>
);

const Toolbar: FC = () => (
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
      <div className="map-sidebar__divider" />
      <div className="map-sidebar__item">
        <button type="button" className="map-sidebar__btn map-sidebar__btn--active">
          <Tag size={15} />
        </button>
      </div>
      <div className="map-sidebar__item">
        <button type="button" className="map-sidebar__btn">
          <Plus size={15} />
        </button>
      </div>
    </div>
  </div>
);

const ReferencesList: FC<{ s: RefsState }> = ({ s }) => (
  <div className="entities-panel" style={{ width: 400, maxHeight: 'none', opacity: s.panel, transform: `translateY(${(1 - s.panel) * -10}px)`, visibility: s.panel > 0.01 ? 'visible' : 'hidden' }}>
    <div className="entities-toolbar">
      <div className="entities-toolbar__header">
        <span className="entities-toolbar__title">Referencias</span>
        <button className="entities-toolbar__close" type="button">
          <X size={16} />
        </button>
      </div>
    </div>
    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 10px', border: '1px solid var(--input)', borderRadius: 'var(--radius-control)', fontSize: 12, background: 'var(--card)' }}>
        <span style={{ flex: 1 }}>Operador Demo</span>
        <ChevronDown size={14} style={{ color: 'var(--chevron)' }} />
      </div>
    </div>
    <div className="entities-list-view__search-bar">
      <div className="entities-list-view__search" style={{ flex: 1 }}>
        <Search size={12} style={{ color: 'var(--placeholder)' }} />
        <span style={{ fontSize: 12, color: 'var(--placeholder)' }}>Buscar referencia</span>
      </div>
    </div>
    <div className="entities-panel__content">
      {PLACES.map((p, i) => {
        const on = i === SELECTED ? s.picked : 0;
        return (
          <div
            key={p.name}
            data-anchor={`row-${i}`}
            style={{
              height: 42,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 14px',
              borderTop: i ? '1px solid var(--border)' : undefined,
              fontSize: 13,
              fontWeight: on > 0.5 ? 700 : 500,
              color: 'var(--foreground)',
              background: on > 0.01 ? `color-mix(in srgb, var(--primary) ${Math.round(on * 10)}%, transparent)` : s.hoverRow === i ? 'var(--primary-tint)' : 'transparent'
            }}
          >
            {on > 0.5 ? <SquareCheck size={16} style={{ color: 'var(--primary)' }} /> : <Square size={16} style={{ color: 'var(--input)' }} />}
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--foreground)' }}>
              <IcoIcon name={p.icon} size={16} />
            </span>
            {p.name}
          </div>
        );
      })}
    </div>
  </div>
);

export const ReferencesScreen: FC<{ s: RefsState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    {/* Mapa (siempre montado para medir anclas; oculto mientras se ve el error) */}
    <div style={{ position: 'absolute', inset: 0, visibility: s.showMap ? 'visible' : 'hidden' }}>
      <MapBase width={1440} height={810} avenues={AVENUES.slice(1)} labels={[]} seed={11} />
      {PLACES.map((p, i) => (
        <MarkerPin key={p.name} p={p} scale={s.markers[i]} picked={i === SELECTED ? s.picked : 0} frame={s.frame} />
      ))}
      <Toolbar />
      <div className="reactive-map__entities-area" style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, zIndex: 1001 }}>
        <button
          type="button"
          data-anchor="refs-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: s.panel > 0.5 ? 'var(--primary)' : 'var(--card)',
            color: s.panel > 0.5 ? 'var(--primary-foreground)' : 'var(--foreground)',
            border: s.panel > 0.5 ? '1px solid transparent' : '1px solid var(--input)',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: '0 1px 5px rgba(0,0,0,.15)',
            transform: `scale(${1 - 0.06 * s.btnPress})`
          }}
        >
          {s.panel > 0.5 ? <X size={15} /> : <Layers size={15} />}
          <span>Referencias</span>
        </button>
        <ReferencesList s={s} />
      </div>
    </div>
    {/* Error de antes (visible solo al inicio) */}
    <div style={{ position: 'absolute', inset: 0, visibility: s.showMap ? 'hidden' : 'visible' }}>
      <ErrorPage s={s} />
    </div>
  </div>
);
