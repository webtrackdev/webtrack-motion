// Replica de Planes de Trabajo > Dashboard PT (vista Aeropuerto, WorkplansAirportScreen +
// AirportView). Mismas clases (.wp-airport, .wpa-*), mismos tokens y mismos textos del i18n de
// reactive (solo lectura). Estados del PR #1782: cargador solo la primera vez y, en los
// refrescos, tarjetas conservadas con "Actualizando…" en el encabezado. Datos ficticios.
import type { FC } from 'react';
import { ChevronRight, ChevronUp, Funnel } from 'lucide-react';
import '@webtrack/views/screens/Workplans/views/WorkplansAirportScreen/AirportView/styles.css';
import '@webtrack/views/components/PillSelector/PillSelector.css';
import {
  T,
  buildScale,
  deltaCls,
  fmtDelta,
  fmtDur,
  fmtPct,
  isExecutionComplete,
  isExecutionIncomplete,
  lastReachedStopIndex,
  progressPct,
  refStats,
  utilization
} from '@webtrack/views/screens/Workplans/views/WorkplansAirportScreen/AirportView/helpers';
import type { CapacityUnit, PlanStop, PlanUnit, UnassignedRef, WorkPlanMeta } from '@webtrack/views/screens/Workplans/views/WorkplansAirportScreen/AirportView/types';
import { META, UNASSIGNED, UNITS } from './data';

export type AirportState = {
  frame: number;
  /** Tablero con tarjetas o el cargador de la primera carga (el de "antes" en cada refresco). */
  loader: boolean;
  /** Hay una consulta en curso: el encabezado dice "Actualizando…". */
  refreshing: boolean;
  /** Version de los datos: 0 = 10:42, 1 = 10:44. */
  data: 0 | 1;
  /** 0..1 resalte "recien actualizado" de lo que cambio. */
  fresh: number;
};

// Textos del i18n real (es.json de Workplans y de la app).
const TXT = {
  headerTitle: 'Plan de Trabajos',
  updatedAt: (time: string) => `Actualizado ${time}`,
  refreshing: 'Actualizando…',
  loading: 'Cargando el tablero del plan…',
  monitor: 'Monitor',
  bi: 'Inteligencia de Negocios',
  capacity: 'Capacidad'
};
const plural = (n: number, one: string, other: string) => (n === 1 ? `${n} ${one}` : `${n} ${other}`);
const SYMBOL: Record<CapacityUnit, string> = { m3: 'm³', peso: 'kg', litros: 'L', sacos: 'sacos', cajas: 'cajas', unidades: 'un' };

// Estados de ejecucion (WORKPLAN_EXECUTION_STATUS_CATALOG): etiqueta y color reales.
const EXEC: Record<number, { label: string; color: string }> = {
  1: { label: 'En Tránsito', color: '#ff7b7b' },
  4: { label: 'En Visita', color: '#7669e8' },
  5: { label: 'Completo', color: '#22a06b' }
};

const ExecBadge: FC<{ status: number; anchor?: string }> = ({ status, anchor }) => (
  <span className="inline-flex cursor-help" data-anchor={anchor}>
    <span data-slot="status-badge" data-tone="custom" className="status-badge status-badge--custom" style={{ ['--status-badge-color' as string]: EXEC[status].color }}>
      <span className="status-dot" aria-hidden="true" />
      {EXEC[status].label}
    </span>
  </span>
);

const TRUCK_SVG = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
    <path d="M2 6h11a1 1 0 0 1 1 1v8H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm13 3h3.5L21 12v3h-6V9z" />
    <circle cx="6.5" cy="17.5" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
  </svg>
);

const StopLabel: FC<{ stop: PlanStop }> = ({ stop }) => {
  const arrow = stop.terminal ? null : <span className={`op-arrow ${stop.op === 'delivery' ? 'd' : 'p'}`}>{stop.op === 'delivery' ? '▼' : '▲'}</span>;
  const showEmptyReal = !stop.real && (!stop.terminal || !stop.sal);
  const deltaMin = stop.deltaMin ?? (stop.real ? T(stop.real) - T(stop.plan) : null);
  return (
    <>
      <div className="name">
        {arrow} {arrow ? ' ' : null}
        {stop.name}
      </div>
      <div className="kv">
        <span className="k">Plan</span>
        <span className="v">{stop.plan}</span>
      </div>
      {stop.real ? (
        <div className="kv">
          <span className="k">Real</span>
          <span className="v">{stop.real}</span>
        </div>
      ) : showEmptyReal ? (
        <div className="kv">
          <span className="k">Real</span>
          <span className="v soft">—</span>
        </div>
      ) : null}
      {stop.sal ? (
        <div className="kv">
          <span className="k">Salida</span>
          <span className="v">{stop.sal}</span>
        </div>
      ) : null}
      {deltaMin != null ? <div className={`delta ${deltaCls(deltaMin)}`}>{fmtDelta(deltaMin)}</div> : null}
      {stop.winBad ? <div className="win-bad">Vent {stop.win}</div> : null}
    </>
  );
};

