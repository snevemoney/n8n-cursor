#!/usr/bin/env bash
# VPS read-only audit — disk, processes, backups, sacred files
set -uo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
PHIL_ROOT="${HIVE_PHIL_ROOT:-/opt/philanthropy}"
# Default: OpenClaw workspace cron (/root/bin/backup-openclaw-workspaces.sh)
BACKUP_DIR="${HIVE_BACKUP_DIR:-/root/openclaw-backups/workspaces}"

pass=0
fail=0
skip=0

ok() { echo "PASS $1"; ((pass++)); }
bad() { echo "FAIL $1"; ((fail++)); }
skp() { echo "SKIP $1"; ((skip++)); }

if ! command -v ssh >/dev/null 2>&1; then
  skp "ssh not installed"
  exit 0
fi

if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_TARGET" "echo ok" >/dev/null 2>&1; then
  skp "SSH to $SSH_TARGET failed (no key or host down) — VPS audit skipped"
  exit 0
fi

remote() {
  ssh -o BatchMode=yes -o ConnectTimeout=15 "$SSH_TARGET" "$@"
}

# Disk usage root (integer % from blocks — df's % column rounds up)
disk_pct=$(remote "df / | tail -1 | awk '{u=\$3; t=\$2; if (t+0>0) print int(u*100/t); else print 999}'" 2>/dev/null || echo "999")
df_display=$(remote "df -h / | tail -1 | awk '{print \$5}'" 2>/dev/null || echo "?")
if [[ "$disk_pct" =~ ^[0-9]+$ ]] && (( disk_pct < 85 )); then
  ok "Root disk ${disk_pct}% (${df_display} displayed, <85%)"
elif [[ "$disk_pct" =~ ^[0-9]+$ ]] && (( disk_pct < 90 )); then
  bad "Root disk ${disk_pct}% (${df_display} displayed, warn ≥85%)"
else
  bad "Root disk check failed (${disk_pct}%)"
fi

# n8n_data volume
if remote "docker volume ls -q 2>/dev/null | grep -q n8n" 2>/dev/null; then
  ok "Docker n8n volume present"
else
  bad "Docker n8n volume not found (pattern n8n)"
fi

# OpenClaw gateway — loopback health only. pgrep matches leftover "pm2 restart"
# and the embedder; that is not the gateway (2026-09-12 audit).
if remote "curl -fsS --max-time 3 http://127.0.0.1:18789/health >/dev/null" 2>/dev/null; then
  ok "OpenClaw gateway :18789 health"
else
  bad "OpenClaw gateway :18789 down (HOLD until Evens starts it)"
fi

if remote "test -f /opt/philanthropy/openclaw/openclaw.json" 2>/dev/null; then
  ok "Live OpenClaw config /opt/philanthropy/openclaw/openclaw.json"
else
  bad "Live OpenClaw config missing"
fi

if remote "test -d /root/.openclaw" 2>/dev/null; then
  ok "Ghost home /root/.openclaw present"
else
  skp "Ghost home /root/.openclaw missing — scripts must refuse mutate"
fi

# Sacred files at philanthropy root (per-agent workspace souls are empty husks)
sacred_count=$(remote "find ${PHIL_ROOT} -maxdepth 1 \\( -name 'SOUL.md' -o -name 'AGENTS.md' -o -name 'TOOLS.md' \\) 2>/dev/null | wc -l" 2>/dev/null || echo "0")
if [[ "$sacred_count" =~ ^[0-9]+$ ]] && (( sacred_count >= 1 )); then
  ok "Sacred philanthropy files found (count=$sacred_count)"
else
  bad "Sacred philanthropy files not found under $PHIL_ROOT"
fi

# Backup freshness (if dir exists)
if remote "test -d ${BACKUP_DIR}" 2>/dev/null; then
  age_h=$(remote "find ${BACKUP_DIR} -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -1 | xargs -I{} date -d @{} +%s 2>/dev/null || echo 0" 2>/dev/null)
  now=$(date +%s)
  if [[ "$age_h" =~ ^[0-9]+$ ]] && (( now - age_h < 93600 )); then
    ok "Backup dir ${BACKUP_DIR} has file newer than 26h"
  else
    bad "Backup dir stale or unreadable ($BACKUP_DIR)"
  fi
else
  skp "Backup dir $BACKUP_DIR not found — set HIVE_BACKUP_DIR if elsewhere"
fi

echo "Summary: PASS=$pass FAIL=$fail SKIP=$skip"
exit $(( fail > 0 ? 1 : 0 ))
