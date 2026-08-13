#!/usr/bin/env bash
# Smoke: per-agent hive tool role gate on Philanthropy POST /api/agent
set -euo pipefail

API="${PHILANTHROPY_API:-http://127.0.0.1:3002/api/agent}"
SCORPION="${SCORPION_BASE:-https://evenslouis.ca/scorpion}"
CID="agent-roles-smoke-$(date +%s)"
FAIL=0

ok() { echo "OK  $*" >&2; }
bad() { echo "FAIL $*" >&2; FAIL=1; }

post_agent() {
  local tool="$1"
  local agent_id="${2-}"
  local extra_params="${3:-\{\}}"
  TOOL="$tool" AGENT_ID="$agent_id" PARAMS_JSON="$extra_params" API_URL="$API" python3 - <<'PY'
import json
import os
import urllib.error
import urllib.request

body = {"tool": os.environ["TOOL"], "params": json.loads(os.environ.get("PARAMS_JSON") or "{}")}
agent = os.environ.get("AGENT_ID") or ""
if agent:
    body["agentId"] = agent
req = urllib.request.Request(
    os.environ["API_URL"],
    data=json.dumps(body).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=20) as resp:
        print(resp.status)
        print(resp.read().decode()[:1200])
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode()[:1200])
PY
}

expect_code() {
  local label="$1"
  local want="$2"
  shift 2
  local out
  out="$("$@")"
  local code
  code="$(echo "$out" | head -1)"
  local body
  body="$(echo "$out" | tail -n +2)"
  if [[ "$code" == "$want" ]]; then
    ok "$label → HTTP $code"
  else
    bad "$label → expected HTTP $want got $code — $body"
  fi
  echo "$body"
}

expect_json_code() {
  local label="$1"
  local want_code="$2"
  shift 2
  local body
  body="$(expect_code "$label" "403" "$@")"
  if echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if d.get('code')=='${want_code}' else 1)" 2>/dev/null; then
    ok "$label body code=${want_code}"
  else
    bad "$label body missing code=${want_code} — $body"
  fi
}

echo "== Role gate smoke (${API}) =="

# naomi + hive_send_report — pass role gate (may error after gate — not ROLE_BLOCKED)
out="$(post_agent hive_send_report naomi '{"skipAlert": true}')"
code="$(echo "$out" | head -1)"
if [[ "$code" == "403" ]] && echo "$out" | grep -q ROLE_BLOCKED; then
  bad "naomi + hive_send_report should pass role gate"
else
  ok "naomi + hive_send_report not ROLE_BLOCKED (HTTP $code)"
fi

expect_json_code "naomi + ce_approve_action" ROLE_BLOCKED post_agent ce_approve_action naomi '{"actionId":"smoke"}'
expect_code "ledger + ce_list_actions" "200" post_agent ce_list_actions ledger '{"limit":3}'
expect_json_code "voice + n8n_trigger_catalog_webhook" ROLE_BLOCKED post_agent n8n_trigger_catalog_webhook voice '{"name":"noop"}'
expect_code "missing agentId + scorpion_health" "200" post_agent scorpion_health "" '{}'
expect_json_code "missing agentId + scorpion_register_outcome" ROLE_BLOCKED post_agent scorpion_register_outcome "" '{"correlationId":"smoke","jobType":"test","status":"ok"}'
expect_json_code "naomi + deal_update (Tier 3 regression)" TIER3_HITL_BLOCKED post_agent deal_update naomi '{"dealId":"x"}'

echo ""
if [[ "$FAIL" -eq 0 ]]; then
  ok "all role gate checks passed"
else
  echo "Some checks failed" >&2
  exit 1
fi

echo ""
echo "== Register outcome to Scorpion =="
if [[ -n "${HIVE_MACHINE_TOKEN:-}" ]]; then
  reg_body="$(python3 - <<PY
import json
print(json.dumps({
  "correlationId": "${CID}",
  "jobType": "hive.agent_roles.deployed",
  "status": "completed",
  "summary": "smoke-agent-roles.sh passed on VPS",
  "metadata": {"script": "scripts/hive/smoke-agent-roles.sh"},
}))
PY
)"
  reg="$(curl -sS --max-time 15 -X POST "${SCORPION}/api/hive/register" \
    -H "Authorization: Bearer ${HIVE_MACHINE_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$reg_body")"
  if echo "$reg" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    ok "registered ${CID}"
  else
    bad "register failed: $reg"
  fi
else
  echo "SKIP register — set HIVE_MACHINE_TOKEN to register outcome"
fi

exit "$FAIL"
