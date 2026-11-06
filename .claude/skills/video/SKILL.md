---
name: video
description: Crea videos y GIF de producto con calidad de motion (estilo Meta, sin voz, en español) para cualquier plataforma a partir de un PR, su repo, una URL o un tema sin plataforma. Usar cuando el usuario pida "un video de cómo hacer X", el video o GIF de un PR o de una lista de PRs, mostrar una funcionalidad nueva, o un motion de una pantalla o de un tema (deportes, cursos). Aplica siempre fidelidad visual a la aplicación real.
---

# Videos y GIF de producto, nivel motion

Proyecto Remotion en `webtrack-motion`. El usuario da un PR (o varios), un repo, una URL o
un tema y recibe el video terminado **sin aprobar guiones a medio camino**: el guion va en el
mensaje final. Por defecto: 1920x1080, 30 fps, sin audio, español con tuteo, **MP4 y GIF**.

## Lo que más importa (corrección tras corrección del usuario)

1. **Fidelidad visual a la aplicación real**: mismos íconos, estructura y aspecto, en toda
   pantalla y en la entrada. Nada de íconos genéricos ni rediseños →
   [fidelidad-visual.md](references/fidelidad-visual.md).
2. **Entrada según el tipo**: tutorial con "TUTORIAL · tema"; funcionalidad o PR con **solo
   un título** y de una a los detalles. Las palabras que aparezcan tienen que poder leerse.
3. **Cámara cerca** (zoom 1.6-1.9) para que el GIF de 960 px se lea; tarjetas Antes/Ahora
   sobre una zona no esencial; textos verdaderos tomados del PR.
4. **Siempre un GIF**, y verificado con cuadros extraídos antes de enviarlo.
5. **Objetos de la vida real en 2D animado y colorido; 3D siempre con contraste.**

Todo el detalle, con tiempos y valores, en [calidad-diseno.md](references/calidad-diseno.md).

## Reglas

- **Nunca escribir en el repo de la plataforma** (ni `git fetch`, `checkout`, `commit`).
  Solo lectura: código, i18n, CSS, assets. Un PR o rama ajena se lee con
  `scripts/pr.sh info|diff|i18n|file <N> [repo]` (archivos por SHA, no por nombre de rama).
- **Nunca ingresar credenciales.** Si el sitio pide login, el usuario inicia sesión.
- Datos ficticios; sin logos ni nombres de clientes reales.
- Todo texto de interfaz sale de la plataforma (i18n o pantalla); todo movimiento mostrado
  es uno que el producto permite.
- Sin commits hasta que el usuario lo pida.
- Renders **uno por uno**, nunca dos composiciones a la vez.

## Flujo rápido (un PR o una tarea)

1. **Entiende el cambio.** `scripts/pr.sh info <N> [repo]` y `diff`; los textos nuevos con
   `scripts/pr.sh i18n <N>`. Si el PR es de otra repo (p. ej. base de datos), muéstralo en la
   pantalla que lo consume (el cuerpo suele nombrar el PR de front). Decide: pantalla propia,
   efecto visible indirecto, o explicativo (avísalo al final).
2. **Lee la pantalla real** (checkout local en producción, SHA para lo nuevo) y define la
   historia en 3 pasos: acción > cambio > resultado, más el Antes/Ahora.
3. **Esqueleto**: `node scripts/new-video.mjs <plataforma> <slug> --name <Pascal> --title
   "<2-3 palabras>" --badge <NUEVO|MEJORA|CORRECCIÓN> --icon ico:<IcoMoon>|lucide:<Nombre>
   --ref "<repo>#<N>" --end "<frase.>" --highlight <palabra> --subtitle "<Módulo · Pantalla>"
   --antes "<...>" --ahora "<...>"`. Crea composición, `Screen.tsx` y guion con la calidad
   por defecto y lo registra en `Root.tsx`.
4. **Réplica fiel** en `Screen.tsx` (o piezas propias): copia el más parecido de
   [catalogo-piezas.md](references/catalogo-piezas.md); CSS real con `@<id>/...`, clases
   Tailwind del componente, íconos trazados a su fuente. Todo lo que el cursor toca lleva
   `data-anchor` y está montado desde el frame 0.
