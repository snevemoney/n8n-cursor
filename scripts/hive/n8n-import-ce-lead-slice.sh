#!/usr/bin/env bash
# Import CE lead vertical slice: hive-ce-lead-notify + refresh ecosystem router route map
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/ce-lead-notify.json"
NAME="Hive CE Lead Notify"

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
print(json.dumps({
  'name': '''${NAME}''',
  'nodes': wf['nodes'],
  'connections': wf['connections'],
  'settings': wf.get('settings', {}),
}))
PY
)

if [[ -n "$existing_id" ]]; then
  echo "Updating workflow id=$existing_id"
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" | python3 -m json.tool 2>/dev/null | head -15 || true
  wf_id="$existing_id"
else
  echo "Creating workflow"
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  echo "Created id=$wf_id"
fi

if [[ -n "${wf_id:-}" ]]; then
  echo "Activating workflow ${wf_id}"
  curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" | python3 -m json.tool 2>/dev/null | head -8 || true
fi

echo ""
echo "Refreshing ecosystem router (ce-lead-notify route)..."
bash "$(dirname "$0")/n8n-import-ecosystem-router.sh"

echo ""
echo "Slice ready. Smoke:"
echo "  bash scripts/hive/smoke-ce-lead-slice.sh"
