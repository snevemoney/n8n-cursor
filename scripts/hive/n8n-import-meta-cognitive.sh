#!/usr/bin/env bash
# Import meta-cognitive feedback loop workflows (founder signal, critique, predictive construct)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  echo "N8N_API_KEY required"
  exit 1
fi

auth=(-H "X-N8N-API-KEY: ${KEY}" -H "Content-Type: application/json")

import_one() {
  local file="$1"
  local name="$2"
  if [[ ! -f "$file" ]]; then
    echo "Missing $file"
    exit 1
  fi
  local existing_id
  existing_id=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for w in data.get('data', data if isinstance(data, list) else []):
    if w.get('name') == '''${name}''':
        print(w.get('id',''))
        break
" 2>/dev/null || echo "")

  local payload
  payload=$(python3 <<PY
import json
with open('${file}') as f:
    wf = json.load(f)
print(json.dumps({
  'name': '''${name}''',
  'nodes': wf['nodes'],
  'connections': wf['connections'],
  'settings': wf.get('settings', {}),
}))
PY
)

  local wf_id
  if [[ -n "$existing_id" ]]; then
    echo "Updating ${name} id=${existing_id}"
    curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" >/dev/null
    wf_id="$existing_id"
  else
    echo "Creating ${name}"
    wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  fi

  if [[ -n "${wf_id:-}" ]]; then
    curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/deactivate" >/dev/null || true
    echo "Inactive ${name} (${wf_id}) — DRAFT_PENDING_REVIEW"
  fi
}

import_one "$ROOT/workflows/hive/founder-signal-ingest.json" "Hive Founder Signal Ingest"
import_one "$ROOT/workflows/hive/predictive-construct.json" "Hive Predictive Construct"
import_one "$ROOT/workflows/hive/meta-critique-notify.json" "Hive Meta Critique Notify"
import_one "$ROOT/workflows/hive/sunday-meta-critique.json" "Hive Sunday Meta Critique"

echo ""
echo "Refreshing ecosystem router (meta-cognitive routes)..."
bash "$(dirname "$0")/n8n-import-ecosystem-router.sh"

echo ""
echo "Meta-cognitive loop imported. Smoke:"
echo "  bash scripts/hive/smoke-meta-cognitive.sh"
echo "Docs: docs/hive/META_COGNITIVE_LOOP.md"
