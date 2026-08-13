#!/usr/bin/env bash
# Append a telemetry row to 03_Telemetry_Logs/YYYY-MM-DD.md and optionally patch manifest frontmatter
set -euo pipefail

VAULT="${HIVE_OBSIDIAN_VAULT:-}"
EVENT="${1:-INFO}"
MSG="${2:-}"
APP="${3:-n8n-cursor}"

if [[ -z "$VAULT" ]]; then
  echo "HIVE_OBSIDIAN_VAULT required"
  exit 1
fi

DAY=$(date -u +%Y-%m-%d)
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG_DIR="$VAULT/03_Telemetry_Logs"
LOG="$LOG_DIR/${DAY}.md"
mkdir -p "$LOG_DIR"

if [[ ! -f "$LOG" ]]; then
  cat > "$LOG" <<EOF
---
date: ${DAY}
type: telemetry_log
---

# Telemetry ${DAY}

EOF
fi

{
  echo ""
  echo "## ${TS} · ${EVENT}"
  echo ""
  echo "- **app:** ${APP}"
  echo "- **message:** ${MSG}"
} >> "$LOG"

NOTE="$VAULT/02_System_Manifests/${APP}.md"
if [[ -f "$NOTE" ]]; then
  RATING=95
  [[ "$EVENT" == "FAIL" || "$EVENT" == "CRITICAL" ]] && RATING=70
  bash "$(dirname "$0")/update-frontmatter.sh" "$NOTE" \
    "last_test_run=${TS}" \
    "health_rating=${RATING}" \
    "current_bottleneck=${MSG}" \
    "status=$([[ "$EVENT" == "FAIL" ]] && echo degraded || echo operational)"
fi

echo "Logged to $LOG"
