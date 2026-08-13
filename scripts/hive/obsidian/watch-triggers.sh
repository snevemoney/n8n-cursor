#!/usr/bin/env bash
# Watch 04_Automation_Triggers for new/changed .md → ingest-trigger-file.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VAULT="${HIVE_OBSIDIAN_VAULT:-}"
TRIGGERS="${VAULT}/04_Automation_Triggers"
INGEST="$ROOT/scripts/hive/obsidian/ingest-trigger-file.sh"

if [[ -z "$VAULT" || ! -d "$TRIGGERS" ]]; then
  echo "HIVE_OBSIDIAN_VAULT must point to vault with 04_Automation_Triggers/"
  exit 1
fi

process() {
  local f="$1"
  [[ "$f" == *.md ]] || return 0
  [[ -f "$f" ]] || return 0
  echo "[$(date -u +%H:%M:%S)] trigger: $f"
  bash "$INGEST" "$f" || echo "ingest failed: $f"
}

# Initial scan (skip README)
for f in "$TRIGGERS"/*.md; do
  [[ -f "$f" ]] || continue
  [[ "$(basename "$f")" == "README.md" ]] && continue
done

echo "Watching $TRIGGERS (Ctrl+C to stop)"

if command -v fswatch >/dev/null 2>&1; then
  fswatch -0 -o "$TRIGGERS" | while read -r _; do
    for f in "$TRIGGERS"/*.md; do
      [[ -f "$f" ]] && process "$f"
    done
  done
elif command -v inotifywait >/dev/null 2>&1; then
  while inotifywait -e close_write,moved_to,create "$TRIGGERS" 2>/dev/null; do
    for f in "$TRIGGERS"/*.md; do
      [[ -f "$f" ]] && process "$f"
    done
  done
else
  echo "Install fswatch (macOS: brew install fswatch) or inotify-tools (Linux)"
  exit 1
fi
