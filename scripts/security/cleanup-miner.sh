#!/bin/bash

echo "🧹 Crypto Miner Cleanup Script"
echo "=============================="

# Connect to VPS and clean up the infection
ssh n8ncloud << 'REMOTE_CLEANUP'

echo "🔍 Checking for malicious processes..."
ps aux | grep -E 'minio|xmr|monero|hashrate' | grep -v grep

echo "🗑️ Removing malicious cron jobs..."
crontab -l 2>/dev/null | grep -v 'auto_optimize\|error_detector\|database_monitor' | crontab -

echo "🗑️ Removing malicious scripts..."
rm -f ~/auto_optimize.sh ~/error_detector.sh ~/database_monitor.sh

echo "🔪 Killing any remaining malicious processes..."
pkill -f 'minio.daviduwu.ovh' 2>/dev/null
pkill -f 'xmr_linux_amd6444' 2>/dev/null

echo "🧹 Cleaning up any downloaded files..."
find ~/ -name "*xmr*" -delete 2>/dev/null
find ~/ -name "*minio*" -delete 2>/dev/null

echo "🔍 Final check for malicious processes..."
ps aux | grep -E 'minio|xmr|monero|hashrate' | grep -v grep || echo "✅ No malicious processes found"

echo "📊 System load after cleanup..."
uptime

echo "🧹 Cleanup complete!"

REMOTE_CLEANUP

echo "✅ Remote cleanup completed!"
echo "🔍 Check your remote Cursor connection now"
