#!/usr/bin/env bash
set -euo pipefail

# Crypto-mining monitoring script
# Run this every 5 minutes via cron: */5 * * * * /path/to/crypto_monitoring.sh

LOG_FILE="$HOME/crypto_monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=80
ALERT_THRESHOLD_NET=1000000  # 1MB/s

log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_cpu_spikes() {
    local cpu_usage=$(mpstat 1 1 | awk 'NR==4 {print 100-$12}')
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        log_with_timestamp "🚨 HIGH CPU ALERT: ${cpu_usage}%"
        
        # Get top CPU processes
        log_with_timestamp "Top CPU processes:"
        ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -10 | tee -a "$LOG_FILE"
        
        # Check for suspicious processes
        local suspicious=$(ps ax -o pid,cmd | egrep -i 'xmrig|minerd|kdevtmpfsi|kinsing|watchdogs|cryptonight|mrsho|zzh|sustse' || true)
        if [ -n "$suspicious" ]; then
            log_with_timestamp "🚨 SUSPICIOUS PROCESSES DETECTED:"
            echo "$suspicious" | tee -a "$LOG_FILE"
        fi
    fi
}

check_memory_usage() {
    local mem_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "$mem_usage > $ALERT_THRESHOLD_MEM" | bc -l) )); then
        log_with_timestamp "🚨 HIGH MEMORY ALERT: ${mem_usage}%"
    fi
}

check_network_anomalies() {
    # Check for connections to mining ports
    local mining_connections=$(sudo ss -Htnp '( sport = :3333 or sport = :4444 or sport = :5555 or sport = :7777 or sport = :8080 or sport = :9999 )' 2>/dev/null || true)
    if [ -n "$mining_connections" ]; then
        log_with_timestamp "🚨 MINING PORT CONNECTIONS DETECTED:"
        echo "$mining_connections" | tee -a "$LOG_FILE"
    fi
    
    # Check for high network usage
    local net_usage=$(cat /proc/net/dev | grep -v lo | awk '{sum+=$2+$10} END {print sum}')
    if [ -n "$net_usage" ] && [ "$net_usage" -gt "$ALERT_THRESHOLD_NET" ]; then
        log_with_timestamp "🚨 HIGH NETWORK USAGE: ${net_usage} bytes/s"
    fi
}

check_docker_containers() {
    # Check for containers with high resource usage
    local high_cpu_containers=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | awk 'NR>1 && $2+0 > 50 {print $0}' || true)
    if [ -n "$high_cpu_containers" ]; then
        log_with_timestamp "🚨 HIGH CPU CONTAINERS:"
        echo "$high_cpu_containers" | tee -a "$LOG_FILE"
    fi
    
    # Check for suspicious container processes
    docker ps --format "{{.Names}}" | while read container; do
        local suspicious_procs=$(docker exec "$container" sh -c "ps aux" 2>/dev/null | egrep -i 'xmrig|minerd|kdevtmpfsi|kinsing' || true)
        if [ -n "$suspicious_procs" ]; then
            log_with_timestamp "🚨 SUSPICIOUS PROCESSES IN CONTAINER $container:"
            echo "$suspicious_procs" | tee -a "$LOG_FILE"
        fi
    done
}

check_system_integrity() {
    # Check for new files in temp directories
    local new_executables=$(find /tmp /var/tmp /dev/shm -type f -maxdepth 1 -perm -111 -newer /tmp/.last_check 2>/dev/null || true)
    if [ -n "$new_executables" ]; then
        log_with_timestamp "🚨 NEW EXECUTABLES IN TEMP DIRS:"
        echo "$new_executables" | tee -a "$LOG_FILE"
    fi
    touch /tmp/.last_check
    
    # Check for cron changes
    local cron_changes=$(find /etc/cron* /var/spool/cron -type f -newer /tmp/.last_cron_check 2>/dev/null || true)
    if [ -n "$cron_changes" ]; then
        log_with_timestamp "🚨 CRON CHANGES DETECTED:"
        echo "$cron_changes" | tee -a "$LOG_FILE"
    fi
    touch /tmp/.last_cron_check
}

send_alert() {
    local message="$1"
    log_with_timestamp "ALERT: $message"
    
    # Send to Discord/Slack webhook if configured
    if [ -n "${DISCORD_WEBHOOK_URL:-}" ]; then
        curl -H "Content-Type: application/json" \
             -d "{\"content\":\"🚨 Crypto-mining alert: $message\"}" \
             "$DISCORD_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # Send email if configured
    if [ -n "${ALERT_EMAIL:-}" ] && command -v mail >/dev/null 2>&1; then
        echo "Crypto-mining alert: $message" | mail -s "Security Alert" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

# Main monitoring loop
main() {
    log_with_timestamp "Starting crypto-mining monitoring check..."
    
    check_cpu_spikes
    check_memory_usage
    check_network_anomalies
    check_docker_containers
    check_system_integrity
    
    # Check if any alerts were generated in the last run
    if tail -n 20 "$LOG_FILE" | grep -q "🚨"; then
        send_alert "Suspicious activity detected - check logs"
    fi
    
    log_with_timestamp "Monitoring check complete"
}

# Run main function
main "$@"
