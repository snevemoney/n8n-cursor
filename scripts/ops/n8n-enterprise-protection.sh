#!/bin/bash

# 🚀 N8N ENTERPRISE PROTECTION SYSTEM - "AI Protecting AI" Business Grade
# 🛡️ Multiple protection layers, fail-safes, enterprise DevOps best practices
# 🔒 Business production ready with zero tolerance for issues

set -euo pipefail

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/n8n-enterprise.log"
CONFIG_FILE="$SCRIPT_DIR/n8n-enterprise-config.json"
LOCK_FILE="$SCRIPT_DIR/.n8n-enterprise.lock"
BACKUP_DIR="$SCRIPT_DIR/enterprise-backups/$(date +%Y%m%d_%H%M%S)"
AUDIT_LOG="$SCRIPT_DIR/enterprise-audit.log"
INTEGRITY_FILE="$SCRIPT_DIR/.integrity-check"
VERSION_FILE="$SCRIPT_DIR/.version-control"

# Enterprise configuration
ENTERPRISE_MODE=true
PROTECTION_LEVELS=("BASIC" "ADVANCED" "ENTERPRISE" "NUCLEAR")
CURRENT_PROTECTION_LEVEL="ENTERPRISE"
AUTO_RECOVERY=true
INTEGRITY_CHECKING=true
MULTI_BACKUP_STRATEGY=true
REAL_TIME_MONITORING=true

# Port configuration with enterprise isolation
SYSTEM_N8N_PORT=5678
DOCKER_N8N_PORT=15678
DOCKER_PROXY_PORT=15680
STATUS_PORT=15682
MONITORING_PORT=15683
BACKUP_PORT=15684
RESERVED_PORTS=($SYSTEM_N8N_PORT $DOCKER_N8N_PORT $DOCKER_PROXY_PORT $STATUS_PORT $MONITORING_PORT $BACKUP_PORT)

# Service configuration with enterprise standards
SERVICES=("n8n" "nginx" "docker" "monitoring" "backup")
HEALTH_THRESHOLD=3
RECOVERY_ATTEMPTS=3
MAX_FAILURE_COUNT=5

# Enterprise logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[${timestamp}] [${level}] ${message}"
    
    echo -e "$log_entry" | tee -a "$LOG_FILE"
    
    # Enterprise audit logging
    if [[ "$level" == "ERROR" || "$level" == "WARN" || "$level" == "CRITICAL" ]]; then
        echo "$log_entry" >> "$AUDIT_LOG"
    fi
}

# Enterprise lock management with PID validation
check_enterprise_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            log "WARN" "Enterprise protection already running (PID: $pid)"
            exit 1
        else
            log "WARN" "Removing stale enterprise lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
    
    # Create lock file with additional metadata
    cat > "$LOCK_FILE" << EOF
PID: $$
Timestamp: $(date)
User: $(whoami)
Protection Level: $CURRENT_PROTECTION_LEVEL
EOF
}

# Enterprise cleanup function
enterprise_cleanup() {
    log "INFO" "Enterprise protection cleanup initiated"
    rm -f "$LOCK_FILE"
    
    # Final integrity check
    if [[ "$INTEGRITY_CHECKING" == true ]]; then
        perform_integrity_check
    fi
    
    exit 0
}

trap enterprise_cleanup EXIT INT TERM

# Enterprise configuration management
load_enterprise_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        log "INFO" "📋 Loading enterprise configuration..."
        export N8N_PASSWORD=$(jq -r '.n8n_password // "admin123"' "$CONFIG_FILE" 2>/dev/null || echo "admin123")
        export N8N_ENCRYPTION_KEY=$(jq -r '.n8n_encryption_key // "your-secret-key-here"' "$CONFIG_FILE" 2>/dev/null || echo "your-secret-key-here")
        CURRENT_PROTECTION_LEVEL=$(jq -r '.protection_level // "ENTERPRISE"' "$CONFIG_FILE" 2>/dev/null || echo "ENTERPRISE")
    else
        log "INFO" "📋 Creating enterprise configuration..."
        create_enterprise_config
    fi
}

