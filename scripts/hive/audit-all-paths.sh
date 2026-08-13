#!/usr/bin/env bash
# Full hive path audit — every app surface (HTTP + Scorpion UI pages)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCORPION="$ROOT/apps/scorpion"
REPORT="$ROOT/docs/hive/ALL_PATHS_AUDIT_LAST.txt"

export EVENSLOUIS_BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
export APEX_BASE="$EVENSLOUIS_BASE"
# export HIVE_ROUTES_STRICT=1  # uncomment to fail on missing hive deploy

cd "$SCORPION"

if ! pnpm exec playwright install chromium 2>&1 | grep -q 'already'; then
  pnpm exec playwright install chromium
fi

SPECS=(
  "tests/e2e/all-hive-paths.spec.ts"
  "tests/e2e/hive-ecosystem-paths.spec.ts"
  "tests/e2e/scorpion-nav-pages.spec.ts"
  "tests/e2e/scorpion-api-paths.spec.ts"
  "tests/e2e/hive-path-deploy-apis.spec.ts"
)

{
  echo "Full hive path audit"
  echo "Base: $EVENSLOUIS_BASE"
  echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "=============================================="
  for spec in "${SPECS[@]}"; do
    echo ""
    echo "## $spec"
    pnpm exec playwright test "$spec" --reporter=line 2>&1 || true
  done
  if [[ -n "${CE_E2E_EMAIL:-}${E2E_EMAIL:-}" && -n "${CE_E2E_PASSWORD:-}${E2E_PASSWORD:-}" ]]; then
    echo ""
    echo "## tests/e2e/ce-pro-all-pages.spec.ts (authenticated)"
    pnpm exec playwright test tests/e2e/ce-pro-all-pages.spec.ts --reporter=line 2>&1 || true
  else
    echo ""
    echo "SKIP ce-pro-all-pages — set CE_E2E_EMAIL + CE_E2E_PASSWORD for /pro dashboard sweep"
  fi
  echo "=============================================="
} | tee "$REPORT"

echo "Report: $REPORT"
