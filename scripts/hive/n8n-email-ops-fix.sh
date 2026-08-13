#!/usr/bin/env bash
# Lane 2 — fix existing email automation wiring (no new workflows).
# Gmail OAuth reconnect must be done in n8n UI by operator.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
N8N_API="${N8N_API_URL:-http://127.0.0.1:5678/api/v1}"
KEY="${N8N_API_KEY:-}"

if [[ -z "$KEY" ]]; then
  for f in /root/domain-paths/n8n-cursor/.env /opt/philanthropy/.env; do
    if [[ -f "$f" ]]; then
      # shellcheck disable=SC1090
      source "$f" 2>/dev/null || true
    fi
  done
  KEY="${N8N_API_KEY:-}"
fi

log() { echo "[email-ops] $*"; }

activate_by_name() {
  local name="$1"
  local id
  id=$(curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows?limit=250" 2>/dev/null | python3 -c "
import sys,json
name='$name'
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')==name:
    print(w.get('id','')); break
")
  [[ -z "$id" ]] && { log "SKIP not found: $name"; return 0; }
  local active
  active=$(curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows/${id}" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('active'))")
  if [[ "$active" == "True" || "$active" == "true" ]]; then
    log "OK already active: $name"
    return 0
  fi
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows/${id}/activate" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    log "OK activated: $name"
  else
    log "WARN activate $name HTTP $code (Gmail OAuth may be missing in n8n UI)"
  fi
}

log "start email ops fix"

if [[ -z "$KEY" ]]; then
  log "SKIP N8N_API_KEY missing"
  exit 0
fi

# Existing prod email workflows — activate if inactive
activate_by_name "Email Notification System"
activate_by_name "Evens Louis Email Reply Agent"
activate_by_name "GPT-5 Support Agent"

log "credential audit (operator reconnect Gmail in n8n UI if AI/Gmail nodes fail):"
bash "${SCRIPT_DIR}/n8n-audit-credentials.sh" 2>/dev/null || true

log "CE lead hook:"
if grep -q notifyHiveLeadCreated /root/client-engine/src/lib/db.ts 2>/dev/null; then
  log "OK CE lead notify wired"
else
  log "RUN wire-ce-lead-hook-vps.sh from hub"
fi

log "daily digest:"
digest_active=$(curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows?limit=250" 2>/dev/null | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')=='Hive Daily Operational Digest' and w.get('active'):
    print('yes'); break
" 2>/dev/null || true)
if [[ "$digest_active" == "yes" ]]; then
  log "OK Hive Daily Operational Digest active"
else
  log "WARN daily digest inactive — run n8n-import-telemetry.sh"
fi

log "done — operator: n8n UI → Credentials → reconnect Gmail for GPT-5 / Reply Agent"
