#!/bin/bash
# sessionStart: inject one-brain card. Fail open — never block a sitting.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PY="$ROOT/scripts/hive/os/one-brain.py"
if ! command -v python3 >/dev/null 2>&1 || [[ ! -f "$PY" ]]; then
  echo '{"additional_context":""}'
  exit 0
fi
python3 "$PY" wake --hook --no-chats || echo '{"additional_context":""}'
exit 0
