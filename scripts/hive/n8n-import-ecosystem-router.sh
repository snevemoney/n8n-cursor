#!/usr/bin/env bash
# Import hive-ecosystem-route master router (Secret 21)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/ecosystem-router.json"
NAME="Hive Ecosystem Master Router"

N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "N8N_API_KEY required"
  exit 1
fi

auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")

existing_id=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for w in data.get('data', data if isinstance(data, list) else []):
    if w.get('name') == '${NAME}':
        print(w.get('id',''))
        break
" 2>/dev/null || echo "")

payload=$(python3 <<PY
import json
with open('${WF_FILE}') as f:
    wf = json.load(f)
print(json.dumps({'name': '''${NAME}''', 'nodes': wf['nodes'], 'connections': wf['connections'], 'settings': wf.get('settings', {})}))
PY
)

if [[ -n "$existing_id" ]]; then
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" | python3 -m json.tool 2>/dev/null | head -15 || true
  wf_id="$existing_id"
else
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
fi

if [[ -n "${wf_id:-}" ]]; then
  curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" | python3 -m json.tool 2>/dev/null | head -8 || true
fi

echo ""
echo "POST https://evenslouis.ca/webhook/hive-ecosystem-route"
echo 'Body: {"route":"ce-lead-notify","correlationId":"ce-lead-test-001","sourceRepo":"client-engine","payload":{"leadId":"x","name":"Test","email":"t@example.com","status":"new"}}'
echo ""
echo "Import CE lead handler: bash scripts/hive/n8n-import-ce-lead-slice.sh"
