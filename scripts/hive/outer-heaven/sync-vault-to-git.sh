#!/usr/bin/env bash
# Sync Outer Heaven cache/vault → git mirror docs/hive/outer-heaven/
# Primary edit: Obsidian vault. Agents read git mirror + shared brief.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CACHE="${OUTER_HEAVEN_CACHE:-$HOME/.grokbot/outer-heaven}"

# Auto-load vault path from os-config if unset
if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -f "$HOME/.grokbot/os-config.json" ]]; then
  HIVE_OBSIDIAN_VAULT="$(python3 -c "import json,pathlib; p=pathlib.Path.home()/'.grokbot'/'os-config.json'; print(json.loads(p.read_text()).get('HIVE_OBSIDIAN_VAULT',''))" 2>/dev/null || true)"
  export HIVE_OBSIDIAN_VAULT
fi
if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -d "$HOME/Documents/My_Billion_Dollar_Vault" ]]; then
  export HIVE_OBSIDIAN_VAULT="$HOME/Documents/My_Billion_Dollar_Vault"
fi

VAULT="${HIVE_OBSIDIAN_VAULT:-}"
DEST="$ROOT/docs/hive/outer-heaven"

# Prefer fast local cache when populated (iCloud-safe)
if [[ -d "$CACHE" && ( -f "$CACHE/OPERATOR_MEMORY.md" || -d "$CACHE/CHRONICLE" ) ]]; then
  SRC="$CACHE"
  echo "sync source: cache ($SRC)"
elif [[ -n "$VAULT" && -d "$VAULT/00_Outer_Heaven" ]]; then
  SRC="$VAULT/00_Outer_Heaven"
  echo "sync source: vault ($SRC)"
else
  echo "ERROR: no cache or vault source (refusing template overwrite)."
  echo "Run capture first or set HIVE_OBSIDIAN_VAULT / ~/.grokbot/os-config.json."
  echo "Template-only seed: OUTER_HEAVEN_ALLOW_TEMPLATE_SYNC=1"
  if [[ "${OUTER_HEAVEN_ALLOW_TEMPLATE_SYNC:-}" == "1" ]]; then
    echo "OUTER_HEAVEN_ALLOW_TEMPLATE_SYNC=1 — merging template into mirror (no delete)"
    SRC="$ROOT/scripts/hive/obsidian-vault-template/00_Outer_Heaven"
    RSYNC_DELETE=""
  else
    exit 2
  fi
fi

if [[ "${OUTER_HEAVEN_SYNC_DELETE:-}" == "1" ]]; then
  RSYNC_DELETE="--delete"
else
  RSYNC_DELETE=""
fi

mkdir -p "$DEST" "$DEST/.hive"
rsync -a $RSYNC_DELETE \
  --exclude '.DS_Store' \
  "$SRC/" "$DEST/"

# Build wikilink graph index into mirror
GRAPH_SRC="$SRC"
if [[ -n "$VAULT" && -d "$VAULT" && "$SRC" != "$CACHE" ]]; then
  node "$ROOT/scripts/hive/obsidian/build-graph-index.mjs" "$VAULT" 2>/dev/null || true
  if [[ -f "$VAULT/.hive/graph-index.json" ]]; then
    mkdir -p "$DEST/.hive"
    cp "$VAULT/.hive/graph-index.json" "$DEST/.hive/graph-index.json"
  fi
elif [[ -f "$CACHE/.hive/graph-index.json" ]]; then
  mkdir -p "$DEST/.hive"
  cp "$CACHE/.hive/graph-index.json" "$DEST/.hive/graph-index.json"
fi

echo "Synced $SRC → $DEST"
echo "Agents load brief: python3 scripts/hive/os/outer-heaven-brief.py --agent \"Big Boss\""
