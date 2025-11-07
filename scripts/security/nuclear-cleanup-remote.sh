#!/bin/bash

echo "🚨 NUCLEAR CLEANUP INITIATED"
echo "============================"

# Kill malicious processes
echo "🔪 Killing malicious processes..."
sudo pkill -f 'minio.daviduwu.ovh' 2>/dev/null || echo "No minio processes found"
sudo pkill -f 'xmr_linux_amd6444' 2>/dev/null || echo "No xmr processes found"

# Clear all cron jobs
echo "🗑️ Clearing all cron jobs..."
sudo crontab -r 2>/dev/null || echo "No cron jobs to clear"

# Remove malicious scripts
echo "🗑️ Removing malicious scripts..."
sudo rm -f ~/auto_optimize.sh ~/error_detector.sh ~/database_monitor.sh 2>/dev/null
sudo rm -f /home/evens/auto_optimize.sh /home/evens/error_detector.sh /home/evens/database_monitor.sh 2>/dev/null

# Clean up any downloaded files
echo "🧹 Cleaning up malicious files..."
sudo find ~/ -name "*xmr*" -delete 2>/dev/null
sudo find ~/ -name "*minio*" -delete 2>/dev/null
sudo find /tmp -name "*xmr*" -delete 2>/dev/null
sudo find /tmp -name "*minio*" -delete 2>/dev/null

# Check for any remaining processes
echo "🔍 Checking for remaining malicious processes..."
ps aux | grep -E 'minio|xmr|monero|hashrate' | grep -v grep || echo "✅ No malicious processes found"

echo "📊 System load after cleanup..."
uptime

echo "✅ Nuclear cleanup completed!"
