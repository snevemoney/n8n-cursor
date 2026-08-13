#!/usr/bin/env bash
# Smoke meta-cognitive founder signal → predictive construct chain
set -euo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SECRET="${HIVE_WEBHOOK_SECRET:-}"
CID="${1:-meta-cog-smoke-$(date +%s)}"

if [[ -z "$SECRET" ]]; then
  echo "WARN HIVE_WEBHOOK_SECRET not set — posting to ecosystem router without X-Hive-Secret"
fi

echo "== Founder signal (predictive trigger) =="
PAYLOAD="$(python3 - <<PY
import json
print(json.dumps({
  "route": "founder-signal",
  "correlationId": "${CID}",
  "sourceRepo": "n8n-cursor",
  "payload": {
    "signalType": "note",
    "source": "smoke-script",
    "text": "Launching marketing campaign next Monday — need automated lead scoring for three new clients",
    "tags": ["launch", "marketing"]
  }
}))
PY
)"
if [[ -n "$SECRET" ]]; then
  curl -sS -X POST "${BASE}/webhook/hive-ecosystem-route" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${SECRET}" \
    -d "$PAYLOAD"
else
  curl -sS -X POST "${BASE}/webhook/hive-ecosystem-route" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"
fi | python3 -c "
import sys, json
raw = sys.stdin.read().strip()
if not raw:
    print({'ok': True, 'note': 'empty body (founder-signal workflow inactive — expected for DRAFT_PENDING_REVIEW)'})
else:
    print(json.dumps(json.loads(raw), indent=2))
"

echo ""
echo "Expect: founder.signal.ingested + optional product.predictive_infrastructure.proposed (need_hitl)"
echo "Check n8n for DRAFT_PENDING_REVIEW workflow (inactive) and Telegram #alerts"
