#!/usr/bin/env bash
# Copy hive .cursorrules template to repo roots (Secret 8 — context as DNA)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/scripts/hive/templates/hive/.cursorrules"
CLAUDE_SRC="$ROOT/scripts/hive/templates/hive/claude.code.json"

for dest in "$ROOT/.cursorrules" "$ROOT/apps/scorpion/.cursorrules"; do
  cp "$SRC" "$dest"
  echo "synced → $dest"
done

if [[ -f "$CLAUDE_SRC" ]]; then
  cp "$CLAUDE_SRC" "$ROOT/claude.code.json"
  echo "synced → $ROOT/claude.code.json"
fi
