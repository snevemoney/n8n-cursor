#!/usr/bin/env bash
# Lane 4 — verify CE money path + builder stub wiring (no new builder code).
set -uo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
pass=0
fail=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }

echo "=== CE builder smoke ==="

code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${BASE}/pro/api/health" 2>/dev/null || echo "000")
if [[ "$code" == "200" ]]; then ok "CE /pro/api/health"; else bad "CE /pro/api/health ($code)"; fi

builder=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${BASE}/builder/" 2>/dev/null || echo "000")
if [[ "$builder" == "200" ]]; then ok "Builder /builder/ reachable"; else bad "Builder ($builder)"; fi

if [[ -f /root/client-engine/.env ]]; then
  if grep -q '^BUILDER_API_URL=' /root/client-engine/.env; then
    ok "CE BUILDER_API_URL configured"
  else
    bad "CE BUILDER_API_URL missing"
  fi
  if grep -q notifyHiveLeadCreated /root/client-engine/src/lib/db.ts 2>/dev/null; then
    ok "CE lead hook in db.ts"
  else
    bad "CE lead hook missing"
  fi
else
  bad "CE repo not at /root/client-engine"
fi

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'client-engine-pro'; then
  ok "CE pro container running"
else
  bad "CE pro container not found"
fi

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q 'paths-builder'; then
  ok "Builder container running (stub until real tree deployed)"
else
  bad "Builder container missing"
fi

echo "Summary: PASS=$pass FAIL=$fail"
echo "Note: builder-stub on :3001 is expected — approve builds on ${BASE}/pro"
if [[ "$fail" -gt 0 ]]; then
  cid="smoke-builder-$(date -u +%Y%m%d%H%M%S)"
  sev="WARN"
  [[ "$pass" -eq 0 ]] && sev="CRITICAL"
  root="$(cd "$(dirname "$0")/../.." && pwd)"
  if [[ -f "$root/scripts/hive/emit-smoke-failure.sh" ]]; then
    bash "$root/scripts/hive/emit-smoke-failure.sh" \
      --severity "$sev" --lane "engineering" \
      --summary "smoke-ce-builder PASS=$pass FAIL=$fail" \
      --correlationId "$cid" 2>/dev/null || true
  fi
fi
exit $(( fail > 0 ? 1 : 0 ))
