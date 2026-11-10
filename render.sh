#!/bin/sh
# Render de un video:  ./render.sh <plataforma> <id-de-composicion>  ->  out/<plataforma>/<id>.mp4
# Usa el Chromium headless de Playwright: el que descarga Remotion falla en esta Mac
# ("icudtl.dat not found in bundle"). Se puede cambiar con BROWSER=/ruta/al/chrome.
set -e
PLATFORM="${1:?Uso: ./render.sh <plataforma> <id-de-composicion>}"
ID="${2:?Uso: ./render.sh <plataforma> <id-de-composicion>}"
shift 2
# Video temporal de un trabajo (jobs/<id>/index.tsx) o el Root de la plataforma.
ENTRY="src/platforms/$PLATFORM/index.ts"
[ -f "src/platforms/$PLATFORM/jobs/$ID/index.tsx" ] && ENTRY="src/platforms/$PLATFORM/jobs/$ID/index.tsx"
BROWSER="${BROWSER:-$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell}"
mkdir -p "out/$PLATFORM"
npx remotion render "$ENTRY" "$ID" "out/$PLATFORM/$ID.mp4" --codec=h264 --crf=18 --browser-executable="$BROWSER" "$@"
