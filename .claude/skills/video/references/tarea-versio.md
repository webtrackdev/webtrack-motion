# Video de una tarea de Versio (flujo de cada dev, sin worker)

Cuando alguien dice **"genera el video de WD-4541"** (o "del issue…", "de la tarea…") en una sesión
interactiva dentro de este repo. (Desde otro repo o sin revisión paso a paso se usa el MCP `webtrack-motion`:
`generate_video` lo hace todo en segundo plano y entrega las rutas, sin subir.)

1. `pnpm video WD-4541` (agrega `--version <número>` o `--app <slug>` si lo dicen). Trae el issue de
   Versio y muestra el **encargo completo**: datos de la novedad, PRs, qué leer, los dos videos, reglas y
   reporte final. Síguelo al pie de la letra: es el mismo que usa el worker, así salen iguales.
   - Si avisa "ya hay trabajo de antes", pregunta si continuar o empezar con `--fresh`.
   - Si la versión no es borrador, avísalo antes de empezar (no se podrá poner en la novedad).
2. Arma los **dos videos** en `src/platforms/webtrack/jobs/`: el clip `versio-wd-4541` (10-20 s, sin voz → GIF)
   y el tutorial `versio-wd-4541-tutorial` (con voz → MP4), con voz sintetizada y `timeline.json`.
   Revisa con `./still.sh webtrack <slug> <frames>` y pasa la lista de calidad-diseno.md.
3. Muestra 2 o 3 stills de cada uno y **espera el visto bueno** del usuario.
4. `pnpm publish-video WD-4541`: renderiza, arma el GIF, mezcla voz y música, comprime, sube y lo pone en la
   novedad. `--no-upload` solo renderiza (para revisar el MP4); `--keep` conserva las carpetas para ajustar.
5. Reporta: duración de cada video, caracteres del guion, URLs del GIF y del video, y qué se dedujo.

## De dónde salen los datos

- **Versio** (lo normal): la novedad del borrador más reciente donde está la tarea.
- **Avanza**, si la tarea no está en ninguna versión: título, "Para el usuario", módulo, ícono e imágenes de su
  nota. Se genera y se publica en YouTube, pero no queda en ninguna novedad hasta importarla a un borrador.
- **PRs**: los de Versio más los que nombran la tarea en GitHub (`gh search prs WD-#### --owner webtrackdev`;
  las ramas llevan la clave), hasta 8. Si vino de Avanza, son los únicos.

## Lo que ya se aprendió (no repetir errores)

- **Tiempo real**: unos 15 min por tarea (Claude ~10 min, render del tutorial ~3 min, el resto 1-2 min).
- **Peso**: Versio acepta hasta 25 MB. El MP4 se comprime solo (crf 24→34, luego 720p); el GIF se rehace a
  720 px y 10 fps si pesa de más. Si aun así no cabe, acorta el tutorial (no rellenes).
- **Voz**: guion de menos de 3.500 caracteres (nunca más de 5.000). `narrate.mjs synthesize` cachea por sección:
  repetirlo tras `voice-timeline.mjs` no cuesta. Sin `ELEVENLABS_API_KEY` el tutorial no se puede terminar.
- **Duración del tutorial según el tipo**: funcionalidad 2-4 min, mejora 1-2 min, corrección 40-70 s.
- **Módulo**: la novedad debe tener módulo del catálogo de Reactive para publicarse; si `pnpm video` muestra
  "(sin módulo)", dilo en el reporte (en Versio se corrige con `update_issue`).
- **Pantallas nuevas**: la copia de Reactive (`.cache/platforms/webtrack`, rama develop) puede no tener lo del PR.
  Lee los archivos del PR por SHA con `scripts/pr.sh file <N> <ruta> [repo]`. PR de base de datos o backend:
  muéstralo en la pantalla que lo consume (el cuerpo del PR suele nombrar el PR de front).
- **Límite de uso de Claude** ("hit your limit · resets 7:50pm", "monthly spend limit"): no es un error del video.
  Para y avisa; no hay que rehacer nada de lo ya armado.
- **Typecheck**: `pnpm typecheck` no debe dar errores en tus carpetas de `jobs/` (otros errores preexistentes no son tuyos).
- **Nada de git ni de escribir fuera de `jobs/`**: ni en la copia de Reactive ni en `src/core`, `Root.tsx` o `videos/`.

## Requisitos (los revisa `pnpm doctor`)

`.env` con `ELEVENLABS_API_KEY` (voz) y `VERSIO_MCP_TOKEN` (Versio › MCP (Claude) › Nuevo token: leer la tarea
y subir con tus permisos). `gh auth login` (PRs), `claude` con sesión, ffmpeg y el navegador de render
(`pnpm doctor --fix`). Si `pnpm doctor` da algo en rojo, resuélvelo antes de empezar.
