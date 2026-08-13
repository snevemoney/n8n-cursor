#!/usr/bin/env bash
# Dispatch biweekly Grok routines (launchd gate — cron cannot exact 14-day interval).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="${HOME}/.grokbot/biweekly-routine-stamp.json"
INTERVAL_DAYS="${GROK_BIWEEKLY_DAYS:-14}"
LOG="${GROK_BIWEEKLY_LOG:-/tmp/grok-biweekly-dispatch.log}"

mkdir -p "${HOME}/.grokbot"
now_epoch="$(date +%s)"
last_epoch=0
if [[ -f "$STAMP" ]]; then
  last_epoch="$(python3 -c "import json; print(json.load(open('$STAMP')).get('lastRunEpoch',0))" 2>/dev/null || echo 0)"
fi
delta=$((now_epoch - last_epoch))
min_secs=$((INTERVAL_DAYS * 86400))

{
  echo "=== grok-biweekly-dispatch $(date -u +%Y-%m-%dT%H:%M:%SZ) delta=${delta}s ==="
  if [[ "$delta" -lt "$min_secs" && "${GROK_BIWEEKLY_FORCE:-0}" != "1" ]]; then
    echo "skip — last run within ${INTERVAL_DAYS} days"
    exit 0
  fi
  python3 "$ROOT/scripts/hive/grokbot-setup-routines.py" --engine launchd --dispatch
  python3 -c "import json; json.dump({'lastRunEpoch': $now_epoch}, open('$STAMP','w'), indent=2)"
  echo "=== complete ==="
} >>"$LOG" 2>&1