const RouteTimeline: FC<{ unit: PlanUnit; meta: WorkPlanMeta; anchorStop?: number }> = ({ unit, anchorStop }) => {
  const { xs } = buildScale(unit);
  const reached = lastReachedStopIndex(unit);
  const truckX =
    unit.truckAt == null || reached < 0 ? null : unit.stops[reached].sal && reached < xs.length - 1 ? (xs[reached] + xs[reached + 1]) / 2 : xs[reached];
  const trackStyle = { ['--wpa-stops' as string]: unit.stops.length };
  return (
    <div className="wpa-track-scroll">
      <div className="wpa-track" style={trackStyle}>
        <div className="wpa-rail" />
        {xs.slice(0, -1).map((left, i) => {
          const right = xs[i + 1];
          const future = truckX !== null && left >= truckX;
          return <div key={`seg-${i}`} className={`wpa-seg ${unit.segments[i] || 'g'}${future ? ' future' : ''}`} style={{ left: `${left}%`, width: `${right - left}%` }} />;
        })}
        {unit.stops.map((s, i) => {
          const pending = !s.terminal && !s.real;
          const classes = ['wpa-stop', s.terminal ? 'terminal' : '', pending ? 'pending' : '', s.late ? 'late' : '', s.warn ? 'warn' : '', s.op === 'pickup' ? 'pickup' : ''].filter(Boolean).join(' ');
          return (
            <div key={`stop-${i}`} className={classes} style={{ left: `${xs[i]}%` }} title={s.name}>
              <div className="dot" />
            </div>
          );
        })}
        {truckX !== null ? (
          <div className={`wpa-truck ${unit.status === 'alert' ? 'bad' : 'ok'}`} style={{ left: `${truckX}%` }} title={`Última comunicación · ${unit.truckAt}`}>
            {TRUCK_SVG}
          </div>
        ) : null}
        {unit.stops.map((s, i) => (
          <div key={`lbl-${i}`} data-anchor={anchorStop === i ? 'stop-changed' : undefined} className={`wpa-stop-lbl${s.terminal ? ' terminal-lbl' : ''}`} style={{ left: `${xs[i]}%` }}>
            <StopLabel stop={s} />
          </div>
        ))}
      </div>
    </div>
  );
};

