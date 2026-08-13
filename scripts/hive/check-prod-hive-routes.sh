#!/usr/bin/env bash
# Verify Scorpion hive routes are live on prod
set -uo pipefail

BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SCORPION="${BASE}/scorpion"

code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${SCORPION}/api/hive/golden-paths" 2>/dev/null || echo "000")

if [[ "$code" == "200" ]]; then
  echo "PASS Scorpion hive routes deployed (${SCORPION}/api/hive/golden-paths → 200)"
  curl -sS --max-time 15 "${SCORPION}/api/hive/golden-paths" | python3 -m json.tool 2>/dev/null | head -20
  exit 0
fi

echo "FAIL Scorpion hive routes not on prod (HTTP $code)"
echo ""
echo "Deploy steps:"
echo "  1. Merge/deploy apps/scorpion from n8n-cursor to VPS"
echo "  2. Set HIVE_MACHINE_TOKEN on Scorpion service env"
echo "  3. Unset HIVE_ALLOW_OPEN_REGISTER in production"
echo "  4. bash scripts/hive/n8n-import-golden-path.sh  (needs N8N_API_KEY)"
echo "  5. bash scripts/hive/expert-audit.sh"
echo ""
echo "See docs/hive/EXPERT_AUDIT.md"
exit 1
