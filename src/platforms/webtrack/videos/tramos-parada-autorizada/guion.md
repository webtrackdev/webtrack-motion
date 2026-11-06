# Tramos y parada autorizada (tutorial, sin audio)

Fuente: RouteSegmentFormPanel.tsx de reactive (solo lectura) y su i18n. Flujo real:
Editar tramo > Parada Autorizada (on) > aparece "Sin limite de tiempo" (on por defecto) >
apagarlo > aparece "Tiempo de parada permitido" en Minuto(s) > Guardar. El cambio del tramo
se guarda con la ruta. Datos ficticios. 1920x1080, 30 fps, ~35 s.

| Escena | Frames | Que pasa |
|---|---|---|
| 1. Gancho | 0-84 | "Tutorial · Tramos" · "Cada tramo, con sus propias reglas." |
| 2. Tramos | 80-300 | Cuatro checkpoints en el mapa forman tres tramos (etiquetas Tramo 1-3) |
| 3. Abrir tramo | 290-356 | Boton de tramo bajo "Calzada Aguilar Batres": panel "Editar Tramo" |
| 4. Configurar | 356-600 | Parada Autorizada on, Sin limite de tiempo off, 20 Minuto(s), Guardar |
| 5. Resultado | 600-800 | La unidad recorre la ruta y se detiene en el tramo; tres beneficios |
| 6. Guardar ruta | 800-900 | Guardar y toast de exito |
| 7. Cierre | 900-1040 | "Paradas bajo control." · "Configura cada tramo de tu ruta." · logo |
