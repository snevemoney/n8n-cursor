#!/usr/bin/env bash
# Freeze prerequisites check — active n8n workflow count (read-only)
set -uo pipefail

N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

pass=0
fail=0
skip=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

if [[ -z "$KEY" ]]; then
  skp "N8N_API_KEY not set — freeze-check skipped"
  exit 0
fi

resp=$(curl -sS --max-time 15 -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows?active=true" 2>/dev/null || echo "")
if echo "$resp" | grep -q '"data"'; then
  count=$(echo "$resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null || echo "?")
  ok "Active n8n workflows: $count (see docs/hive/FREEZE_AUTOMATIONS.md to pause)"
elif echo "$resp" | grep -qiE 'unauthorized|forbidden|401|403'; then
  skp "N8N_API_KEY rejected — freeze-check skipped"
else
  bad "Could not list active n8n workflows"
fi

echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
exit $(( fail > 0 ? 1 : 0 ))
