#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
import_one() {
  local file="$1" name="$2"
  N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
  KEY="${N8N_API_KEY:-}"
  [[ -n "$KEY" ]] || { echo "N8N_API_KEY required"; exit 1; }
  auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")
  existing=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')=='${name}': print(w.get('id','')); break")
  payload=$(python3 -c "import json; wf=json.load(open('${file}')); print(json.dumps({'name':'${name}','nodes':wf['nodes'],'connections':wf['connections'],'settings':wf.get('settings',{})}))")
  if [[ -n "$existing" ]]; then
    curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing}" -d "$payload" >/dev/null
    wf_id="$existing"
  else
    wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  fi
  [[ -n "$wf_id" ]] && curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" >/dev/null
  echo "activated ${name} id=${wf_id}"
}
import_one "$ROOT/workflows/hive/telemetry-ingest.json" "Hive Telemetry Ingest"
import_one "$ROOT/workflows/hive/daily-operational-digest.json" "Hive Daily Operational Digest"
echo "POST https://evenslouis.ca/webhook/hive-telemetry-ingest"
