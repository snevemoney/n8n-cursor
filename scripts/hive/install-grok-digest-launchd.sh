#!/usr/bin/env bash
# Daily Grok digest is owned by Big Boss Grok cron (grokbot-setup-routines.py).
# This launchd job is optional backup when Grok gateway is offline.
# Usage:
#   bash scripts/hive/install-grok-digest-launchd.sh
#   bash scripts/hive/install-grok-digest-launchd.sh --vault ~/Documents/My_Billion_Dollar_Vault
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$ROOT/scripts/hive/com.hive.grok-digest.plist.template"
LABEL="com.hive.grok-digest"
PLIST_DEST="$HOME/Library/LaunchAgents/${LABEL}.plist"
VAULT="${HIVE_OBSIDIAN_VAULT:-$HOME/Documents/My_Billion_Dollar_Vault}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault) VAULT="${2:-}"; shift 2 ;;
    --repo) ROOT="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--vault PATH] [--repo PATH]"
      exit 0
      ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

chmod +x "$ROOT/scripts/hive/grok-digest-dispatch.sh"
[[ -f "$TEMPLATE" ]] || { echo "Missing template: $TEMPLATE" >&2; exit 1; }

mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s|REPLACE_REPO|$ROOT|g" -e "s|REPLACE_VAULT|$VAULT|g" "$TEMPLATE" > "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"
launchctl enable "gui/$(id -u)/${LABEL}" 2>/dev/null || true

echo "Installed ${LABEL}"
echo "  plist: $PLIST_DEST"
  echo "  schedule: daily 07:05 local (backup — primary digest is Grok Big Boss cron 07:00)"
echo "  test: bash $ROOT/scripts/hive/grok-digest-dispatch.sh"