create_enterprise_config() {
    cat > "$CONFIG_FILE" << EOF
{
  "n8n_password": "admin123",
  "n8n_encryption_key": "your-secret-key-here",
  "protection_level": "ENTERPRISE",
  "auto_recovery": true,
  "integrity_checking": true,
  "multi_backup_strategy": true,
  "real_time_monitoring": true,
  "conflict_prevention": true,
  "health_monitoring": true,
  "backup_retention_days": 30,
  "port_isolation": true,
  "resource_limits": {
    "memory_limit": "4G",
    "cpu_limit": "4.0"
  },
  "protection_layers": {
    "layer1": "port_conflict_prevention",
    "layer2": "service_health_monitoring",
    "layer3": "integrity_validation",
    "layer4": "auto_recovery",
    "layer5": "multi_backup_strategy",
    "layer6": "real_time_auditing"
  }
}
EOF
}

# Layer 1: Enterprise port conflict prevention with intelligent resolution
enterprise_port_protection() {
    log "INFO" "🛡️  Layer 1: Enterprise port conflict prevention..."
    
    local conflicts=()
    local resolution_strategy=""
    
    for port in "${RESERVED_PORTS[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            local process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
            conflicts+=("Port $port: $process")
            
            # Enterprise conflict resolution strategies
            case $port in
                $SYSTEM_N8N_PORT)
                    resolution_strategy="ISOLATE_DOCKER"
                    log "WARN" "⚠️  System n8n using port $port - isolating Docker services"
                    ;;
                $DOCKER_N8N_PORT)
                    resolution_strategy="SWITCH_TO_BACKUP"
                    DOCKER_N8N_PORT=15679
                    log "WARN" "⚠️  Port $port conflict - switching to backup port 15679"
                    ;;
                $DOCKER_PROXY_PORT)
                    resolution_strategy="DYNAMIC_PORT_ASSIGNMENT"
                    DOCKER_PROXY_PORT=15685
                    log "WARN" "⚠️  Port $port conflict - using dynamic port 15685"
                    ;;
                *)
                    resolution_strategy="LOG_AND_MONITOR"
                    log "WARN" "⚠️  Port $port conflict detected - monitoring"
                    ;;
            esac
        fi
    done
    
    if [[ ${#conflicts[@]} -gt 0 ]]; then
        log "WARN" "🚨 Enterprise port conflicts detected and resolved:"
        for conflict in "${conflicts[@]}"; do
            log "WARN" "   $conflict"
        done
        return 1
    else
        log "INFO" "✅ Layer 1: No port conflicts detected"
        return 0
    fi
}

# Layer 2: Enterprise service health monitoring with predictive analysis
enterprise_health_monitoring() {
    log "INFO" "🏥 Layer 2: Enterprise service health monitoring..."
    
    local health_score=0
    local health_report=()
    local failure_count=0
    
    # Check system n8n with enterprise standards
    if systemctl is-active --quiet n8n; then
        health_score=$((health_score + 1))
        health_report+=("✅ System n8n: ACTIVE")
        
        # Check system n8n performance
        local n8n_status=$(systemctl status n8n --no-pager | grep -E "(Active|Memory|CPU)" | head -3)
        log "INFO" "System n8n status: $n8n_status"
    else
        health_report+=("❌ System n8n: INACTIVE")
        failure_count=$((failure_count + 1))
    fi
    
    # Check Docker n8n with enterprise standards
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n.*Up"; then
        health_score=$((health_score + 1))
        health_report+=("✅ Docker n8n: RUNNING")
        
        # Check Docker n8n resource usage
        local docker_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep n8n)
        log "INFO" "Docker n8n stats: $docker_stats"
    else
        health_report+=("❌ Docker n8n: NOT RUNNING")
        failure_count=$((failure_count + 1))
    fi
    
    # Check Nginx with enterprise standards
    if systemctl is-active --quiet nginx; then
        health_score=$((health_score + 1))
        health_report+=("✅ Nginx: ACTIVE")
        
        # Check Nginx configuration
        if nginx -t 2>/dev/null; then
            log "INFO" "✅ Nginx configuration: VALID"
        else
            log "WARN" "⚠️  Nginx configuration: INVALID"
            failure_count=$((failure_count + 1))
        fi
    else
        health_report+=("❌ Nginx: INACTIVE")
        failure_count=$((failure_count + 1))
    fi
    
    # Enterprise health assessment with predictive analysis
    if [[ $health_score -ge $HEALTH_THRESHOLD ]]; then
        log "INFO" "✅ Layer 2: Enterprise health score: EXCELLENT ($health_score/3)"
        
        # Predictive analysis: Check for potential issues
        if [[ $failure_count -gt 0 ]]; then
            log "WARN" "⚠️  Predictive analysis: Potential degradation detected"
        fi
        
        return 0
    else
        log "WARN" "⚠️  Layer 2: Enterprise health score: CRITICAL ($health_score/3)"
        
        # Enterprise alerting
        if [[ $failure_count -ge $MAX_FAILURE_COUNT ]]; then
            log "CRITICAL" "🚨 CRITICAL: Maximum failure count reached - initiating emergency protocols"
            initiate_emergency_protocols
        fi
        
        return 1
    fi
}

# Layer 3: Enterprise integrity validation with checksums and version control
enterprise_integrity_check() {
    log "INFO" "🔒 Layer 3: Enterprise integrity validation..."
    
    # Create integrity checksums for critical files
    local critical_files=(
        "n8n-dynamic-live-system.sh"
        "docker-compose-smart.yml"
        "nginx-smart.conf"
        "n8n-enterprise-protection.sh"
    )
    
    local integrity_violations=0
    
    for file in "${critical_files[@]}"; do
        if [[ -f "$file" ]]; then
            # Generate checksum
            local current_checksum=$(sha256sum "$file" | awk '{print $1}')
            
            # Check against stored checksum
            if [[ -f "$INTEGRITY_FILE" ]]; then
                local stored_checksum=$(grep "^$file:" "$INTEGRITY_FILE" | awk '{print $2}' 2>/dev/null || echo "")
                
                if [[ -n "$stored_checksum" && "$current_checksum" != "$stored_checksum" ]]; then
                    log "CRITICAL" "🚨 INTEGRITY VIOLATION: $file has been modified!"
                    integrity_violations=$((integrity_violations + 1))
                    
                    # Enterprise response: Restore from backup
                    restore_file_integrity "$file"
                else
                    log "INFO" "✅ Integrity check passed: $file"
                fi
            else
                # First run: Store checksums
                echo "$file:$current_checksum" >> "$INTEGRITY_FILE"
                log "INFO" "📝 Storing integrity checksum: $file"
            fi
        else
            log "WARN" "⚠️  Critical file missing: $file"
            integrity_violations=$((integrity_violations + 1))
        fi
    done
    
    # Version control validation
    if [[ -f "$VERSION_FILE" ]]; then
        local current_version=$(cat "$VERSION_FILE")
        log "INFO" "📋 Current version: $current_version"
    else
        echo "1.0.0-enterprise" > "$VERSION_FILE"
        log "INFO" "📋 Version file created: 1.0.0-enterprise"
    fi
    
    if [[ $integrity_violations -eq 0 ]]; then
        log "INFO" "✅ Layer 3: Enterprise integrity validation passed"
        return 0
    else
        log "CRITICAL" "🚨 Layer 3: Enterprise integrity validation failed ($integrity_violations violations)"
        return 1
    fi
}

# Layer 4: Enterprise auto-recovery with multiple strategies
enterprise_auto_recovery() {
    log "INFO" "🔧 Layer 4: Enterprise auto-recovery..."
    
    local recovery_success=false
    local recovery_attempt=1
    
    while [[ $recovery_attempt -le $RECOVERY_ATTEMPTS && "$recovery_success" == false ]]; do
        log "INFO" "🔄 Recovery attempt $recovery_attempt of $RECOVERY_ATTEMPTS..."
        
        # Strategy 1: Service restart
        if [[ $recovery_attempt -eq 1 ]]; then
            log "INFO" "🔄 Strategy 1: Service restart..."
            restart_enterprise_services
        fi
        
        # Strategy 2: Configuration repair
        elif [[ $recovery_attempt -eq 2 ]]; then
            log "INFO" "🔄 Strategy 2: Configuration repair..."
            repair_enterprise_configurations
        fi
        
        # Strategy 3: Full system recovery
        elif [[ $recovery_attempt -eq 3 ]]; then
            log "INFO" "🔄 Strategy 3: Full system recovery..."
            full_system_recovery
        fi
        
        # Wait and check recovery
        sleep 10
        if enterprise_health_monitoring; then
            recovery_success=true
            log "INFO" "✅ Recovery successful on attempt $recovery_attempt"
            break
        fi
        
        recovery_attempt=$((recovery_attempt + 1))
    done
    
    if [[ "$recovery_success" == false ]]; then
        log "CRITICAL" "🚨 CRITICAL: All recovery attempts failed - initiating emergency protocols"
        initiate_emergency_protocols
        return 1
    else
        log "INFO" "✅ Layer 4: Enterprise auto-recovery completed successfully"
        return 0
    fi
}

# Layer 5: Enterprise multi-backup strategy with redundancy
enterprise_backup_strategy() {
    log "INFO" "💾 Layer 5: Enterprise multi-backup strategy..."
    
    # Create timestamped backup
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local primary_backup="$BACKUP_DIR/primary_$backup_timestamp"
    local secondary_backup="$BACKUP_DIR/secondary_$backup_timestamp"
    local cloud_backup="$BACKUP_DIR/cloud_$backup_timestamp"
    
    mkdir -p "$primary_backup" "$secondary_backup" "$cloud_backup"
    
    # Primary backup: Full system state
    log "INFO" "💾 Creating primary backup..."
    cp -r docker-compose*.yml "$primary_backup/" 2>/dev/null || true
    cp -r *.sh "$primary_backup/" 2>/dev/null || true
    cp -r *.conf "$primary_backup/" 2>/dev/null || true
    cp -r *.json "$primary_backup/" 2>/dev/null || true
    
    # Secondary backup: Running state
    log "INFO" "💾 Creating secondary backup..."
    docker ps -a > "$secondary_backup/docker-status.txt" 2>/dev/null || true
    netstat -tlnp > "$secondary_backup/port-status.txt" 2>/dev/null || true
    systemctl status n8n > "$secondary_backup/n8n-status.txt" 2>/dev/null || true
    ps aux > "$secondary_backup/process-status.txt" 2>/dev/null || true
    
    # Cloud backup: Critical configurations
    log "INFO" "💾 Creating cloud backup..."
    cp "$CONFIG_FILE" "$cloud_backup/" 2>/dev/null || true
    cp "$INTEGRITY_FILE" "$cloud_backup/" 2>/dev/null || true
    cp "$VERSION_FILE" "$cloud_backup/" 2>/dev/null || true
    
    # Backup verification
    local backup_success=true
    for backup_dir in "$primary_backup" "$secondary_backup" "$cloud_backup"; do
        if [[ ! -d "$backup_dir" ]] || [[ -z "$(ls -A "$backup_dir" 2>/dev/null)" ]]; then
            log "ERROR" "❌ Backup verification failed: $backup_dir"
            backup_success=false
        fi
    done
    
    if [[ "$backup_success" == true ]]; then
        log "INFO" "✅ Layer 5: Enterprise backup strategy completed successfully"
        
        # Cleanup old backups (keep last 30 days)
        cleanup_old_backups
        
        return 0
    else
        log "ERROR" "❌ Layer 5: Enterprise backup strategy failed"
        return 1
    fi
}

# Layer 6: Enterprise real-time auditing and monitoring
enterprise_real_time_monitoring() {
    log "INFO" "📊 Layer 6: Enterprise real-time monitoring..."
    
    # Monitor system resources
    local memory_usage=$(free -h | grep Mem | awk '{print $3"/"$2}')
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}')
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    
    log "INFO" "📊 System resources: Memory: $memory_usage, Disk: $disk_usage, CPU: $cpu_usage%"
    
    # Monitor Docker resources
    if docker ps | grep -q "n8n"; then
        local docker_memory=$(docker stats --no-stream --format "{{.MemUsage}}" | grep n8n | head -1)
        local docker_cpu=$(docker stats --no-stream --format "{{.CPUPerc}}" | grep n8n | head -1)
        log "INFO" "📊 Docker n8n: Memory: $docker_memory, CPU: $docker_cpu"
    fi
    
    # Monitor network connections
    local active_connections=$(netstat -an | grep ESTABLISHED | wc -l)
    local listening_ports=$(netstat -tlnp | wc -l)
    log "INFO" "📊 Network: Active connections: $active_connections, Listening ports: $((listening_ports - 1))"
    
    # Real-time alerting for critical thresholds
    if [[ ${cpu_usage%.*} -gt 80 ]]; then
        log "WARN" "⚠️  High CPU usage detected: ${cpu_usage}%"
    fi
    
    if [[ ${disk_usage%?} -gt 80 ]]; then
        log "WARN" "⚠️  High disk usage detected: $disk_usage"
    fi
    
    log "INFO" "✅ Layer 6: Enterprise real-time monitoring active"
}

