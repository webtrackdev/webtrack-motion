// Datos ficticios del video de rutas inversas (WD-3970). Sin datos de clientes.
import { roundedPath, type Pt } from '../../../../core/geo';

export const FORWARD_PTS: Pt[] = [
  [740, 700],
  [740, 565],
  [870, 470],
  [1040, 470],
  [1130, 385],
  [1130, 300],
  [1330, 168]
];

export const FORWARD_D = roundedPath(FORWARD_PTS, 42);
export const REVERSE_D = roundedPath([...FORWARD_PTS].reverse(), 42);

// Checkpoints de la ruta de ida, en orden.
export const CHECKPOINTS = [
  { name: 'Bodega Zona 12', x: 740, y: 700 },
  { name: 'Calzada Aguilar Batres', x: 950, y: 470 },
  { name: 'Gasolinera Petapa', x: 1130, y: 345 },
  { name: 'CEDI Villa Nueva', x: 1330, y: 168 }
];

export const SOURCE_ROUTE = 'Zona 12 – Villa Nueva';
export const NEW_ROUTE = 'Villa Nueva – Zona 12';
export const ROUTE_OPTIONS = [SOURCE_ROUTE, 'Mixco – Zona 4', 'Escuintla – Palín', 'Zona 18 – Fraijanes'];
export const DISTANCE_KM = 18.6;

export const AVENUES = [
  { d: FORWARD_D, width: 16 },
  { d: 'M -60 300 C 300 270, 560 380, 1500 330', width: 13 },
  { d: 'M 1000 -60 C 1010 300, 900 600, 1060 880', width: 12 },
  { d: 'M 560 880 C 640 640, 520 420, 620 -60', width: 11 }
];

export const LABELS = [
  { x: 640, y: 770, text: 'ZONA 12', size: 13, weight: 800 },
  { x: 1236, y: 110, text: 'VILLA NUEVA', size: 13, weight: 800 },
  { x: 1180, y: 430, text: 'PETAPA', size: 12, weight: 800 },
  { x: 760, y: 540, text: 'Calz. Aguilar Batres', rotate: -36, size: 11 },
  { x: 1220, y: 318, text: 'Av. Petapa', rotate: -2, size: 11 }
];
