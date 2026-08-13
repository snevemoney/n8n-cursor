#!/usr/bin/env bash
# Run Playwright hive ecosystem path audit (cross-product URLs)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCORPION="$ROOT/apps/scorpion"
REPORT="$ROOT/docs/hive/HIVE_PATHS_PLAYWRIGHT_LAST.txt"

export EVENSLOUIS_BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
export APEX_BASE="$EVENSLOUIS_BASE"

cd "$SCORPION"

if ! pnpm exec playwright install chromium --dry-run 2>&1 | grep -q 'is already installed'; then
  pnpm exec playwright install chromium
fi

{
  echo "Hive ecosystem Playwright audit"
  echo "Base: $EVENSLOUIS_BASE"
  echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "=============================================="
  pnpm exec playwright test tests/e2e/hive-ecosystem-paths.spec.ts --reporter=line 2>&1
  echo "=============================================="
} | tee "$REPORT"

echo "Report: $REPORT"