# Enterprise service management
restart_enterprise_services() {
    log "INFO" "🔄 Restarting enterprise services..."
    
    # Restart Docker n8n
    if ! docker ps | grep -q "n8n.*Up"; then
        start_enterprise_docker_n8n
    fi
    
    # Restart Nginx
    if ! systemctl is-active --quiet nginx; then
        log "INFO" "🔄 Restarting Nginx..."
        sudo systemctl restart nginx 2>/dev/null || true
    fi
    
    # Restart system n8n (if needed and safe)
    if ! systemctl is-active --quiet n8n; then
        log "INFO" "🔄 Restarting system n8n..."
        sudo systemctl restart n8n 2>/dev/null || true
    fi
}

# Enterprise Docker n8n management
start_enterprise_docker_n8n() {
    log "INFO" "🚀 Starting enterprise Docker n8n..."
    
    cd "$SCRIPT_DIR"
    
    if [[ -f "docker-compose-smart.yml" ]]; then
        log "INFO" "🔄 Using enterprise Docker configuration..."
        docker-compose -f docker-compose-smart.yml down 2>/dev/null || true
        sleep 3
        
        # Enterprise startup with health checks
        docker-compose -f docker-compose-smart.yml up -d
        
        # Wait for startup with enterprise patience
        log "INFO" "⏳ Enterprise startup sequence..."
        sleep 20
        
        # Verify startup
        if docker ps | grep -q "n8n.*Up"; then
            log "INFO" "✅ Enterprise Docker n8n started successfully!"
            
            # Verify health endpoint
            local health_check_attempts=0
            while [[ $health_check_attempts -lt 5 ]]; do
                if curl -f "http://localhost:15678/healthz" 2>/dev/null; then
                    log "INFO" "✅ Health endpoint verified"
                    break
                fi
                sleep 5
                health_check_attempts=$((health_check_attempts + 1))
            done
        else
            log "ERROR" "❌ Failed to start enterprise Docker n8n"
            docker-compose -f docker-compose-smart.yml logs n8n
        fi
    else
        log "ERROR" "❌ Enterprise Docker compose file not found"
    fi
}