const UnitCard: FC<{ unit: PlanUnit; meta: WorkPlanMeta; index: number; fresh: number; changed: boolean }> = ({ unit, meta, index, fresh, changed }) => {
  const rs = refStats(unit);
  const { dem, pct } = utilization(unit);
  const sym = SYMBOL[meta.capacityUnit];
  const prog = progressPct(unit);
  const fuelGal = unit.km / meta.fuelKmPerGal;
  const cap = unit.cap as number;
  const capCls = pct! > 95 ? 'cap-crit' : pct! >= 80 ? 'cap-warn' : 'cap-ok';
  const flash = changed ? fresh : 0;
  return (
    <article
      data-anchor={`card-${index}`}
      className="wpa-unit surface-card"
      style={flash > 0.01 ? { borderColor: `color-mix(in srgb, #22c55e ${Math.round(flash * 100)}%, var(--border))`, boxShadow: `0 0 0 ${3 * flash}px rgba(34,197,94,${0.22 * flash})` } : undefined}
    >
      <div className="wpa-unit-head">
        <div>
          <div className="unit-title">
            <span className="uid">{unit.id}</span>
            <span className="sep">·</span>
            <span className="driver">{unit.driver}</span>
            <span className={`tag ${unit.restricted ? 'restr' : 'free'}`}>{unit.restricted ? 'Franja restringida aplica' : 'Libre circulación'}</span>
          </div>
          <div className="unit-meta">
            {rs.done}/{rs.total} paradas visitadas · Inicio <span className="mono">{unit.start}</span> · Cierre <span className="mono">{unit.end}</span>
          </div>
        </div>
        <div className="right">
          <ExecBadge status={unit.executionStatus} anchor={`badge-${index}`} />
          {unit.alertNote ? <div className="alert-note" dangerouslySetInnerHTML={{ __html: unit.alertNote }} /> : null}
        </div>
      </div>
      <div className={`wpa-cap ${capCls}`}>
        <span className="cap-label">{TXT.capacity}</span>
        <div className="cap-bar">
          {unit.stops
            .filter((s) => !s.terminal)
            .map((s, i) => (
              <div key={`${s.name}-${i}`} className="cap-seg" style={{ width: `${(((s.dem ?? 0) / cap) * 100).toFixed(2)}%` }} title={`${s.name} · ${s.dem} ${sym}`} />
            ))}
        </div>
        <span className="cap-num">
          {dem.toFixed(1)} / {cap.toFixed(1)} {sym}
          <span className="pct">{fmtPct(pct!)}</span>
        </span>
      </div>
      <RouteTimeline unit={unit} meta={meta} anchorStop={changed ? 4 : undefined} />
      <div className="wpa-unit-foot">
        <span className="route-name">{unit.routeName}</span>
        <span className="progress">
          <span className="p-bar">
            <span className={`p-fill${unit.status === 'alert' ? ' bad' : ''}`} style={{ width: `${prog}%`, display: 'block' }} />
          </span>
          <span className="p-num">{prog}%</span>
        </span>
        <div className="spacer" />
        <span className="foot-stat">
          <span className="k">Distancia</span> {unit.km.toFixed(1)} km
        </span>
        <span className="foot-stat">
          <span className="k">Duración</span> {fmtDur(unit.durMin)}
        </span>
        <span className="foot-stat">
          <span className="k">Combustible</span> {fuelGal.toFixed(1)} gal
        </span>
        <span className="foot-stat">
          <span className="k">Desv.</span> <span className={`desv ${deltaCls(unit.desvMin)}`}>{fmtDelta(unit.desvMin)}</span>
        </span>
      </div>
    </article>
  );
};

const Kpis: FC<{ units: PlanUnit[]; meta: WorkPlanMeta; unassigned: UnassignedRef[] }> = ({ units, meta, unassigned }) => {
  const totals = units.reduce(
    (acc, u) => {
      const rs = refStats(u);
      acc.refs += rs.total;
      acc.done += rs.done;
      acc.km += u.km;
      if (u.km > 0) acc.withKm += 1;
      const { pct } = utilization(u);
      if (pct != null) {
        acc.util += pct;
        acc.withCap += 1;
      }
      if (rs.done > 0) {
        acc.desv += u.desvMin;
        acc.withVisits += 1;
      }
      return acc;
    },
    { refs: 0, done: 0, km: 0, withKm: 0, util: 0, withCap: 0, desv: 0, withVisits: 0 }
  );
  const distinctUnits = new Set(units.map((u) => u.unitId)).size;
  const doneUnits = units.filter(isExecutionComplete).length;
  const incompleteUnits = units.filter(isExecutionIncomplete).length;
  const inProgress = units.length - doneUnits - incompleteUnits;
  const avgUtil = totals.withCap > 0 ? totals.util / totals.withCap : null;
  const avgDesv = totals.withVisits > 0 ? totals.desv / totals.withVisits : null;
  const fuelGal = totals.km / meta.fuelKmPerGal;
  return (
    <div className="wpa-kpis">
      <div className="wpa-kpi surface-card">
        <div className="label">Unidades</div>
        <div className="value">
          {distinctUnits}
          {meta.totalUnitsAvailable != null ? <small> / {meta.totalUnitsAvailable}</small> : null}
        </div>
        <div className="sub">
          <span className="muted">{plural(units.length, 'plan', 'planes')}</span>
          <span className="dot">·</span>
          <span className="muted">{inProgress} en curso</span>
          <span className="dot">·</span>
          <span className="ok">{plural(doneUnits, 'completo', 'completos')}</span>
          <span className="dot">·</span>
          <span className="bad">{plural(incompleteUnits, 'incompleto', 'incompletos')}</span>
        </div>
      </div>
      <div className="wpa-kpi surface-card" data-anchor="kpi-refs">
        <div className="label">Referencias</div>
        <div className="value v-green">
          {totals.done}
          <small> / {totals.refs}</small>
        </div>
        <div className="sub">
          <span className="ok">{totals.done} visitadas</span>
          <span className="dot">·</span>
          <span className="muted">{totals.refs - totals.done} pendientes</span>
          <span className="dot">·</span>
          <span className="bad">{unassigned.length} sin asignar</span>
        </div>
      </div>
      <div className="wpa-kpi surface-card">
        <div className="label">Utilización de flota</div>
        <div className="value v-blue">{avgUtil == null ? '—' : fmtPct(avgUtil)}</div>
        <div className="sub">
          <span className="muted">
            {totals.withCap} de {units.length} con capacidad · {SYMBOL[meta.capacityUnit]}
          </span>
        </div>
      </div>
      <div className="wpa-kpi surface-card">
        <div className="label">Km planificados</div>
        <div className="value">
          {totals.km.toFixed(1)}
          <small> km</small>
        </div>
        <div className="sub">
          <span className="muted">
            {totals.withKm} de {units.length} con distancia estimada
          </span>
        </div>
      </div>
      <div className="wpa-kpi surface-card">
        <div className="label">Desviación promedio</div>
        <div className={`value ${avgDesv != null && avgDesv > 5 ? 'v-amber' : ''}`}>{avgDesv == null ? '—' : fmtDelta(Math.round(avgDesv))}</div>
        <div className="sub">
          <span className="muted">última llegada real vs. plan · {totals.withVisits} con visitas</span>
        </div>
      </div>
      <div className="wpa-kpi surface-card">
        <div className="label">Combustible estimado</div>
        <div className="value v-amber">
          {fuelGal.toFixed(1)}
          <small> gal</small>
        </div>
        <div className="sub">
          <span className="muted">km planificados / {meta.fuelKmPerGal} km/gal</span>
        </div>
      </div>
    </div>
  );
};

