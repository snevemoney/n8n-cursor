#!/usr/bin/env bash
# Hive cross-app watchdog — health checks, safe auto-heal, register + telemetry.
# Designed to run on VPS every 10m (Naomi lane). Tier 3 (money/deploy/prod) never auto.
#
# Install: bash scripts/hive/install-hive-watchdog-cron.sh
# Manual:  bash scripts/hive/hive-watchdog.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
STATE_FILE="${HIVE_WATCHDOG_STATE:-/var/run/hive-watchdog.state}"
CID="hive-watchdog-$(date +%Y%m%d%H%M%S)"
BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
WEBHOOK_BASE="${N8N_WEBHOOK_BASE:-https://evenslouis.ca/webhook}"
TIMEOUT=8

issues=0
healed=0
checks_ok=0

log() { echo "[watchdog] $*"; }

curl_code() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time "$TIMEOUT" "$1" 2>/dev/null || echo "000"
}

load_env() {
  for f in /root/domain-paths/n8n-cursor/.env /opt/philanthropy/.env.local /opt/philanthropy/.env; do
    if [[ -f "$f" ]]; then
      set -a
      # shellcheck disable=SC1090
      source "$f" 2>/dev/null || true
      set +a
    fi
  done
}

state_get() {
  [[ -f "$STATE_FILE" ]] && grep "^$1=" "$STATE_FILE" 2>/dev/null | cut -d= -f2- || echo ""
}

state_set() {
  local key="$1" val="$2"
  mkdir -p "$(dirname "$STATE_FILE")"
  touch "$STATE_FILE"
  if grep -q "^${key}=" "$STATE_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$STATE_FILE"
  else
    echo "${key}=${val}" >> "$STATE_FILE"
  fi
}

should_alert() {
  local key="$1"
  local last
  last="$(state_get "alert_${key}")"
  local now
  now="$(date +%s)"
  if [[ -z "$last" ]] || (( now - last > 900 )); then
    state_set "alert_${key}" "$now"
    return 0
  fi
  return 1
}

register_outcome() {
  local summary="$1"
  local status="${2:-done}"
  [[ -z "${HIVE_MACHINE_TOKEN:-}" ]] && return 0
  curl -sS --max-time 12 -X POST "${BASE}/scorpion/api/hive/register" \
    -H "Authorization: Bearer ${HIVE_MACHINE_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "correlationId": "${CID}",
  "jobType": "hive.watchdog.run",
  "goal": "Hive watchdog health rollup",
  "source": "hive.watchdog",
  "status": "${status}",
  "registerTo": "scorpion",
  "summary": """${summary}""",
  "metadata": {"script": "scripts/hive/hive-watchdog.sh", "issues": ${issues}, "healed": ${healed}, "checks_ok": ${checks_ok}},
}))
PY
)" >/dev/null 2>&1 || true
}

emit_grok_event() {
  local severity="$1"
  local lane="$2"
  local summary="$3"
  local emit="${REPO_ROOT}/scripts/hive/emit-smoke-failure.sh"
  if [[ -f "$emit" ]]; then
    bash "$emit" --severity "$severity" --lane "$lane" --summary "$summary" --correlationId "$CID" 2>/dev/null || true
  fi
}

emit_telemetry() {
  local severity="$1"
  local event_type="$2"
  local message="$3"
  [[ -z "${HIVE_WEBHOOK_SECRET:-}" ]] && return 0
  curl -sS --max-time 12 -X POST "${WEBHOOK_BASE}/hive-telemetry-ingest" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
  "correlationId": "${CID}",
  "repository_name": "n8n-cursor",
  "event_type": "${event_type}",
  "severity": "${severity}",
  "context": {
    "tool_executed": "hive-watchdog",
    "file_path": "scripts/hive/hive-watchdog.sh",
    "error_message": """${message}""",
  },
  "hive_state": {"is_self_healing_active": True, "current_iteration_count": ${healed}},
}))
PY
)" >/dev/null 2>&1 || true
}

emit_error_heal() {
  local route="$1"
  local error="$2"
  [[ -z "${HIVE_WEBHOOK_SECRET:-}" ]] && return 0
  should_alert "$route" || return 0
  curl -sS --max-time 15 -X POST "${WEBHOOK_BASE}/hive-error-heal" \
    -H "Content-Type: application/json" \
    -H "X-Hive-Secret: ${HIVE_WEBHOOK_SECRET}" \
    -d "$(python3 - <<PY
import json
print(json.dumps({
  "correlationId": "${CID}",
  "statusCode": 503,
  "route": "${route}",
  "error": """${error}""",
  "repo": "n8n-cursor",
  "service": "hive-watchdog",
}))
PY
)" >/dev/null 2>&1 || true
}

