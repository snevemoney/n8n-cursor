#!/usr/bin/env bash
# Import Outer Heaven library n8n workflow (hive-chronicle-ingest)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "N8N_API_KEY required"
  exit 1
fi

auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")
FILE="$ROOT/workflows/hive/hive-chronicle-ingest.json"
NAME="Hive Chronicle Ingest"

existing_id=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for w in data.get('data', data if isinstance(data, list) else []):
    if w.get('name') == '''${NAME}''':
        print(w.get('id',''))
        break
")

body=$(python3 -c "
import json
from pathlib import Path
w = json.loads(Path('${FILE}').read_text())
payload = {
  'name': w['name'],
  'nodes': w['nodes'],
  'connections': w['connections'],
  'settings': w.get('settings', {}),
}
print(json.dumps(payload))
")

if [[ -n "$existing_id" ]]; then
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$body" | python3 -m json.tool | head -5
  echo "Updated workflow $NAME ($existing_id)"
else
  curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$body" | python3 -m json.tool | head -5
  echo "Created workflow $NAME"
fi

echo "Activate in n8n UI when ready: https://evenslouis.ca/n8n"
