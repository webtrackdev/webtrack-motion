// Datos ficticios del tutorial de tramos. Sin datos de clientes.
import { roundedPath, type Pt } from '../../../../core/geo';

const S1: Pt[] = [
  [740, 700],
  [740, 565],
  [870, 470],
  [950, 470]
];
const S2: Pt[] = [
  [950, 470],
  [1040, 470],
  [1130, 385],
  [1130, 345]
];
const S3: Pt[] = [
  [1130, 345],
  [1130, 300],
  [1330, 168]
];

export const SEGS = [S1, S2, S3].map((p) => roundedPath(p, 36));
export const FULL_D = roundedPath([...S1, ...S2.slice(1), ...S3.slice(1)], 36);

export const CPS = [
  { name: 'Bodega Zona 12', x: 740, y: 700 },
  { name: 'Calzada Aguilar Batres', x: 950, y: 470 },
  { name: 'Gasolinera Petapa', x: 1130, y: 345 },
  { name: 'CEDI Villa Nueva', x: 1330, y: 168 }
];

/** Tramo que se configura (indice de SEGS): Calzada Aguilar Batres -> Gasolinera Petapa. */
export const EDIT_SEG = 1;
export const STOP_MINUTES = '20';
export const ROUTE_NAME = 'Zona 12 – Villa Nueva';

export const AVENUES = [
  { d: FULL_D, width: 16 },
  { d: 'M -60 300 C 300 270, 560 380, 1500 330', width: 13 },
  { d: 'M 1000 -60 C 1010 300, 900 600, 1060 880', width: 12 },
  { d: 'M 560 880 C 640 640, 520 420, 620 -60', width: 11 }
];

export const LABELS = [
  { x: 640, y: 770, text: 'ZONA 12', size: 13, weight: 800 },
  { x: 1236, y: 110, text: 'VILLA NUEVA', size: 13, weight: 800 },
  { x: 1180, y: 430, text: 'PETAPA', size: 12, weight: 800 },
  { x: 1220, y: 318, text: 'Av. Petapa', rotate: -2, size: 11 }
];
