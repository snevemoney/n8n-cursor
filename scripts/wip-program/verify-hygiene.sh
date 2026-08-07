#!/usr/bin/env bash
# Phase 0: verify README hygiene headers on all 15 repos.
set -euo pipefail
REPOS=(
  n8n-cursor client-engine philanthropic-ai-agent outer-heaven-backups
  shield-buddies clipengine trendspotter-ai proof-qc-assist autoflow-finance
  book-reimagined quick-list-hub-42 clearfield-evidence-flow insights-lm-private
  lightning-ui lightningflow
)
fail=0
for r in "${REPOS[@]}"; do
  head=$(gh api "repos/snevemoney/$r/readme" -H "Accept: application/vnd.github.raw" 2>/dev/null | head -n 1 || true)
  if echo "$head" | grep -q 'HYGIENE'; then
    echo "OK  $r"
  else
    # n8n-cursor may only be headed on migration branch until PR merge
    if [[ "$r" == "n8n-cursor" ]]; then
      echo "WAIT $r (expect header on cursor/n8n-domain-migration-59dd until merge)"
    else
      echo "MISS $r"
      fail=1
    fi
  fi
done
exit "$fail"
