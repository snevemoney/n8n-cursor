#!/usr/bin/env bash
# Smoke life + business ops lanes after fix script.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
pass=0
fail=0
skip=0
ON_VPS=0
[[ -d /opt/philanthropy ]] && ON_VPS=1

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

vps_ssh() {
  if [[ "$ON_VPS" -eq 1 ]]; then
    bash -c "$1"
  else
    ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" "$1"
  fi
}

# Load secrets from hub .env if present
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env" 2>/dev/null || true
  set +a
fi
if [[ "$ON_VPS" -eq 1 && -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env" 2>/dev/null || true
  set +a
  export HIVE_MACHINE_TOKEN="${HIVE_MACHINE_TOKEN:-$(docker exec evenslouis_paths-scorpion-1 printenv HIVE_MACHINE_TOKEN 2>/dev/null || true)}"
fi

echo "=== Lane 1 — n8n + philanthropy ==="
if vps_ssh "curl -sS --max-time 30 -X POST http://127.0.0.1:3002/api/agent -H 'Content-Type: application/json' -d '{\"tool\":\"n8n_list_workflows\",\"params\":{\"limit\":3}}'" 2>/dev/null | grep -q '"ok":true'; then
  ok "philanthropy n8n_list_workflows"
else
  bad "philanthropy n8n_list_workflows"
fi

if [[ "$ON_VPS" -eq 1 ]]; then
  g3_out=$(bash "$ROOT/scripts/hive/g3-webhook-smoke.sh" 2>&1)
else
  g3_out=$(ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" \
    "cd /root/domain-paths/n8n-cursor && export HIVE_WEBHOOK_SECRET=\$(grep -E '^HIVE_WEBHOOK_SECRET=' .env | head -1 | cut -d= -f2- | tr -d '\"') && export HIVE_MACHINE_TOKEN=\$(docker exec evenslouis_paths-scorpion-1 printenv HIVE_MACHINE_TOKEN 2>/dev/null || true) && bash scripts/hive/g3-webhook-smoke.sh" 2>&1)
fi
if echo "$g3_out" | grep -q 'PASS n8n webhook'; then
  ok "G3 hive-smoke-notify webhook"
else
  bad "G3 hive-smoke-notify webhook"
fi

echo ""
echo "=== Lane 2 — email + CE leads ==="
if vps_ssh "curl -sS --max-time 30 -X POST http://127.0.0.1:3002/api/agent -H 'Content-Type: application/json' -d '{\"tool\":\"ce_lookup_lead\",\"params\":{\"limit\":3}}'" 2>/dev/null | grep -q '"ok":true'; then
  ok "ce_lookup_lead"
else
  bad "ce_lookup_lead"
fi

if [[ "$ON_VPS" -eq 1 ]]; then
  KEY=$(grep -E '^N8N_API_KEY=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"' || true)
else
  KEY=$(ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" \
    "grep -E '^N8N_API_KEY=' /root/domain-paths/n8n-cursor/.env | head -1 | cut -d= -f2- | tr -d '\"'" 2>/dev/null || true)
fi
if [[ -n "$KEY" ]]; then
  if [[ "$ON_VPS" -eq 1 ]]; then
    active=$(curl -sS -H "X-N8N-API-KEY: $KEY" 'http://127.0.0.1:5678/api/v1/workflows?limit=250' 2>/dev/null | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')=='Email Notification System' and w.get('active'):
    print('yes'); break
" 2>/dev/null || true)
  else
    active=$(ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" \
      "curl -sS -H 'X-N8N-API-KEY: $KEY' 'http://127.0.0.1:5678/api/v1/workflows?limit=250'" 2>/dev/null | python3 -c "
import sys,json
for w in json.load(sys.stdin).get('data',[]):
  if w.get('name')=='Email Notification System' and w.get('active'):
    print('yes'); break
" 2>/dev/null || true)
  fi
  if [[ "$active" == "yes" ]]; then
    ok "Email Notification System active"
  else
    bad "Email Notification System not active"
  fi
else
  skp "Email Notification System (no N8N_API_KEY)"
fi

echo ""
echo "=== Lane 3 — evenslouis n8n catalog (voice/business) ==="
if grep -q 'evens-support-agent' "$ROOT/scripts/hive/n8n-catalog.json" 2>/dev/null && \
   ! grep -q 'n8ncloud.tech' "$ROOT/scripts/hive/n8n-catalog.json" 2>/dev/null; then
  ok "n8n catalog uses evenslouis.ca only"
else
  bad "n8n catalog still references n8ncloud.tech or missing evens entries"
fi

echo ""
echo "=== Lane 4 — CE + builder ==="
code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 "${BASE}/pro/api/health" 2>/dev/null || echo "000")
if [[ "$code" == "200" ]]; then
  ok "CE /pro/api/health"
else
  bad "CE /pro/api/health ($code)"
fi

if [[ "$ON_VPS" -eq 1 ]]; then
  hook=$(grep -c notifyHiveLeadCreated /root/client-engine/src/lib/db.ts 2>/dev/null || echo "0")
else
  hook=$(ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" \
    "grep -c notifyHiveLeadCreated /root/client-engine/src/lib/db.ts 2>/dev/null" || echo "0")
fi
if [[ "$hook" -ge 1 ]]; then
  ok "CE lead hook in db.ts"
else
  bad "CE lead hook missing"
fi

builder_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 8 "${BASE}/builder/" 2>/dev/null || echo "000")
if [[ "$builder_code" == "200" ]]; then
  ok "Builder public path reachable (stub OK)"
else
  bad "Builder public path ($builder_code)"
fi

echo ""
echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
if [[ "$fail" -gt 0 ]]; then
  cid="smoke-life-$(date -u +%Y%m%d%H%M%S)"
  sev="WARN"
  [[ "$pass" -eq 0 ]] && sev="CRITICAL"
  if [[ -f "$ROOT/scripts/hive/emit-smoke-failure.sh" ]]; then
    bash "$ROOT/scripts/hive/emit-smoke-failure.sh" \
      --severity "$sev" --lane "health" \
      --summary "smoke-life-business-ops PASS=$pass FAIL=$fail SKIP=$skip" \
      --correlationId "$cid" 2>/dev/null || true
  fi
fi
exit $(( fail > 0 ? 1 : 0 ))
