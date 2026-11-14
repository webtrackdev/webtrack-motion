// Mapa del viaje de la caja: posiciones de cada parada (coordenadas del mundo), rutas y
// linea de tiempo del video. El mundo mide ~3900x2050; la camara lo recorre.

/** Linea de tiempo (frames a 30 fps). Cada parada tiene vuelo de camara + pestanas. */
export const T = {
  intro: 0,
  overview: 150,
  web: 480,
  webLang: 535,
  webFolders: 805,
  webPatterns: 1085,
  bridge: 1385,
  server: 1690,
  srvLang: 1740,
  srvSecurity: 2020,
  srvLayers: 2265,
  srvFolders: 2595,
  oop: 2900,
  oopInherit: 2930,
  oopEncap: 3175,
  oopIface: 3455,
  data: 3700,
  dataWhy: 3815,
  dataOrm: 4085,
  events: 4300,
  pilot: 4900,
  sats: 5350,
  deploy: 5740,
  summary: 6040,
  end: 6560,
  total: 6720
};

export const P = {
  web: { x: 520, y: 900 },
  map: { x: 560, y: 1640 },
  server: { x: 1720, y: 800 },
  data: { x: 2860, y: 760 },
  mail: { x: 1380, y: 1330 },
  blob: { x: 1830, y: 1330 },
  azsql: { x: 2330, y: 1330 },
  ident: { x: 2830, y: 1330 },
  pilot: { x: 2700, y: 1820 },
  phone: { x: 3080, y: 1700 },
  mapbox: { x: 420, y: 230 },
  claude: { x: 1350, y: 150 },
  serp: { x: 1900, y: 110 },
  bright: { x: 2450, y: 150 },
  github: { x: 3700, y: 1330 }
};

export const AZURE = { x: 1090, y: 380, w: 2280, h: 1160 };

/** Rutas del mundo (SVG). La caja viaja por `main1` y `main2`. */
export const R = {
  main1: 'M 800 820 C 1050 820, 1200 640, 1470 640',
  main2: 'M 1970 640 C 2200 640, 2420 600, 2660 640',
  mail: 'M 1620 1080 C 1560 1160, 1420 1170, 1390 1225',
  blob: 'M 1760 1080 C 1780 1150, 1820 1180, 1830 1225',
  pilot: 'M 1900 1080 C 2000 1500, 2300 1620, 2540 1740',
  toMap: 'M 1490 950 C 1100 1000, 760 1200, 600 1480',
  claude: 'M 1350 360 C 1400 440, 1560 490, 1640 515',
  serp: 'M 1900 320 C 1880 400, 1800 470, 1760 515',
  bright: 'M 2450 360 C 2350 440, 2000 490, 1880 515',
  mapbox: 'M 420 440 C 430 560, 470 640, 500 710',
  deploy: 'M 3700 1220 C 3700 380, 2300 260, 1880 520',
  oidc: 'M 3600 1330 L 2950 1330'
};

/** Vista general: la camara ve todo el mundo. */
export const OVERVIEW = { fx: 1990, fy: 960, z: 0.44 };

/** Encuadre de una parada a la izquierda de la pantalla (deja la mitad derecha al panel). */
export const leftOf = (x: number, y: number, z: number, screenX = 500) => ({ fx: x + (960 - screenX) / z, fy: y, z });
