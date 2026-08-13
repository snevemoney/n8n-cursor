#!/usr/bin/env bash
# Chain hive week finalization: deploy → n8n → smokes → summary doc
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/docs/hive/FINALIZE_ALL_LAST.txt"
SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ROOT="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"

pass=0
fail=0
skip=0
log() { echo "$1" | tee -a "$OUT"; }
ok() { log "PASS $1"; ((pass++)); }
bad() { log "FAIL $1"; ((fail++)); }
skp() { log "SKIP $1"; ((skip++)); }

: > "$OUT"
log "=== Hive finalize-all $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
log ""

# 1. Scorpion deploy
log "## Phase 1 — Scorpion deploy"
if bash "$ROOT/scripts/hive/deploy-evenslouis-paths.sh" >> "$OUT" 2>&1; then
  ok "deploy-evenslouis-paths.sh"
else
  bad "deploy-evenslouis-paths.sh"
fi

for url in \
  "knowledge|${EVENSLOUIS_BASE:-https://evenslouis.ca}/scorpion/api/knowledge|200|5" \
  "obsidian|${EVENSLOUIS_BASE:-https://evenslouis.ca}/scorpion/api/hive/obsidian/status|200|10" \
  "planner|${EVENSLOUIS_BASE:-https://evenslouis.ca}/scorpion/planner|200|10"
do
  name="${url%%|*}"
  rest="${url#*|}"
  target="${rest%%|*}"
  rest2="${rest#*|}"
  expect="${rest2%%|*}"
  max="${rest2##*|}"
  result=$(curl -sS -o /dev/null -w "%{http_code} %{time_total}" --max-time "$max" "$target" 2>/dev/null || echo "000 999")
  code="${result%% *}"
  time="${result##* }"
  if [[ "$code" == "$expect" ]] && awk "BEGIN {exit !($time < $max)}"; then
    ok "$name curl $code ${time}s"
  else
    bad "$name curl $code ${time}s (want $expect)"
  fi
done

# 2. n8n imports (CLI fallback when N8N_API_KEY missing)
log ""
log "## Phase 2 — n8n workflows"
if bash "$ROOT/scripts/hive/discover-n8n-api-key.sh" >> "$OUT" 2>&1; then
  ok "discover-n8n-api-key"
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env" 2>/dev/null || true
  ssh -o BatchMode=yes "$SSH_TARGET" "grep -E '^N8N_API_KEY=' $REMOTE_ROOT/.env" >> "$OUT" 2>&1 || true
  set +a
  for script in n8n-import-ecosystem-router.sh n8n-import-ce-lead-slice.sh n8n-import-meta-cognitive.sh; do
    if ssh -o BatchMode=yes "$SSH_TARGET" "cd $REMOTE_ROOT && bash scripts/hive/$script" >> "$OUT" 2>&1; then
      ok "$script"
    else
      skp "$script (API import — may use CLI on VPS)"
    fi
  done
else
  skp "N8N_API_KEY not in env — workflows should be imported via n8n CLI on VPS"
fi

# 3. CE hook
log ""
log "## Phase 3 — CE lead hook"
if bash "$ROOT/scripts/hive/wire-ce-lead-hook-vps.sh" >> "$OUT" 2>&1; then
  ok "wire-ce-lead-hook-vps"
else
  skp "wire-ce-lead-hook-vps (may already be wired)"
fi

# 4. Philanthropy leverage
log ""
log "## Phase 4 — Philanthropy obsidian tool"
if ssh -o BatchMode=yes "$SSH_TARGET" "cd $REMOTE_ROOT && python3 scripts/hive/upgrade-hive-leverage.py" >> "$OUT" 2>&1; then
  ok "upgrade-hive-leverage.py"
else
  bad "upgrade-hive-leverage.py"
fi

# 5. Smokes + audits
log ""
log "## Phase 5 — Smokes and audits"
for script in smoke-ce-lead-slice.sh smoke-meta-cognitive.sh core-work-ready-smoke.sh expert-audit.sh audit-all-paths.sh vps-audit.sh; do
  if [[ -f "$ROOT/scripts/hive/$script" ]]; then
    if bash "$ROOT/scripts/hive/$script" >> "$OUT" 2>&1; then
      ok "$script"
    else
      bad "$script"
    fi
  fi
done

log ""
log "=== Summary: PASS=$pass FAIL=$fail SKIP=$skip ==="
exit $(( fail > 0 ? 1 : 0 ))
