#!/usr/bin/env bash
# Client Engine HITL gate smoke — optional Playwright against /pro
set -uo pipefail

CE_REPO="${CE_REPO:-/Users/evenslouis/client-engine-1}"
BASE="${CE_PRO_BASE:-https://evenslouis.ca/pro}"

pass=0
fail=0
skip=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

# Always check public health
code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${BASE}/api/health" 2>/dev/null || echo "000")
if [[ "$code" == "200" ]]; then
  ok "CE /pro/api/health ($code)"
else
  bad "CE /pro/api/health ($code)"
fi

if [[ ! -d "$CE_REPO" ]]; then
  skp "CE_REPO not found ($CE_REPO) — Playwright HITL skipped"
  echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
  exit $(( fail > 0 ? 1 : 0 ))
fi

if [[ -z "${CE_E2E_EMAIL:-}" && -z "${E2E_EMAIL:-}" ]]; then
  skp "CE_E2E_EMAIL not set — Playwright login skipped"
  echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
  exit $(( fail > 0 ? 1 : 0 ))
fi

export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-$BASE}"
export E2E_EMAIL="${CE_E2E_EMAIL:-${E2E_EMAIL:-}}"
export E2E_PASSWORD="${CE_E2E_PASSWORD:-${E2E_PASSWORD:-}}"

if (cd "$CE_REPO" && npx playwright test tests/e2e/hive-gate-pro.spec.ts --reporter=line 2>&1); then
  ok "CE hive-gate-pro Playwright spec"
else
  bad "CE hive-gate-pro Playwright spec failed"
fi

echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
exit $(( fail > 0 ? 1 : 0 ))
