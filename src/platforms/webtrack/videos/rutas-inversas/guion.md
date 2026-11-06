# Rutas inversas · PR webtrackdev/reactive#1743 (WD-3970)

Que cambio en el PR: el editor de rutas suma "Base de la ruta" con tres modos
(Normal, Maestra, Inversa). Inversa toma otra ruta y arma el camino de regreso:
checkpoints en orden inverso (cada tramo conserva su configuracion), hereda velocidad,
horarios, membresia y notificaciones, y queda como ruta independiente.

Formato: 1920x1080, 30 fps, 26 s, sin audio (pendiente pista licenciada).

| Escena | Frames | Que pasa |
|---|---|---|
| 1. Gancho | 0-84 | "Nuevo en rutas" · "Ida y vuelta, sin trazar dos veces." |
| 2. Ruta de ida | 68-206 | La ventana sube en 3D; se dibuja Zona 12 -> Villa Nueva y la unidad la recorre |
| 3. Inversa | 206-404 | Panel "Nueva Ruta"; clic en Inversa (el selector salta), combobox, se elige la ruta de ida |
| 4. El regreso | 396-566 | La lista se llena invertida; en el mapa la ida queda punteada y el regreso se dibuja; tres beneficios flotan |
| 5. Guardar | 566-664 | Clic en Guardar y toast "La ruta ... se guardo con exito." |
| 6. Cierre | 664-780 | "Rutas inversas." · "El camino de regreso, en un clic." · logo |

Textos de UI tomados del i18n real (routes.routeBase.*, reactiveMapRoute.*). Datos ficticios.