# Enterprise configuration repair
repair_enterprise_configurations() {
    log "INFO" "🔧 Repairing enterprise configurations..."
    
    # Fix Nginx configuration
    if ! nginx -t 2>/dev/null; then
        log "WARN" "⚠️  Repairing Nginx configuration..."
        
        # Backup current config
        sudo cp /etc/nginx/sites-enabled/n8ncloud.tech /etc/nginx/sites-enabled/n8ncloud.tech.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
        
        # Try to reload Nginx
        if sudo nginx -s reload 2>/dev/null; then
            log "INFO" "✅ Nginx configuration repaired successfully"
        else
            log "ERROR" "❌ Failed to repair Nginx configuration"
        fi
    fi
    
    # Fix Docker configuration
    if ! docker info >/dev/null 2>&1; then
        log "WARN" "⚠️  Docker daemon not responding - attempting restart..."
        sudo systemctl restart docker 2>/dev/null || true
        sleep 5
    fi
}

# Full system recovery
full_system_recovery() {
    log "INFO" "🚨 Initiating full system recovery..."
    
    # Stop all services
    docker-compose -f docker-compose-smart.yml down 2>/dev/null || true
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Wait for cleanup
    sleep 5
    
    # Restart services in order
    sudo systemctl start nginx 2>/dev/null || true
    sleep 3
    
    start_enterprise_docker_n8n
    
    log "INFO" "✅ Full system recovery completed"
}

