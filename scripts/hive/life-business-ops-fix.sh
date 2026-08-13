#!/usr/bin/env bash
# Fix wiring for existing life + business automation (no greenfield builds).
# Run on VPS: cd /root/domain-paths/n8n-cursor && bash scripts/hive/life-business-ops-fix.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CID="life-business-ops-fix-$(date +%Y%m%d%H%M%S)"

log() { echo "[life-business-ops] $*"; }

log "start $CID"

# 1. Deploy philanthropy tools, catalog, env, shortcuts
log "upgrade-hive-leverage"
python3 "${SCRIPT_DIR}/upgrade-hive-leverage.py"

# 2. Mirror N8N keys to .env.local for tooling that reads it
PHIL_ENV="/opt/philanthropy/.env"
PHIL_LOCAL="/opt/philanthropy/.env.local"
if [[ -f "$PHIL_ENV" ]]; then
  for key in N8N_API_KEY N8N_BASE_URL N8N_WEBHOOK_BASE HIVE_WEBHOOK_SECRET CE_HIVE_TOKEN CE_HIVE_BASE_URL N8N_CATALOG_PATH; do
    val=$(grep -E "^${key}=" "$PHIL_ENV" 2>/dev/null | head -1 | cut -d= -f2- || true)
    [[ -z "$val" ]] && continue
    touch "$PHIL_LOCAL"
    if grep -q "^${key}=" "$PHIL_LOCAL" 2>/dev/null; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$PHIL_LOCAL"
    else
      echo "${key}=${val}" >> "$PHIL_LOCAL"
    fi
  done
  log "synced philanthropy .env.local"
fi

# 3. Activate safe hive workflows
log "activate hive workflows"
bash "${SCRIPT_DIR}/n8n-activate-all-hive-workflows.sh" || true

# 4. Publish golden path webhooks (after container recreate safety)
if [[ -x "${SCRIPT_DIR}/n8n-activate-hive-workflows.sh" ]]; then
  bash "${SCRIPT_DIR}/n8n-activate-hive-workflows.sh" || log "WARN n8n-activate-hive-workflows skipped"
fi

# 5. CE lead hook (idempotent)
if [[ -x "${SCRIPT_DIR}/wire-ce-lead-hook-vps.sh" ]]; then
  # wire script uses scp from hub — skip if already on VPS
  if [[ -f /root/client-engine/src/lib/hive/lead-notify.ts ]] && grep -q notifyHiveLeadCreated /root/client-engine/src/lib/db.ts 2>/dev/null; then
    log "CE lead hook already wired"
  else
    bash "${SCRIPT_DIR}/wire-ce-lead-hook-vps.sh" || log "WARN CE hook wire failed"
  fi
fi

# 6. Email + evenslouis n8n business workflows
if [[ -x "${SCRIPT_DIR}/n8n-email-ops-fix.sh" ]]; then
  bash "${SCRIPT_DIR}/n8n-email-ops-fix.sh" || log "WARN email-ops partial"
fi
if [[ -x "${SCRIPT_DIR}/n8n-evens-business-activate.sh" ]]; then
  bash "${SCRIPT_DIR}/n8n-evens-business-activate.sh" || log "WARN evens business activate partial"
fi

# 7. Register outcome
TOKEN=$(docker exec evenslouis_paths-scorpion-1 printenv HIVE_MACHINE_TOKEN 2>/dev/null || true)
if [[ -n "$TOKEN" ]]; then
  curl -sS --max-time 12 -X POST "https://evenslouis.ca/scorpion/api/hive/register" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"correlationId\":\"${CID}\",\"jobType\":\"hive.life_business_ops.fixed\",\"status\":\"completed\",\"summary\":\"life-business-ops-fix deployed\",\"metadata\":{\"script\":\"scripts/hive/life-business-ops-fix.sh\"}}" \
    >/dev/null 2>&1 || true
fi

log "done $CID — run: bash scripts/hive/smoke-life-business-ops.sh"
