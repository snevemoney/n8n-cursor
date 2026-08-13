#!/usr/bin/env bash
# Install launchd job: biweekly craft routine dispatch (Monday 09:15 gate inside script).
# Usage: bash scripts/hive/install-grok-biweekly-launchd.sh [--repo PATH]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$ROOT/scripts/hive/com.hive.grok-biweekly.plist.template"
LABEL="com.hive.grok-biweekly"
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

chmod +x "$ROOT/scripts/hive/grok-biweekly-dispatch.sh"
[[ -f "$TEMPLATE" ]] || { echo "Missing template: $TEMPLATE" >&2; exit 1; }

mkdir -p "$HOME/Library/LaunchAgents" "${HOME}/.grokbot"
sed -e "s|REPLACE_REPO|$ROOT|g" "$TEMPLATE" > "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"
launchctl enable "gui/$(id -u)/${LABEL}" 2>/dev/null || true

echo "Installed ${LABEL}"
echo "  plist: $PLIST_DEST"
echo "  schedule: Monday 09:15 local (14-day gate in grok-biweekly-dispatch.sh)"
echo "  test: GROK_BIWEEKLY_FORCE=1 bash $ROOT/scripts/hive/grok-biweekly-dispatch.sh"
