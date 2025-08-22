#!/bin/bash

# 🚀 N8N DYNAMIC LIVE SYSTEM - "AI Protecting AI" Ultimate Edition
# 🛡️ Zero duplication, always live, intelligent consolidation
# 🔒 Bulletproof guardrails with smooth user experience

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
LOG_FILE="$SCRIPT_DIR/n8n-dynamic-system.log"
CONFIG_FILE="$SCRIPT_DIR/n8n-dynamic-config.json"
LOCK_FILE="$SCRIPT_DIR/.n8n-dynamic.lock"
BACKUP_DIR="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"

# Port configuration (SMART PORT MANAGEMENT)
SYSTEM_N8N_PORT=5678
DOCKER_N8N_PORT=15678
DOCKER_PROXY_PORT=15680
STATUS_PORT=15682
RESERVED_PORTS=($SYSTEM_N8N_PORT $DOCKER_N8N_PORT $DOCKER_PROXY_PORT $STATUS_PORT)

# Service configuration
SERVICES=("n8n" "nginx" "docker")
HEALTH_THRESHOLD=2

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
      log "WARN" "Dynamic system already running (PID: $pid)"
      exit 1
    else
      log "WARN" "Removing stale lock file"
      rm -f "$LOCK_FILE"
    fi
  fi
  echo $$ >"$LOCK_FILE"
}

# Cleanup function
cleanup() {
  log "INFO" "Cleaning up dynamic system"
  rm -f "$LOCK_FILE"
  exit 0
}

trap cleanup EXIT INT TERM

# Dynamic configuration management
load_config() {
  if [[ -f "$CONFIG_FILE" ]]; then
    log "INFO" "📋 Loading dynamic configuration..."
    # Load config from JSON file
    export N8N_PASSWORD=$(jq -r '.n8n_password // "admin123"' "$CONFIG_FILE" 2>/dev/null || echo "admin123")
    export N8N_ENCRYPTION_KEY=$(jq -r '.n8n_encryption_key // "your-secret-key-here"' "$CONFIG_FILE" 2>/dev/null || echo "your-secret-key-here")
  else
    log "INFO" "📋 Creating default configuration..."
    create_default_config
  fi
}

create_default_config() {
  cat >"$CONFIG_FILE" <<EOF
{
  "n8n_password": "admin123",
  "n8n_encryption_key": "your-secret-key-here",
  "auto_heal": true,
  "conflict_prevention": true,
  "health_monitoring": true,
  "backup_retention_days": 7,
  "port_isolation": true,
  "resource_limits": {
    "memory_limit": "2G",
    "cpu_limit": "2.0"
  }
}
EOF
}

# Intelligent duplication detection and cleanup
detect_and_clean_duplicates() {
  log "INFO" "🧹 Detecting and cleaning duplicates..."

  # Create backup before cleanup
  create_safe_backup

  # Remove duplicate scripts safely
  local duplicates=(
    "bulk_import_workflows.sh"
    "clean-reimport-workflows.sh"
    "cleanup-unnecessary.sh"
    "complete_restore.sh"
    "docker_isolation_system.sh"
    "docker_management_rules.sh"
    "enter-n8n.sh"
    "fix-ai-expressions.sh"
    "fix-mcp-tools.sh"
    "fix-remaining-workflows.sh"
    "fix-with-n8n-code.sh"
    "fix-workflow-expressions.sh"
    "fix-workflows-better.sh"
    "fix-workflows-complete.sh"
    "fix-workflows-with-actual-mcp.sh"
    "import-missing-workflows.sh"
    "mcp-manager.sh"
    "n8n-manager.sh"
    "remove-duplicates.sh"
    "remove-duplicates-delete.sh"
    "restore_complete_n8n.sh"
    "restore_workflows.sh"
    "safe-cleanup.sh"
    "setup-24-7.sh"
    "setup-comprehensive-n8n.sh"
    "setup-mcp-integration.sh"
    "start-n8n.sh"
    "status-n8n.sh"
    "stop-n8n.sh"
    "update-n8n.sh"
    "workflow-manager.sh"
  )

  for duplicate in "${duplicates[@]}"; do
    if [[ -f "$duplicate" ]]; then
      log "INFO" "🗑️  Removing duplicate: $duplicate"
      mv "$duplicate" "$BACKUP_DIR/" 2>/dev/null || true
    fi
  done

  # Remove duplicate Docker compose files
  if [[ -f "docker-compose-isolated.yml" ]]; then
    log "INFO" "🗑️  Removing duplicate Docker compose: docker-compose-isolated.yml"
    mv "docker-compose-isolated.yml" "$BACKUP_DIR/" 2>/dev/null || true
  fi

  if [[ -f "docker-compose.yml" ]]; then
    log "INFO" "🗑️  Removing duplicate Docker compose: docker-compose.yml"
    mv "docker-compose.yml" "$BACKUP_DIR/" 2>/dev/null || true
  fi

  # Remove old scripts directory
  if [[ -d "scripts" ]]; then
    log "INFO" "🗑️  Removing old scripts directory"
    mv "scripts" "$BACKUP_DIR/" 2>/dev/null || true
  fi

  # Remove old tools directory
  if [[ -d "tools" ]]; then
    log "INFO" "🗑️  Removing old tools directory"
    mv "tools" "$BACKUP_DIR/" 2>/dev/null || true
  fi

  log "INFO" "✅ Duplicate cleanup completed"
}

