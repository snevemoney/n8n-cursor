#!/usr/bin/env bash
# Face of the existing hive bus. 127.0.0.1 only.
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
cd "$ROOT"
exec python3 "$HERE/serve.py"
