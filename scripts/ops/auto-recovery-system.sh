#!/bin/bash

# 🔧 AUTO-RECOVERY SYSTEM - Automatically Fix Detected Issues
# 🚨 Responds to safety verification alerts and restores functionality
# 🔒 Safe recovery with rollback capabilities

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RECOVERY_LOG="$SCRIPT_DIR/auto-recovery.log"
SAFETY_DB="$SCRIPT_DIR/safety-backup-database.json"
ROLLBACK_BASE="$SCRIPT_DIR/safety-rollback"

log() {
  local level="$1"
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "[$timestamp] [$level] $message" | tee -a "$RECOVERY_LOG"
}

echo -e "${CYAN}🔧 AUTO-RECOVERY SYSTEM${NC}"
echo -e "${BLUE}========================${NC}"

# Step 1: Analyze safety verification results
log "INFO" "🔍 Analyzing safety verification results..."

if [[ ! -f "$SAFETY_DB" ]]; then
  log "ERROR" "❌ Safety database not found. Run safety verification first."
  exit 1
fi

# Extract issues from safety database
missing_functions=$(jq -r '.functionality_checklist.missing_functions[]?' "$SAFETY_DB" 2>/dev/null || echo "")
connectivity_issues=$(jq -r '.service_connections.verification_results[]?' "$SAFETY_DB" 2>/dev/null | grep "❌" || echo "")

log "INFO" "📊 Detected issues:"
log "INFO" "   Missing functions: $missing_functions"
log "INFO" "   Connectivity issues: $connectivity_issues"

# Step 2: Auto-recovery procedures
log "INFO" "🔧 Starting auto-recovery procedures..."

# Recovery 1: Fix enterprise protection system
if echo "$missing_functions" | grep -q "enterprise_protection"; then
  log "WARN" "🚨 Enterprise protection system missing - attempting recovery..."

  # Check if file exists but is broken
  if [[ -f "n8n-enterprise-protection.sh" ]]; then
    log "INFO" "🔄 File exists but may be broken - checking syntax..."
    if ! bash -n "n8n-enterprise-protection.sh" 2>/dev/null; then
      log "WARN" "⚠️  File has syntax errors - attempting repair..."
      # Try to restore from backup
      latest_backup=$(find "$ROLLBACK_BASE" -name "n8n-enterprise-protection.sh" -type f 2>/dev/null | sort | tail -1)
      if [[ -n "$latest_backup" ]]; then
        cp "$latest_backup" "n8n-enterprise-protection.sh"
        chmod +x "n8n-enterprise-protection.sh"
        log "INFO" "✅ Enterprise protection system restored from backup"
      else
        log "ERROR" "❌ No backup found for enterprise protection system"
      fi
    fi
  else
    log "WARN" "⚠️  File missing - restoring from backup..."
    latest_backup=$(find "$ROLLBACK_BASE" -name "n8n-enterprise-protection.sh" -type f 2>/dev/null | sort | tail -1)
    if [[ -n "$latest_backup" ]]; then
      cp "$latest_backup" "n8n-enterprise-protection.sh"
      chmod +x "n8n-enterprise-protection.sh"
      log "INFO" "✅ Enterprise protection system restored from backup"
    else
      log "ERROR" "❌ No backup found for enterprise protection system"
    fi
  fi
fi

