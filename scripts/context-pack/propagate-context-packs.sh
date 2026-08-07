#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PACKS="$ROOT/scripts/context-pack/packs"
WORK="${TMPDIR:-/tmp}/hive-context-packs-$$"
BRANCH="cursor/dexter-context-pack-79a6"
STATUS="$ROOT/docs/hive/PROPAGATION_STATUS.md"
mkdir -p "$WORK"
# pack_id:github_repo
TARGETS=(
  "client-engine:client-engine"
  "philanthropic-ai-agent:philanthropic-ai-agent"
  "outer-heaven-backups:outer-heaven-backups"
  "shield-buddies:shield-buddies"
  "clipengine:clipengine"
  "trendspotter-ai:trendspotter-ai"
  "proof-qc-assist:proof-qc-assist"
  "clearfield-evidence-flow:clearfield-evidence-flow"
  "insights-lm-private:insights-lm-private"
  "autoflow-finance:autoflow-finance"
  "book-reimagined:book-reimagined"
  "quick-list-hub-42:quick-list-hub-42"
  "lightning-ui:lightning-ui"
  "lightningflow-gh:lightningflow"
)
echo "# Propagation status" > "$STATUS"
echo "" >> "$STATUS"
echo "| Repo | Result | PR |" >> "$STATUS"
echo "|------|--------|----|" >> "$STATUS"
for pair in "${TARGETS[@]}"; do
  id="${pair%%:*}"; repo="${pair##*:}"
  PACK="$PACKS/$id"
  [[ -d "$PACK" ]] || { echo "| $repo | missing pack | |"; echo "| $repo | missing pack | |" >> "$STATUS"; continue; }
  echo "=== $repo (pack $id) ==="
  DEST="$WORK/$repo"
  rm -rf "$DEST"
  if ! git clone --depth 1 "https://github.com/snevemoney/${repo}.git" "$DEST" 2>/tmp/clone-$repo.err; then
    echo "| $repo | clone_fail | |" >> "$STATUS"
    tail -3 /tmp/clone-$repo.err || true
    continue
  fi
  cd "$DEST"
  git checkout -B "$BRANCH"
  if [[ -f AGENTS.md ]]; then
    {
      echo "<!-- BEGIN HIVE CONTEXT PACK -->"
      cat "$PACK/AGENTS.md"
      echo "<!-- END HIVE CONTEXT PACK -->"
      echo ""
      cat AGENTS.md
    } > AGENTS.md.new && mv AGENTS.md.new AGENTS.md
  else
    cp "$PACK/AGENTS.md" AGENTS.md
  fi
  cp "$PACK/PROJECT_CONTEXT.md" PROJECT_CONTEXT.md
  mkdir -p docs/hive docs/adr docs/external docs/program-design
  cp "$PACK/docs/hive/"*.md docs/hive/
  cp "$PACK/docs/adr/README.md" docs/adr/
  cp "$PACK/docs/external/README.md" docs/external/
  cp "$PACK/docs/program-design/README.md" docs/program-design/
  git add AGENTS.md PROJECT_CONTEXT.md docs/hive docs/adr docs/external docs/program-design
  if git diff --cached --quiet; then
    echo "| $repo | no_changes | |" >> "$STATUS"
    continue
  fi
  git -c user.email="agent@local" -c user.name="Cursor Agent" commit -m "docs: add hive mind context pack (solo+hive, Dexter gates)"
  if git push -u origin "$BRANCH" 2>/tmp/push-$repo.err; then
    url=$(gh pr create --title "docs: hive mind context pack for ${repo}" --body "## Summary
- Adds AGENTS.md / PROJECT_CONTEXT.md and docs/hive solo+hive briefs
- Dexter program-design pointer + adr/external stubs
- Aligns with n8n-cursor hive canon

## Test plan
- [ ] Role and non-goals clear in AGENTS.md
- [ ] No secrets in docs/external
- [ ] Existing AGENTS/OpenClaw contracts preserved when present" 2>/tmp/pr-$repo.err | tail -1)
    echo "| $repo | pushed | $url |" >> "$STATUS"
    echo "OK $repo $url"
  else
    echo "| $repo | push_fail | |" >> "$STATUS"
    tail -8 /tmp/push-$repo.err || true
  fi
done
echo "DONE $WORK"
