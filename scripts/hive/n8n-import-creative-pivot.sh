#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF="$ROOT/workflows/hive/creative-pivot-notify.json"
NAME="Hive Creative Pivot Notify"
N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"
[[ -n "$KEY" ]] || { echo "N8N_API_KEY required"; exit 1; }
auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")
existing=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')=='${NAME}': print(w.get('id','')); break")
payload=$(python3 -c "import json; wf=json.load(open('${WF}')); print(json.dumps({'name':'${NAME}','nodes':wf['nodes'],'connections':wf['connections'],'settings':wf.get('settings',{})}))")
if [[ -n "$existing" ]]; then
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing}" -d "$payload" >/dev/null
  wf_id="$existing"
else
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
fi
[[ -n "$wf_id" ]] && curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" >/dev/null
echo "Creative pivot webhook: /webhook/hive-creative-pivot"
echo 'Fixture: {"correlationId":"pivot-1","fix_attempt":3,"tool_method":"x.y","business_goal":"test","estimated_loop_cost_usd":1}'
