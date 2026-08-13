#!/usr/bin/env bash
# Import or update hive-error-heal-notify workflow via n8n REST API
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/error-heal-notify.json"
NAME="Hive Error Heal Notify"

N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "N8N_API_KEY required"
  exit 1
fi

if [[ ! -f "$WF_FILE" ]]; then
  echo "Missing $WF_FILE"
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
out = {
  'name': '''${NAME}''',
  'nodes': wf['nodes'],
  'connections': wf['connections'],
  'settings': wf.get('settings', {}),
}
print(json.dumps(out))
PY
)

if [[ -n "$existing_id" ]]; then
  echo "Updating workflow id=$existing_id"
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" | python3 -m json.tool | head -20
  wf_id="$existing_id"
else
  echo "Creating workflow"
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  echo "Created id=$wf_id"
fi

if [[ -n "${wf_id:-}" ]]; then
  echo "Activating workflow ${wf_id}"
  curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" | python3 -m json.tool | head -10
fi

echo ""
echo "Webhook URL: \${N8N_WEBHOOK_BASE:-https://evenslouis.ca/webhook}/hive-error-heal"
echo "Fixture:"
echo '  curl -X POST "$N8N_WEBHOOK_BASE/hive-error-heal" \'
echo '    -H "Content-Type: application/json" \'
echo '    -H "X-Hive-Secret: $HIVE_WEBHOOK_SECRET" \'
echo '    -d '"'"'{"correlationId":"heal-test-001","statusCode":500,"route":"/api/health","error":"Connection refused","repo":"n8n-cursor"}'"'"
