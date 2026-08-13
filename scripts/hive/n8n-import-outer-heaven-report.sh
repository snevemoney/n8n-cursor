#!/usr/bin/env bash
# Import or update Hive Outer Heaven Report Notify workflow via n8n REST API
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/outer-heaven-report-notify.json"
NAME="Hive Outer Heaven Report Notify"

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

cred_id=$(curl -sS "${auth[@]}" "${N8N_API}/credentials" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('data', []):
    if c.get('name') == 'jarvis' and 'telegram' in c.get('type', '').lower():
        print(c.get('id', ''))
        break
" 2>/dev/null || echo "")

if [[ -z "$cred_id" ]]; then
  echo "WARN: jarvis Telegram credential not found — attach Telegram credential in n8n UI after import"
  cred_id="MXoCxucFsrdjW9cO"
fi

existing_id=$(curl -sS "${auth[@]}" "${N8N_API}/workflows" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for w in data.get('data', data if isinstance(data, list) else []):
    if w.get('name') == '''${NAME}''':
        print(w.get('id',''))
        break
" 2>/dev/null || echo "")

payload=$(CRED_ID="$cred_id" python3 <<PY
import json, os
with open('${WF_FILE}') as f:
    wf = json.load(f)
for n in wf.get('nodes', []):
    if n.get('type') == 'n8n-nodes-base.telegram':
        n.setdefault('credentials', {})['telegramApi'] = {
            'id': os.environ['CRED_ID'],
            'name': 'jarvis',
        }
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
  curl -sS -X PUT "${auth[@]}" "${N8N_API}/workflows/${existing_id}" -d "$payload" | python3 -m json.tool | head -25
  wf_id="$existing_id"
else
  echo "Creating workflow"
  wf_id=$(curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows" -d "$payload" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
  echo "Created id=$wf_id"
fi

if [[ -n "$wf_id" ]]; then
  echo "Activating workflow $wf_id"
  curl -sS -X POST "${auth[@]}" "${N8N_API}/workflows/${wf_id}/activate" 2>/dev/null | python3 -m json.tool | head -10 || true
fi

echo ""
echo "If API import is forbidden (read-only key), import on VPS:"
echo "  scp workflows/hive/outer-heaven-report-notify.json root@VPS:/tmp/"
echo "  ssh root@VPS 'docker cp /tmp/outer-heaven-report-notify.json n8n-cursor-n8n-1:/tmp/wf.json && docker exec n8n-cursor-n8n-1 n8n import:workflow --input=/tmp/wf.json && docker exec n8n-cursor-n8n-1 n8n update:workflow --id=e39875ba-a355-43f2-9dd6-dc0e4bcda2ef --active=true'"

echo ""
echo "Manual trigger:"
echo "  curl -X POST \"\${N8N_WEBHOOK_BASE:-https://evenslouis.ca/webhook}/hive-outer-heaven-report\" \\"
echo "    -H 'Content-Type: application/json' -H \"X-Hive-Secret: \$HIVE_WEBHOOK_SECRET\" \\"
echo "    -d '{\"correlationId\":\"hive-report-manual-$(date +%s)\"}'"
echo ""
echo "Set n8n env: HIVE_MACHINE_TOKEN, TELEGRAM_BOT_TOKEN (OpenClaw bot), HIVE_TELEGRAM_CHAT_ID (default -1003718712318), HIVE_TELEGRAM_TOPIC_ID (default 13 #alerts)"
