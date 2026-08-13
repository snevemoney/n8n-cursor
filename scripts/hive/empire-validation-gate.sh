#!/usr/bin/env bash
# Empire validation gate — run before prod deploy (Secrets 4–6 checklist).
set -euo pipefail

FEATURE="${1:-}"
if [[ -z "$FEATURE" ]]; then
  echo "Usage: empire-validation-gate.sh \"feature one-liner\""
  exit 1
fi

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "═══════════════════════════════════════════════"
echo " Empire validation gate — $TS"
echo " Feature: $FEATURE"
echo "═══════════════════════════════════════════════"
echo ""
echo "Before prod deploy, ALL must be TRUE (or Tier 3 hitl_propose for money):"
echo ""
echo "  [ ] MOGUL SIMPLIFY — 50% scope deleted/deferred; minimum path named (mogul-gate.sh)"
echo "  [ ] DATA MOAT — Register/telemetry creates compounding aggregate signal"
echo "  [ ] LIQUIDITY — CE money path, take-rate/float, or documented N/A + hitl_propose"
echo "  [ ] LEGACY ARBITRAGE — Legal cache/queue/webhook vs legacy bottleneck (or N/A doc)"
echo ""
echo "If ANY is FALSE → abort deploy · refactor · hitl_propose_action (Tier 3 if money)"
echo ""
echo "Run first: bash $ROOT/scripts/hive/mogul-gate.sh \"$FEATURE\""
echo "Scheduled promote gate: bash $ROOT/scripts/hive/promote-staging-gate.sh"
echo ""
echo "Refs:"
echo "  $ROOT/docs/hive/MOGUL_MODE.md"
echo "  $ROOT/docs/hive/EMPIRE_SECRETS.yaml"
echo "  $ROOT/docs/hive/TIER3_HITL.md"
echo "  bash $ROOT/scripts/hive/dexter-gate.sh \"$FEATURE\""
