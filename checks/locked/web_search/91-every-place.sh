#!/usr/bin/env bash
# plain: There is one web search path: no second ad-hoc search function elsewhere in brain/, mouth/ or hands/.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
hits=$(grep -rlE "def (web_search|search_web|_web_lookup)\b" brain mouth hands | grep -v "^hands/web_search.py$" || true)
[ -z "$hits" ] || { echo "duplicate search: $hits" >&2; exit 1; }
