#!/usr/bin/env bash
# Prepend hygiene headers and push. Run with snevemoney write access (e.g. VPS gh auth).
# Skips n8n-cursor (handled on cursor/n8n-domain-migration-59dd).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HEADERS="$ROOT/headers"
WORK="${TMPDIR:-/tmp}/evens-readme-hygiene-$$"
mkdir -p "$WORK"
trap 'rm -rf "$WORK"' EXIT

REPOS=(
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

clone_sparse() {
  local repo="$1"
  local dest="$2"
  rm -rf "$dest"
  mkdir -p "$dest"
  git -c advice.detachedHead=false clone --depth 1 --filter=blob:none --sparse \
    "https://github.com/snevemoney/${repo}.git" "$dest"
  (
    cd "$dest"
    git sparse-checkout set README.md || true
    # ensure README exists even if sparse missed
    git checkout HEAD -- README.md 2>/dev/null || true
  )
}

for repo in "${REPOS[@]}"; do
  header="$HEADERS/$repo.md"
  if [[ ! -f "$header" ]]; then
    echo "SKIP $repo (no header file)"
    continue
  fi
  echo "==> README $repo"
  clone_sparse "$repo" "$WORK/$repo"
  cd "$WORK/$repo"
  branch="cursor/github-hygiene-59dd"
  git checkout -B "$branch"
  if [[ -f README.md ]]; then
    if head -n 8 README.md | grep -q 'HYGIENE: paste at top'; then
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
  default="$(gh repo view "snevemoney/$repo" --json defaultBranchRef -q .defaultBranchRef.name)"
  if gh pr list --repo "snevemoney/$repo" --head "$branch" --json number -q '.[0].number' | grep -q '[0-9]'; then
    echo "  PR already exists"
  else
    gh pr create --repo "snevemoney/$repo" --base "$default" --head "$branch" \
      --title "docs: repo hygiene header (lane / WIP / not-X)" \
      --body "Adds canonical status/lane/role/not-X header so this repo is not confused with sibling products. Part of Evens Louis hive taxonomy." \
      || echo "  PR create skipped/failed"
  fi
  cd /
done

echo "README_HEADERS_DONE"
