#!/usr/bin/env bash
# plain: Every other locked feature still passes its own checks (shared suite, eval and cross-feature checks are run once, not again; probe_eval/06-ci-wired is excused: it needs the workflows permission only Evens can grant).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
for f in ../../checks/locked/*/; do n=$(basename $f); [ "$n" = "plan_budget" ] && continue; for c in $f*.sh; do case $c in */92-*|*/93-*|*/94-*|*/probe_eval/06-ci-wired.sh) continue;; esac; bash $c >/dev/null 2>&1 || { echo "broke $c" >&2; exit 1; }; done; done