# Recovery 2: Fix nginx configuration
if echo "$missing_functions" | grep -q "nginx_config"; then
  log "WARN" "🚨 Nginx configuration issue detected - attempting recovery..."

  if [[ -f "nginx-smart.conf" ]]; then
    log "INFO" "🔄 Testing nginx configuration..."
    if nginx -t -c "$(pwd)/nginx-smart.conf" >/dev/null 2>&1; then
      log "INFO" "✅ Nginx configuration is valid"
    else
      log "WARN" "⚠️  Nginx configuration has errors - attempting repair..."
      # Try to restore from backup
      latest_backup=$(find "$ROLLBACK_BASE" -name "nginx-smart.conf" -type f 2>/dev/null | sort | tail -1)
      if [[ -n "$latest_backup" ]]; then
        cp "$latest_backup" "nginx-smart.conf"
        log "INFO" "✅ Nginx configuration restored from backup"
      else
        log "ERROR" "❌ No backup found for nginx configuration"
      fi
    fi
  else
    log "WARN" "⚠️  Nginx configuration file missing - restoring from backup..."
    latest_backup=$(find "$ROLLBACK_BASE" -name "nginx-smart.conf" -type f 2>/dev/null | sort | tail -1)
    if [[ -n "$latest_backup" ]]; then
      cp "$latest_backup" "nginx-smart.conf"
      log "INFO" "✅ Nginx configuration restored from backup"
    else
      log "ERROR" "❌ No backup found for nginx configuration"
    fi
  fi
fi

# Recovery 3: Start n8n containers
if echo "$connectivity_issues" | grep -q "n8n containers: NOT RUNNING"; then
  log "WARN" "🚨 n8n containers not running - attempting to start..."

  if [[ -f "docker-compose-smart.yml" ]]; then
    log "INFO" "🔄 Starting n8n containers..."
    cd "$SCRIPT_DIR"
    docker-compose -f docker-compose-smart.yml up -d

    # Wait for startup
    log "INFO" "⏳ Waiting for containers to start..."
    sleep 15

    # Verify startup
    if docker ps | grep -q "n8n.*Up"; then
      log "INFO" "✅ n8n containers started successfully"
    else
      log "ERROR" "❌ Failed to start n8n containers"
      docker-compose -f docker-compose-smart.yml logs n8n
    fi
  else
    log "ERROR" "❌ Docker compose file not found"
  fi
fi

# Recovery 4: Fix port issues
if echo "$connectivity_issues" | grep -q "Port 15678: NOT LISTENING"; then
  log "WARN" "🚨 Port 15678 not listening - checking n8n container..."

  if docker ps | grep -q "n8n.*Up"; then
    log "INFO" "✅ n8n container is running, port should be available"
    # Check if port is actually listening
    if netstat -tlnp 2>/dev/null | grep -q ":15678 "; then
      log "INFO" "✅ Port 15678 is now listening"
    else
      log "WARN" "⚠️  Port still not listening - checking container logs..."
      docker-compose -f docker-compose-smart.yml logs n8n | tail -10
    fi
  else
    log "ERROR" "❌ n8n container not running - cannot fix port issue"
  fi
fi

if echo "$connectivity_issues" | grep -q "Port 15682: NOT LISTENING"; then
  log "WARN" "🚨 Port 15682 not listening - this is the status port..."
  log "INFO" "🔄 Port 15682 is optional and can be started later"
fi

# Step 3: Verify recovery success
log "INFO" "🔍 Verifying recovery success..."

# Re-run basic checks
recovery_success=true

# Check enterprise protection system
if [[ -f "n8n-enterprise-protection.sh" ]]; then
  if ./n8n-enterprise-protection.sh --help >/dev/null 2>&1; then
    log "INFO" "✅ Enterprise protection system: RECOVERED"
  else
    log "ERROR" "❌ Enterprise protection system: STILL BROKEN"
    recovery_success=false
  fi
else
  log "ERROR" "❌ Enterprise protection system: STILL MISSING"
  recovery_success=false
fi

# Check nginx configuration
if [[ -f "nginx-smart.conf" ]]; then
  if nginx -t -c "$(pwd)/nginx-smart.conf" >/dev/null 2>&1; then
    log "INFO" "✅ Nginx configuration: RECOVERED"
  else
    log "ERROR" "❌ Nginx configuration: STILL BROKEN"
    recovery_success=false
  fi
else
  log "ERROR" "❌ Nginx configuration: STILL MISSING"
  recovery_success=false
fi

# Check n8n containers
if docker ps | grep -q "n8n.*Up"; then
  log "INFO" "✅ n8n containers: RECOVERED"
else
  log "ERROR" "❌ n8n containers: STILL NOT RUNNING"
  recovery_success=false
fi

