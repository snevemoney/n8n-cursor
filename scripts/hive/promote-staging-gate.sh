#!/usr/bin/env bash
# Automated gate for staging → main promote (golden paths + empire-validation checks).
# Used ONLY by .github/workflows/staging-to-main-promote.yml — not chat agents.
#
# Exit 0: safe to promote
# Exit 1: block promote
# Exit 2: nothing to promote (staging not ahead of main) — workflow should skip merge
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS="$ROOT/scripts/hive"
FEATURE="${1:-scheduled staging→main promote}"
BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SCORPION="${BASE}/scorpion"

failures=0
warns=0

bad() { echo "FAIL $1"; failures=$((failures + 1)); }
ok() { echo "PASS $1"; }
warn() { echo "WARN $1"; warns=$((warns + 1)); }

echo "═══════════════════════════════════════════════"
echo " Promote staging→main gate"
echo " Feature: $FEATURE"
echo " Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo " Base: $BASE"
echo "═══════════════════════════════════════════════"
echo ""

# --- Staging ahead of main (optional; workflow may run this separately) ---
if [[ "${SKIP_GIT_AHEAD_CHECK:-}" != "1" ]]; then
  echo "## Git: staging ahead of main"
  if git -C "$ROOT" rev-parse --verify origin/staging >/dev/null 2>&1 \
    && git -C "$ROOT" rev-parse --verify origin/main >/dev/null 2>&1; then
    ahead=$(git -C "$ROOT" rev-list --count origin/main..origin/staging 2>/dev/null || echo "0")
    if [[ "$ahead" -eq 0 ]]; then
      echo "SKIP staging is not ahead of main ($ahead commits)"
      exit 2
    fi
    ok "staging is $ahead commit(s) ahead of main"
  else
    warn "origin/staging or origin/main not found — skip ahead check (local smoke only)"
  fi
  echo ""
fi

# --- Empire validation (automated subset) ---
echo "## Empire validation (automated)"
ok "MOGUL SIMPLIFY — N/A for promote (no new feature scope)"
echo ""

echo "## Prod hive routes"
if bash "$SCRIPTS/check-prod-hive-routes.sh"; then
  ok "prod hive routes"
else
  bad "prod hive routes"
fi
echo ""

echo "## Core work-ready smoke (automated rows)"
if bash "$SCRIPTS/core-work-ready-smoke.sh" /tmp/promote-core-smoke.txt; then
  ok "core work-ready smoke"
else
  bad "core work-ready smoke"
fi
echo ""

echo "## Hive API smoke (data moat — register + missions)"
if [[ -z "${HIVE_MACHINE_TOKEN:-}" ]]; then
  bad "HIVE_MACHINE_TOKEN not set — cannot verify register/missions"
else
  if bash "$SCRIPTS/hive-api-smoke.sh"; then
    ok "hive API smoke (data moat leg)"
  else
    bad "hive API smoke"
  fi
fi
echo ""

echo "## G3 webhook smoke (legacy arbitrage — n8n vs manual notify)"
if [[ -z "${HIVE_WEBHOOK_SECRET:-}" ]]; then
  bad "HIVE_WEBHOOK_SECRET not set — cannot verify G3 chain"
else
  if bash "$SCRIPTS/g3-webhook-smoke.sh"; then
    ok "G3 webhook smoke"
  else
    bad "G3 webhook smoke"
  fi
fi
echo ""

echo "## Golden paths scoreboard (G2 + G3 required; G1 operator-only)"
gp=$(curl -sS --max-time 20 "${SCORPION}/api/hive/golden-paths" 2>/dev/null || echo "")
if [[ -z "$gp" ]] || ! echo "$gp" | grep -q '"paths"'; then
  bad "golden-paths API unreachable or invalid"
else
  echo "$gp" | python3 -m json.tool 2>/dev/null | head -40 || true
  g2=$(echo "$gp" | python3 -c "import sys,json; ps={p['path']:p['pass'] for p in json.load(sys.stdin).get('paths',[])}; print('true' if ps.get('G2') else 'false')" 2>/dev/null || echo "false")
  g3=$(echo "$gp" | python3 -c "import sys,json; ps={p['path']:p['pass'] for p in json.load(sys.stdin).get('paths',[])}; print('true' if ps.get('G3') else 'false')" 2>/dev/null || echo "false")
  g1=$(echo "$gp" | python3 -c "import sys,json; ps={p['path']:p['pass'] for p in json.load(sys.stdin).get('paths',[])}; print('true' if ps.get('G1') else 'false')" 2>/dev/null || echo "false")

  if [[ "$g2" == "true" ]]; then ok "G2 pass"; else bad "G2 fail — CE leads path"; fi
  if [[ "$g3" == "true" ]]; then ok "G3 pass"; else bad "G3 fail — n8n notify path"; fi
  if [[ "$g1" == "true" ]]; then
    ok "G1 pass"
  else
    warn "G1 not pass — Telegram operator verify still recommended (does not block scheduled promote)"
  fi
fi
echo ""

echo "## Empire validation summary"
if [[ "$failures" -eq 0 ]]; then
  ok "LIQUIDITY — N/A for code promote (money path unchanged on /pro)"
  ok "LEGACY ARBITRAGE — webhook + register chain verified above"
else
  bad "empire-validation blocked ($failures hard failure(s))"
fi
echo ""

echo "═══════════════════════════════════════════════"
echo " Result: failures=$failures warnings=$warns"
echo "═══════════════════════════════════════════════"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
exit 0
