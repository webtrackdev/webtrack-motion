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
BROWSER="${BROWSER:-$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell}"
mkdir -p "out/$PLATFORM/stills"
for F in "${FRAMES[@]}"; do
  npx remotion still "$ENTRY" "$ID" "out/$PLATFORM/stills/$ID-$F.png" --frame="$F" --browser-executable="$BROWSER" --log=error "${FLAGS[@]}"
  echo "out/$PLATFORM/stills/$ID-$F.png"
done
