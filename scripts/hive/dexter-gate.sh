#!/usr/bin/env bash
# Dexter gate — run before medium+ hive features (money, APIs, multi-repo).
set -euo pipefail

GOAL="${1:-}"
if [[ -z "$GOAL" ]]; then
  echo "Usage: dexter-gate.sh \"measurable goal one line\""
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "═══════════════════════════════════════════════"
echo " Dexter gate — $TS"
echo " Goal: $GOAL"
echo "═══════════════════════════════════════════════"
echo ""
echo "Run mogul-gate first if not done: bash $ROOT/scripts/hive/mogul-gate.sh \"$GOAL\""
echo ""
echo "Stage 1 — Product"
echo "  [ ] DONE_WHEN is measurable (not \"works\")"
echo "  [ ] HITL owner named if money/send/deploy"
echo ""
echo "Stage 2 — Architecture"
echo "  [ ] Data owner: CE | Scorpion | n8n (one primary)"
echo "  [ ] Endpoints listed in docs/hive/INTEROP_CONTRACTS.md"
echo ""
echo "Stage 3 — Program design"
echo "  [ ] Files to touch named (max ~5 for slice 1)"
echo "  [ ] Types/signatures sketched"
echo "  [ ] Test or smoke command named"
echo ""
echo "Stage 4 — Vertical slice"
echo "  [ ] Thinnest E2E path identified (Telegram → tool → register)"
echo "  [ ] No horizontal \"framework first\" dump"
echo ""
echo "Refs:"
echo "  $ROOT/docs/program-design/README.md"
echo "  $ROOT/docs/hive/LEVERAGE_LANES.md"
echo ""
echo "If all boxes checked → proceed. Else → #council first."
