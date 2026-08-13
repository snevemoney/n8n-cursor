#!/usr/bin/env bash
# Emit operator event: telemetry register + optional Grok mission + Telegram fallback.
# Usage:
#   bash scripts/hive/outer-heaven/emit-operator-event.sh \
#     --severity WARN --lane business --summary "20hr week at 8/20" \
#     --correlationId oh-week-20260811
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
WEBHOOK_BASE="${HIVE_WEBHOOK_BASE:-https://evenslouis.ca/webhook}"
SEVERITY="INFO"
LANE="ops"
SUMMARY=""
CORRELATION_ID=""
DISPATCH_GROK="auto"
EVENT_TYPE="INFO"

usage() {
  sed -n '2,8p' "$0"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --severity) SEVERITY="${2:-INFO}"; shift 2 ;;
    --lane) LANE="${2:-ops}"; shift 2 ;;
    --summary) SUMMARY="${2:-}"; shift 2 ;;
    --correlationId) CORRELATION_ID="${2:-}"; shift 2 ;;
    --event-type) EVENT_TYPE="${2:-INFO}"; shift 2 ;;
    --no-grok) DISPATCH_GROK="no"; shift ;;
    --force-grok) DISPATCH_GROK="yes"; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1" >&2; usage ;;
  esac
done

[[ -n "$SUMMARY" ]] || { echo "Missing --summary" >&2; exit 1; }

if [[ -z "$CORRELATION_ID" ]]; then
  CORRELATION_ID="oh-$(date -u +%Y%m%d%H%M%S)"
fi

# Map severity to event_type when default INFO
if [[ "$EVENT_TYPE" == "INFO" && "$SEVERITY" == "WARN" ]]; then
  EVENT_TYPE="WARN"
elif [[ "$EVENT_TYPE" == "INFO" && "$SEVERITY" == "CRITICAL" ]]; then
  EVENT_TYPE="TEST_FAILURE"
fi

should_grok="no"
if [[ "$DISPATCH_GROK" == "yes" ]]; then
  should_grok="yes"
elif [[ "$DISPATCH_GROK" == "auto" && "$SEVERITY" != "INFO" ]]; then
  should_grok="yes"
fi

payload="$(python3 - <<PY
import json
print(json.dumps({
  "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
  "correlationId": "${CORRELATION_ID}",
  "repository_name": "n8n-cursor",
  "event_type": "${EVENT_TYPE}",
  "severity": "${SEVERITY}",
  "context": {
    "tool_executed": "emit-operator-event",
    "file_path": "scripts/hive/outer-heaven/emit-operator-event.sh",
    "error_message": """${SUMMARY}""",
    "lane": "${LANE}",
  },
  "hive_state": {"is_self_healing_active": True, "current_iteration_count": 0},
}))
PY
)"

echo "emit-operator-event: severity=${SEVERITY} lane=${LANE} cid=${CORRELATION_ID}"

if [[ -n "${HIVE_WEBHOOK_SECRET:-}" ]]; then
  if curl -sS --max-time 15 -X POST "${WEBHOOK_BASE}/hive-telemetry-ingest" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}" \
    -d "$payload" >/dev/null; then
    echo "  telemetry → hive-telemetry-ingest OK"
  else
    echo "  telemetry → failed (non-fatal)" >&2
  fi
else
  echo "  telemetry → skipped (HIVE_WEBHOOK_SECRET unset)"
fi

if [[ "$should_grok" == "yes" ]]; then
  if python3 "$ROOT/scripts/hive/grokbot-dispatch-missions.py" \
    --event "$SEVERITY" --lane "$LANE" \
    --summary "$SUMMARY" --correlation-id "$CORRELATION_ID" 2>/dev/null; then
    echo "  grok mission dispatched"
  else
    echo "  grok dispatch skipped (Grok Bot offline or gateway missing)" >&2
  fi
fi

if [[ "$SEVERITY" == "CRITICAL" && -n "${HIVE_WEBHOOK_SECRET:-}" ]]; then
  curl -sS --max-time 15 -X POST "${WEBHOOK_BASE}/hive-smoke-notify" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "correlationId": "${CORRELATION_ID}",
  "message": "[CRITICAL ${LANE}] ${SUMMARY}",
}))
PY
)" >/dev/null 2>&1 || true
  echo "  telegram fallback → hive-smoke-notify (if configured)"
fi

echo "done"
