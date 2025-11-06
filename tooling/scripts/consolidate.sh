#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
pushd "$ROOT" >/dev/null

echo "🔧 Starting consolidation pass..."

# 1) Standardize executable bits for shell scripts
echo "📝 Setting executable bits..."
find apps/n8n-cursor/scripts -type f -name "*.sh" -print0 | xargs -0 chmod +x || true

# 2) Find duplicate scripts by content hash; keep the newest
echo "🔍 Finding duplicates..."
files=($(find apps/n8n-cursor/scripts -type f -name "*.sh"))
for f in "${files[@]}"; do
  echo "Processing: $f"
done
echo "Skipping duplicate detection for now (bash version compatibility)"

# 3) Normalize names: kebab-case for files (safe: only hyphen/underscore)
echo "📋 Normalizing names..."
find apps/n8n-cursor -type f -name "* *" -print0 | while IFS= read -r -d '' p; do
  tgt="$(echo "$p" | sed 's/ /-/g')"
  git mv "$p" "$tgt"
done

# 4) Enforce extensions
echo "🔧 Adding .sh extensions..."
find apps/n8n-cursor/scripts -type f -perm +111 ! -name "*.sh" | while IFS= read -r p; do
  echo "Adding .sh extension to: $p"
  git mv "$p" "${p}.sh" 2>/dev/null || echo "Could not rename: $p"
done

# 5) Move raw workflow exports (.json) to dedicated dir
echo "📊 Organizing workflows..."
mkdir -p apps/n8n-cursor/workflows/raw
find . -maxdepth 1 -type f -name "*workflow*.json" -exec git mv {} apps/n8n-cursor/workflows/raw/ \; || true

popd >/dev/null
echo "✅ Consolidation pass complete."
