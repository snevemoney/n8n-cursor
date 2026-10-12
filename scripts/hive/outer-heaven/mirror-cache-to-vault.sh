#!/usr/bin/env bash
# Best-effort mirror ~/.grokbot/outer-heaven → Obsidian vault (iCloud-safe timeout).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CACHE="${OUTER_HEAVEN_CACHE:-$HOME/.grokbot/outer-heaven}"
TIMEOUT_SEC="${OUTER_HEAVEN_MIRROR_TIMEOUT:-45}"

if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -f "$HOME/.grokbot/os-config.json" ]]; then
  HIVE_OBSIDIAN_VAULT="$(python3 -c "import json,pathlib; p=pathlib.Path.home()/'.grokbot'/'os-config.json'; print(json.loads(p.read_text()).get('HIVE_OBSIDIAN_VAULT',''))" 2>/dev/null || true)"
  export HIVE_OBSIDIAN_VAULT
fi
if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -d "$HOME/Documents/My_Billion_Dollar_Vault" ]]; then
  export HIVE_OBSIDIAN_VAULT="$HOME/Documents/My_Billion_Dollar_Vault"
fi

if [[ ! -d "$CACHE" ]]; then
  echo "mirror-cache-to-vault: skip (no cache at $CACHE)"
  exit 0
fi
if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" || ! -d "$HIVE_OBSIDIAN_VAULT" ]]; then
  echo "mirror-cache-to-vault: skip (HIVE_OBSIDIAN_VAULT unset)"
  exit 0
fi

DEST="$HIVE_OBSIDIAN_VAULT/00_Outer_Heaven"
mkdir -p "$DEST"

# Protect vault CHRONICLE (and similar) from smaller/stale cache overwrites.
# Claude Code 2026-10-11: vault Aug chronicle ~2.3MB vs cache ~39KB.
# Bash 3.2 safe. Skip when vault file is larger than cache copy.
EXCL_FILE="$(mktemp)"
trap 'rm -f "$EXCL_FILE"' EXIT
: > "$EXCL_FILE"
if [[ -d "$CACHE/CHRONICLE" && -d "$DEST/CHRONICLE" ]]; then
  # portable find; no mapfile
  find "$CACHE/CHRONICLE" -type f 2>/dev/null | while IFS= read -r cfile; do
    rel="${cfile#$CACHE/}"
    vfile="$DEST/$rel"
    if [[ -f "$vfile" ]]; then
      csize=$(wc -c < "$cfile" | tr -d ' ')
      vsize=$(wc -c < "$vfile" | tr -d ' ')
      if [[ "$vsize" -gt "$csize" ]]; then
        echo "$rel" >> "$EXCL_FILE"
        echo "mirror-cache-to-vault: PROTECT larger vault $rel (vault=${vsize} cache=${csize})"
      fi
    fi
  done
fi

RSYNC_ARGS=(-a --exclude '.DS_Store')
if [[ -s "$EXCL_FILE" ]]; then
  RSYNC_ARGS+=(--exclude-from="$EXCL_FILE")
fi

if command -v timeout >/dev/null 2>&1; then
  if timeout "$TIMEOUT_SEC" rsync "${RSYNC_ARGS[@]}" \
    "$CACHE/" "$DEST/"; then
    echo "mirror-cache-to-vault: ok → $DEST"
    # Graph index lives at vault root
    if [[ -f "$CACHE/.hive/graph-index.json" ]]; then
      mkdir -p "$HIVE_OBSIDIAN_VAULT/.hive"
      timeout 10 cp "$CACHE/.hive/graph-index.json" "$HIVE_OBSIDIAN_VAULT/.hive/graph-index.json" 2>/dev/null || true
    fi
    exit 0
  fi
  echo "mirror-cache-to-vault: timeout or rsync failed (${TIMEOUT_SEC}s) — cache remains source of truth"
  exit 0
fi

rsync "${RSYNC_ARGS[@]}" "$CACHE/" "$DEST/" && echo "mirror-cache-to-vault: ok → $DEST"