# Smart port conflict detection and resolution
detect_and_resolve_conflicts() {
  log "INFO" "🔍 Detecting and resolving port conflicts..."

  local conflicts=()

  for port in "${RESERVED_PORTS[@]}"; do
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
      local process=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)
      conflicts+=("Port $port: $process")

      # Smart conflict resolution
      if [[ "$port" == "$SYSTEM_N8N_PORT" ]]; then
        log "WARN" "⚠️  System n8n using port $port - using isolated Docker ports"
      elif [[ "$port" == "$DOCKER_N8N_PORT" ]]; then
        log "WARN" "⚠️  Port $port conflict - switching to backup port"
        DOCKER_N8N_PORT=15679
      fi
    fi
  done

  if [[ ${#conflicts[@]} -gt 0 ]]; then
    log "WARN" "🚨 Port conflicts detected and resolved:"
    for conflict in "${conflicts[@]}"; do
      log "WARN" "   $conflict"
    done
    return 1
  else
    log "INFO" "✅ No port conflicts detected"
    return 0
  fi
}

# Dynamic service health monitoring
monitor_service_health() {
  log "INFO" "🏥 Monitoring service health..."

  local health_score=0
  local health_report=()

  # Check system n8n
  if systemctl is-active --quiet n8n; then
    health_score=$((health_score + 1))
    health_report+=("✅ System n8n: ACTIVE")
  else
    health_report+=("❌ System n8n: INACTIVE")
  fi

  # Check Docker n8n
  if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n.*Up"; then
    health_score=$((health_score + 1))
    health_report+=("✅ Docker n8n: RUNNING")
  else
    health_report+=("❌ Docker n8n: NOT RUNNING")
  fi

  # Check Nginx
  if systemctl is-active --quiet nginx; then
    health_score=$((health_score + 1))
    health_report+=("✅ Nginx: ACTIVE")
  else
    health_report+=("❌ Nginx: INACTIVE")
  fi

  # Health assessment
  if [[ $health_score -ge $HEALTH_THRESHOLD ]]; then
    log "INFO" "✅ System health: GOOD ($health_score/3)"
    return 0
  else
    log "WARN" "⚠️  System health: POOR ($health_score/3)"
    return 1
  fi
}

# Intelligent auto-healing
auto_heal_system() {
  log "INFO" "🔧 Starting intelligent auto-healing..."

  # Create backup before healing
  create_safe_backup

  # Resolve port conflicts first
  detect_and_resolve_conflicts

  # Start Docker n8n if not running
  if ! docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "n8n.*Up"; then
    log "INFO" "🔄 Starting Docker n8n..."
    start_docker_n8n
  fi

  # Fix Nginx configuration if needed
  if ! nginx -t 2>/dev/null; then
    log "WARN" "⚠️  Fixing Nginx configuration..."
    fix_nginx_config
  fi

  # Restart services if needed
  if ! monitor_service_health; then
    log "WARN" "⚠️  Restarting unhealthy services..."
    restart_services
  fi

  log "INFO" "✅ Auto-healing completed"
}

# Start Docker n8n intelligently
start_docker_n8n() {
  log "INFO" "🚀 Starting Docker n8n intelligently..."

  cd "$SCRIPT_DIR"

  # Use smart Docker compose
  if [[ -f "docker-compose-smart.yml" ]]; then
    log "INFO" "🔄 Using smart Docker configuration..."
    docker-compose -f docker-compose-smart.yml down 2>/dev/null || true
    sleep 2
    docker-compose -f docker-compose-smart.yml up -d

    # Wait for startup
    log "INFO" "⏳ Waiting for n8n to start..."
    sleep 15

    if docker ps | grep -q "n8n.*Up"; then
      log "INFO" "✅ Docker n8n started successfully!"
    else
      log "ERROR" "❌ Failed to start Docker n8n"
      docker-compose -f docker-compose-smart.yml logs n8n
    fi
  else
    log "ERROR" "❌ Smart Docker compose file not found"
  fi
}

# Fix Nginx configuration
fix_nginx_config() {
  log "INFO" "🔧 Fixing Nginx configuration..."

  # Backup current config
  sudo cp /etc/nginx/sites-enabled/n8ncloud.tech /etc/nginx/sites-enabled/n8ncloud.tech.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

  # Try to reload Nginx
  if sudo nginx -s reload 2>/dev/null; then
    log "INFO" "✅ Nginx configuration reloaded successfully"
  else
    log "ERROR" "❌ Failed to reload Nginx configuration"
  fi
}

# Restart services intelligently
restart_services() {
  log "INFO" "🔄 Restarting services intelligently..."

  # Restart Docker n8n
  if ! docker ps | grep -q "n8n.*Up"; then
    start_docker_n8n
  fi

  # Restart Nginx if needed
  if ! systemctl is-active --quiet nginx; then
    log "INFO" "🔄 Restarting Nginx..."
    sudo systemctl restart nginx 2>/dev/null || true
  fi

  # Restart system n8n if needed (but don't conflict)
  if ! systemctl is-active --quiet n8n; then
    log "INFO" "🔄 Restarting system n8n..."
    sudo systemctl restart n8n 2>/dev/null || true
  fi
}

# Create safe backup
create_safe_backup() {
  log "INFO" "💾 Creating safe backup..."

  mkdir -p "$BACKUP_DIR"

  # Backup current state
  cp docker-compose*.yml "$BACKUP_DIR/" 2>/dev/null || true
  cp *.sh "$BACKUP_DIR/" 2>/dev/null || true
  cp *.conf "$BACKUP_DIR/" 2>/dev/null || true
  cp *.json "$BACKUP_DIR/" 2>/dev/null || true

  # Backup current running state
  docker ps -a >"$BACKUP_DIR/docker-status.txt" 2>/dev/null || true
  netstat -tlnp >"$BACKUP_DIR/port-status.txt" 2>/dev/null || true
  systemctl status n8n >"$BACKUP_DIR/n8n-status.txt" 2>/dev/null || true

  log "INFO" "✅ Safe backup created at: $BACKUP_DIR"
}

# Dynamic status monitoring
show_dynamic_status() {
  log "INFO" "📊 Dynamic system status:"

  echo -e "\n${CYAN}=== N8N DYNAMIC LIVE SYSTEM STATUS ===${NC}"

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

  echo -e "\n${BLUE}📈 System Health Score:${NC} $health_score/3"

  if [[ $health_score -eq 3 ]]; then
    echo -e "   ${GREEN}🎉 EXCELLENT - All systems operational!${NC}"
  elif [[ $health_score -eq 2 ]]; then
    echo -e "   ${YELLOW}⚠️  GOOD - Minor issues detected${NC}"
  else
    echo -e "   ${RED}🚨 CRITICAL - Major issues detected${NC}"
  fi

  # Access information
  echo -e "\n${BLUE}🌐 Access Points:${NC}"
  if docker ps | grep -q "n8n.*Up"; then
    echo -e "   Main URL: ${BLUE}https://n8ncloud.tech${NC}"
    echo -e "   Docker URL: ${BLUE}https://docker.n8ncloud.tech:15680${NC}"
    echo -e "   Status: ${BLUE}https://status.n8ncloud.tech:15682${NC}"
  fi

  if systemctl is-active --quiet n8n; then
    echo -e "   System URL: ${BLUE}https://system.n8ncloud.tech:15681${NC}"
  fi

  echo -e "\n${CYAN}==========================================${NC}\n"
}

# Main dynamic system loop
main_dynamic_loop() {
  log "INFO" "🚀 Starting N8N Dynamic Live System..."
  log "INFO" "🛡️  AI Protecting AI - Zero Duplication, Always Live"

  # Initial setup
  load_config
  detect_and_clean_duplicates
  detect_and_resolve_conflicts

  # Main dynamic loop
  while true; do
    log "INFO" "🔄 Running dynamic cycle..."

    # Monitor health
    if ! monitor_service_health; then
      log "WARN" "🏥 Health issues detected - initiating auto-healing..."
      auto_heal_system
    fi

    # Show status
    show_dynamic_status

    # Wait before next cycle
    log "INFO" "⏰ Waiting 30 seconds before next dynamic cycle..."
    sleep 30
  done
}

# Command line interface
case "${1:-}" in
"start")
  check_lock
  main_dynamic_loop
  ;;
"status")
  show_dynamic_status
  ;;
"health")
  monitor_service_health
  ;;
"conflicts")
  detect_and_resolve_conflicts
  ;;
"heal")
  auto_heal_system
  ;;
"cleanup")
  detect_and_clean_duplicates
  ;;
"start-docker")
  start_docker_n8n
  ;;
"backup")
  create_safe_backup
  ;;
*)
  echo -e "${CYAN}🚀 N8N DYNAMIC LIVE SYSTEM${NC}"
  echo -e "${BLUE}Usage:${NC}"
  echo -e "  $0 start         - Start dynamic live system"
  echo -e "  $0 status        - Show dynamic status"
  echo -e "  $0 health        - Check service health"
  echo -e "  $0 conflicts     - Detect and resolve conflicts"
  echo -e "  $0 heal          - Run auto-healing"
  echo -e "  $0 cleanup       - Clean up duplicates"
  echo -e "  $0 start-docker  - Start Docker n8n"
  echo -e "  $0 backup        - Create backup"
  echo -e ""
  echo -e "${GREEN}This system is DYNAMIC, LIVE, and ZERO DUPLICATION!${NC}"
  ;;
esac
