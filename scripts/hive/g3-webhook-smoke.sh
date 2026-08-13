#!/usr/bin/env bash
# G3 golden path — n8n webhook → Scorpion register (optional full chain)
set -uo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SCORPION="${BASE}/scorpion"
WEBHOOK_BASE="${N8N_WEBHOOK_BASE:-${BASE}/webhook}"
SECRET="${HIVE_WEBHOOK_SECRET:-}"
TOKEN="${HIVE_MACHINE_TOKEN:-}"

pass=0
fail=0
skip=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

if [[ -z "$SECRET" ]]; then
  skp "HIVE_WEBHOOK_SECRET not set — G3 webhook smoke skipped"
  exit 0
fi

cid="hive-g3-smoke-$(date +%s)"
url="${WEBHOOK_BASE}/hive-smoke-notify"

resp=$(curl -sS --max-time 20 -X POST "$url" \
  -H "Content-Type: application/json" \
  -H "X-Hive-Secret: ${SECRET}" \
  -d "{\"correlationId\":\"${cid}\",\"message\":\"G3 expert audit smoke\"}" \
  -w "\nHTTP_CODE:%{http_code}")

code=$(echo "$resp" | grep HTTP_CODE | cut -d: -f2)
body=$(echo "$resp" | sed '/HTTP_CODE:/d')

if [[ "$code" == "200" || "$code" == "201" || "$code" == "204" ]]; then
  ok "n8n webhook hive-smoke-notify responded ($code)"
else
  bad "n8n webhook failed HTTP $code — $body"
fi

if [[ -z "$TOKEN" ]]; then
  skp "HIVE_MACHINE_TOKEN not set — cannot verify Scorpion register row"
  echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
  exit $(( fail > 0 ? 1 : 0 ))
fi

found=0
for _ in 1 2 3 4 5; do
  sleep 2
  list=$(curl -sS --max-time 15 "${SCORPION}/api/hive/missions?limit=30" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "")
  if echo "$list" | grep -q "$cid"; then
    found=1
    break
  fi
done

if [[ "$found" -eq 1 ]]; then
  ok "Scorpion missions includes G3 correlationId $cid"
else
  bad "Scorpion missions missing G3 correlationId after retries (workflow register may have failed)"
fi

echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
exit $(( fail > 0 ? 1 : 0 ))
