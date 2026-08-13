#!/usr/bin/env bash
# Mogul gate — Secret 17 (Musk first principles): delete 50% before code.
set -euo pipefail

GOAL="${1:-}"
if [[ -z "$GOAL" ]]; then
  echo "Usage: mogul-gate.sh \"feature one-liner\""
  exit 1
fi

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "═══════════════════════════════════════════════"
echo " Mogul gate (First Principles) — $TS"
echo " Goal: $GOAL"
echo "════════════════════════════════════════════════"
echo ""
echo "Answer IN WRITING before any implementation:"
echo ""
echo "  1. CORE PAIN — One sentence: mandatory problem this solves (not nice-to-have)"
echo "  2. MINIMUM — Absolute physical minimum to solve it (API? n8n row? existing hook?)"
echo "  3. DELETE LIST — 50% of original plan cut or deferred (name each item)"
echo "  4. CHOKE POINT — Thiel: one niche bottleneck we monopolize (or N/A + why)"
echo "  5. MARGINAL COST — Why this won't add servers/subscriptions we don't need"
echo "  6. VIRAL LOOP — What public artifact or funnel leg does this create? (or N/A)"
echo ""
echo "Musk 5-step order: question requirements → DELETE → simplify → accelerate → automate LAST"
echo ""
echo "If DELETE LIST is empty or vague → STOP. No code until 50% scope is named cut."
echo ""
echo "Then run:"
echo "  bash $ROOT/scripts/hive/empire-validation-gate.sh \"$GOAL\""
echo "  bash $ROOT/scripts/hive/dexter-gate.sh \"$GOAL\"   # if medium+"
echo ""
echo "Refs: $ROOT/docs/hive/MOGUL_MODE.md"
