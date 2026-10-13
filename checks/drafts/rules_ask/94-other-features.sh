#!/usr/bin/env bash
# plain: Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
for f in ../../checks/locked/*/; do n=$(basename $f); [ "$n" = "rules_ask" ] && continue; for c in $f*.sh; do case $c in */92-*|*/93-*|*/94-*) continue;; esac; bash $c >/dev/null 2>&1 || { echo "broke $c" >&2; exit 1; }; done; done
