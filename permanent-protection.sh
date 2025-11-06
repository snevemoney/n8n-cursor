#!/bin/bash

echo "🛡️ PERMANENT PROTECTION INSTALLATION"
echo "===================================="

# Step 1: Block the malicious domains at firewall level
echo "🔒 Blocking malicious domains..."
sudo iptables -A OUTPUT -d minio.daviduwu.ovh -j DROP 2>/dev/null || echo "iptables not available"
sudo ufw deny out to minio.daviduwu.ovh 2>/dev/null || echo "ufw not available"

# Step 2: Create a monitoring script that runs every minute
echo "📡 Installing monitoring system..."
cat > ~/security_monitor.sh << 'MONITOR_SCRIPT'
#!/bin/bash
# Security monitor - runs every minute to catch crypto miners

# Kill any malicious processes immediately
pkill -f 'minio.daviduwu.ovh' 2>/dev/null
pkill -f 'xmr_linux_amd6444' 2>/dev/null
pkill -f 'curl.*minio' 2>/dev/null
pkill -f 'wget.*minio' 2>/dev/null

# Check for suspicious cron jobs
if crontab -l 2>/dev/null | grep -q 'minio\|xmr\|daviduwu'; then
    crontab -r
    echo "$(date): Malicious cron detected and removed" >> ~/security.log
fi

# Check for suspicious files
if [ -f ~/auto_optimize.sh ] || [ -f ~/error_detector.sh ] || [ -f ~/database_monitor.sh ]; then
    rm -f ~/auto_optimize.sh ~/error_detector.sh ~/database_monitor.sh
    echo "$(date): Malicious scripts detected and removed" >> ~/security.log
fi

# Log if anything was found
if [ -f ~/security.log ]; then
    echo "$(date): Security scan completed" >> ~/security.log
fi
MONITOR_SCRIPT

chmod +x ~/security_monitor.sh

# Step 3: Install the monitor in crontab (every minute)
echo "⏰ Installing security monitor (runs every minute)..."
(crontab -l 2>/dev/null; echo "* * * * * ~/security_monitor.sh") | crontab -

# Step 4: Create a startup protection script
echo "🚀 Installing startup protection..."
cat > ~/startup_protection.sh << 'STARTUP_SCRIPT'
#!/bin/bash
# Startup protection - runs on every login

# Kill any existing malicious processes
pkill -f 'minio.daviduwu.ovh' 2>/dev/null
pkill -f 'xmr_linux_amd6444' 2>/dev/null

# Clear any suspicious cron jobs
if crontab -l 2>/dev/null | grep -q 'minio\|xmr\|daviduwu'; then
    crontab -r
fi

# Start the security monitor
~/security_monitor.sh
STARTUP_SCRIPT

chmod +x ~/startup_protection.sh

# Step 5: Add to shell startup files
echo "📝 Adding to shell startup files..."
echo "~/startup_protection.sh" >> ~/.bashrc
echo "~/startup_protection.sh" >> ~/.profile

# Step 6: Create a manual cleanup command
echo "🧹 Creating manual cleanup command..."
cat > ~/cleanup.sh << 'CLEANUP_SCRIPT'
#!/bin/bash
echo "🧹 Manual cleanup initiated..."
pkill -f 'minio.daviduwu.ovh'
pkill -f 'xmr_linux_amd6444'
crontab -r
rm -f ~/auto_optimize.sh ~/error_detector.sh ~/database_monitor.sh
find ~/ -name "*xmr*" -delete 2>/dev/null
find ~/ -name "*minio*" -delete 2>/dev/null
echo "✅ Cleanup completed"
CLEANUP_SCRIPT

chmod +x ~/cleanup.sh

echo ""
echo "🛡️ PERMANENT PROTECTION INSTALLED!"
echo "=================================="
echo "✅ Security monitor runs every minute"
echo "✅ Startup protection on every login"
echo "✅ Manual cleanup: ~/cleanup.sh"
echo "✅ Monitoring logs: ~/security.log"
echo ""
echo "🔒 The crypto miner should never return!"
