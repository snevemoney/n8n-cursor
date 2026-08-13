#!/usr/bin/env bash
# Expert hive audit orchestrator — Phase 0 close toolkit
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
REPORT="${1:-docs/hive/EXPERT_AUDIT_LAST.txt}"
SCRIPTS="$ROOT/scripts/hive"

failures=0

{
  echo "Expert Hive Audit"
  echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Base: ${EVENSLOUIS_BASE:-https://evenslouis.ca}"
  echo "=============================================="
  echo ""

  echo "## Prod hive routes"
  bash "$SCRIPTS/check-prod-hive-routes.sh" || failures=$((failures + 1))
  echo ""

  echo "## Core work-ready smoke"
  bash "$SCRIPTS/core-work-ready-smoke.sh" || failures=$((failures + 1))
  echo ""

  echo "## Hive API smoke"
  bash "$SCRIPTS/hive-api-smoke.sh" || failures=$((failures + 1))
  echo ""

  echo "## G3 webhook smoke"
  bash "$SCRIPTS/g3-webhook-smoke.sh" || failures=$((failures + 1))
  echo ""

  echo "## VPS audit (SSH)"
  bash "$SCRIPTS/vps-audit.sh" || failures=$((failures + 1))
  echo ""

  echo "## Freeze check (n8n)"
  bash "$SCRIPTS/freeze-check.sh" || failures=$((failures + 1))
  echo ""

  echo "## CE HITL smoke (optional)"
  bash "$SCRIPTS/ce-hitl-smoke.sh" || failures=$((failures + 1))
  echo ""

  echo "## Playwright hive path audit"
  bash "$SCRIPTS/run-hive-paths-playwright.sh" || failures=$((failures + 1))
  echo ""

  echo "=============================================="
  echo "Expert audit complete. Hard failures: $failures"
  echo "(SKIP lines do not count as failures)"
} | tee "$REPORT"

exit $(( failures > 0 ? 1 : 0 ))