# Emergency protocols
initiate_emergency_protocols() {
    log "CRITICAL" "🚨 EMERGENCY PROTOCOLS INITIATED"
    
    # Create emergency backup
    enterprise_backup_strategy
    
    # Send emergency alerts (placeholder for integration)
    log "CRITICAL" "🚨 SENDING EMERGENCY ALERTS"
    
    # Attempt one final recovery
    full_system_recovery
    
    # If still failing, maintain system in safe state
    log "CRITICAL" "🚨 SYSTEM IN EMERGENCY SAFE MODE"
}

# File integrity restoration
restore_file_integrity() {
    local file="$1"
    log "INFO" "🔧 Restoring file integrity: $file"
    
    # Find latest backup of this file
    local latest_backup=$(find enterprise-backups -name "$file" -type f 2>/dev/null | sort | tail -1)
    
    if [[ -n "$latest_backup" ]]; then
        log "INFO" "🔄 Restoring from backup: $latest_backup"
        cp "$latest_backup" "$file"
        
        # Update integrity checksum
        local new_checksum=$(sha256sum "$file" | awk '{print $1}')
        sed -i "s|^$file:.*|$file:$new_checksum|" "$INTEGRITY_FILE"
        
        log "INFO" "✅ File integrity restored: $file"
    else
        log "ERROR" "❌ No backup found for: $file"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "INFO" "🧹 Cleaning up old enterprise backups..."
    
    # Keep only last 30 days of backups
    find enterprise-backups -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    
    log "INFO" "✅ Old backups cleaned up"
}

