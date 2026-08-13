#!/usr/bin/env bash
# Copy mogul vault template to HIVE_OBSIDIAN_VAULT
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TEMPLATE="$ROOT/scripts/hive/obsidian-vault-template"
TARGET="${HIVE_OBSIDIAN_VAULT:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: HIVE_OBSIDIAN_VAULT=~/My_Billion_Dollar_Vault bash scripts/hive/obsidian-vault-bootstrap.sh"
  exit 1
fi

if [[ ! -d "$TEMPLATE" ]]; then
  echo "Missing template at $TEMPLATE"
  exit 1
fi

mkdir -p "$TARGET"
rsync -a --ignore-existing "$TEMPLATE/" "$TARGET/"
mkdir -p "$TARGET/.hive" "$TARGET/04_Automation_Triggers" "$TARGET/00_Outer_Heaven/CHRONICLE" "$TARGET/00_Outer_Heaven/PATTERNS" "$TARGET/00_Outer_Heaven/PROJECTS"

echo "Vault bootstrapped at $TARGET"
echo "Next:"
echo "  export HIVE_OBSIDIAN_VAULT=$TARGET"
echo "  python3 scripts/hive/outer-heaven/seed-project-notes.py"
echo "  bash scripts/hive/outer-heaven/sync-vault-to-git.sh"
echo "  bash scripts/hive/obsidian/sync-manifests-to-vault.sh"
echo "  bash scripts/hive/obsidian/watch-triggers.sh   # optional hot-folder"
