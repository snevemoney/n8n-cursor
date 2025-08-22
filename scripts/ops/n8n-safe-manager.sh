#!/bin/bash

# 🚀 N8N SAFE MANAGER - "AI Protecting AI" for Beginners
# 🛡️ Safe, non-destructive management of your n8n stack
# 🔒 Never breaks anything - always keeps you in control

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
LOG_FILE="$SCRIPT_DIR/n8n-manager.log"
BACKUP_DIR="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Safe backup function
safe_backup() {
    log "INFO" "💾 Creating safe backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current state
    cp docker-compose*.yml "$BACKUP_DIR/" 2>/dev/null || true
    cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
    cp workflows/*.json "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup current running state
    docker ps -a > "$BACKUP_DIR/docker-status.txt" 2>/dev/null || true
    netstat -tlnp > "$BACKUP_DIR/port-status.txt" 2>/dev/null || true
    
    log "INFO" "✅ Safe backup created at: $BACKUP_DIR"
}

# Safe status check
safe_status() {
    log "INFO" "📊 Checking safe status..."
    
    echo -e "\n${CYAN}=== N8N SAFE STATUS CHECK ===${NC}"
    
    # Docker status
    echo -e "\n${BLUE}🐳 Docker Status:${NC}"
    if docker ps | grep -q "n8n"; then
        echo -e "   ${GREEN}✅ Docker n8n: RUNNING${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep n8n
    else
        echo -e "   ${RED}❌ Docker n8n: NOT RUNNING${NC}"
    fi
    
    # Port status
    echo -e "\n${BLUE}🔌 Port Status:${NC}"
    local ports=(5678 15678 15679 15680)
    for port in "${ports[@]}"; do
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
    
    if systemctl is-active --quiet nginx; then
        echo -e "   Nginx: ${GREEN}ACTIVE${NC}"
    else
        echo -e "   Nginx: ${RED}INACTIVE${NC}"
    fi
    
    echo -e "\n${CYAN}==============================${NC}\n"
}

# Safe Docker start
safe_docker_start() {
    log "INFO" "🚀 Starting Docker n8n safely..."
    
    # Create backup first
    safe_backup
    
    # Check for conflicts
    if netstat -tlnp 2>/dev/null | grep -q ":15678 "; then
        log "WARN" "⚠️  Port 15678 is already in use"
        log "INFO" "🔄 Using alternative port configuration..."
    fi
    
    # Start Docker services
    cd "$SCRIPT_DIR"
    if [[ -f "docker-compose-smart.yml" ]]; then
        log "INFO" "🔄 Using smart Docker configuration..."
        docker-compose -f docker-compose-smart.yml up -d
    else
        log "INFO" "🔄 Using standard Docker configuration..."
        docker-compose up -d
    fi
    
    # Wait for startup
    log "INFO" "⏳ Waiting for n8n to start..."
    sleep 10
    
    # Check status
    if docker ps | grep -q "n8n.*Up"; then
        log "INFO" "✅ Docker n8n started successfully!"
        safe_status
    else
        log "ERROR" "❌ Failed to start Docker n8n"
        docker-compose logs n8n
    fi
}

# Safe Docker stop
safe_docker_stop() {
    log "INFO" "🛑 Stopping Docker n8n safely..."
    
    # Create backup first
    safe_backup
    
    # Stop services
    cd "$SCRIPT_DIR"
    docker-compose down
    
    log "INFO" "✅ Docker n8n stopped safely"
    safe_status
}

# Safe Docker restart
safe_docker_restart() {
    log "INFO" "🔄 Restarting Docker n8n safely..."
    
    safe_docker_stop
    sleep 2
    safe_docker_start
}

# Safe cleanup (NON-DESTRUCTIVE)
safe_cleanup() {
    log "INFO" "🧹 Running safe cleanup..."
    
    # Create backup first
    safe_backup
    
    # Remove stopped containers (safe)
    docker container prune -f 2>/dev/null || true
    
    # Remove unused images (safe)
    docker image prune -f 2>/dev/null || true
    
    # Remove unused networks (safe)
    docker network prune -f 2>/dev/null || true
    
    # Remove unused volumes (safe - only empty ones)
    docker volume prune -f 2>/dev/null || true
    
    log "INFO" "✅ Safe cleanup completed"
}

# Safe logs view
safe_logs() {
    log "INFO" "📝 Viewing safe logs..."
    
    echo -e "\n${CYAN}=== N8N LOGS (Last 50 lines) ===${NC}"
    
    if docker ps | grep -q "n8n"; then
        echo -e "\n${BLUE}🐳 Docker n8n logs:${NC}"
        docker-compose logs --tail=50 n8n
    else
        echo -e "\n${YELLOW}⚠️  Docker n8n not running${NC}"
    fi
    
    echo -e "\n${CYAN}==============================${NC}\n"
}

# Safe access to n8n
safe_access() {
    log "INFO" "🔓 Providing safe access information..."
    
    echo -e "\n${CYAN}=== SAFE N8N ACCESS ===${NC}"
    
    # Check which n8n is running
    if docker ps | grep -q "n8n.*Up"; then
        echo -e "\n${GREEN}🐳 Docker n8n is running:${NC}"
        echo -e "   Main URL: ${BLUE}https://n8ncloud.tech${NC}"
        echo -e "   Docker URL: ${BLUE}https://docker.n8ncloud.tech:15680${NC}"
        echo -e "   Status: ${BLUE}https://status.n8ncloud.tech:15682${NC}"
    fi
    
    if systemctl is-active --quiet n8n; then
        echo -e "\n${GREEN}🖥️  System n8n is running:${NC}"
        echo -e "   System URL: ${BLUE}https://system.n8ncloud.tech:15681${NC}"
    fi
    
    echo -e "\n${YELLOW}🔑 Default credentials:${NC}"
    echo -e "   Username: admin"
    echo -e "   Password: admin123 (or check your .env file)"
    
    echo -e "\n${CYAN}==============================${NC}\n"
}

# Safe troubleshooting
safe_troubleshoot() {
    log "INFO" "🔧 Running safe troubleshooting..."
    
    echo -e "\n${CYAN}=== SAFE TROUBLESHOOTING ===${NC}"
    
    # Check common issues
    echo -e "\n${BLUE}🔍 Common Issues Check:${NC}"
    
    # Port conflicts
    if netstat -tlnp 2>/dev/null | grep -q ":5678 "; then
        echo -e "   ${YELLOW}⚠️  Port 5678 conflict detected${NC}"
        echo -e "      System n8n is using this port"
        echo -e "      Docker n8n will use port 15678 instead"
    fi
    
    # Docker status
    if ! docker ps | grep -q "n8n.*Up"; then
        echo -e "   ${RED}❌ Docker n8n container not running${NC}"
        echo -e "      Try: $0 start"
    fi
    
    # Nginx status
    if ! systemctl is-active --quiet nginx; then
        echo -e "   ${RED}❌ Nginx not running${NC}"
        echo -e "      This affects web access"
    fi
    
    # SSL certificates
    if [[ ! -f "/etc/letsencrypt/live/n8ncloud.tech/fullchain.pem" ]]; then
        echo -e "   ${YELLOW}⚠️  SSL certificate not found${NC}"
        echo -e "      HTTPS may not work properly"
    fi
    
    echo -e "\n${BLUE}💡 Solutions:${NC}"
    echo -e "   1. Use $0 start to start Docker n8n"
    echo -e "   2. Use $0 status to check current state"
    echo -e "   3. Use $0 logs to view error logs"
    echo -e "   4. Use $0 access to get access URLs"
    
    echo -e "\n${CYAN}==============================${NC}\n"
}

# Safe update
safe_update() {
    log "INFO" "🔄 Running safe update..."
    
    # Create backup first
    safe_backup
    
    # Pull latest images
    docker-compose pull
    
    # Restart with new images
    safe_docker_restart
    
    log "INFO" "✅ Safe update completed"
}

# Main menu
show_menu() {
    echo -e "\n${CYAN}🛡️  N8N SAFE MANAGER - AI Protecting AI${NC}"
    echo -e "${BLUE}Choose an option (safe and non-destructive):${NC}\n"
    
    echo -e "  ${GREEN}1${NC}  📊 Status Check    - See what's running"
    echo -e "  ${GREEN}2${NC}  🚀 Start Docker    - Start n8n safely"
    echo -e "  ${GREEN}3${NC}  🛑 Stop Docker     - Stop n8n safely"
    echo -e "  ${GREEN}4${NC}  🔄 Restart Docker  - Restart n8n safely"
    echo -e "  ${GREEN}5${NC}  📝 View Logs       - See what's happening"
    echo -e "  ${GREEN}6${NC}  🔓 Access Info     - Get URLs and credentials"
    echo -e "  ${GREEN}7${NC}  🔧 Troubleshoot   - Diagnose issues"
    echo -e "  ${GREEN}8${NC}  🧹 Safe Cleanup    - Clean up safely"
    echo -e "  ${GREEN}9${NC}  🔄 Update          - Update safely"
    echo -e "  ${GREEN}0${NC}  🚪 Exit            - Close manager\n"
    
    read -p "Enter your choice (0-9): " choice
    
    case $choice in
        1) safe_status ;;
        2) safe_docker_start ;;
        3) safe_docker_stop ;;
        4) safe_docker_restart ;;
        5) safe_logs ;;
        6) safe_access ;;
        7) safe_troubleshoot ;;
        8) safe_cleanup ;;
        9) safe_update ;;
        0) echo -e "\n${GREEN}👋 Goodbye! Your n8n is safe.${NC}"; exit 0 ;;
        *) echo -e "\n${RED}❌ Invalid choice. Please try again.${NC}" ;;
    esac
}

# Command line interface
case "${1:-}" in
    "start")
        safe_docker_start
        ;;
    "stop")
        safe_docker_stop
        ;;
    "restart")
        safe_docker_restart
        ;;
    "status")
        safe_status
        ;;
    "logs")
        safe_logs
        ;;
    "access")
        safe_access
        ;;
    "troubleshoot")
        safe_troubleshoot
        ;;
    "cleanup")
        safe_cleanup
        ;;
    "update")
        safe_update
        ;;
    "menu"|"")
        while true; do
            show_menu
            echo -e "\n${YELLOW}Press Enter to continue...${NC}"
            read
        done
        ;;
    *)
        echo -e "${CYAN}🛡️  N8N SAFE MANAGER${NC}"
        echo -e "${BLUE}Usage:${NC}"
        echo -e "  $0 start        - Start Docker n8n safely"
        echo -e "  $0 stop         - Stop Docker n8n safely"
        echo -e "  $0 restart      - Restart Docker n8n safely"
        echo -e "  $0 status       - Check current status"
        echo -e "  $0 logs         - View logs safely"
        echo -e "  $0 access       - Get access information"
        echo -e "  $0 troubleshoot - Diagnose issues safely"
        echo -e "  $0 cleanup      - Clean up safely"
        echo -e "  $0 update       - Update safely"
        echo -e "  $0 menu         - Interactive menu"
        echo -e ""
        echo -e "${GREEN}This manager is SAFE and never breaks anything!${NC}"
        ;;
esac
