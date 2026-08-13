#!/usr/bin/env bash
# Install hive-watchdog on VPS cron (every 10 minutes, Naomi lane).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
VPS="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_REPO="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"

echo "== Sync watchdog scripts to VPS =="
rsync -az \
  "${SCRIPT_DIR}/hive-watchdog.sh" \
  "${SCRIPT_DIR}/install-hive-watchdog-cron.sh" \
  "${SCRIPT_DIR}/fix-telegram-llm-vps.sh" \
  "${SCRIPT_DIR}/sync-vps-llm-keys.py" \
  "${VPS}:${REMOTE_REPO}/scripts/hive/"

ssh -o BatchMode=yes "$VPS" bash -s <<EOF
set -euo pipefail
REMOTE_REPO="${REMOTE_REPO}"
chmod +x \${REMOTE_REPO}/scripts/hive/hive-watchdog.sh
chmod +x \${REMOTE_REPO}/scripts/hive/fix-telegram-llm-vps.sh
touch /var/log/hive-watchdog.log

CRON_MARK="# hive-watchdog"
CRON_LINE="*/10 * * * * cd \${REMOTE_REPO} && bash scripts/hive/hive-watchdog.sh >> /var/log/hive-watchdog.log 2>&1"

if crontab -l 2>/dev/null | grep -q "hive-watchdog"; then
  crontab -l 2>/dev/null | grep -v "hive-watchdog" > /tmp/cron.tmp || true
else
  crontab -l 2>/dev/null > /tmp/cron.tmp || true
fi
echo "\${CRON_LINE} \${CRON_MARK}" >> /tmp/cron.tmp
crontab /tmp/cron.tmp
rm -f /tmp/cron.tmp
echo "installed cron:"
crontab -l | grep hive-watchdog || true

echo ""
echo "== First watchdog run =="
cd \${REMOTE_REPO}
export HIVE_MACHINE_TOKEN="\$(docker exec evenslouis_paths-scorpion-1 printenv HIVE_MACHINE_TOKEN 2>/dev/null || true)"
export HIVE_WEBHOOK_SECRET="\$(grep -E '^HIVE_WEBHOOK_SECRET=' /root/domain-paths/n8n-cursor/.env 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"')"
bash scripts/hive/hive-watchdog.sh || true
tail -8 /var/log/hive-watchdog.log 2>/dev/null || true
EOF

echo "Done. Watchdog runs every 10m; logs: /var/log/hive-watchdog.log on VPS"
