#!/bin/bash
# GIF desde el MP4 ya renderizado:  ./gif.sh <plataforma> <id> [ancho=960] [fps=12] [inicio_s] [duracion_s]
#   -> out/<plataforma>/<id>.gif  (o <id>-<inicio>s.gif si es un fragmento)
# Paleta propia del video (256 colores) y tramado para que los degradados no se vean en bandas.
# El GIF pesa mucho mas que el MP4: para correos o tickets conviene un fragmento corto.
set -e
PLATFORM="${1:?Uso: ./gif.sh <plataforma> <id> [ancho] [fps] [inicio_s] [duracion_s]}"
ID="${2:?Uso: ./gif.sh <plataforma> <id> [ancho] [fps] [inicio_s] [duracion_s]}"
WIDTH="${3:-960}"
FPS="${4:-12}"
START="${5:-}"
DUR="${6:-}"
SRC="out/$PLATFORM/$ID.mp4"
[ -f "$SRC" ] || { echo "No existe $SRC: renderiza primero con ./render.sh $PLATFORM $ID"; exit 1; }
OUT="out/$PLATFORM/$ID.gif"
CUT=()
if [ -n "$START" ]; then CUT+=(-ss "$START"); OUT="out/$PLATFORM/$ID-${START}s.gif"; fi
if [ -n "$DUR" ]; then CUT+=(-t "$DUR"); fi
FILTERS="fps=$FPS,scale=$WIDTH:-1:flags=lanczos"
PALETTE="$(mktemp -t palette).png"
ffmpeg -v error -y "${CUT[@]}" -i "$SRC" -vf "$FILTERS,palettegen=max_colors=256:stats_mode=diff" "$PALETTE"
ffmpeg -v error -y "${CUT[@]}" -i "$SRC" -i "$PALETTE" -lavfi "$FILTERS [x]; [x][1:v] paletteuse=dither=sierra2_4a:diff_mode=rectangle" -loop 0 "$OUT"
rm -f "$PALETTE"
echo "$OUT ($(du -h "$OUT" | cut -f1))"
