#!/usr/bin/env bash
# Deactivate kill switch.
set -euo pipefail

KILL_FILE="${HOME}/.grokbot/os-kill-switch.json"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$(dirname "$KILL_FILE")"
cat >"$KILL_FILE" <<EOF
{
  "active": false,
  "deactivated_at": "$TS"
}
EOF

echo "Kill switch OFF → agents may RUN when can-act passes."
