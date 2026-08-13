#!/usr/bin/env bash
# Install Mac launchd job for 15-minute Outer Heaven capture cycle.
# Usage:
#   bash scripts/hive/outer-heaven/install-capture-launchd.sh
#   bash scripts/hive/outer-heaven/install-capture-launchd.sh --vault ~/Obsidian/HiveVault
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
TEMPLATE="$ROOT/scripts/hive/outer-heaven/com.hive.outer-heaven-sync.plist.template"
LABEL="com.hive.outer-heaven-sync"
PLIST_DEST="$HOME/Library/LaunchAgents/${LABEL}.plist"
VAULT="${HIVE_OBSIDIAN_VAULT:-}"

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

if [[ -z "$VAULT" ]]; then
  echo "HIVE_OBSIDIAN_VAULT not set. Pass --vault /path/to/obsidian/vault" >&2
  echo "Or: export HIVE_OBSIDIAN_VAULT=~/path/to/vault && $0" >&2
  exit 1
fi

if [[ ! -d "$VAULT/00_Outer_Heaven" && -d "$ROOT/scripts/hive/obsidian-vault-template/00_Outer_Heaven" ]]; then
  echo "Bootstrapping 00_Outer_Heaven into vault..."
  mkdir -p "$VAULT/00_Outer_Heaven"
  cp -R "$ROOT/scripts/hive/obsidian-vault-template/00_Outer_Heaven/." "$VAULT/00_Outer_Heaven/"
fi

[[ -f "$TEMPLATE" ]] || { echo "Missing template: $TEMPLATE" >&2; exit 1; }

mkdir -p "$HOME/Library/LaunchAgents"
sed -e "s|REPLACE_REPO|$ROOT|g" -e "s|REPLACE_VAULT|$VAULT|g" "$TEMPLATE" > "$PLIST_DEST"
chmod 644 "$PLIST_DEST"

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_DEST"
launchctl enable "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl kickstart -k "gui/$(id -u)/${LABEL}" 2>/dev/null || launchctl start "$LABEL" 2>/dev/null || true

echo "Installed ${LABEL}"
echo "  plist: $PLIST_DEST"
echo "  vault: $VAULT"
echo "  repo:  $ROOT"
echo "  logs:  /tmp/outer-heaven-sync.log /tmp/outer-heaven-sync.err"
echo ""
echo "Test once: bash $ROOT/scripts/hive/outer-heaven/run-capture-cycle.sh"