heal_openclaw() {
  if curl_code "http://127.0.0.1:18789/health" | grep -q 200; then
    log "SKIP openclaw heal — already healthy (avoid duplicate gateway)"
    return 0
  fi
  log "HEAL openclaw — gateway down or unhealthy"
  if [[ -x "${SCRIPT_DIR}/fix-telegram-llm-vps.sh" ]]; then
    HEAL_NO_PING=1 bash "${SCRIPT_DIR}/fix-telegram-llm-vps.sh" || true
  else
    pm2 stop openclaw 2>/dev/null || true
    sleep 2
    pkill -f "openclaw.mjs gateway" 2>/dev/null || true
    pkill -f "openclaw/dist/index.js gateway" 2>/dev/null || true
    pkill -f "openclaw-gateway" 2>/dev/null || true
    sleep 2
    pm2 start openclaw --update-env 2>/dev/null || true
    sleep 20
  fi
  ((healed++)) || true
}

heal_philanthropy() {
  log "HEAL philanthropy — pm2 restart"
  pm2 restart philanthropy 2>/dev/null || true
  sleep 8
  ((healed++)) || true
}

check_service() {
  local name="$1"
  local url="$2"
  local code
  code="$(curl_code "$url")"
  if [[ "$code" == "200" ]]; then
    log "OK   ${name} (${code})"
    ((checks_ok++)) || true
    return 0
  fi
  log "FAIL ${name} (${code}) ${url}"
  ((issues++)) || true
  return 1
}

# Accept 200 or redirect (Caddy often 301/302 on trailing slash paths).
check_service_redirect() {
  local name="$1"
  local url="$2"
  local code
  code="$(curl_code "$url")"
  if [[ "$code" == "200" || "$code" == "301" || "$code" == "302" ]]; then
    log "OK   ${name} (${code})"
    ((checks_ok++)) || true
    return 0
  fi
  log "FAIL ${name} (${code}) ${url}"
  ((issues++)) || true
  return 1
}

# --- main ---
load_env
log "run ${CID}"

# Local spine (VPS)
check_service "openclaw" "http://127.0.0.1:18789/health" || heal_openclaw
check_service "philanthropy" "http://127.0.0.1:3002/api/health" || heal_philanthropy
check_service "ce-hive-bridge" "http://127.0.0.1:3205/healthz" || emit_error_heal "ce-hive-bridge" "CE hive bridge healthz failed"
check_service "embedder" "http://127.0.0.1:8000/health" || emit_error_heal "embedder" "Embedder health failed"

# Public paths
check_service "scorpion-public" "${BASE}/scorpion/healthz" || emit_error_heal "scorpion/healthz" "Scorpion public healthz failed"
check_service "claw-public" "${BASE}/claw/" || emit_error_heal "claw" "OpenClaw public path failed"
check_service_redirect "n8n-public" "${BASE}/n8n/" || emit_error_heal "n8n" "n8n UI path failed"
check_service "ce-public" "${BASE}/pro/api/health" || emit_error_heal "ce/pro/api/health" "CE health failed"

# Golden paths (read-only)
gp_code="$(curl_code "${BASE}/scorpion/api/hive/golden-paths")"
if [[ "$gp_code" == "200" ]]; then
  log "OK   golden-paths API"
  ((checks_ok++)) || true
else
  log "FAIL golden-paths API (${gp_code})"
  ((issues++)) || true
  emit_error_heal "scorpion/golden-paths" "Golden paths API unreachable"
fi

# Disk (alert only — never auto-delete)
disk_pct="$(df -P / 2>/dev/null | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
if [[ -n "$disk_pct" ]] && (( disk_pct >= 90 )); then
  log "CRITICAL disk ${disk_pct}%"
  ((issues++)) || true
  emit_telemetry "CRITICAL" "WARN" "VPS disk ${disk_pct}% — operator prune required"
  emit_error_heal "vps/disk" "Root disk ${disk_pct}% full"
elif [[ -n "$disk_pct" ]] && (( disk_pct >= 85 )); then
  log "WARN disk ${disk_pct}%"
  emit_telemetry "WARN" "WARN" "VPS disk ${disk_pct}%"
fi

# Re-check openclaw after heal
if [[ "$healed" -gt 0 ]]; then
  sleep 5
  if curl_code "http://127.0.0.1:18789/health" | grep -q 200; then
    log "OK   openclaw recovered after heal"
  else
    emit_error_heal "openclaw/gateway" "OpenClaw still down after watchdog heal"
  fi
fi

summary="watchdog checks_ok=${checks_ok} issues=${issues} healed=${healed} disk=${disk_pct:-?}%"
log "SUMMARY ${summary}"

if [[ "$issues" -eq 0 ]]; then
  register_outcome "$summary" "done"
  emit_telemetry "INFO" "INFO" "$summary"
  exit 0
fi

register_outcome "$summary" "failed"
emit_telemetry "WARN" "WARN" "$summary"
if [[ -n "$disk_pct" ]] && (( disk_pct >= 90 )); then
  emit_grok_event "CRITICAL" "health" "$summary"
else
  emit_grok_event "WARN" "health" "$summary"
fi
exit 1
