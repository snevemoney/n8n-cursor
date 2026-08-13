#!/usr/bin/env bash
# Weekly hive scoreboard — run expert audit and append log
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
LOG="$ROOT/docs/hive/WEEKLY_SCOREBOARD.log"

bash "$ROOT/scripts/hive/expert-audit.sh" "$ROOT/docs/hive/EXPERT_AUDIT_LAST.txt"
rc=$?

line="$(date -u +%Y-%m-%dT%H:%M:%SZ) expert-audit exit=$rc"
echo "$line" >> "$LOG"

bash "$ROOT/scripts/hive/sync-gate-status.sh" || true

exit $rc
