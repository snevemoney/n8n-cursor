#!/usr/bin/env bash
# Emergency kill switch — all agents NO_ACTION until resume.
set -euo pipefail

KILL_FILE="${HOME}/.grokbot/os-kill-switch.json"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$(dirname "$KILL_FILE")"
cat >"$KILL_FILE" <<EOF
{
  "active": true,
  "activated_at": "$TS",
  "reason": "operator kill switch",
  "resume_hint": "bash scripts/hive/os/resume-agents.sh"
}
EOF

echo "Kill switch ACTIVE → $KILL_FILE"

# Unload hive launchd jobs if present (best-effort)
for label in com.hive.grokbot-orchestrate com.hive.grokbot-watchdog; do
  launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
done

echo ""
echo "All OS agents should return NO_ACTION (can-act gate reads kill switch)."
echo "To resume: bash scripts/hive/os/resume-agents.sh"
