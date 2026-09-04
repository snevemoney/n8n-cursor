#!/usr/bin/env bash
# Face of the existing hive bus. 127.0.0.1 only.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
if [[ "${VOICE_OS_BIND:-}" == "0.0.0.0" ]]; then
  echo "refused: 0.0.0.0 bind"
  exit 2
fi
exec python3 "$HERE/serve.py"
