#!/usr/bin/env bash
# plain: There is one model-free route decision: model_free_route is defined once, and the eval has no copy of the routing rules.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
n=$(grep -rE "def model_free_route\b" brain mouth hands eval | wc -l)
[ "$n" -eq 1 ] || { echo "defs: $n" >&2; exit 1; }
! grep -qE "re\.compile|wants_" eval/eval_probes.py
