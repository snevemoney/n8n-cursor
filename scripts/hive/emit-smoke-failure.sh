#!/usr/bin/env bash
# Emit Grok operator event after smoke/watchdog failure (Mac or VPS with repo checkout).
# Usage:
#   bash scripts/hive/emit-smoke-failure.sh --lane health --summary "..." [--severity WARN|CRITICAL] [--correlationId cid]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SEVERITY="WARN"
LANE="health"
SUMMARY=""
CORRELATION_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --severity) SEVERITY="${2:-WARN}"; shift 2 ;;
    --lane) LANE="${2:-health}"; shift 2 ;;
    --summary) SUMMARY="${2:-}"; shift 2 ;;
    --correlationId) CORRELATION_ID="${2:-}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

[[ -n "$SUMMARY" ]] || { echo "Missing --summary" >&2; exit 1; }

EMIT="${ROOT}/scripts/hive/outer-heaven/emit-operator-event.sh"
[[ -f "$EMIT" ]] || { echo "Missing $EMIT" >&2; exit 1; }

args=(--severity "$SEVERITY" --lane "$LANE" --summary "$SUMMARY")
[[ -n "$CORRELATION_ID" ]] && args+=(--correlationId "$CORRELATION_ID")

bash "$EMIT" "${args[@]}" || true
