#!/bin/sh
# Render de un video:  ./render.sh <plataforma> <id-de-composicion>  ->  out/<plataforma>/<id>.mp4
# Usa el Chromium headless de Playwright: el que descarga Remotion falla en macOS
# ("icudtl.dat not found in bundle"). Se puede cambiar con BROWSER=/ruta/al/chrome.
set -e
PLATFORM="${1:?Uso: ./render.sh <plataforma> <id-de-composicion>}"
ID="${2:?Uso: ./render.sh <plataforma> <id-de-composicion>}"
shift 2
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
mkdir -p "out/$PLATFORM"
npx remotion render "$ENTRY" "$ID" "out/$PLATFORM/$ID.mp4" --codec=h264 --crf=18 --browser-executable="$BROWSER" "$@"
