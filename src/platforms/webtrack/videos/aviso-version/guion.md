# Aviso de versión · PR webtrackdev/reactive#1762 (WD-4514)

Tipo: funcionalidad / corrección (solo título y de una a los detalles). Sin audio, 1920x1080, 30 fps.
Fuente: diff del PR y `ReloadPrompt.tsx` (HTML, clases `.wt-version-toast*`, hoja de estilos y Webi
del cohete tal cual) con los textos de `reloadPrompt.*` del i18n. Panel de fondo: "Creación Rápida
de Usuarios" ya replicado en `usuarios-licencias/Screen.tsx`. Datos ficticios.

| Escena | Frames del cuerpo | Qué pasa |
|---|---|---|
| Entrada | antes del cuerpo | "CORRECCIÓN" · "Aviso de versión" |
| 1. Panel abierto | 0-64 | Panel lateral modal con el formulario |
| 2. Llega el aviso | 64-118 | El toast entra con resorte abajo a la derecha |
| 3. Pulsa "Ahora no" | 118-150 | Cursor, hover y clic; el aviso se cierra |
| 4. El panel sigue abierto | 158-250 | La cámara regresa al panel: sigue abierto |
| 5. Antes / Ahora | 258-372 | Antes: el aviso no respondía y cerraba el panel. Ahora: responde |
| Cierre | 390-474 | "Sin trabas." · logo |
