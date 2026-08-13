#!/usr/bin/env bash
# Prepend hygiene headers and push. Run with snevemoney write access (e.g. VPS gh auth).
# Skips n8n-cursor (handled on cursor/n8n-domain-migration-59dd).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
HEADERS="$ROOT/headers"
WORK="${TMPDIR:-/tmp}/evens-readme-hygiene-$$"
BRANCH="cursor/repo-hygiene-headers-59dd"
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

for repo in "${REPOS[@]}"; do
  header="$HEADERS/$repo.md"
  if [[ ! -f "$header" ]]; then
    echo "SKIP $repo (no header file)"
    continue
  fi
  echo "==> README $repo"
  rm -rf "$WORK/$repo"
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 "https://github.com/snevemoney/${repo}.git" "$WORK/$repo"
  cd "$WORK/$repo"
  git checkout -B "$BRANCH"
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
  git push -u origin "$BRANCH" --force-with-lease
  default="$(gh repo view "snevemoney/$repo" --json defaultBranchRef -q .defaultBranchRef.name)"
  existing="$(gh pr list --repo "snevemoney/$repo" --head "$BRANCH" --json number -q '.[0].number' || true)"
  if [[ -n "${existing:-}" && "$existing" != "null" ]]; then
    echo "  PR #$existing already exists"
  else
    gh pr create --repo "snevemoney/$repo" --base "$default" --head "$BRANCH" \
      --title "docs: repo hygiene header (lane / WIP / not-X)" \
      --body "Adds canonical status/lane/role/not-X header so this repo is not confused with sibling products. Part of Evens Louis hive taxonomy." \
      || echo "  PR create skipped/failed"
  fi
  cd /
done

echo "README_HEADERS_DONE"
