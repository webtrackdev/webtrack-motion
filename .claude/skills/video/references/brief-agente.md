# Brief para un subagente que construye un video (plantilla)

Copia esto en el prompt del agente, rellena `<...>` y no lo recortes: el agente solo sabe lo
que le pongas aquí. Úsalo con la guía de lotes ([lotes-de-prs.md](lotes-de-prs.md)): pocos
agentes a la vez, un video completo cada vez.

---

Construye UN video de funcionalidad (para convertirlo en GIF) del PR <repo>#<N>
(<ticket y título>). Proyecto: /Users/nerydelacruz/Documents/Webtrack/webtrack-motion
(Remotion). Respuestas y comentarios en español, identificadores de código en inglés.

**Lee primero**, en este orden: `CLAUDE.md`, `.claude/skills/video/SKILL.md` y de ahí
`references/calidad-diseno.md`, `references/fidelidad-visual.md` y
`references/catalogo-piezas.md` (qué piezas y videos modelo existen). Copia la estructura de
`<video modelo más parecido>`.

**Qué cambia el PR** (lo que ya leí): <3-6 líneas con archivos, textos nuevos y el efecto
que ve el usuario>. **Historia sugerida**: <acción > cambio > resultado>. **Antes/Ahora**:
Antes "<...>", Ahora "<...>" (textos verdaderos; si los dedujiste, dilo).

**Cómo empezar**: `node scripts/new-video.mjs <plataforma> <slug> --name <Pascal> --title
"<2-3 palabras>" --badge <NUEVO|MEJORA|CORRECCIÓN> --icon ico:<NombreIcoMoon> --ref
"<repo>#<N>" --end "<frase.>" --highlight <palabra> --subtitle "<Módulo · Pantalla>"
--antes "<...>" --ahora "<...>"`. Eso crea la carpeta con composición, `Screen.tsx` de
ejemplo y guion, y registra el video en `Root.tsx`. Reemplaza `Screen.tsx` por la pantalla
real y ajusta los TODO.

**Para leer el PR** usa `scripts/pr.sh info|diff|i18n|file <N> [repo]` (archivos del PR por
SHA). El checkout local de `../reactive` puede no tener lo nuevo.

**Reglas inamovibles**
- Fuentes de solo lectura: nunca escribas, hagas `git fetch`, `checkout` ni `commit` en
  ../reactive ni en ../reactive-backend. Sin credenciales; datos ficticios.
- Fidelidad: mismos íconos (IcoIcon con el nombre real; lucide solo si el componente real lo
  usa), estructura, clases Tailwind y textos del i18n que la aplicación real.
- No toques `src/core`, `FormKit.tsx`, `IcoIcon.tsx`, otros videos ni el skill. Piezas
  nuevas compartibles: `src/platforms/<id>/components/` con nombre propio.
- NO renderices MP4 ni GIF (lo hace quien te lanzó). Solo stills de revisión:
  `./still.sh <plataforma> <slug> <frame>` (frame = frame del cuerpo + 51). Júntalos con
  ffmpeg (hstack/vstack, entradas explícitas, 960 de ancho) y mira la imagen. Pasa la lista
  de verificación de `calidad-diseno.md`.

**Reporte final** (breve): slug, componente y archivo, DURATION, título y badge, qué
muestra (3 líneas), qué se simplificó o dedujo, ruta de la hoja de contactos. Sin código.
