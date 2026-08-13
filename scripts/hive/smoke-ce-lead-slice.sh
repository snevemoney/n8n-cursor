#!/usr/bin/env bash
# Smoke test: CE lead → hive-ecosystem-route → register → Telegram
set -euo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SECRET="${HIVE_WEBHOOK_SECRET:-}"
CID="${1:-ce-lead-smoke-$(date +%s)}"

if [[ -z "$SECRET" ]]; then
  echo "WARN HIVE_WEBHOOK_SECRET not set — posting to ecosystem router without X-Hive-Secret"
fi

echo "== Direct ecosystem route (ce-lead-notify) =="
if [[ -n "$SECRET" ]]; then
  curl -sS -X POST "${BASE}/webhook/hive-ecosystem-route" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${SECRET}" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "route": "ce-lead-notify",
  "correlationId": "${CID}",
  "sourceRepo": "client-engine",
  "payload": {
    "leadId": "smoke-lead-001",
    "name": "Hive Slice Smoke",
    "email": "smoke@example.com",
    "status": "new",
    "source": "smoke-script"
  }
}))
PY
)" | python3 -m json.tool
else
  curl -sS -X POST "${BASE}/webhook/hive-ecosystem-route" \
    -H "Content-Type: application/json" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "route": "ce-lead-notify",
  "correlationId": "${CID}",
  "sourceRepo": "client-engine",
  "payload": {
    "leadId": "smoke-lead-001",
    "name": "Hive Slice Smoke",
    "email": "smoke@example.com",
    "status": "new",
    "source": "smoke-script"
  }
}))
PY
)" | python3 -m json.tool
fi

echo ""
echo "== Verify Scorpion mission (optional, needs HIVE_MACHINE_TOKEN) =="
if [[ -n "${HIVE_MACHINE_TOKEN:-}" ]]; then
  curl -sS "${BASE}/scorpion/api/hive/missions?limit=5" \
    -H "Authorization: Bearer ${HIVE_MACHINE_TOKEN}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
cid = '${CID}'
for m in data.get('missions', data if isinstance(data, list) else []):
    if m.get('correlationId') == cid or cid in str(m.get('summary','')):
        print('FOUND mission:', json.dumps(m, indent=2)[:800])
        break
else:
    print('Mission not in first page — check ops UI or widen since filter')
"
else
  echo "Set HIVE_MACHINE_TOKEN to verify register row"
fi

echo ""
echo "Expect Telegram #alerts (topic 13) with correlationId=${CID}"
