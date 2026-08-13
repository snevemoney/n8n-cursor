#!/usr/bin/env bash
# Append one entry to Outer Heaven chronicle (Obsidian primary or git mirror).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SOURCE="manual"
PROJECT=""
TAGS=""
SURVIVABILITY="ops"
SUMMARY=""

usage() {
  echo "Usage: append-chronicle.sh [--source cursor|grok|manual|n8n] [--project id] [--tags a,b] [--survivability ops|business|personal] \"Summary text\""
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --survivability) SURVIVABILITY="$2"; shift 2 ;;
    -h|--help) usage ;;
    *)
      SUMMARY="$1"
      shift
      ;;
  esac
done

[[ -n "$SUMMARY" ]] || usage

python3 "$ROOT/scripts/hive/outer-heaven/append-chronicle.py" \
  --source "$SOURCE" \
  --workspace "${OUTER_HEAVEN_WORKSPACE:-manual}" \
  --project "$PROJECT" \
  --tags "$TAGS" \
  --survivability "$SURVIVABILITY" \
  --summary "$SUMMARY"

echo "Appended to chronicle under $(python3 -c "from pathlib import Path; import sys; sys.path.insert(0,'$ROOT/scripts/hive/outer-heaven'); from lib import library_root; print(library_root())")"
