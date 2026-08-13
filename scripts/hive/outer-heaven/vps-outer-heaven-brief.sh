#!/usr/bin/env bash
# Emit Outer Heaven brief from VPS mirror (cloud Grok routines — no Scorpion).
set -euo pipefail

MIRROR="${OUTER_HEAVEN_MIRROR:-/root/outer-heaven-mirror}"
REPO="${OUTER_HEAVEN_REPO:-/root/domain-paths/n8n-cursor}"
WRITE_JSON=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --write-json) WRITE_JSON=true; shift ;;
    -h|--help)
      echo "Usage: OUTER_HEAVEN_MIRROR=/root/outer-heaven-mirror $0 [--write-json]"
      exit 0
      ;;
    *) shift ;;
  esac
done

if [[ ! -d "$MIRROR" ]]; then
  echo "VPS mirror not found: $MIRROR" >&2
  exit 1
fi

if [[ -f "$REPO/scripts/hive/os/outer-heaven-brief.py" ]]; then
  export OUTER_HEAVEN_CACHE="$MIRROR"
  python3 "$REPO/scripts/hive/os/outer-heaven-brief.py" \
    --agent "Big Boss" \
    --source cache \
    --format markdown \
    ${WRITE_JSON:+--publish}
  exit $?
fi

# Minimal fallback if repo not synced yet
MEM="$MIRROR/OPERATOR_MEMORY.md"
echo "# VPS Outer Heaven brief (fallback)"
echo "Mirror: $MIRROR"
if [[ -f "$MEM" ]]; then
  head -n 40 "$MEM"
fi
