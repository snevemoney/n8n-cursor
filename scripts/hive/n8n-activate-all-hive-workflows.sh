#!/usr/bin/env bash
# Activate safe hive n8n workflows via API (skip HITL draft-only workflows).
set -uo pipefail

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

if [[ -z "$KEY" ]]; then
  echo "SKIP N8N_API_KEY not set"
  exit 0
fi

# Never auto-activate: draft/HITL-only agent workflow builders
SKIP_NAMES=(
  "Hive Predictive Construct"
  "Hive Meta Critique Notify"
  "Hive Sunday Meta Critique"
)

should_skip() {
  local name="$1"
  for s in "${SKIP_NAMES[@]}"; do
    [[ "$name" == "$s" ]] && return 0
  done
  return 1
}

activated=0
skipped=0
failed=0

while IFS=$'\t' read -r id name active; do
  [[ -z "$id" ]] && continue
  if should_skip "$name"; then
    echo "SKIP (HITL/cron-only) $name"
    ((skipped++)) || true
    continue
  fi
  if [[ "$active" == "True" || "$active" == "true" ]]; then
    echo "OK   already active: $name"
    continue
  fi
  code=$(curl -sS -o /dev/null -w '%{http_code}' -X POST \
    -H "X-N8N-API-KEY: ${KEY}" \
    -H "Content-Type: application/json" \
    "${N8N_API}/workflows/${id}/activate" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    echo "OK   activated: $name"
    ((activated++)) || true
  else
    echo "FAIL activate $name HTTP $code"
    ((failed++)) || true
  fi
done < <(curl -sS -H "X-N8N-API-KEY: ${KEY}" "${N8N_API}/workflows?limit=250" 2>/dev/null | python3 -c "
import sys, json
for w in json.load(sys.stdin).get('data', []):
    n = w.get('name', '')
    if 'hive' in n.lower():
        print(f\"{w.get('id','')}\t{n}\t{w.get('active')}\")
")

echo "SUMMARY activated=$activated skipped=$skipped failed=$failed"
exit $(( failed > 0 ? 1 : 0 ))
