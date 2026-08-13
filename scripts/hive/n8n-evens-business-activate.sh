#!/usr/bin/env bash
# Activate evenslouis.ca/n8n business workflows (support, orchestrator, elevenlabs).
set -uo pipefail

N8N_API="${N8N_API_URL:-http://127.0.0.1:5678/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  for f in /root/domain-paths/n8n-cursor/.env /opt/philanthropy/.env; do
    # shellcheck disable=SC1090
    [[ -f "$f" ]] && source "$f" 2>/dev/null || true
  done
  KEY="${N8N_API_KEY:-}"
fi

log() { echo "[evens-n8n] $*"; }

activate_by_name() {
  local name="$1"
  local id
  id=$(curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows?limit=250" 2>/dev/null | python3 -c "
import sys,json
name='$name'
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')==name: print(w.get('id','')); break
")
  [[ -z "$id" ]] && { log "SKIP not found: $name"; return 0; }
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows/${id}/activate" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then log "OK activated: $name"; else log "WARN activate $name HTTP $code"; fi
}

[[ -z "$KEY" ]] && { log "SKIP N8N_API_KEY missing"; exit 0; }

log "activating evenslouis.ca/n8n business workflows"
activate_by_name "Support Agent Webhook"
activate_by_name "Master Orchestration System"
activate_by_name "elevenlabs post call workflow"
activate_by_name "Email Notification System"
log "done — webhooks at https://evenslouis.ca/webhook/*"
