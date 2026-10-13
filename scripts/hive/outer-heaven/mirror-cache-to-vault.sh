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

# Do not let a thin/stale cache shard overwrite a richer vault chronicle (Aug 2026 wipe).
# Keep vault when it is larger, or newer-and-not-smaller. Never truncate CHRONICLE via rsync.
PROTECT=()
if [[ -d "$DEST/CHRONICLE" ]]; then
  shopt -s nullglob
  for shard in "$DEST/CHRONICLE"/*.md; do
    base="$(basename "$shard")"
    src="$CACHE/CHRONICLE/$base"
    [[ -f "$src" ]] || continue
    dest_bytes="$(stat -f%z "$shard" 2>/dev/null || stat -c%s "$shard")"
    src_bytes="$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src")"
    dest_mtime="$(stat -f%m "$shard" 2>/dev/null || stat -c%Y "$shard")"
    src_mtime="$(stat -f%m "$src" 2>/dev/null || stat -c%Y "$src")"
    keep=0
    if (( dest_bytes > src_bytes )); then
      keep=1
    elif (( dest_mtime > src_mtime && dest_bytes >= src_bytes )); then
      keep=1
    elif (( dest_bytes > src_bytes * 2 && dest_bytes > 100000 )); then
      keep=1
    fi
    if (( keep )); then
      echo "mirror-cache-to-vault: protect CHRONICLE/$base (${dest_bytes}B vault vs ${src_bytes}B cache)"
      PROTECT+=(--exclude "CHRONICLE/$base")
    fi
  done
  shopt -u nullglob
fi

if command -v timeout >/dev/null 2>&1; then
  if timeout "$TIMEOUT_SEC" rsync -a \
    --exclude '.DS_Store' \
    "${PROTECT[@]}" \
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

rsync -a --exclude '.DS_Store' "${PROTECT[@]}" "$CACHE/" "$DEST/" && echo "mirror-cache-to-vault: ok → $DEST"
