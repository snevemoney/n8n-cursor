#!/bin/bash
# sessionEnd: write a receipt only. Do not invent a decision. Fail open.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PY="$ROOT/scripts/hive/os/one-brain.py"
if ! command -v python3 >/dev/null 2>&1 || [[ ! -f "$PY" ]]; then
  echo '{}'
  exit 0
fi
python3 "$PY" close --hook || echo '{}'
exit 0
