#!/usr/bin/env bash
# plain: Every other feature already locked on this branch still passes its locked checks (its shared test-suite check is covered by check 8).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
for f in ../../checks/locked/*/; do n=$(basename $f); [ "$n" = "skills" ] && continue; for c in $f*.sh; do case $c in */92-*) continue;; esac; bash $c >/dev/null 2>&1 || { echo "broke $c" >&2; exit 1; }; done; done
