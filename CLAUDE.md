# motion-studio

Videos de producto (tutoriales y lanzamientos) para varias plataformas o temas, con Remotion.
El flujo completo está en el skill `video` (`.claude/skills/video/SKILL.md`); la guía de calidad en `references/calidad-diseno.md`.

## Video de una tarea (lo más común)

Si piden el video de una tarea o issue ("genera el video de WD-4541"): corre `pnpm video WD-4541` y sigue el
encargo que imprime; al final `pnpm publish-video WD-4541`. Detalle, aprendizajes y requisitos en
`.claude/skills/video/references/tarea-versio.md`. Antes de la primera vez en una máquina: `pnpm doctor`.

## Reglas

- **Nunca escribir en el repo de una plataforma** (por ejemplo la copia de Reactive en `.cache/platforms/webtrack`, que descarga `pnpm doctor`). Solo se lee: código, i18n, CSS, assets.
- Nunca ingresar credenciales en un sitio; el usuario inicia sesión.
- Datos ficticios en todos los videos.
- **Fidelidad visual**: con una aplicación real, los videos usan siempre sus mismos íconos, estructura y aspecto; nada de íconos genéricos ni rediseños. Ver `.claude/skills/video/references/fidelidad-visual.md`.
- Respuestas en español, breves y concretas. Código en inglés, comentarios y documentación en español.

## Estructura

- `src/core/`: piezas comunes (cámara, cursor, texto, tarjetas, subtítulos, ventana, plantillas).
- `src/platforms/<id>/`: marca (`platform.ts`), fuente, estilos, `Root.tsx`, componentes propios y `videos/`.
- `platforms.json`: registro de plataformas y su fuente (repo, URL o tema). Las que tienen `git` se descargan solas en `.cache/platforms/<id>` (solo `src/`, rama `branch`).
- `scripts/video.mjs` (`pnpm video WD-####`) y `scripts/publish-video.mjs` (`pnpm publish-video WD-####`): el video de una tarea en la máquina de cada dev, sin worker. El primero trae el issue de Versio (MCP, `VERSIO_MCP_TOKEN`) y muestra el encargo; el segundo renderiza, sube y lo pone en la novedad. Comparten con el worker `scripts/lib/pipeline.mjs` (encargo, render, GIF, voz, compresión) y `scripts/lib/versio.mjs`.
- `scripts/mcp.mjs` (MCP stdio, `.mcp.json`): `generate_video`, `video_status`, `cancel_video`, `list_videos`. Genera en la máquina del dev con `scripts/generate.mjs` en segundo plano (Claude headless + render, estado en `out/tasks/<slug>.status.json`, archivos en `out/videos/<tarea>/`) y al terminar publica el tutorial en el canal de YouTube de Versio (`prepare_video_upload` → PUT → `publish_youtube`; con borrador, GIF y enlace en la novedad). `--no-publish` / `publish: false` solo genera.
- `scripts/doctor.mjs` (`pnpm doctor`, `--check`, `--fix`): descarga o actualiza esas copias y revisa herramientas (ffmpeg, navegador de render, `claude`, `gh`) y claves. Con eso el repo se basta solo: no hace falta clonar Reactive ni otro proyecto.
- `scripts/new-platform.mjs`: da de alta una plataforma o un tema.
- `scripts/new-video.mjs`: arma el esqueleto de un video de funcionalidad (composición, Screen, guion) y lo registra en el Root. Con `--job` lo crea temporal en `src/platforms/<id>/jobs/<slug>/` (ignorado por git, con su propio `index.tsx`, sin tocar el Root); `still.sh` y `render.sh` lo detectan solos.
- `scripts/pr.sh info|diff|i18n|file <N> [repo]`: lee un PR de la organización en solo lectura (archivos por SHA).
- `scripts/versio.mjs versions|plan [version]`: lee de Versio (API con `VERSIO_API_KEY` en `.env`) las novedades de una versión y deja en `out/versio/<app>/<version>/plan.md` qué videos y GIF crear. Solo planifica: no crea ni renderiza nada. Reglas en `versio.config.json`.
- `./still.sh <plataforma> <id> <frame>...` y `./render.sh <plataforma> <id>` dejan todo en `out/<plataforma>/`. Con 3D se agrega `--gl=angle`.
- `scripts/worker.mjs` (`pnpm worker`, `--once`, `--dry-run`): atiende la cola de Versio ("Generar con Claude" en un issue; tabla `motion_jobs`, función `motion-jobs`). Por cada trabajo ejecuta `claude -p` aquí con el skill `video` y los datos del issue (tarea, PRs, título, texto, módulo), con slug fijo `versio-<tarea>` en una carpeta temporal de `jobs/` (`new-video.mjs --job`); Claude arma dos videos: el clip corto `versio-<tarea>` (de él sale el GIF) y el tutorial narrado `versio-<tarea>-tutorial` (voz y música; es el MP4 "Ver video explicativo", ver `references/tutorial-narrado.md`). Luego el worker renderiza, mezcla la voz, comprime el MP4 si pasa de 24 MB, sube todo y borra las carpetas, así que no queda React en el repo por cada video (si falla, el código queda en `jobs/` para revisarlo). Los videos suben: entran solos a la novedad si la versión es borrador. Registro de cada encargo en `out/jobs/<slug>.log`. Necesita `MOTION_WORKER_SECRET` en `.env` y `claude` con sesión iniciada.
