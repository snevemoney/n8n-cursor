#!/usr/bin/env bash
# Push Mac Outer Heaven cache to VPS mirror for cloud Grok routines (no Scorpion).
set -euo pipefail

CACHE="${OUTER_HEAVEN_CACHE:-$HOME/.grokbot/outer-heaven}"
VPS_HOST="${OUTER_HEAVEN_VPS_HOST:-root@69.62.66.78}"
VPS_PATH="${OUTER_HEAVEN_VPS_MIRROR:-/root/outer-heaven-mirror}"
TIMEOUT_SEC="${OUTER_HEAVEN_VPS_RSYNC_TIMEOUT:-120}"

if [[ ! -d "$CACHE" ]]; then
  echo "push-vault-mirror: skip (no cache)"
  exit 0
fi

if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$VPS_HOST" "mkdir -p '$VPS_PATH'"; then
  echo "push-vault-mirror: skip (SSH unavailable)"
  exit 0
fi

RSYNC_RSH="ssh -o BatchMode=yes -o ConnectTimeout=15"
export RSYNC_RSH

if command -v timeout >/dev/null 2>&1; then
  timeout "$TIMEOUT_SEC" rsync -az \
    --exclude '.DS_Store' \
    -e "$RSYNC_RSH" \
    "$CACHE/" "${VPS_HOST}:${VPS_PATH}/" \
    && echo "push-vault-mirror: ok → ${VPS_HOST}:${VPS_PATH}"
else
  rsync -az --exclude '.DS_Store' -e "$RSYNC_RSH" "$CACHE/" "${VPS_HOST}:${VPS_PATH}/"
fi

# Pre-render brief on VPS for cloud cron
ssh -o BatchMode=yes "$VPS_HOST" \
  "OUTER_HEAVEN_MIRROR='$VPS_PATH' bash /root/domain-paths/n8n-cursor/scripts/hive/outer-heaven/vps-outer-heaven-brief.sh --write-json" \
  2>/dev/null || true
