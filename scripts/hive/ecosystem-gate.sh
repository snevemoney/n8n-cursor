#!/usr/bin/env bash
# Ecosystem gate — Secrets 20–22 before cross-repo wiring.
set -euo pipefail

GOAL="${1:-}"
if [[ -z "$GOAL" ]]; then
  echo "Usage: ecosystem-gate.sh \"connect app A to app B\""
  exit 1
fi

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "═══════════════════════════════════════════════"
echo " Ecosystem grid gate — $TS"
echo " Goal: $GOAL"
echo "═══════════════════════════════════════════════"
echo ""
echo "  [ ] API GATEWAY — Each app exposes machine API/webhook (UI optional)?"
echo "  [ ] ROUTER — Cross-app transit via n8n catalog (not custom inter-repo code)?"
echo "  [ ] SHARED CORE — Checked packages/* before new auth/telemetry/billing helper?"
echo "  [ ] CORRELATION — correlationId on every hop; register leg documented?"
echo "  [ ] ERROR SHAPE — ECOSYSTEM_ERROR_PAYLOAD.md for failures?"
echo "  [ ] REPO OWNER — Data owner named (CE | Scorpion | n8n) per INTEROP_CONTRACTS?"
echo "  [ ] SOLO-SAFE — Each repo still deployable alone if grid link breaks?"
echo ""
echo "Router webhook: hive-ecosystem-route (import: n8n-import-ecosystem-router.sh)"
echo "Reference slice: ce-lead-notify — docs/hive/slices/CE_LEAD_VERTICAL_SLICE.md"
echo ""
echo "Then:"
echo "  bash $ROOT/scripts/hive/mogul-gate.sh \"$GOAL\""
echo "  bash $ROOT/scripts/hive/dexter-gate.sh \"$GOAL\""
echo ""
echo "Refs:"
echo "  $ROOT/docs/hive/MULTI_REPO_GRID.md"
echo "  $ROOT/docs/hive/SHARED_CORE_REGISTRY.md"
echo "  $ROOT/packages/shared-config/src/repo-registry.ts"
