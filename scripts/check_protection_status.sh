#!/bin/bash

echo "🔒 N8N DATA PROTECTION STATUS"
echo "============================="

# Check protection services
echo "🛡️ Protection Services:"
echo "   Data Guardian: $(systemctl is-active n8n-data-guardian.service)"
echo "   Backup Verifier: $(systemctl is-active n8n-backup-verifier.timer)"

# Check protected backup
PROTECTED_BACKUP="/home/evens/n8n-cursor/PROTECTED_BACKUP"
if [ -f "$PROTECTED_BACKUP/database.sqlite" ]; then
  BACKUP_SIZE=$(du -h "$PROTECTED_BACKUP/database.sqlite" | cut -f1)
  echo "   Protected Backup: ✅ ($BACKUP_SIZE)"
else
  echo "   Protected Backup: ❌ MISSING"
fi

# Check current data
DOCKER_DATA_1="/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/database.sqlite"
DOCKER_DATA_2="/var/lib/docker/volumes/n8n-cursor_n8n_data/_data/database.sqlite"

if [ -f "$DOCKER_DATA_1" ]; then
  CURRENT_SIZE=$(du -h "$DOCKER_DATA_1" | cut -f1)
  echo "   Current Data: ✅ ($CURRENT_SIZE)"
elif [ -f "$DOCKER_DATA_2" ]; then
  CURRENT_SIZE=$(du -h "$DOCKER_DATA_2" | cut -f1)
  echo "   Current Data: ✅ ($CURRENT_SIZE)"
else
  echo "   Current Data: ❌ MISSING"
fi

echo ""
echo "📋 Recent Guardian Events:"
tail -5 /home/evens/n8n-cursor/logs/data_guardian.log 2>/dev/null || echo "   No events logged yet"

echo ""
echo "🔍 Recent Backup Verifications:"
tail -3 /home/evens/n8n-cursor/logs/backup_verifier.log 2>/dev/null || echo "   No verifications logged yet"
