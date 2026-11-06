#!/bin/bash
# Lectura de un PR de la organizacion (solo lectura, con gh). Uso:
#   scripts/pr.sh info <N> [repo]            titulo, cuerpo, archivos y SHA del commit
#   scripts/pr.sh diff <N> [repo]            diff completo (sin lineas index/diff --git)
#   scripts/pr.sh i18n <N> [repo]            solo las lineas nuevas de archivos i18n/locales *.json (es)
#   scripts/pr.sh file <N> <ruta> [repo]     un archivo en el commit del PR (por SHA, no por rama)
# repo por defecto: reactive (webtrackdev/<repo>). Nunca escribe en el repo ni hace git fetch.
set -e
CMD="${1:?Uso: scripts/pr.sh info|diff|i18n|file <N> [...]}"
N="${2:?Falta el numero de PR}"
ORG="${PR_ORG:-webtrackdev}"
case "$CMD" in
  file) PATH_IN="${3:?Falta la ruta del archivo}"; REPO="${4:-reactive}" ;;
  *) REPO="${3:-reactive}" ;;
esac
R="$ORG/$REPO"
case "$CMD" in
  info)
    gh pr view "$N" --repo "$R" --json title,state,headRefName,headRefOid,additions,deletions,body,files \
      --jq '"\(.title) [\(.state)]  +\(.additions)/-\(.deletions)\nrama: \(.headRefName)\nSHA: \(.headRefOid)\n\n\(.body)\n---ARCHIVOS\n" + ([.files[].path] | join("\n"))'
    ;;
  diff)
    gh pr diff "$N" --repo "$R" | grep -v '^index \|^diff --git'
    ;;
  i18n)
    gh pr diff "$N" --repo "$R" | python3 -c '
import sys
cur = None
for line in sys.stdin:
    if line.startswith("+++ b/"):
        cur = line[6:].strip()
    elif cur and cur.endswith(".json") and ("i18n" in cur or "locales" in cur) and "/es.json" in cur and line.startswith("+") and not line.startswith("+++"):
        print(line[1:].rstrip()[:240])
'
    ;;
  file)
    SHA=$(gh pr view "$N" --repo "$R" --json headRefOid --jq .headRefOid)
    gh api "repos/$R/contents/$PATH_IN?ref=$SHA" --jq .content | base64 -d
    ;;
  *) echo "Comando desconocido: $CMD" >&2; exit 1 ;;
esac
