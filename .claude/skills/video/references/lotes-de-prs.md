# Varios PRs de una vez (lotes)

El usuario suele pasar una lista de PRs ("hazme los gif para esto"). Esto es lo que
funciona y lo que falló la primera vez (11 PRs, 6 agentes en paralelo: el usuario detuvo
la tanda antes de ver nada).

## Lo que funciona

1. **Clasifica primero** (un `gh pr view` por PR, `scripts/pr.sh info <N>`): con pantalla
   propia, con efecto visible indirecto, o sin cambio visible (explicativo). Dile al usuario
   en una línea el reparto y empieza.
2. **Entrega incremental.** Termina un video completo (stills revisados, MP4, GIF) y
   envíalo con `SendUserFile` antes de empezar el siguiente. El usuario ve progreso y puede
   corregir el estilo a tiempo. Nunca esperes al final para mostrar todo.
3. **Orden:** primero los de más valor visual y los que reutilizan piezas existentes; los
   que requieren una pantalla nueva (Jobs, Planes de trabajo) después, uno por uno.
4. **Los PRs de otra repo** (p. ej. DevDatabase) se muestran en la pantalla que los
   consume: busca el PR de front que los acompaña (el cuerpo lo suele nombrar).
5. **Renders siempre en serie**, en un solo comando en segundo plano (`for ... ; do
   ./render.sh ...; ./gif.sh ...; done` con `run_in_background`), nunca con `&` dentro de
   un subshell ni dos a la vez.

## Subagentes: cuándo sí y cuándo no

- Sirven para **investigar y construir pantallas independientes** (cada uno en su carpeta),
  pero no para entregar rápido: cada uno tarda y consume mucho. Con 6 en paralelo no hubo
  nada que enseñar al usuario durante largo rato.
- Regla práctica: **hasta 3 videos en vuelo** y pide que cada agente termine **un video
  completo con stills** antes de empezar el siguiente. Revisa su hoja de contactos tú
  mismo antes de registrar y renderizar.
- El agente no renderiza MP4/GIF ni toca `Root.tsx`, `core/`, `FormKit.tsx` ni otro video.
  Usa un `dev-entry.tsx` propio para sus stills. Plantilla del brief:
  [brief-agente.md](brief-agente.md).
- Si el usuario dice "detente", detén todos los agentes (`TaskStop`) y di qué quedó a
  medias (carpetas en `videos/`) sin borrar nada.

## Lectura de PRs ajenos (solo lectura)

- `scripts/pr.sh info|diff|i18n|file <N> [repo]` hace todo con `gh`.
- Los archivos del commit del PR se piden por **SHA** (`headRefOid`), no por nombre de rama:
  las ramas con barras (`feature/fer/...`) dan 404.
- El checkout local de `../reactive` puede no tener los cambios del PR ni las pantallas
  nuevas. Para lo nuevo, usa el SHA; para lo existente en producción, el checkout.
- Nunca `git fetch`, `checkout` ni escribir en el repo de la plataforma.

## Honestidad en el reporte

Por video: qué muestra, qué se **simplificó**, qué se **dedujo** (texto de Antes/Ahora que
el PR no traía) y qué es **explicativo** porque no hay cambio visible. Una línea cada uno.
