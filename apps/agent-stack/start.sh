#!/usr/bin/env bash
# Hive agent-stack starter. Original MIT. Not a copy of AGPL start.sh.
# Starts the tape visualizer on 4018. Mouth is the write path, not a daemon.
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

if [[ "$MODE" != "check" ]]; then
  unset AGENT_STACK_DRY_TTS || true
fi

if [[ "$MODE" == "check" ]]; then
  echo "mouth: $( [[ -x "$MOUTH_START" ]] && echo wired || echo missing )"
  echo "face: $( [[ -x "$FACE_START" ]] && echo wired || echo missing )"
  echo "hands: parked"
  AGENT_STACK_DRY_TTS=1 python3 "$HERE/mouth/turn.py" --self-test
  AGENT_STACK_DRY_TTS=1 python3 "$HERE/mouth/voice.py" --self-test
  python3 "$HERE/face/serve.py" --self-test
  AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 python3 "$HERE/tests/test_golden_pipeline.py"
  python3 "$HERE/memory/test_scars.py"
  exit 0
fi

if [[ -x "$MOUTH_START" && "$MODE" != "face" ]]; then
  echo "mouth: ready (say JARVIS or tap Space on the face; CLI $HERE/mouth/turn.py)"
  if [[ "$MODE" == "mouth" ]]; then
    exec "$MOUTH_START"
  fi
else
  echo "mouth: skipped (no executable $MOUTH_START)"
fi

if [[ -x "$FACE_START" && "$MODE" != "mouth" ]]; then
  echo "face: starting $FACE_START"
  exec "$FACE_START"
fi

echo "face: skipped (no executable $FACE_START)"
echo "hands: parked"
echo "nothing required left to start."
