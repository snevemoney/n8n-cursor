#!/usr/bin/env bash
# Core work-ready smoke — evenslouis.ca hive (Phase 0 gate)
# Run from repo root: bash scripts/hive/core-work-ready-smoke.sh
set -uo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
TIMEOUT="${SMOKE_TIMEOUT:-15}"
REPORT="${1:-docs/hive/CORE_WORK_READY_SMOKE_LAST.txt}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0
warn=0
manual=0

ok() { echo -e "${GREEN}PASS${NC} $1"; ((pass++)); }
bad() { echo -e "${RED}FAIL${NC} $1"; ((fail++)); }
note() { echo -e "${YELLOW}MANUAL${NC} $1"; ((manual++)); }

curl_code() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT" "$1" 2>/dev/null || echo "000"
}

curl_json_ok() {
  local url="$1"
  local body
  body=$(curl -sS --max-time "$TIMEOUT" "$url" 2>/dev/null) || return 1
  echo "$body" | grep -q '"ok"[[:space:]]*:[[:space:]]*true' && return 0
  echo "$body" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' && return 0
  return 1
}

{
  echo "Hive Core Work-Ready Smoke"
  echo "Base: $BASE"
  echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "=============================================="
  echo ""

  echo "## 0.1 Client Engine"
  code=$(curl_code "$BASE/pro")
  if [[ "$code" == "200" || "$code" == "302" || "$code" == "307" ]]; then ok "CE /pro reachable ($code)"; else bad "CE /pro unreachable ($code)"; fi
  code=$(curl_code "$BASE/pro/api/health")
  if [[ "$code" == "200" ]]; then ok "CE /pro/api/health ($code)"; else bad "CE /pro/api/health ($code)"; fi
  note "CE login + leads list + HITL approve — operator verify on $BASE/pro"
  echo ""

  echo "## 0.2 Scorpion"
  code=$(curl_code "$BASE/scorpion")
  if [[ "$code" == "200" || "$code" == "302" ]]; then ok "Scorpion UI ($code)"; else bad "Scorpion UI ($code)"; fi
  code=$(curl_code "$BASE/scorpion/healthz")
  if [[ "$code" == "200" ]]; then ok "Scorpion /healthz ($code)"; else bad "Scorpion /healthz ($code)"; fi
  if curl_json_ok "$BASE/scorpion/healthz"; then ok "Scorpion health JSON ok"; else bad "Scorpion health JSON missing ok"; fi
  note "Scorpion ops/dashboard loads without fatal errors — operator verify in browser"
  echo ""

  echo "## 0.3 OpenClaw / Philanthropy"
  code=$(curl_code "$BASE/claw/")
  if [[ "$code" == "200" || "$code" == "302" ]]; then ok "Claw path ($code)"; else bad "Claw path ($code)"; fi
  if [[ "${HIVE_SSH_VPS_AUDIT:-1}" == "1" ]]; then
    phil=$(ssh -o BatchMode=yes -o ConnectTimeout=8 "${HIVE_VPS_SSH:-root@69.62.66.78}" \
      "curl -sS -o /dev/null -w '%{http_code}' --max-time 8 http://127.0.0.1:3002/api/health" 2>/dev/null || echo "000")
    if [[ "$phil" == "200" ]]; then ok "Philanthropy /api/health ($phil)"; else bad "Philanthropy /api/health ($phil)"; fi
    port=$(ssh -o BatchMode=yes -o ConnectTimeout=8 "${HIVE_VPS_SSH:-root@69.62.66.78}" \
      "curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3205/healthz" 2>/dev/null || echo "000")
    if [[ "$port" == "200" ]]; then ok "CE hive bridge /healthz ($port)"; else bad "CE hive bridge /healthz ($port)"; fi
    pf=$(ssh -o BatchMode=yes -o ConnectTimeout=8 "${HIVE_VPS_SSH:-root@69.62.66.78}" \
      "curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:4010/healthz" 2>/dev/null || echo "000")
    if [[ "$pf" == "200" ]]; then ok "Portfolio /healthz ($pf)"; else bad "Portfolio /healthz ($pf)"; fi
  fi
  note "Telegram Big Boss tool-backed reply — operator verify on VPS/Telegram"
  note "Sacred workspace files + disk headroom — SSH verify on 69.62.66.78"
  echo ""

  echo "## 0.4 n8n"
  code=$(curl_code "$BASE/n8n/")
  if [[ "$code" == "200" || "$code" == "301" || "$code" == "302" ]]; then ok "n8n UI path ($code)"; else bad "n8n UI path ($code)"; fi
  if [[ -n "${HIVE_MACHINE_TOKEN:-}" ]]; then
    gp=$(curl -sS --max-time "$TIMEOUT" "$BASE/scorpion/api/hive/golden-paths" 2>/dev/null || echo "")
    if echo "$gp" | grep -q '"paths"'; then ok "Scorpion golden-paths API"; else bad "Scorpion golden-paths API"; fi
  else
    note "Set HIVE_MACHINE_TOKEN to auto-check hive API (or run hive-api-smoke.sh)"
  fi
  if [[ -n "${HIVE_WEBHOOK_SECRET:-}" ]]; then
    note "G3 webhook — run g3-webhook-smoke.sh (HIVE_WEBHOOK_SECRET set)"
  else
    note "Webhook auth + test workflow — run g3-webhook-smoke.sh when HIVE_WEBHOOK_SECRET set"
  fi
  echo ""

  echo "## 0.5 Outer Heaven backups"
  note "Last backup timestamp + restore drill — SSH/cron verify (see docs/hive/runbooks/outer-heaven-backups.md)"
  echo ""

  echo "=============================================="
  echo "Summary: PASS=$pass FAIL=$fail MANUAL=$manual"
} | tee "$REPORT"

exit $(( fail > 0 ? 1 : 0 ))
