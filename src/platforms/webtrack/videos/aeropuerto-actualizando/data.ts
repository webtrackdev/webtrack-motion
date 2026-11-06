// Datos ficticios del tablero Aeropuerto (mismo contrato PlanUnit de reactive). Dos versiones:
// 0 = lo que se ve a las 10:42 y 1 = el tablero nuevo que llega a las 10:44.
import type { PlanUnit, WorkPlanMeta } from '@webtrack/views/screens/Workplans/views/WorkplansAirportScreen/AirportView/types';

export const META: Record<0 | 1, WorkPlanMeta> = {
  0: { id: 'PT-0611', scheduleLabel: '06:30–12:20', hub: 'Bodega Central', capacityUnit: 'm3', fuelKmPerGal: 9, now: '10:42', restrictedBands: [], totalUnitsAvailable: 8 },
  1: { id: 'PT-0611', scheduleLabel: '06:30–12:20', hub: 'Bodega Central', capacityUnit: 'm3', fuelKmPerGal: 9, now: '10:44', restrictedBands: [], totalUnitsAvailable: 8 }
};

const u1 = (v: 0 | 1): PlanUnit => ({
  key: '5101',
  unitId: 14,
  id: 'CAM-014',
  driver: 'Marcos Rivera',
  cap: 12,
  restricted: false,
  status: 'alert',
  executionStatus: 1,
  alertNote: v === 0 ? 'Atraso <b>+6m</b> · próxima parada Panadería Santa Rosa' : 'Atraso <b>+23m</b> en Panadería Santa Rosa',
  routeName: 'Ruta Norte 1',
  km: 64.2,
  durMin: 350,
  desvMin: v === 0 ? 6 : 12,
  start: '06:30',
  end: '12:20',
  truckAt: v === 0 ? '10:41' : '10:43',
  stops: [
    { name: 'Bodega Central', terminal: true, plan: '06:30', real: '06:32', sal: '06:40', deltaMin: 2 },
    { name: 'Tienda La Fuente', op: 'delivery', plan: '07:20', real: '07:24', sal: '07:34', dem: 2.4, deltaMin: 4 },
    { name: 'Súper Mercado Norte', op: 'delivery', plan: '08:15', real: '08:21', sal: '08:33', dem: 3.1, deltaMin: 6, late: true },
    { name: 'Farmacia Central', op: 'pickup', plan: '09:10', real: '09:16', sal: '09:24', dem: 0.8, deltaMin: 6, late: true },
    v === 0
      ? { name: 'Panadería Santa Rosa', op: 'delivery', plan: '10:20', dem: 1.9 }
      : { name: 'Panadería Santa Rosa', op: 'delivery', plan: '10:20', real: '10:43', dem: 1.9, deltaMin: 23, late: true },
    { name: 'Distribuidora El Sol', op: 'delivery', plan: '11:30', dem: 2.2 },
    { name: 'Bodega Central', terminal: true, plan: '12:20' }
  ],
  segments: v === 0 ? ['g', 'r', 'r', 'g', 'g', 'g'] : ['g', 'r', 'r', 'r', 'g', 'g']
});

const u2: PlanUnit = {
  key: '5102',
  unitId: 27,
  id: 'CAM-027',
  driver: 'Lucía Ortega',
  cap: 9,
  restricted: true,
  status: 'ok',
  executionStatus: 4,
  routeName: 'Ruta Sur 2',
  km: 48.9,
  durMin: 330,
  desvMin: 2,
  start: '07:00',
  end: '12:30',
  truckAt: '10:40',
  stops: [
    { name: 'Bodega Central', terminal: true, plan: '07:00', real: '07:01', sal: '07:10', deltaMin: 1 },
    { name: 'Ferretería Los Pinos', op: 'delivery', plan: '07:45', real: '07:47', sal: '07:55', dem: 1.6, deltaMin: 2 },
    { name: 'Colegio San Andrés', op: 'delivery', plan: '08:50', real: '08:49', sal: '09:00', dem: 2.2, deltaMin: -1 },
    { name: 'Tienda El Mirador', op: 'delivery', plan: '10:30', real: '10:32', dem: 2.5, deltaMin: 2 },
    { name: 'Clínica Santa Elena', op: 'delivery', plan: '11:20', dem: 1.4 },
    { name: 'Bodega Central', terminal: true, plan: '12:30' }
  ],
  segments: ['g', 'g', 'g', 'g', 'g']
};

const u3: PlanUnit = {
  key: '5103',
  unitId: 31,
  id: 'CAM-031',
  driver: 'Pedro Aguilar',
  cap: 10,
  restricted: false,
  status: 'done',
  executionStatus: 5,
  routeName: 'Ruta Centro 3',
  km: 31.5,
  durMin: 240,
  desvMin: -4,
  start: '06:00',
  end: '10:00',
  truckAt: '10:02',
  stops: [
    { name: 'Bodega Central', terminal: true, plan: '06:00', real: '06:00', sal: '06:08', deltaMin: 0 },
    { name: 'Librería Aurora', op: 'delivery', plan: '06:45', real: '06:42', sal: '06:52', dem: 2, deltaMin: -3 },
    { name: 'Hotel Plaza Real', op: 'delivery', plan: '07:50', real: '07:44', sal: '07:58', dem: 3.4, deltaMin: -6 },
    { name: 'Bodega Central', terminal: true, plan: '10:00', real: '09:56', deltaMin: -4 }
  ],
  segments: ['g', 'g', 'g']
};

export const UNITS = (v: 0 | 1): PlanUnit[] => [u1(v), u2, u3];
export const UNASSIGNED = [
  { name: 'Veterinaria Mi Mascota', detail: 'Zona 7 · 1.2 m³', reason: { cls: 'cap' as const, txt: 'Sin capacidad disponible' } },
  { name: 'Cafetería El Roble', detail: 'Zona 10 · 0.6 m³', reason: { cls: 'opt' as const, txt: 'Opcional — omitida' } }
];