5. **Ajusta la composición**: tiempos `T`, foco de cámara, waypoints, captions (2-4), callouts.
6. **Revisa**: `./still.sh <plataforma> <slug> <frame>...` (frame = cuerpo + 51), un frame por
   escena y por transición, junta con ffmpeg (hstack/vstack, entradas explícitas) y mira la
   imagen. Pasa la lista de verificación de calidad-diseno.md.
7. **Render y GIF** (en segundo plano, uno tras otro):
   `./render.sh <plataforma> <slug> && ./gif.sh <plataforma> <slug>` → `out/<plataforma>/<slug>.mp4`
   y `.gif`. Extrae 2-3 cuadros del GIF y míralos. Con 3D agrega `--gl=angle`.
8. **Entrega** con `SendUserFile` y un mensaje corto: qué muestra, qué se simplificó o se
   dedujo, peso y ruta. Si el GIF pesa más de ~12 MB, ofrece un fragmento o menos ancho.

## Flujo para otras fuentes

- **Tutorial / URL sin repo**: recorre el sitio con el navegador integrado y extrae tokens e
  íconos ([captura-url.md](references/captura-url.md)); entrada `Hook`.
- **Plataforma nueva**: [nueva-plataforma.md](references/nueva-plataforma.md) y
  `scripts/new-platform.mjs`.
- **Tema sin plataforma** (deportes, cursos): ilustración vectorial 2D y 3D con contraste;
  modelo en `src/platforms/futbol/videos/agarre-portero`.

## Varios PRs

Lista de PRs = lote. Clasifica, **entrega un video completo antes de empezar el siguiente**,
y si usas subagentes: hasta 3 en vuelo, un video completo cada uno. Todo en
[lotes-de-prs.md](references/lotes-de-prs.md); plantilla del prompt del agente en
[brief-agente.md](references/brief-agente.md).

## Archivos del skill

| Archivo | Contenido |
|---|---|
| [calidad-diseno.md](references/calidad-diseno.md) | Guía de estilo y lista de verificación visual |
| [fidelidad-visual.md](references/fidelidad-visual.md) | Cómo copiar íconos, estructura y aspecto de la app real |
| [catalogo-piezas.md](references/catalogo-piezas.md) | Piezas del núcleo, kits por plataforma y videos modelo |
| [lotes-de-prs.md](references/lotes-de-prs.md) | Varios PRs, subagentes, lectura de PRs ajenos |
| [brief-agente.md](references/brief-agente.md) | Plantilla del prompt para un subagente |
| [captura-url.md](references/captura-url.md), [nueva-plataforma.md](references/nueva-plataforma.md) | Plataformas sin repo y alta de plataformas |
| `templates/feature-video/` | Plantillas que usa `scripts/new-video.mjs` |

## Trampas

- Las animaciones y transiciones CSS de la app están apagadas en `core/base.css`: todo el
  movimiento sale de la composición.
- El Chromium que descarga Remotion falla en esta Mac; `render.sh` y `still.sh` usan el de
  Playwright.
- `Camera` enfoca puntos del escenario (1920x1080): convierte puntos de la UI con `uiToStage`.
- Las anclas (`data-anchor`) son de layout y no ven `transform`: si la página se desplaza o
  algo crece con transform, suma ese desplazamiento al cursor.
- En `KineticText`, `highlight` compara la palabra sin puntuación: `'portero'`, no `'portero.'`.
- Los PRs de ramas con barras: pide archivos por SHA, no por rama (404).
- Renders: un solo comando en segundo plano con un bucle; no uses `&` dentro de un subshell.
- zsh no divide variables en palabras y rompe globs sin comillas: escribe las entradas de
  ffmpeg explícitas y entrecomilla.
- 3D: `src/platforms/futbol/components/SoccerBall3D.tsx` es el ejemplo con `@remotion/three`
  (stills y renders con `--gl=angle`). Personajes y manos: ilustración vectorial plana; el
  movimiento humano realista no se genera, se pide un clip y se anota encima.
