#!/usr/bin/env bash
# Face of the existing hive bus. 127.0.0.1 only.
# Plain run:   ./start.sh            (foreground, current terminal)
# Keeper run:  ./start.sh --keep     (log to file, restart on exit, refuse doubles)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
if [[ "${VOICE_OS_BIND:-}" == "0.0.0.0" ]]; then
  echo "refused: 0.0.0.0 bind"
  exit 2
fi
export HOME="${HOME:-$HOME}"
export PATH="${HOME}/.local/bin:${PATH}"
unset AGENT_STACK_DRY_TTS || true
export PYTHONDONTWRITEBYTECODE=1  # no __pycache__ in the tree (locked grep checks scan it)
cd "$ROOT"

PORT="${AGENT_STACK_FACE_PORT:-4018}"
LOG="${AGENT_STACK_FACE_LOG:-$ROOT/logs/agent-stack-face.log}"

face_alive() {
  curl -sS -m 2 "http://127.0.0.1:${PORT}/healthz" >/dev/null 2>&1
}

if [[ "${1:-}" == "--keep" || "${AGENT_STACK_FACE_KEEP:-}" == "1" ]]; then
  mkdir -p "$(dirname "$LOG")"
  if face_alive; then
    echo "$(date -u +%FT%TZ) keeper: another face already answers on ${PORT}; exiting" >> "$LOG"
    exit 0
  fi
  echo "$(date -u +%FT%TZ) keeper: up (pid $$, port ${PORT}, log ${LOG})" >> "$LOG"
  backoff=5
  while :; do
    began=$(date +%s)
    set +e
    python3 "$HERE/serve.py" >> "$LOG" 2>&1
    rc=$?
    set -e
    lived=$(( $(date +%s) - began ))
    if [[ $lived -ge 60 ]]; then
      backoff=5
    fi
    echo "$(date -u +%FT%TZ) keeper: serve.py exited rc=${rc} after ${lived}s; restart in ${backoff}s" >> "$LOG"
    sleep "$backoff"
    backoff=$(( backoff < 60 ? backoff * 2 : 60 ))
    if face_alive; then
      echo "$(date -u +%FT%TZ) keeper: port ${PORT} answered while waiting; standing down" >> "$LOG"
      exit 0
    fi
  done
fi

exec python3 "$HERE/serve.py"
