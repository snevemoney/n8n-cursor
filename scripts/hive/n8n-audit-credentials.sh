#!/usr/bin/env bash
# List n8n credentials that may need reconnect (read-only)
set -uo pipefail

N8N_API="${N8N_API_URL:-https://evenslouis.ca/n8n/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  for f in /root/domain-paths/n8n-cursor/.env /opt/philanthropy/.env; do
    if [[ -f "$f" ]]; then
      val=$(grep -E '^N8N_API_KEY=' "$f" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')
      [[ -n "$val" ]] && KEY="$val" && break
    fi
  done
fi

if [[ -z "$KEY" ]]; then
  echo "SKIP N8N_API_KEY not set"
  exit 0
fi

echo "n8n credentials (name | type | id)"
curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/credentials" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in sorted(data.get('data', []), key=lambda x: x.get('name', '')):
    print(f\"  {c.get('name','?')} | {c.get('type','?')} | {c.get('id','')}\")
print(f\"Total: {len(data.get('data', []))}\")
print()
print('Reconnect Anthropic + OpenAI in n8n UI if AI nodes fail.')
print('Google Drive credential blocks File Upload Sync — reconnect or deactivate that workflow.')
"
