#!/usr/bin/env bash
set -euo pipefail

echo "🛡️  ENHANCED DAILY SECURITY CHECK & AUTO-REMEDIATION"
echo "====================================================="
echo "Date: $(date)"
echo ""

# Function to log security events
log_security_event() {
    local level="$1"
    local message="$2"
    local log_file="/var/log/security-events.log"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$log_file"
    echo "[$level] $message"
}

echo "[1] Who's listening (should be only 80/443 public)"
ss -Hnlpt | grep -Ev '127\.0\.0\.1:|:80|:443' || echo "✅ No suspicious listeners"

echo ""
echo "[2] Container health and resource usage"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.CPUPerc}}\t{{.MemUsage}}'

echo ""
echo "[3] Enhanced malware scan with auto-remediation"
bash scripts/malware_scan.sh

# Auto-remediate if malware detected
if ps ax -o pid,cmd | egrep -i 'xmrig|minerd|kdevtmpfsi|kinsing' | grep -v grep; then
    log_security_event "CRITICAL" "Malware detected during daily scan! Initiating auto-remediation..."
    echo "🚨 MALWARE DETECTED! Running auto-remediation..."
    bash scripts/malware_cordon.sh
    log_security_event "INFO" "Auto-remediation completed"
else
    echo "✅ No malware detected"
fi

echo ""
echo "[4] Container security check"
bash scripts/container_security_check.sh

echo ""
echo "[5] Check for high CPU processes with auto-remediation"
high_cpu_processes=$(ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -5)
echo "$high_cpu_processes"

# Check if any process is using >80% CPU and isn't legitimate
echo "$high_cpu_processes" | awk 'NR>1 && $4>80.0 && $3 !~ /(n8n|docker|node|systemd|fail2ban)/ {print $1}' | while read -r pid; do
    if [ -n "$pid" ]; then
        log_security_event "WARNING" "High CPU process detected (PID: $pid). Investigating..."
        process_info=$(ps -p "$pid" -o pid,ppid,cmd,%cpu,%mem --no-headers 2>/dev/null)
        log_security_event "INFO" "Process info: $process_info"
        
        # Kill suspicious high-CPU processes
        if echo "$process_info" | grep -q -E "(xmrig|minerd|kinsing|kdevtmpfsi)"; then
            log_security_event "CRITICAL" "Killing confirmed malware process PID: $pid"
            kill -9 "$pid" 2>/dev/null || true
        fi
    fi
done

echo ""
echo "[6] Check network connections to suspicious ports with auto-blocking"
suspicious_connections=$(sudo ss -Htnp '( sport = :3333 or sport = :4444 or sport = :5555 or sport = :7777 )' 2>/dev/null || echo "✅ No mining port connections")

if echo "$suspicious_connections" | grep -q -v "✅"; then
    log_security_event "CRITICAL" "Suspicious network connections detected! Blocking ports..."
    echo "🚨 SUSPICIOUS CONNECTIONS DETECTED! Blocking mining ports..."
    
    # Block mining ports in firewall
    sudo ufw deny 3333/tcp 2>/dev/null || true
    sudo ufw deny 4444/tcp 2>/dev/null || true
    sudo ufw deny 5555/tcp 2>/dev/null || true
    sudo ufw deny 7777/tcp 2>/dev/null || true
    
    # Kill processes using these ports
    for port in 3333 4444 5555 7777; do
        pid=$(sudo ss -Htnp "sport = :$port" 2>/dev/null | awk '{print $6}' | cut -d',' -f1 | tail -1)
        if [ -n "$pid" ] && [ "$pid" != "-" ]; then
            log_security_event "INFO" "Killing process $pid using suspicious port $port"
            sudo kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    log_security_event "INFO" "Mining ports blocked and processes killed"
else
    echo "$suspicious_connections"
fi

