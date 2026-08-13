#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/scripts/hive/templates/.hiverules"
for dest in "$ROOT/.hiverules"; do
  cp "$SRC" "$dest" 2>/dev/null || cp "$ROOT/.hiverules" "$dest"
done
# Hub .hiverules is canonical at root — template is minimal fallback
if [[ -f "$ROOT/.hiverules" ]]; then
  echo "hiverules OK at $ROOT/.hiverules"
else
  cp "$SRC" "$ROOT/.hiverules"
  echo "synced → $ROOT/.hiverules"
fi
