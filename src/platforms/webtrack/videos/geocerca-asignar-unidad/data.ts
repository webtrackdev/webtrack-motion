// Datos ficticios. Coordenadas en px de la UI (1440x810).
export const GEOFENCE = { name: 'Bodega Central', address: 'Zona 12', radiusM: 250, cx: 760, cy: 380, r: 118 };

export const UNITS = [
  { name: 'P-118', x: 430, y: 560 },
  { name: 'C-204', x: 1010, y: 640 },
  { name: 'M-310', x: 1180, y: 230 }
];

/** Recorrido de P-118 hacia la geocerca (escena de resultado). */
export const P118_PATH = 'M 430 560 L 520 560 Q 560 560 590 530 L 640 470 Q 670 440 710 430 L 760 420';

export const AVENUES = [
  { d: 'M -60 560 L 520 560 Q 560 560 590 530 L 640 470 Q 670 440 710 430 L 1500 380', width: 15 },
  { d: 'M -60 300 C 300 270, 560 380, 1500 330', width: 12 },
  { d: 'M 1000 -60 C 1010 300, 900 600, 1060 880', width: 12 },
  { d: 'M 560 880 C 640 640, 520 420, 620 -60', width: 11 }
];

export const LABELS = [
  { x: 690, y: 560, text: 'ZONA 12', size: 13, weight: 800 },
  { x: 1180, y: 520, text: 'ZONA 11', size: 13, weight: 800 },
  { x: 250, y: 545, text: 'Calz. Aguilar Batres', size: 11 }
];

export const NOTIFY_OPTIONS = ['Entrada', 'Salida', 'Entrada/Salida'];
export const GEOFENCE_OPTIONS = ['Bodega Central (Círculo)', 'Planta Mixco (Polígono)', 'CEDI Villa Nueva (Rectángulo)'];
export const UNIT_OPTIONS = ['P-118', 'C-204', 'M-310', 'T-402'];
export const ORG = 'Transportes Demo';
