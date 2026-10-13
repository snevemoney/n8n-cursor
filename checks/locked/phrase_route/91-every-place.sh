#!/usr/bin/env bash
# plain: There is one fixed phrase router: no second copy elsewhere in brain/, mouth/ or hands/.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
n=$(grep -rE "def fixed_route\b" brain mouth hands | wc -l)
[ "$n" -eq 1 ] || { echo "fixed_route defs: $n" >&2; exit 1; }
