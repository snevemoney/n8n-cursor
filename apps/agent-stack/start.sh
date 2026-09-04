#!/usr/bin/env bash
# Hive agent-stack starter. Original MIT. Not a copy of AGPL start.sh.
# Starts face only if a face starter exists. Skips missing mouth/face.
# Hands stay parked. Never starts Claude Code or vendored sibling repos.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
MODE="${1:-all}"
STACK="$ROOT/docs/hive/outer-heaven/.hive/agent-stack.json"
FACE_START="$HERE/face/start.sh"
MOUTH_START="$HERE/mouth/start.sh"

if [[ "${VOICE_OS_BIND:-}" == "0.0.0.0" ]]; then
  echo "refused: 0.0.0.0 bind"
  exit 2
fi

echo "hive agent-stack: $ROOT (mode=$MODE)"
if [[ -f "$STACK" ]]; then
  echo "stack: $STACK"
else
  echo "stack: missing — run: npm run adopt"
fi

started=0
if [[ -x "$FACE_START" && "$MODE" != "mouth" ]]; then
  echo "face: starting $FACE_START"
  "$FACE_START" &
  started=1
else
  echo "face: skipped (no executable $FACE_START — sitting 1 parks face)"
fi

if [[ -x "$MOUTH_START" && "$MODE" != "face" ]]; then
  echo "mouth: starting $MOUTH_START"
  "$MOUTH_START"
  started=1
else
  echo "mouth: skipped (no executable $MOUTH_START — sitting 2)"
fi

echo "hands: parked"
if [[ "$started" -eq 0 ]]; then
  echo "nothing to start. conductor + bus only."
fi
