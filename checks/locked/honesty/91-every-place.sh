#!/usr/bin/env bash
# plain: There is one promise guard: no second promise regex or guard elsewhere in brain/, mouth/ or hands/.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
hits=$(grep -rlE "def promise_guard|^PROMISE_RE\b" brain mouth hands | grep -v "^mouth/persona.py$" || true)
[ -z "$hits" ] || { echo "duplicate: $hits" >&2; exit 1; }