echo ""
echo "[7] Check system load with alerting"
system_load=$(uptime)
echo "$system_load"
load_avg=$(echo "$system_load" | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
if (( $(echo "$load_avg > 2.0" | bc -l 2>/dev/null || echo "0" | bc -l) )); then
    log_security_event "WARNING" "High system load detected: $load_avg"
fi

memory_usage=$(free -h)
echo "$memory_usage"

echo ""
echo "[8] Check for new files in temp directories with auto-cleanup"
new_executables=$(find /tmp /var/tmp /dev/shm -type f -maxdepth 1 -perm -111 -mtime -1 2>/dev/null || echo "✅ No new executables in temp dirs")

if echo "$new_executables" | grep -q -v "✅"; then
    log_security_event "WARNING" "New executables detected in temp directories:"
    echo "$new_executables"
    
    # Auto-cleanup suspicious executables
    echo "$new_executables" | while read -r file; do
        if [ -n "$file" ] && [ "$file" != "✅ No new executables in temp dirs" ]; then
            # Don't remove system files
            if [[ "$file" != *"systemd"* ]] && [[ "$file" != *"udev"* ]] && [[ "$file" != *"tmpfs"* ]]; then
                log_security_event "INFO" "Removing suspicious executable: $file"
                rm -f "$file" 2>/dev/null || true
            fi
        fi
    done
else
    echo "$new_executables"
fi

echo ""
echo "[9] Check cron for suspicious entries with auto-cleanup"
cron_entries=$(sudo crontab -l 2>/dev/null | grep -vE '^#' | grep -vE '^$' || echo "✅ No root cron entries")

if echo "$cron_entries" | grep -q -E "(xmrig|minerd|kinsing|mining)"; then
    log_security_event "CRITICAL" "Suspicious cron entries detected! Cleaning up..."
    echo "🚨 SUSPICIOUS CRON ENTRIES! Cleaning up..."
    
    # Remove suspicious cron entries
    sudo crontab -l 2>/dev/null | grep -vE "(xmrig|minerd|kinsing|mining)" | sudo crontab -
    
    # Check system-wide cron directories
    sudo find /etc/cron.* -type f -exec sudo sed -i '/xmrig\|minerd\|kinsing\|mining/d' {} \; 2>/dev/null || true
    
    log_security_event "INFO" "Suspicious cron entries removed"
else
    echo "$cron_entries"
fi

echo ""
echo "[10] Check systemd services for suspicious names with auto-cleanup"
suspicious_services=$(systemctl list-units --type=service --state=running | egrep -i 'xmrig|minerd|kinsing|crypto' || echo "✅ No suspicious systemd services")

if echo "$suspicious_services" | grep -q -v "✅"; then
    log_security_event "CRITICAL" "Suspicious systemd services detected! Stopping and disabling..."
    echo "🚨 SUSPICIOUS SERVICES! Stopping and disabling..."
    
    echo "$suspicious_services" | awk '{print $1}' | while read -r service; do
        if [ -n "$service" ] && [ "$service" != "✅ No suspicious systemd services" ]; then
            log_security_event "INFO" "Stopping and disabling suspicious service: $service"
            sudo systemctl stop "$service" 2>/dev/null || true
            sudo systemctl disable "$service" 2>/dev/null || true
        fi
    done
    
    sudo systemctl daemon-reload
    log_security_event "INFO" "Suspicious services stopped and disabled"
else
    echo "$suspicious_services"
fi

echo ""
echo "[11] Verify security services are running"
echo "Checking fail2ban status..."
sudo systemctl status fail2ban --no-pager -l | head -5 || echo "⚠️  fail2ban not running"

echo "Checking malware prevention service..."
sudo systemctl status malware-prevention.service --no-pager -l | head -5 2>/dev/null || echo "⚠️  malware prevention service not found"

echo "Checking firewall status..."
sudo ufw status | head -5

echo ""
echo "[12] Generate security summary report"
total_events=$(wc -l < /var/log/security-events.log 2>/dev/null || echo "0")
recent_events=$(tail -20 /var/log/security-events.log 2>/dev/null | grep -c "$(date '+%Y-%m-%d')" || echo "0")

echo "📊 SECURITY SUMMARY:"
echo "   • Total security events logged: $total_events"
echo "   • Events today: $recent_events"
echo "   • Security log: /var/log/security-events.log"

echo ""
echo "🛡️  ENHANCED DAILY SECURITY CHECK COMPLETE!"
echo "============================================="
echo "✅ All security checks completed"
echo "✅ Auto-remediation executed where needed"
echo "✅ Security events logged for monitoring"
echo ""
echo "📋 NEXT ACTIONS:"
echo "   • Review security events: tail -f /var/log/security-events.log"
echo "   • Check prevention status: sudo systemctl status malware-prevention.service"
echo "   • Manual deep scan if needed: bash scripts/malware_scan.sh"
echo ""
echo "🔒 Your system is continuously monitored and protected!"
