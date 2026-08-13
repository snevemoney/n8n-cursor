#!/usr/bin/env bash
# Watch 00_Outer_Heaven/INBOX for new .md files → ingest-inbox.py
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
VAULT="${HIVE_OBSIDIAN_VAULT:-}"
INBOX="${VAULT:+$VAULT/00_Outer_Heaven/INBOX}"

if [[ -z "$VAULT" || ! -d "$INBOX" ]]; then
  INBOX="$ROOT/docs/hive/outer-heaven/INBOX"
  mkdir -p "$INBOX/processed"
  echo "HIVE_OBSIDIAN_VAULT not set — watching git mirror INBOX: $INBOX"
fi

ingest() {
  python3 "$ROOT/scripts/hive/outer-heaven/ingest-inbox.py"
}

if command -v fswatch >/dev/null 2>&1; then
  echo "Watching $INBOX (fswatch) — Ctrl+C to stop"
  ingest
  fswatch -0 "$INBOX" | while IFS= read -r -d '' _; do
    ingest
  done
elif command -v inotifywait >/dev/null 2>&1; then
  echo "Watching $INBOX (inotifywait) — Ctrl+C to stop"
  ingest
  while inotifywait -e close_write,moved_to "$INBOX" 2>/dev/null; do
    ingest
  done
else
  echo "No fswatch/inotifywait — running one-shot ingest"
  ingest
fi
