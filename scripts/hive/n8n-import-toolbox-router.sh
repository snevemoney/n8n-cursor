#!/usr/bin/env bash
# Import Hive Toolbox Router (hive-execute-tool)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/toolbox-router.json"
NAME="Hive Toolbox Router"

N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then echo "N8N_API_KEY required"; exit 1; fi
auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")

existing_id=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
    if w.get('name')=='${NAME}': print(w.get('id','')); break
" 2>/dev/null || true)

payload=$(python3 -c "import json; wf=json.load(open('${WF_FILE}')); print(json.dumps({'name':'${NAME}','nodes':wf['nodes'],'connections':wf['connections'],'settings':wf.get('settings',{})}))")

if [[ -n "$existing_id" ]]; then
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" | python3 -m json.tool | head -12
  wf_id="$existing_id"
else
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
fi

[[ -n "${wf_id:-}" ]] && curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" | python3 -m json.tool | head -6

echo ""
echo "JSON-RPC: POST https://evenslouis.ca/webhook/hive-execute-tool"
echo '{"jsonrpc":"2.0","id":"tool-smoke-1","method":"scorpion_hive_spine.golden_paths","params":{}}'
