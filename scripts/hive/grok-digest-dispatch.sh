#!/usr/bin/env bash
# Fetch n8n operator digest and dispatch Big Boss mission on Mac (Grok primary).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEBHOOK_BASE="${HIVE_WEBHOOK_BASE:-https://evenslouis.ca/webhook}"
LOG="${GROK_DIGEST_LOG:-/tmp/grok-digest-dispatch.log}"

{
  echo "=== grok-digest-dispatch $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  if curl -sS --max-time 30 -X POST "${WEBHOOK_BASE}/hive-operator-digest" \
    -H "Content-Type: application/json" \
    ${HIVE_WEBHOOK_SECRET:+-H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}"} \
    -d '{"source":"mac-launchd","correlationId":"grok-digest-'$(date -u +%Y%m%d)'"}' \
    | head -c 2000; then
    echo ""
    echo "digest webhook OK"
  else
    echo "digest webhook failed (non-fatal) — dispatching from golden-paths only"
  fi

  python3 "$ROOT/scripts/hive/grokbot-dispatch-missions.py" --digest
  echo "=== complete ==="
} >>"$LOG" 2>&1
