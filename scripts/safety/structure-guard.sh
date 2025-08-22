#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$ROOT"

mapfile -t ALLOWED < config/repo.schema
ALLOW_RE="^($(printf "%s|" "${ALLOWED[@]}" | sed 's:/$::g;s:|$::'))"

BAD=0
while IFS= read -r f; do
  [[ -z "$f" || "$f" =~ ^\.git/ ]] && continue
  [[ "$f" =~ $ALLOW_RE ]] && continue
  echo "::error::Forbidden path: $f"; BAD=1
done < <(git ls-files)

for f in $(git diff --name-only --cached --diff-filter=ACM | grep -E '^[^/]+\.(sh|json)$' || true); do
  echo "::error::Top-level files are forbidden: $f"; BAD=1
done

# Check for MASTER_UNLOCK in code (not docs)
if git grep -n "MASTER_UNLOCK" -- ':!docs' ':!config' | grep -v '.env.example' >/dev/null 2>&1; then
  echo "::error::MASTER_UNLOCK string found in code. Use env var only."; BAD=1
fi

exit $BAD
