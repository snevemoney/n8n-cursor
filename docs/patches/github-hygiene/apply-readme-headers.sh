#!/usr/bin/env bash
# Prepend hygiene headers to all 15 repos and push. Run on a machine with snevemoney write access.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HEADERS="$ROOT/headers"
WORK="${TMPDIR:-/tmp}/evens-readme-hygiene-$$"
mkdir -p "$WORK"
trap 'rm -rf "$WORK"' EXIT

REPOS=(
  n8n-cursor
  client-engine
  philanthropic-ai-agent
  outer-heaven-backups
  shield-buddies
  clipengine
  trendspotter-ai
  proof-qc-assist
  autoflow-finance
  book-reimagined
  quick-list-hub-42
  clearfield-evidence-flow
  insights-lm-private
  lightning-ui
  lightningflow
)

git_cfg() {
  git -c user.email="evens.louis.dev@gmail.com" -c user.name="Evens Louis" "$@"
}

for repo in "${REPOS[@]}"; do
  header="$HEADERS/$repo.md"
  if [[ ! -f "$header" ]]; then
    echo "SKIP $repo (no header file)"
    continue
  fi
  echo "==> README $repo"
  rm -rf "$WORK/$repo"
  gh repo clone "snevemoney/$repo" "$WORK/$repo" -- --depth 1
  cd "$WORK/$repo"
  branch="cursor/github-hygiene-59dd"
  git checkout -B "$branch"
  if [[ -f README.md ]]; then
    # Skip if already hygiened
    if head -n 5 README.md | grep -q 'HYGIENE: paste at top'; then
      echo "  already has hygiene header"
      continue
    fi
    tmp="$(mktemp)"
    cat "$header" README.md > "$tmp"
    mv "$tmp" README.md
  else
    cp "$header" README.md
  fi
  git add README.md
  if git diff --cached --quiet; then
    echo "  no changes"
    continue
  fi
  git_cfg commit -m "docs: add lane/status hygiene header (not-the-product disclaimers)"
  git push -u origin "$branch"
  # Open or update PR into default branch
  default="$(gh repo view snevemoney/$repo --json defaultBranchRef -q .defaultBranchRef.name)"
  if gh pr view --head "$branch" >/dev/null 2>&1; then
    echo "  PR already exists"
  else
    gh pr create --base "$default" --head "$branch" \
      --title "docs: repo hygiene header (lane / WIP / not-X)" \
      --body "Adds canonical status/lane/role/not-X header so this repo is not confused with sibling products. Part of Evens Louis hive taxonomy." \
      || echo "  PR create skipped/failed (may already exist)"
  fi
  cd /
done

echo "README_HEADERS_DONE"