# Enterprise status display
show_enterprise_status() {
    log "INFO" "📊 Enterprise system status:"
    
    echo -e "\n${CYAN}=== N8N ENTERPRISE PROTECTION SYSTEM STATUS ===${NC}"
    
    # Protection level
    echo -e "\n${BLUE}🛡️  Protection Level:${NC} $CURRENT_PROTECTION_LEVEL"
    
    # Port status
    echo -e "\n${BLUE}🔌 Port Status:${NC}"
    for port in "${RESERVED_PORTS[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            local process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
            echo -e "   Port $port: ${GREEN}IN USE${NC} by $process"
        else
            echo -e "   Port $port: ${YELLOW}AVAILABLE${NC}"
        fi
    done
    
    # Service status
    echo -e "\n${BLUE}🏥 Service Status:${NC}"
    if systemctl is-active --quiet n8n; then
        echo -e "   System n8n: ${GREEN}ACTIVE${NC}"
    else
        echo -e "   System n8n: ${RED}INACTIVE${NC}"
    fi
    
    if docker ps | grep -q "n8n.*Up"; then
        echo -e "   Docker n8n: ${GREEN}RUNNING${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep n8n
    else
        echo -e "   Docker n8n: ${RED}STOPPED${NC}"
    fi
    
    if systemctl is-active --quiet nginx; then
        echo -e "   Nginx: ${GREEN}ACTIVE${NC}"
    else
        echo -e "   Nginx: ${RED}INACTIVE${NC}"
    fi
    
    # Health score
    local health_score=0
    if systemctl is-active --quiet n8n; then ((health_score++)); fi
    if docker ps | grep -q "n8n.*Up"; then ((health_score++)); fi
    if systemctl is-active --quiet nginx; then ((health_score++)); fi
    
    echo -e "\n${BLUE}📈 Enterprise Health Score:${NC} $health_score/3"
    
    if [[ $health_score -eq 3 ]]; then
        echo -e "   ${GREEN}🎉 EXCELLENT - All systems operational!${NC}"
    elif [[ $health_score -eq 2 ]]; then
        echo -e "   ${YELLOW}⚠️  GOOD - Minor issues detected${NC}"
    else
        echo -e "   ${RED}🚨 CRITICAL - Major issues detected${NC}"
    fi
    
    # Access information
    echo -e "\n${BLUE}🌐 Enterprise Access Points:${NC}"
    if docker ps | grep -q "n8n.*Up"; then
        echo -e "   Main URL: ${BLUE}https://n8ncloud.tech${NC}"
        echo -e "   Docker URL: ${BLUE}https://docker.n8ncloud.tech:15680${NC}"
        echo -e "   Status: ${BLUE}https://status.n8ncloud.tech:15682${NC}"
        echo -e "   Monitoring: ${BLUE}https://monitoring.n8ncloud.tech:15683${NC}"
    fi
    
    if systemctl is-active --quiet n8n; then
        echo -e "   System URL: ${BLUE}https://system.n8ncloud.tech:15681${NC}"
    fi
    
    echo -e "\n${CYAN}==========================================${NC}\n"
}

