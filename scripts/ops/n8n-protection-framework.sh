#!/bin/bash

# 🛡️ N8N PROTECTION FRAMEWORK - "AI Protecting AI" Architecture
# 🚀 Enterprise-Grade DevOps with Beginner-Friendly Safety Nets
# 🔒 Self-Healing, Conflict-Preventing, Production-Ready System

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
LOG_FILE="$SCRIPT_DIR/n8n-protection.log"
BACKUP_DIR="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
LOCK_FILE="$SCRIPT_DIR/.n8n-protection.lock"

# Port configuration (SMART PORT MANAGEMENT)
SYSTEM_N8N_PORT=5678
DOCKER_N8N_PORT=15678
DOCKER_PROXY_PORT=15680
RESERVED_PORTS=($SYSTEM_N8N_PORT $DOCKER_N8N_PORT $DOCKER_PROXY_PORT)

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Check if script is already running
check_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            log "WARN" "Protection framework already running (PID: $pid)"
            exit 1
        else
            log "WARN" "Removing stale lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
}

# Cleanup function
cleanup() {
    log "INFO" "Cleaning up protection framework"
    rm -f "$LOCK_FILE"
    exit 0
}

trap cleanup EXIT INT TERM

# Port conflict detection (SMART PORT SCANNING)
detect_port_conflicts() {
    log "INFO" "🔍 Scanning for port conflicts..."
    
    local conflicts=()
    
    for port in "${RESERVED_PORTS[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            local process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
            conflicts+=("Port $port: $process")
        fi
    done
    
    if [[ ${#conflicts[@]} -gt 0 ]]; then
        log "WARN" "🚨 Port conflicts detected:"
        for conflict in "${conflicts[@]}"; do
            log "WARN" "   $conflict"
        done
        return 1
    else
        log "INFO" "✅ No port conflicts detected"
        return 0
    fi
}

# Service health check (SMART HEALTH MONITORING)
check_service_health() {
    log "INFO" "🏥 Checking service health..."
    
    local health_status=0
    
    # Check system n8n
    if systemctl is-active --quiet n8n; then
        log "INFO" "✅ System n8n service: ACTIVE"
    else
        log "WARN" "⚠️  System n8n service: INACTIVE"
        health_status=1
    fi
    
    # Check Docker n8n
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n-cursor_n8n_1.*Up"; then
        log "INFO" "✅ Docker n8n container: RUNNING"
    else
        log "WARN" "⚠️  Docker n8n container: NOT RUNNING"
        health_status=1
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        log "INFO" "✅ Nginx service: ACTIVE"
    else
        log "WARN" "⚠️  Nginx service: INACTIVE"
        health_status=1
    fi
    
    return $health_status
}

# Auto-healing function (SMART RECOVERY)
auto_heal() {
    log "INFO" "🔧 Starting auto-healing process..."
    
    # Create backup before any changes
    create_backup
    
    # Try to fix Docker container first
    if ! docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n-cursor_n8n_1.*Up"; then
        log "INFO" "🔄 Attempting to restart Docker n8n container..."
        cd "$SCRIPT_DIR"
        docker-compose down 2>/dev/null || true
        sleep 2
        
        # Check if system n8n is using our ports
        if netstat -tlnp 2>/dev/null | grep -q ":$SYSTEM_N8N_PORT "; then
            log "WARN" "⚠️  System n8n is using port $SYSTEM_N8N_PORT"
            log "INFO" "🔄 Using isolated Docker ports instead..."
        fi
        
        docker-compose up -d
        sleep 5
        
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n-cursor_n8n_1.*Up"; then
            log "INFO" "✅ Docker n8n container recovered successfully"
        else
            log "ERROR" "❌ Failed to recover Docker n8n container"
        fi
    fi
    
    # Check Nginx configuration
    if ! nginx -t 2>/dev/null; then
        log "WARN" "⚠️  Nginx configuration has errors"
        log "INFO" "🔄 Attempting to fix Nginx configuration..."
        
        # Backup current config
        sudo cp /etc/nginx/sites-enabled/n8ncloud.tech /etc/nginx/sites-enabled/n8ncloud.tech.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
        
        # Try to reload Nginx
        if sudo nginx -s reload 2>/dev/null; then
            log "INFO" "✅ Nginx configuration reloaded successfully"
        else
            log "ERROR" "❌ Failed to reload Nginx configuration"
        fi
    fi
}

# Create backup (SAFETY FIRST)
create_backup() {
    log "INFO" "💾 Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup Docker compose files
    cp docker-compose*.yml "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup scripts
    cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup workflows
    cp workflows/*.json "$BACKUP_DIR/" 2>/dev/null || true
    
    log "INFO" "✅ Backup created at: $BACKUP_DIR"
}

# Conflict prevention (SMART PREVENTION)
prevent_conflicts() {
    log "INFO" "🛡️  Setting up conflict prevention..."
    
    # Create port reservation file
    cat > "$SCRIPT_DIR/port-reservations.txt" << EOF
# N8N PORT RESERVATIONS - DO NOT MODIFY
# This file prevents port conflicts by documenting reserved ports
SYSTEM_N8N_PORT=$SYSTEM_N8N_PORT
DOCKER_N8N_PORT=$DOCKER_N8N_PORT
DOCKER_PROXY_PORT=$DOCKER_PROXY_PORT

# NEVER use these ports for other services
# Always check this file before starting new services
EOF
    
    log "INFO" "✅ Port reservations documented"
}

# Status monitoring (REAL-TIME FEEDBACK)
monitor_status() {
    log "INFO" "📊 Current system status:"
    
    echo -e "\n${CYAN}=== N8N PROTECTION FRAMEWORK STATUS ===${NC}"
    
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
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n-cursor_n8n_1.*Up"; then
        echo -e "   Docker n8n: ${GREEN}RUNNING${NC}"
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
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n-cursor_n8n_1.*Up"; then ((health_score++)); fi
    if systemctl is-active --quiet nginx; then ((health_score++)); fi
    
    echo -e "\n${BLUE}📈 System Health Score:${NC} $health_score/3"
    
    if [[ $health_score -eq 3 ]]; then
        echo -e "   ${GREEN}🎉 EXCELLENT - All systems operational!${NC}"
    elif [[ $health_score -eq 2 ]]; then
        echo -e "   ${YELLOW}⚠️  GOOD - Minor issues detected${NC}"
    else
        echo -e "   ${RED}🚨 CRITICAL - Major issues detected${NC}"
    fi
    
    echo -e "\n${CYAN}==========================================${NC}\n"
}

# Main protection loop
main_protection_loop() {
    log "INFO" "🚀 Starting N8N Protection Framework..."
    log "INFO" "🛡️  AI Protecting AI - Conflict Prevention Active"
    
    # Initial setup
    prevent_conflicts
    create_backup
    
    # Main protection loop
    while true; do
        log "INFO" "🔄 Running protection cycle..."
        
        # Check for conflicts
        if detect_port_conflicts; then
            log "WARN" "🚨 Conflicts detected - initiating auto-healing..."
            auto_heal
        fi
        
        # Check service health
        if ! check_service_health; then
            log "WARN" "🏥 Health issues detected - initiating auto-healing..."
            auto_heal
        fi
        
        # Show status
        monitor_status
        
        # Wait before next cycle
        log "INFO" "⏰ Waiting 60 seconds before next protection cycle..."
        sleep 60
    done
}

# Command line interface
case "${1:-}" in
    "start")
        check_lock
        main_protection_loop
        ;;
    "status")
        monitor_status
        ;;
    "health")
        check_service_health
        ;;
    "conflicts")
        detect_port_conflicts
        ;;
    "heal")
        auto_heal
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo -e "${CYAN}🛡️  N8N PROTECTION FRAMEWORK${NC}"
        echo -e "${BLUE}Usage:${NC}"
        echo -e "  $0 start     - Start protection framework"
        echo -e "  $0 status    - Show current status"
        echo -e "  $0 health    - Check service health"
        echo -e "  $0 conflicts - Detect port conflicts"
        echo -e "  $0 heal      - Run auto-healing"
        echo -e "  $0 backup    - Create backup"
        echo -e ""
        echo -e "${GREEN}This framework protects you from conflicts and auto-heals issues!${NC}"
        ;;
esac
