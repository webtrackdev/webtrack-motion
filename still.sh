#!/bin/bash
# Cuadros sueltos para revisar:  ./still.sh <plataforma> <id> <frame>... [--opcion=valor...]
#   -> out/<plataforma>/stills/<id>-<frame>.png
# Los argumentos numericos son frames; el resto se pasa a Remotion (p. ej. --gl=angle para 3D).
set -e
PLATFORM="${1:?Uso: ./still.sh <plataforma> <id> <frame>...}"
ID="${2:?Uso: ./still.sh <plataforma> <id> <frame>...}"
shift 2
FRAMES=(); FLAGS=()
for A in "$@"; do if [[ "$A" =~ ^[0-9]+$ ]]; then FRAMES+=("$A"); else FLAGS+=("$A"); fi; done
# Video temporal de un trabajo (jobs/<id>/index.tsx) o el Root de la plataforma.
ENTRY="src/platforms/$PLATFORM/index.ts"
[ -f "src/platforms/$PLATFORM/jobs/$ID/index.tsx" ] && ENTRY="src/platforms/$PLATFORM/jobs/$ID/index.tsx"
# El repo de la plataforma (su CSS y componentes) sale de la copia que descarga `pnpm doctor`.
REPO_DIR="$(node -e "const p=require('./platforms.json')[process.argv[1]];if(p&&p.source&&p.source.type==='repo')console.log(p.source.repo+'/'+(p.source.src||'src'))" "$PLATFORM")"
if [ -n "$REPO_DIR" ] && [ ! -d "$REPO_DIR" ]; then echo "Falta $REPO_DIR (repo de la plataforma $PLATFORM): corre pnpm doctor"; exit 1; fi
# Navegador: BROWSER, o el chrome-headless-shell que instaló Playwright (macOS o Linux/WSL).
if [ -z "$BROWSER" ]; then
  for CACHE in "$HOME/Library/Caches/ms-playwright" "$HOME/.cache/ms-playwright"; do
    BROWSER="$(ls -d "$CACHE"/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell 2>/dev/null | tail -1)"
    [ -n "$BROWSER" ] && break
  done
fi
[ -n "$BROWSER" ] || { echo "Falta el navegador: npx playwright install chromium-headless-shell"; exit 1; }
mkdir -p "out/$PLATFORM/stills"
for F in "${FRAMES[@]}"; do
  npx remotion still "$ENTRY" "$ID" "out/$PLATFORM/stills/$ID-$F.png" --frame="$F" --browser-executable="$BROWSER" --log=error "${FLAGS[@]}"
  echo "out/$PLATFORM/stills/$ID-$F.png"
done
