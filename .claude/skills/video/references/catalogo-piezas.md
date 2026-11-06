# Catálogo de piezas y videos modelo

Antes de escribir una pantalla, busca aquí si ya existe la pieza. Todo está en
`src/core/` (común) y `src/platforms/<id>/` (de cada plataforma).

## Núcleo (`src/core/`)

| Pieza | Para qué | Notas |
|---|---|---|
| `anim.ts` | `FPS`, `EASE`, `SPRING`, `sp`, `kf`, `lerp` | `sp(frame, at, SPRING.snappy)` entrada con resorte; `kf(frame,[f..],[v..])` interpola. |
| `AppWindow.tsx` | Ventana 1440x810 que flota; `uiToStage`, `windowMotion` | `uiToStage(x,y)` pasa un punto de la UI al escenario 1920x1080. |
| `Camera.tsx` | Claves `{f,fx,fy,z,rx,ry}` | `fx,fy` en escenario; `rx/ry` inclinan 3D. |
| `Cursor.tsx` | Waypoints `{f,x,y,click}`, ondas de clic | `hideAt`, `scale={0.85}`. |
| `anchors.ts` | `useAnchors(ref, fontsReady)` mide `data-anchor` | Posiciones de layout, sin transforms. |
| `Caption.tsx` | Subtítulo en píldora | `at`, `out`, `text`, `y`. |
| `Callout.tsx` | Tarjeta flotante Antes/Ahora | `x,y` en escenario, `tint`, `icon`, `title`, `body`. Ancho 430. |
| `Toast.tsx` | Aviso de éxito | |
| `KineticText.tsx` | Texto cinético con palabra resaltada | `highlight` sin puntuación. |
| `typing.ts` | `typed`, `typedEnd`, `caretOn` | Escritura en inputs. |
| `Backdrop.tsx` | Fondo de marca | |
| `templates/LaunchIntro.tsx` | Entrada de funcionalidad | `title`, `icon`, `badge`, `words?`; `launchIntroLength(n)`. |
| `templates/Hook.tsx` | Entrada de tutorial | |
| `templates/EndCard.tsx` | Cierre con logo | `title`, `highlight`, `subtitle`, `at`. |
| `templates/SideHeader.tsx` | Encabezado lateral (etiqueta, título, texto) | |
| `geo.ts` | `roundedPath`, `pointAt`, `progressOf` | Rutas con esquinas redondeadas. |

## Webtrack (`src/platforms/webtrack/components/`)

| Pieza | Para qué |
|---|---|
| `IcoIcon.tsx` | Íconos IcoMoon de la plataforma por nombre (`<IcoIcon name="Jobs" size={84} />`). |
| `FormKit.tsx` | Etiqueta, `SelectField` con lista, `Menu`, `TextField`, `Btn`, resalte verde (`glowStyle`). |
| `MapBase.tsx`, `Pin.tsx`, `RouteLine.tsx`, `Vehicle.tsx` | Mapa urbano vectorial, pin de checkpoint, ruta animada, vehículo. |
| `jobshub-kit.tsx` + `jobshub.css` | Pantalla Jobs: `JobsPageHeader`, `HubTabsRow`, `JobsFilterBar`, `KpiCards`, `Button`, `StatusBadge`, `UserInitials`, tarjeta de job, toolbar, tokens de nivel del Calendario. |

## Videos modelo (copia el que más se parezca)

Todos en `src/platforms/webtrack/videos/`.

| Si el PR o tarea es... | Mira |
|---|---|
| Panel lateral + diálogo/aviso encima | `usuarios-licencias` |
| Lista desplegable con opción de crear / contenido que cambia al escribir | `contactos-ruta` |
| Un error que ya no sale (contraste error vs pantalla buena, con barrido) | `referencias-publicas` |
| Formulario con filtros, dropdown que se actualiza | `configapp-plantillas` |
| Pantalla de tablero/tabla con filtro, fila nueva y detalle desplegable; página que se desplaza | `jobs-sin-asignar` |
| Mapa con ruta, pines, panel de edición | `crear-ruta-logistica`, `tramos-parada-autorizada`, `geocerca-asignar-unidad` |
| Explicativo técnico con escenas de tarjetas | `webi-mcp-seguro` |
| Lanzamiento con narrativa (palabras que golpean) | `rutas-inversas` |
| Tema sin plataforma, ilustración 2D y balón 3D | `src/platforms/futbol/videos/agarre-portero` |

## Qué no existe todavía

Menú lateral completo, lista de usuarios con filtros, SIMs, Planes de trabajo (vista
Aeropuerto), editor de organización, política de contraseñas. Si el PR los necesita, léelos
del repo (fidelidad-visual.md) y deja la pieza nueva en `components/` de la plataforma con
un nombre propio para que el siguiente video la reutilice.
