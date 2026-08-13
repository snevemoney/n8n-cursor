#!/usr/bin/env bash
# Install launchd job: poll Scorpion missions and dispatch Grok handoff chains every 15 min.
# Usage: bash scripts/hive/install-grok-orchestrator-launchd.sh [--repo PATH]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$ROOT/scripts/hive/com.hive.grok-orchestrator.plist.template"
LABEL="com.hive.grok-orchestrator"
PLIST_DEST="$HOME/Library/LaunchAgents/${LABEL}.plist"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) ROOT="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--repo PATH]"
      exit 0
      ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

chmod +x "$ROOT/scripts/hive/grokbot-orchestrate.py"
[[ -f "$TEMPLATE" ]] || { echo "Missing template: $TEMPLATE" >&2; exit 1; }

mkdir -p "$HOME/Library/LaunchAgents" "${HOME}/.grokbot"
sed -e "s|REPLACE_REPO|$ROOT|g" "$TEMPLATE" > "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"
launchctl enable "gui/$(id -u)/${LABEL}" 2>/dev/null || true

echo "Installed ${LABEL}"
echo "  plist: $PLIST_DEST"
echo "  schedule: every 900s (15 min) — grokbot-orchestrate.py --watch --once"
echo "  test: python3 $ROOT/scripts/hive/grokbot-orchestrate.py --validate"
echo "  test: python3 $ROOT/scripts/hive/grokbot-orchestrate.py --dry-run --watch --once"