# Step 4: Generate recovery report
log "INFO" "📋 Generating recovery report..."

RECOVERY_REPORT="$SCRIPT_DIR/auto-recovery-report.txt"
cat >"$RECOVERY_REPORT" <<EOF
🔧 AUTO-RECOVERY REPORT
========================
Generated: $(date)
System: n8n Production Stack

📊 RECOVERY ACTIONS TAKEN
==========================
$(grep "🔄\|✅\|❌" "$RECOVERY_LOG" | tail -20)

🔍 RECOVERY VERIFICATION
========================
Enterprise Protection: $(if [[ -f "n8n-enterprise-protection.sh" ]] && ./n8n-enterprise-protection.sh --help >/dev/null 2>&1; then echo "✅ RECOVERED"; else echo "❌ STILL BROKEN"; fi)
Nginx Configuration: $(if [[ -f "nginx-smart.conf" ]] && nginx -t -c "$(pwd)/nginx-smart.conf" >/dev/null 2>&1; then echo "✅ RECOVERED"; else echo "❌ STILL BROKEN"; fi)
n8n Containers: $(if docker ps | grep -q "n8n.*Up"; then echo "✅ RECOVERED"; else echo "❌ STILL NOT RUNNING"; fi)

📁 RECOVERY RESOURCES
=====================
Recovery Log: $RECOVERY_LOG
Safety Database: $SAFETY_DB
Rollback Directory: $ROLLBACK_BASE

🔄 NEXT STEPS
=============
$(if [[ "$recovery_success" == true ]]; then
  echo "✅ All critical issues resolved"
  echo "🚀 System ready for normal operation"
  echo "📊 Run safety verification again to confirm"
else
  echo "❌ Some issues remain unresolved"
  echo "🔄 Manual intervention may be required"
  echo "📁 Check rollback directory for original files"
fi)

📞 EMERGENCY CONTACTS
=====================
- Server: 69.62.66.78:22222
- User: evens
- Password: xuzGeb-xucpyz-kufpu3
EOF

log "INFO" "✅ Recovery report generated at: $RECOVERY_REPORT"

# Step 5: Final status
echo -e "\n${CYAN}🔧 AUTO-RECOVERY COMPLETE${NC}"
echo -e "${BLUE}============================${NC}"

if [[ "$recovery_success" == true ]]; then
  echo -e "${GREEN}✅ All critical issues have been resolved!${NC}"
  echo -e "${GREEN}🚀 Your system is ready for normal operation${NC}"
else
  echo -e "${YELLOW}⚠️  Some issues remain unresolved${NC}"
  echo -e "${YELLOW}🔄 Manual intervention may be required${NC}"
fi

echo -e "\n${BLUE}📁 RECOVERY RESOURCES:${NC}"
echo -e "   Recovery Log: ${GREEN}$RECOVERY_LOG${NC}"
echo -e "   Recovery Report: ${GREEN}$RECOVERY_REPORT${NC}"
echo -e "   Safety Database: ${GREEN}$SAFETY_DB${NC}"
echo -e "   Rollback Directory: ${GREEN}$ROLLBACK_BASE${NC}"

echo -e "\n${CYAN}🎯 RECOMMENDED NEXT STEPS:${NC}"
if [[ "$recovery_success" == true ]]; then
  echo -e "   1. ${GREEN}Run safety verification again${NC}"
  echo -e "   2. ${GREEN}Test system functionality${NC}"
  echo -e "   3. ${GREEN}Monitor for any new issues${NC}"
else
  echo -e "   1. ${YELLOW}Check recovery report for details${NC}"
  echo -e "   2. ${YELLOW}Review rollback directory${NC}"
  echo -e "   3. ${YELLOW}Consider manual recovery procedures${NC}"
fi

log "INFO" "🔧 Auto-recovery system complete"
log "INFO" "📊 Recovery report generated"
log "INFO" "🎯 System status: $([[ "$recovery_success" == true ]] && echo "RECOVERED" || echo "NEEDS ATTENTION")"

echo -e "\n${GREEN}✅ Auto-recovery system complete!${NC}"
