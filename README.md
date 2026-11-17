# Webtrack Motion

Videos de producto de Webtrack (GIF de novedades y tutoriales narrados) hechos con
[Remotion](https://www.remotion.dev/) y Claude Code. No se graba la pantalla: Claude lee el
código real de Reactive y arma una réplica animada con sus mismos íconos, textos y estilos.
Después se le pone voz con ElevenLabs y música.

**Todo está en este repo.** No hace falta clonar Reactive ni ningún otro proyecto: `pnpm doctor`
descarga una copia ligera de Reactive (solo `src/`, de la rama `develop`) en `.cache/` y revisa que
tengas todo. Lo único externo son tus sesiones (Claude Code y GitHub) y la clave de ElevenLabs.

Se usa de tres formas:

- **Cada dev, por tarea (lo normal):** abre Claude Code en este repo y dice *"genera el video de WD-4541"*.
  Claude trae el issue de Versio (`pnpm video WD-4541`), arma el clip y el tutorial narrado, te muestra
  cómo quedaron y con `pnpm publish-video WD-4541` los sube a la novedad. Sin worker ni cola.
- **Automática, desde Versio:** "Generar con Claude" en una novedad pone un trabajo en cola y el *worker*
  de este repo (`pnpm worker`) lo hace solo. Mismo resultado (comparten `scripts/lib/pipeline.mjs`).
- **A mano, de un PR o un tema:** "haz el video del PR 1790". El flujo está en el skill `video`.

## MCP: pedir el video desde cualquier sesión de Claude

webtrack-motion trae su propio MCP (`scripts/mcp.mjs`). Con él, desde Claude Code en **cualquier** repo
(por ejemplo, trabajando en Reactive) basta decir *"genera el GIF y el video de WD-4541"*: el MCP lo genera
en tu máquina, en segundo plano, y al terminar **publica el tutorial en el canal de YouTube de Versio**. Si la
tarea está en un borrador de Versio, la novedad queda con el GIF de vista previa y el enlace de YouTube. Copia
local en `out/videos/WD-4541/`. Con `publish: false` (o `pnpm generate WD-4541 --no-publish`) solo genera.

```bash
# Una vez, para todas tus sesiones (dentro de este repo ya lo trae .mcp.json):
claude mcp add --scope user webtrack-motion -- node ~/Documents/Webtrack/webtrack-motion/scripts/mcp.mjs
```

| Herramienta | Qué hace |
|---|---|
| `generate_video` | Arranca la generación (unos 15 min) y al final publica en YouTube. Con solo la tarea busca el issue en Versio (`VERSIO_MCP_TOKEN`); si no, pásale título, texto y PRs. |
| `video_status` | Fase, %, minutos que lleva y que faltan; al terminar, el enlace de YouTube, si quedó en la novedad y las rutas locales. |
| `cancel_video` | Corta la generación (Claude, render y voz). |
| `list_videos` | Lo generado o en curso en esta máquina. |

Sigue aunque cierres la sesión de Claude (corre en un proceso aparte, `scripts/generate.mjs`). A mano:
`pnpm generate WD-4541` (o `--issue archivo.json` sin Versio).

## Video de una tarea, paso a paso

```bash
claude                              # dentro de webtrack-motion
> genera el video de WD-4541
```

Por dentro:

1. `pnpm video WD-4541` busca la tarea en Versio (el borrador más reciente; `--version` para otra) o, si no está
   en ninguna versión, en Avanza; completa sus PRs buscando la tarea en GitHub y muestra el encargo: título,
   texto, módulo, PRs, qué leer y las reglas.
2. Claude lee los PRs (`scripts/pr.sh`) y la pantalla real en la copia de Reactive, y arma dos videos en
   `src/platforms/webtrack/jobs/`: el clip corto (→ GIF) y el tutorial narrado con voz (→ MP4).
3. Te muestra stills para que des el visto bueno.
4. `pnpm publish-video WD-4541` renderiza, arma el GIF, mezcla voz y música, comprime (máx. 25 MB), sube a
   Versio con tu token y los pone en la novedad. `--no-upload` solo renderiza para revisar.

Tarda unos 15 minutos. Detalle y aprendizajes: `.claude/skills/video/references/tarea-versio.md`.

---

## Inicio rápido

### Mac

```bash
# 1. Herramientas (una sola vez)
brew install node pnpm ffmpeg gh
npm install -g @anthropic-ai/claude-code

# 2. Clonar (solo este repo)
git clone https://github.com/nerywebtrack/webtrack-motion.git
cd webtrack-motion
pnpm install

# 3. Sesiones
claude                        # inicia sesión y sal con /exit
gh auth login && gh auth setup-git   # leer PRs y descargar Reactive (webtrackdev)

# 4. Claves
cp .env.example .env         # completa ELEVENLABS_API_KEY y VERSIO_MCP_TOKEN (ver "Claves")

# 5. Descarga Reactive en .cache/, instala el navegador de render y revisa que todo esté
pnpm doctor --fix

# 6. Probar
pnpm studio                   # abre Remotion Studio con todos los videos
pnpm worker --dry-run         # muestra el siguiente trabajo de Versio sin tomarlo

# 7. Dejar el worker atendiendo Versio
pnpm worker
```

### Windows (con WSL / Ubuntu)

Remotion, ffmpeg y los scripts `.sh` funcionan en Linux, así que en Windows todo va dentro de WSL.

```bash
# 1. En PowerShell como administrador (una sola vez) y reinicia
wsl --install -d Ubuntu

# 2. Ya dentro de Ubuntu: herramientas
sudo apt update && sudo apt install -y ffmpeg git gh curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pnpm @anthropic-ai/claude-code

# 3. Clonar, dentro de Linux (no en /mnt/c: es mucho más lento)
mkdir -p ~/Webtrack && cd ~/Webtrack
git clone https://github.com/nerywebtrack/webtrack-motion.git
cd webtrack-motion
pnpm install
npx playwright install --with-deps chromium-headless-shell   # navegador con sus librerías del sistema

# 4. Sesiones
claude
gh auth login && gh auth setup-git

# 5. Claves y revisión (descarga Reactive en .cache/)
cp .env.example .env && nano .env
pnpm doctor

# 7. Probar y dejar el worker corriendo
pnpm studio
pnpm worker --dry-run
pnpm worker
```

### Para qué sirve cada paso

| Comando | Para qué |
|---|---|
| `ffmpeg` | Hace el GIF, mezcla la voz con el video y comprime el MP4 para que pese menos de 25 MB, el límite de Versio. |
| `gh` | `scripts/pr.sh` lee los PRs de `webtrackdev` (solo lectura) para saber qué cambió. |
| `claude` | Claude Code es quien escribe cada video. El worker lo ejecuta con `claude -p`, así que necesita la sesión iniciada. |
| `pnpm doctor` | Descarga o actualiza la copia de Reactive en `.cache/platforms/webtrack` (su CSS, íconos y pantallas: Claude la lee, nunca la modifica; repo y rama en `platforms.json`) y revisa herramientas y claves. Córrelo cuando quieras traer lo último de Reactive; el worker lo hace solo al arrancar. `--fix` instala el navegador de render si falta. |
| `pnpm studio` | Vista previa de todos los videos en el navegador, para revisarlos y ajustarlos. |
| `pnpm worker` | Atiende la cola de Versio. Debe quedar abierto mientras se quieran generar videos. |

---

## Claves (`.env`)

El archivo `.env` no se sube a git. Copia `.env.example` y complétalo:

| Variable | Para qué | Dónde se consigue |
|---|---|---|
| `MOTION_WORKER_SECRET` | Solo para el worker: se identifica con Versio | El mismo valor del secreto `MOTION_WORKER_SECRET` en Supabase (pídelo a quien administre Versio) |
| `ELEVENLABS_API_KEY` | Voz de los tutoriales | ElevenLabs › Profile › API keys |
| `VERSIO_MCP_TOKEN` | Leer la tarea y subir el video con tus permisos (`pnpm video` / `pnpm publish-video`) | Versio › MCP (Claude) › Nuevo token |
| `VERSIO_API_KEY` | Solo para `pnpm versio` (planificar una versión) | Versio › Ajustes › API keys |
| `DEEPGRAM_API_KEY` | Opcional: voz alternativa (`provider: deepgram` en `audio.config.json`) | Deepgram |
| `CLAUDE_MODEL` | Opcional: modelo que usa el worker | — |

---

## Cómo funciona "Generar con Claude"

```
Versio (novedad) ──► cola motion_jobs ──► pnpm worker ──► claude -p (skill video)
                                                              │
        ◄── sube GIF + MP4 a la novedad ◄── render + voz + ffmpeg ◄┘
```

1. En Versio, una persona pulsa **Generar con Claude** en una novedad.
2. El worker toma el trabajo y le pasa a Claude la tarea `WD-####`, los PRs, el título, el texto y el módulo.
3. Claude crea **dos videos** en una carpeta temporal `src/platforms/webtrack/jobs/versio-<tarea>/`:
   - **Clip corto** `versio-<tarea>`: de 10 a 20 s, sin voz. De aquí sale el **GIF** que se ve primero en la novedad.
   - **Tutorial narrado** `versio-<tarea>-tutorial`: con voz y música. Es el **MP4** del botón "Ver video explicativo".
4. El worker renderiza, mezcla la voz, comprime y sube ambos. Si la versión está en borrador, entran solos a la novedad.
5. Al terminar borra la carpeta temporal. Si algo falla, la carpeta se queda para revisarla, y el registro está en `out/jobs/<slug>.log`.

Un trabajo tarda entre 30 y 90 minutos. Versio da un trabajo por abandonado a las 3 horas.

Comandos útiles del worker:

```bash
pnpm worker              # espera trabajos (Ctrl+C para parar)
pnpm worker --once       # atiende lo que haya en cola y termina
pnpm worker --dry-run    # muestra el encargo del siguiente trabajo sin tomarlo
```

---

## Estándar de los videos

Lo que acordamos para todos los videos de producto, para que tengan el mismo diseño hagan quien los haga:

### Dos videos por funcionalidad

| | Clip / GIF (vista previa) | Tutorial narrado |
|---|---|---|
| Objetivo | Captar la atención: **en unos 4 s** debe quedar claro qué cambió | Explicar cómo se usa paso a paso |
| Dónde se ve | Lo primero en la novedad (Reactive) | Botón "Ver video explicativo" |
| Duración | 10 a 20 s, en bucle | Funcionalidad nueva: 2 a 4 min · Mejora: 1 a 2 min · Corrección: 40 a 70 s |
| Audio | Sin sonido | Voz (ElevenLabs) + música de fondo baja |

Quien ve la novedad tiene unos **10 segundos** para decidir si quiere ver más. Por eso primero se
muestra el clip, y el tutorial queda a un clic.

### Reglas de diseño

- **Fidelidad visual:** se usan los mismos íconos, colores, textos y estructura de Reactive, sin íconos genéricos ni rediseños
  ([fidelidad-visual.md](.claude/skills/video/references/fidelidad-visual.md)).
- **Datos ficticios** en todos los videos: nunca clientes, placas ni nombres reales.
- **La voz manda:** primero se escribe el guion y se genera la voz, y después se ajusta la animación a los tiempos de cada frase
  ([tutorial-narrado.md](.claude/skills/video/references/tutorial-narrado.md)).
- Tutorial modelo: `src/platforms/webtrack/videos/modo-delivery-jobs`.
- Guía completa de calidad: [calidad-diseno.md](.claude/skills/video/references/calidad-diseno.md).

---

## Hacer un video a mano

Abre Claude Code en esta carpeta y pídelo en lenguaje normal:

> "Haz el GIF y el tutorial del PR 1790 de reactive"
> "Planifica los videos de la versión 5.10.00.3010"

Claude sigue el skill `video` ([SKILL.md](.claude/skills/video/SKILL.md)). Los scripts que usa también se pueden correr directamente:

| Comando | Qué hace |
|---|---|
| `pnpm studio` | Vista previa de todos los videos |
| `./render.sh webtrack <id>` | Renderiza un video a `out/webtrack/<id>.mp4` (con 3D: `--gl=angle`) |
| `./still.sh webtrack <id> <frame>...` | Saca imágenes sueltas de un video para revisarlo |
| `./gif.sh webtrack <id> [ancho] [fps]` | Convierte el MP4 ya renderizado en GIF optimizado |
| `node scripts/new-video.mjs webtrack <slug> --name ... --title ...` | Crea el esqueleto de un video nuevo |
| `node scripts/narrate.mjs check\|synthesize\|mux webtrack <id>` | Revisa el guion, genera la voz y la mezcla |
| `scripts/pr.sh info\|diff\|i18n\|file <N>` | Lee un PR de `webtrackdev` (solo lectura) |
| `pnpm versio plan [versión]` | Lee de Versio las novedades y deja en `out/versio/` qué videos hay que crear |
| `node scripts/new-platform.mjs <id> ...` | Da de alta otra plataforma o tema |

## Estructura

```
src/core/                  piezas comunes: cámara, cursor, textos, tarjetas, subtítulos, ventana
src/platforms/webtrack/    marca, estilos, Root.tsx y videos/ de Webtrack
src/platforms/*/jobs/      videos temporales del worker (no se versionan)
scripts/                   worker, voz, esqueletos, lectura de PRs y de Versio
.claude/skills/video/      el flujo que sigue Claude y sus guías
platforms.json             plataformas y dónde está su código
audio.config.json          voz, música y volúmenes
versio.config.json         URL de Versio y reglas de qué video toca a cada novedad
out/                       resultados (no se versiona)
```

## Si algo no funciona

| Síntoma | Solución |
|---|---|
| `Falta el navegador` al renderizar | `npx playwright install chromium-headless-shell` (en WSL, con `--with-deps`) |
| `Falta MOTION_WORKER_SECRET` | Agrégalo al `.env`; debe ser igual al secreto de Supabase |
| El worker no toma trabajos | Revisa que `pnpm worker --dry-run` muestre el trabajo y que la novedad tenga "Generar con Claude" en cola |
| `motion-jobs 401` | El `MOTION_WORKER_SECRET` no coincide con el de Supabase |
| El trabajo falla al llamar a Claude | Abre `claude` una vez y revisa que la sesión esté iniciada |
| No hay voz en el tutorial | Falta `ELEVENLABS_API_KEY`, o se acabó el saldo de ElevenLabs |
| El MP4 no sube | Pesa más de 25 MB después de comprimirlo: hay que acortar el tutorial |
| Los videos no se parecen a Reactive | La copia de Reactive está vieja o no existe: corre `pnpm doctor` |

## Reglas del repo

- **Nunca se escribe en el repo de una plataforma** (`.cache/platforms/webtrack`): solo se lee.
- Las claves van en `.env` y no se suben.
- Respuestas y documentación en español; el código, en inglés.