const Pills: FC = () => (
  <div className="wpa-section-tabs">
    <div className="pill-selector pill-selector--md ">
      <button className="pill-selector__btn pill-selector__btn--active" type="button">
        <span>{TXT.monitor}</span>
      </button>
      <button className="pill-selector__btn" type="button">
        <span>{TXT.bi}</span>
      </button>
    </div>
  </div>
);

const Toolbar: FC<{ counts: { all: number; alerts: number; unassigned: number } }> = ({ counts }) => (
  <div className="wpa-toolbar">
    <button type="button" className="tab active">
      Todas <span className="count">{counts.all}</span>
    </button>
    <button type="button" className="tab alert-tab">
      Con alertas <span className="count">{counts.alerts}</span>
    </button>
    <button type="button" className="tab alert-tab">
      Sin asignar <span className="count">{counts.unassigned}</span>
    </button>
    <div className="spacer" />
    <div className="sort-wrap">
      <span className="label">Ordenar por</span>
      <select value="priority" onChange={() => undefined}>
        <option value="priority">Alertas primero</option>
        <option value="util">Utilización</option>
        <option value="start">Hora de inicio</option>
      </select>
    </div>
  </div>
);

const Board: FC<{ s: AirportState }> = ({ s }) => {
  const meta = META[s.data];
  const units = UNITS(s.data);
  const counts = { all: units.length, alerts: units.filter((u) => u.status === 'alert').length, unassigned: UNASSIGNED.length };
  // Punto que pulsa mientras se consulta; en reposo, fijo.
  const beat = s.refreshing ? 0.5 + 0.5 * Math.sin(s.frame * 0.42) : 0;
  const freshText = s.fresh > 0.01 ? { color: `color-mix(in srgb, var(--success) ${Math.round(s.fresh * 100)}%, var(--muted-foreground))`, fontWeight: 700 } : undefined;
  return (
    <div className="wp-airport">
      {/* PlanHeader (PR #1782) */}
      <div className="wpa-header">
        <h2>{TXT.headerTitle}</h2>
        <span className="plan-id">{[meta.id, meta.scheduleLabel, meta.hub].filter(Boolean).join(' · ')}</span>
        <div className="spacer" />
        <span className={`updated${s.refreshing ? ' refreshing' : ''}`} data-anchor="updated" style={freshText}>
          <span className="pulse" style={s.refreshing ? { opacity: 0.35 + 0.65 * beat, transform: `scale(${0.8 + 0.5 * beat})` } : undefined} />
          {s.refreshing ? TXT.refreshing : TXT.updatedAt(meta.now)}
        </span>
      </div>
      <Pills />
      <Kpis units={units} meta={meta} unassigned={UNASSIGNED} />
      <Toolbar counts={counts} />
      {units.map((u, i) => (
        <UnitCard key={u.key} unit={u} meta={meta} index={i} fresh={s.fresh} changed={i === 0 && s.data === 1} />
      ))}
      <section className="wpa-unassigned surface-card">
        <h3>
          Referencias sin asignar <span className="count">{UNASSIGNED.length}</span>
        </h3>
        <div className="ua-grid">
          {UNASSIGNED.map((r, i) => (
            <div className="ua-card surface-card" key={`${r.name}-${i}`}>
              <div className="name">{r.name}</div>
              <div className="detail">{r.detail}</div>
              <span className={`reason ${r.reason.cls}`}>{r.reason.txt}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Cargador de la primera carga (y, antes del PR, de cada refresco): reemplazaba todo el tablero.
const Loader: FC<{ frame: number }> = ({ frame }) => (
  <div className="wp-airport">
    <div className="surface-card flex flex-col items-center gap-3 py-12 text-center">
      <div
        data-slot="spinner"
        role="status"
        className="inline-block rounded-full border-current border-t-transparent border-solid size-8 border-[3px] text-primary"
        style={{ transform: `rotate(${frame * 14}deg)` }}
      />
      <span className="text-muted-foreground">{TXT.loading}</span>
    </div>
  </div>
);

// SmartFilter ya buscado: colapsado, con el resumen de filtros activos.
const FilterBar: FC = () => (
  <div
    data-slot="card"
    className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-hairline app-collapse collapse-border gap-0 py-3 mb-4"
  >
    <div data-slot="card-header" className="flex flex-row items-center cursor-pointer collapsed px-6">
      <div className="flex w-full items-center">
        <div className="flex items-center gap-3" style={{ minWidth: 'fit-content' }}>
          <div data-slot="icon-tile" className="icon-tile icon-tile--sm">
            <Funnel />
          </div>
          <div data-slot="card-title" className="collapse-title text-card-title mb-0 whitespace-nowrap text-heading-foreground leading-none font-semibold">
            Filtros
          </div>
        </div>
        <div className="grow mx-6">
          <div className="filter-summary flex flex-wrap items-center">
            <span data-slot="badge" className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 whitespace-nowrap border-primary-tint-border bg-primary-tint text-primary-ink mx-2 filter-summary-badge" style={{ padding: '0.4rem 0.6rem', maxWidth: 250, fontSize: 12, fontWeight: 500 }}>
              <span className="me-2">
                <strong>Fecha:</strong> 2026-11-06
              </span>
            </span>
            <span data-slot="badge" className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 whitespace-nowrap border-neutral-tint-border bg-neutral-tint text-secondary-foreground mx-1" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
              AND
            </span>
            <span data-slot="badge" className="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 whitespace-nowrap border-primary-tint-border bg-primary-tint text-primary-ink mx-2 filter-summary-badge" style={{ padding: '0.4rem 0.6rem', maxWidth: 250, fontSize: 12, fontWeight: 500 }}>
              <span className="me-2">
                <strong>Organización:</strong> Transportes Alfa
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center" style={{ minWidth: 'fit-content' }}>
          <ChevronUp size={16} className="text-subtle-foreground" />
        </div>
      </div>
    </div>
  </div>
);

export const AirportScreen: FC<{ s: AirportState }> = ({ s }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', padding: '26px 32px', overflow: 'hidden' }}>
    <div className="page-header">
      <nav className="page-breadcrumb">
        <span>Logística</span>
        <ChevronRight />
        <span>Plan de Trabajo</span>
        <ChevronRight />
        <span data-slot="breadcrumb-page">Dashboard PT</span>
      </nav>
      <h1 className="page-title">Dashboard PT</h1>
      <p className="page-subtitle">Tablero del día por unidad: entregas, capacidad y desviación de cada plan de trabajo.</p>
    </div>
    <FilterBar />
    <div className="mb-16" style={{ position: 'relative' }}>
      {/* El tablero queda montado siempre (para medir anclas); el cargador lo tapa cuando toca */}
      <div style={{ visibility: s.loader ? 'hidden' : 'visible' }}>
        <Board s={s} />
      </div>
      {s.loader && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0 }}>
          <Loader frame={s.frame} />
        </div>
      )}
    </div>
  </div>
);
