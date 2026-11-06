# motion-studio

Videos de producto (tutoriales y lanzamientos) para varias plataformas o temas, con Remotion.
El flujo completo está en el skill `video` (`.claude/skills/video/SKILL.md`); la guía de calidad en `references/calidad-diseno.md`.

## Reglas

- **Nunca escribir en el repo de una plataforma** (por ejemplo `../reactive`). Solo se lee: código, i18n, CSS, assets.
- Nunca ingresar credenciales en un sitio; el usuario inicia sesión.
- Datos ficticios en todos los videos.
- **Fidelidad visual**: con una aplicación real, los videos usan siempre sus mismos íconos, estructura y aspecto; nada de íconos genéricos ni rediseños. Ver `.claude/skills/video/references/fidelidad-visual.md`.
- Respuestas en español, breves y concretas. Código en inglés, comentarios y documentación en español.

## Estructura

- `src/core/`: piezas comunes (cámara, cursor, texto, tarjetas, subtítulos, ventana, plantillas).
- `src/platforms/<id>/`: marca (`platform.ts`), fuente, estilos, `Root.tsx`, componentes propios y `videos/`.
- `platforms.json`: registro de plataformas y su fuente (repo, URL o tema).
- `scripts/new-platform.mjs`: da de alta una plataforma o un tema.
- `scripts/new-video.mjs`: arma el esqueleto de un video de funcionalidad (composición, Screen, guion) y lo registra en el Root.
- `scripts/pr.sh info|diff|i18n|file <N> [repo]`: lee un PR de la organización en solo lectura (archivos por SHA).
- `./still.sh <plataforma> <id> <frame>...` y `./render.sh <plataforma> <id>` dejan todo en `out/<plataforma>/`. Con 3D se agrega `--gl=angle`.
