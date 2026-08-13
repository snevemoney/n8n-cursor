#!/usr/bin/env bash
# Hive API smoke — correlation allocate → register → list
set -uo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SCORPION="${BASE}/scorpion"
TOKEN="${HIVE_MACHINE_TOKEN:-}"

pass=0
fail=0
skip=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

if [[ -z "$TOKEN" ]]; then
  skp "HIVE_MACHINE_TOKEN not set — hive API smoke skipped"
  exit 0
fi

AUTH="Authorization: Bearer ${TOKEN}"

# Allocate correlation ID
alloc=$(curl -sS --max-time 15 -X POST "${SCORPION}/api/hive/missions" -H "$AUTH" -H "Content-Type: application/json")
if echo "$alloc" | grep -q '"correlationId"'; then
  ok "POST /api/hive/missions allocates correlationId"
  cid=$(echo "$alloc" | python3 -c "import sys,json; print(json.load(sys.stdin).get('correlationId',''))" 2>/dev/null || echo "")
else
  bad "POST /api/hive/missions failed: $alloc"
  echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
  exit 1
fi

# Register outcome
reg_body=$(cat <<EOF
{"correlationId":"${cid}","jobType":"audit.smoke","goal":"Hive API smoke test","source":"hive-api-smoke.sh","status":"done","registerTo":"scorpion","summary":"automated smoke"}
EOF
)
reg=$(curl -sS --max-time 15 -X POST "${SCORPION}/api/hive/register" -H "$AUTH" -H "Content-Type: application/json" -d "$reg_body")
if echo "$reg" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  ok "POST /api/hive/register accepts payload"
else
  bad "POST /api/hive/register failed: $reg"
fi

# List missions
list=$(curl -sS --max-time 15 "${SCORPION}/api/hive/missions?limit=10" -H "$AUTH")
if echo "$list" | grep -q "$cid"; then
  ok "GET /api/hive/missions includes registered correlationId"
else
  bad "GET /api/hive/missions missing correlationId $cid"
fi

# Golden paths JSON
gp=$(curl -sS --max-time 15 "${SCORPION}/api/hive/golden-paths")
if echo "$gp" | grep -q '"paths"'; then
  ok "GET /api/hive/golden-paths returns scoreboard"
else
  bad "GET /api/hive/golden-paths failed: $gp"
fi

echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
exit $(( fail > 0 ? 1 : 0 ))
