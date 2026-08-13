#!/usr/bin/env bash
# Promote a chronicle entry or draft to a verified METHODS/ recipe.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
FROM=""
DOMAIN="general"
TITLE=""
SLUG=""

usage() {
  echo "Usage: promote-to-method.sh --domain business --title \"CE lead flow\" [--from-chronicle oh-xxx] [--slug ce-lead-flow]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from-chronicle) FROM="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    --slug) SLUG="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown: $1"; usage ;;
  esac
done

[[ -n "$TITLE" ]] || usage
SLUG="${SLUG:-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//;s/-$//' | cut -c1-40)}"

LIB=$(python3 -c "import sys; sys.path.insert(0,'$ROOT/scripts/hive/outer-heaven'); from lib import library_root; print(library_root())")
METHODS="$LIB/METHODS"
mkdir -p "$METHODS"
OUT="$METHODS/${DOMAIN}-${SLUG}.md"

BODY="Promoted method: $TITLE"
if [[ -n "$FROM" ]]; then
  BODY="Promoted from chronicle \`$FROM\`.

Verify steps on live surface before trusting."
fi

cat > "$OUT" <<EOF
---
domain: $DOMAIN
status: verified
correlationId: ${FROM:-manual}
survival_score: null
last_verified: $(date -u +%Y-%m-%d)
apps_used: []
---

# $TITLE

$BODY

## Steps

_(operator: fill in verified steps)_

## When to use

_(operator: fill in)_
EOF

echo "Wrote $OUT"
