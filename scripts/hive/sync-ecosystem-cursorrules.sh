#!/usr/bin/env bash
# Copy ecosystem .cursorrules to monorepo roots (and optional sibling repos).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/scripts/hive/templates/hive/.cursorrules"

dests=(
  "$ROOT/.cursorrules"
  "$ROOT/apps/scorpion/.cursorrules"
)

# Optional sibling repos — uncomment paths on your machine:
# dests+=("$HOME/client-engine/.cursorrules")
# dests+=("/opt/philanthropy/.cursorrules")

for dest in "${dests[@]}"; do
  mkdir -p "$(dirname "$dest")"
  cp "$SRC" "$dest"
  echo "synced → $dest"
done

echo ""
echo "External repos: copy scripts/hive/templates/hive/.cursorrules manually or add path above."
