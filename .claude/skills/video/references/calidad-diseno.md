# Calidad de diseño: lo que hace que un video se vea "Meta"

Resumen de todo lo que el usuario ha afinado hasta hoy. Cada regla viene de una corrección
suya; si una escena la rompe, no está terminada.

## 1. Entrada

- **Tutorial** ("cómo se hace X"): `Hook` con la etiqueta "TUTORIAL · tema" y titular en dos
  líneas. Es el único tipo que lleva esa etiqueta.
- **Funcionalidad o PR**: **solo un título y de una a los detalles.** `LaunchIntro` sin
  `words`: estallido de color, ícono, badge (`NUEVO`, `MEJORA` o `CORRECCIÓN`) y el nombre.
  Título de 2-3 palabras. Sin escena de presentación ni frases sueltas.
- **Lanzamiento con narrativa** (solo si lo piden): 2-4 palabras que golpean, ~0.45 s cada
  una y ~1.4 s el nombre. "Muy rápido, no da tiempo para leer" fue una corrección real:
  toda palabra en pantalla tiene que poder leerse.
- El cuerpo entra con `<Sequence from={SHIFT}>`, `SHIFT = launchIntroLength(0) - 8` (51
  frames con título solo). Los frames de `still.sh` son de la composición: frame del
  cuerpo + SHIFT.
- El ícono del título es el de la plataforma (`IcoIcon`), no uno de lucide.

## 2. Cuerpo de un video de funcionalidad (12-20 s, 360-600 frames a 30 fps)

Orden fijo: ventana entra → cámara se acerca al foco → acción con cursor → captions →
tarjetas Antes/Ahora → ventana sale → EndCard.

- **Ventana** (`AppWindow` + `windowMotion`): sube en 3D al entrar y se desenfoca al salir.
- **Cámara** (`Camera` + `uiToStage`): la UI es 1440x810 dentro de un escenario 1920x1080
  (escala 1.16). Para que el texto se lea en el **GIF de 960 px**: zoom **1.6-1.9** sobre el
  foco (1.5 si hay mucho contenido ancho). Un movimiento de cámara por escena, sin saltos;
  cada tramo con un mantenimiento para leer. Evita texto de UI menor a 12 px sin zoom.
- **Cursor** (`Cursor` + `useAnchors`): todo lo que toca lleva `data-anchor` y está montado
  desde el frame 0 (con `visibility` u `opacity`, nunca desmontado). Un waypoint por
  acción, `click: true` en los clics, `hideAt` un poco después del último. Las anclas son
  de layout, **sin transforms**: si la página se desplaza con `translateY` o algo crece con
  `transform`, suma ese desplazamiento a la posición del cursor (ejemplo: jobs-sin-asignar).
- **Captions** (`Caption`): 2-4 por video, frase corta (≤ 45 caracteres), sin punto, en
  imperativo o descripción ("Cambia la división y pulsa Buscar"). Uno por acción.
- **Antes/Ahora** (`Callout`, tint `BRAND.danger` con `X`, y `BRAND.success` con `Check`):
  van al final, con la cámara alejada (`fx 1300, fy 560, z 0.88, rx 4, ry -12`). Colócalos
  **sobre una zona no esencial** (nunca encima de lo que acaba de mostrarse). Convertir de
  pantalla a escenario: `stage = fx + (pantalla - 960) / z`. Los textos son **verdaderos**:
  salen del PR o de la descripción, no se inventan; si el PR no los trae, se dice en el
  mensaje final que se dedujeron.
- **Cierre** (`EndCard`): frase corta con una palabra resaltada (`highlight` sin
  puntuación: `'día'`, no `'día.'`), subtítulo con el módulo ("ConfigApp · Nueva task") y
  el logo de la marca.
- Un PR sin cambio visible muestra el efecto que el usuario sí nota (un error que ya no
  sale, un dato que ya no se pierde, un mensaje que cambia). Si no hay nada que ver, se
  hace un explicativo con tarjetas y se avisa en el reporte.

## 3. Fidelidad (la regla más importante)

Mismos íconos, misma estructura, mismo aspecto que la aplicación. Detalle y lista de
verificación en [fidelidad-visual.md](fidelidad-visual.md). Resumen: lee el componente real,
usa su librería de íconos (IcoMoon con `IcoIcon`, lucide solo si el componente lo usa), sus
clases Tailwind y su CSS, y sus textos del i18n. Las formas propias (pines, chips, menús,
avisos, pantalla de error) se dibujan como las dibuja la app.

## 4. Objetos que no son pantalla

- Objetos de la vida real: figuras **2D animadas, bien animadas** (resortes, anticipación,
  rebote, deformación al impacto) y **bien coloridas**. Nada gris ni plano sin vida.
- 3D: las mismas reglas, y el objeto **siempre contrasta** con la paleta del fondo (fondo
  claro: colores saturados u oscuros; fondo oscuro: claros). Con `--gl=angle`.
- Personas y manos: ilustración vectorial plana; el movimiento humano realista no se genera.

## 5. Entrega

- MP4 1920x1080, 30 fps, sin voz, y **siempre un GIF** (`./gif.sh`, 960 px, 12 fps; pesa
  8-12 MB: ofrece un fragmento o menos ancho si hace falta).
- Verifica el GIF final con 2-3 cuadros extraídos con ffmpeg antes de enviarlo.
- El mensaje final es corto: qué muestra, qué se simplificó o se dedujo, peso y ruta. En
  español, sin código.

## 6. Lista de verificación visual (cada still)

- [ ] Texto cortado, solapes, nada tapado por un caption o un callout.
- [ ] El cursor cae sobre su objetivo y el clic coincide con el cambio en pantalla.
- [ ] La cámara no deja medio contenido fuera ni mucho espacio vacío.
- [ ] Íconos y formas propias trazados a su fuente (fidelidad-visual.md).
- [ ] Las palabras de la entrada y los captions se pueden leer en el tiempo que duran.
- [ ] Datos ficticios, sin nombres de clientes ni credenciales.