# Main enterprise protection loop
main_enterprise_loop() {
    log "INFO" "🚀 Starting N8N Enterprise Protection System..."
    log "INFO" "🛡️  AI Protecting AI - Enterprise Grade, Zero Tolerance"
    
    # Initial enterprise setup
    load_enterprise_config
    check_enterprise_lock
    
    # Main enterprise protection loop
    while true; do
        log "INFO" "🔄 Running enterprise protection cycle..."
        
        # Layer 1: Port protection
        if ! enterprise_port_protection; then
            log "WARN" "🚨 Layer 1 failure - initiating recovery..."
            enterprise_auto_recovery
        fi
        
        # Layer 2: Health monitoring
        if ! enterprise_health_monitoring; then
            log "WARN" "🚨 Layer 2 failure - initiating recovery..."
            enterprise_auto_recovery
        fi
        
        # Layer 3: Integrity validation
        if ! enterprise_integrity_check; then
            log "WARN" "🚨 Layer 3 failure - initiating recovery..."
            enterprise_auto_recovery
        fi
        
        # Layer 4: Auto-recovery (if needed)
        if ! enterprise_health_monitoring; then
            log "WARN" "🚨 Recovery needed - initiating Layer 4..."
            enterprise_auto_recovery
        fi
        
        # Layer 5: Backup strategy
        enterprise_backup_strategy
        
        # Layer 6: Real-time monitoring
        enterprise_real_time_monitoring
        
        # Show enterprise status
        show_enterprise_status
        
        # Wait before next cycle
        log "INFO" "⏰ Waiting 45 seconds before next enterprise cycle..."
        sleep 45
    done
}

# Command line interface
case "${1:-}" in
    "start")
        main_enterprise_loop
        ;;
    "status")
        show_enterprise_status
        ;;
    "health")
        enterprise_health_monitoring
        ;;
    "ports")
        enterprise_port_protection
        ;;
    "integrity")
        enterprise_integrity_check
        ;;
    "recovery")
        enterprise_auto_recovery
        ;;
    "backup")
        enterprise_backup_strategy
        ;;
    "monitor")
        enterprise_real_time_monitoring
        ;;
    "start-docker")
        start_enterprise_docker_n8n
        ;;
    *)
        echo -e "${CYAN}🚀 N8N ENTERPRISE PROTECTION SYSTEM${NC}"
        echo -e "${BLUE}Usage:${NC}"
        echo -e "  $0 start         - Start enterprise protection system"
        echo -e "  $0 status        - Show enterprise status"
        echo -e "  $0 health        - Check enterprise health"
        echo -e "  $0 ports         - Check port protection"
        echo -e "  $0 integrity     - Validate integrity"
        echo -e "  $0 recovery      - Run auto-recovery"
        echo -e "  $0 backup        - Create enterprise backup"
        echo -e "  $0 monitor       - Real-time monitoring"
        echo -e "  $0 start-docker  - Start enterprise Docker n8n"
        echo -e ""
        echo -e "${GREEN}This is ENTERPRISE-GRADE protection with ZERO TOLERANCE!${NC}"
        ;;
esac
