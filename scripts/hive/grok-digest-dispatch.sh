#!/usr/bin/env bash
# Fetch n8n operator digest and dispatch Big Boss mission on Mac (Grok primary).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEBHOOK_BASE="${HIVE_WEBHOOK_BASE:-https://evenslouis.ca/webhook}"
LOG="${GROK_DIGEST_LOG:-/tmp/grok-digest-dispatch.log}"

{
  echo "=== grok-digest-dispatch $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
  BODY="${TMPDIR:-/tmp}/grok-digest-body.txt"
  HTTP_CODE="$(curl -sS --max-time 30 -o "$BODY" -w "%{http_code}" -X POST "${WEBHOOK_BASE}/hive-operator-digest" \
    -H "Content-Type: application/json" \
    ${HIVE_WEBHOOK_SECRET:+-H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}"} \
    -d '{"source":"mac-launchd","correlationId":"grok-digest-'$(date -u +%Y%m%d)'"}' || true)"
  case "$HTTP_CODE" in
    2*)
      echo "digest webhook HTTP ${HTTP_CODE}"
      ;;
    *)
      echo "digest webhook failed HTTP ${HTTP_CODE:-000} — child executor not started"
      exit 0
      ;;
  esac

  if ! python3 "$ROOT/scripts/hive/os/fleet-closures.py" --child-executor; then
    echo "NO_ACTION: gateway cannot dispatch — child executor not started"
    exit 0
  fi

  python3 "$ROOT/scripts/hive/grokbot-dispatch-missions.py" --digest
  echo "=== complete ==="
} >>"$LOG" 2>&1
