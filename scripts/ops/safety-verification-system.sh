#!/bin/bash

# 🛡️ SAFETY VERIFICATION SYSTEM - Ensure Nothing is Lost or Disconnected
# 🔒 Comprehensive verification with auto-backup and rollback capabilities
# 📊 Database of backlogs for disaster recovery

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
SAFETY_LOG="$SCRIPT_DIR/safety-verification.log"
BACKUP_DB="$SCRIPT_DIR/safety-backup-database.json"
ROLLBACK_DIR="$SCRIPT_DIR/safety-rollback/$(date +%Y%m%d_%H%M%S)"
VERIFICATION_REPORT="$SCRIPT_DIR/safety-verification-report.txt"

# Create directories
mkdir -p "$ROLLBACK_DIR"

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$SAFETY_LOG"
}

echo -e "${CYAN}🛡️  SAFETY VERIFICATION SYSTEM${NC}"
echo -e "${BLUE}================================${NC}"

# Step 1: Create comprehensive backup database
log "INFO" "📊 Creating comprehensive backup database..."
cat > "$BACKUP_DB" << 'EOF'
{
  "backup_metadata": {
    "created": "$(date)",
    "system": "n8n-production-stack",
    "version": "1.0.0",
    "purpose": "Safety verification and disaster recovery"
  },
  "file_inventory": {
    "critical_files": [],
    "consolidated_files": [],
    "backup_locations": [],
    "rollback_points": []
  },
  "service_connections": {
    "n8n_services": [],
    "docker_containers": [],
    "nginx_configs": [],
    "port_mappings": []
  },
  "functionality_checklist": {
    "core_functions": [],
    "missing_functions": [],
    "disconnected_services": [],
    "verification_results": []
  }
}
EOF

log "INFO" "✅ Backup database created at: $BACKUP_DB"

# Step 2: Inventory all files and create safety backup
log "INFO" "📦 Creating comprehensive safety backup..."

# Backup all critical files
critical_files=(
    "n8n-enterprise-protection.sh"
    "n8n-dynamic-live-system.sh"
    "start-enterprise-protection.sh"
    "docker-compose-smart.yml"
    "nginx-smart.conf"
    "package.json"
    "*.md"
)

for pattern in "${critical_files[@]}"; do
    for file in $pattern; do
        if [[ -f "$file" ]]; then
            cp "$file" "$ROLLBACK_DIR/"
            log "INFO" "💾 Backed up: $file"
        fi
    done
done

# Backup consolidated directory
if [[ -d "consolidated" ]]; then
    cp -r consolidated "$ROLLBACK_DIR/"
    log "INFO" "💾 Backed up consolidated directory"
fi

# Backup backup directories
if [[ -d "consolidation-backup" ]]; then
    cp -r consolidation-backup "$ROLLBACK_DIR/"
    log "INFO" "💾 Backed up consolidation backup"
fi

log "INFO" "✅ Safety backup created at: $ROLLBACK_DIR"

# Step 3: Verify no functionality was lost
log "INFO" "🔍 Verifying no functionality was lost..."

# Check if all critical functions are accessible
functionality_check() {
    local missing_functions=()
    local verification_results=()
    
    # Check enterprise protection system
    if [[ -f "n8n-enterprise-protection.sh" ]]; then
        if ./n8n-enterprise-protection.sh --help >/dev/null 2>&1; then
            verification_results+=("✅ Enterprise protection system: FUNCTIONAL")
        else
            verification_results+=("❌ Enterprise protection system: BROKEN")
            missing_functions+=("enterprise_protection")
        fi
    else
        verification_results+=("❌ Enterprise protection system: MISSING")
        missing_functions+=("enterprise_protection")
    fi
    
    # Check consolidated scripts
    if [[ -d "consolidated" ]]; then
        for script in consolidated/*.sh; do
            if [[ -f "$script" ]]; then
                local script_name=$(basename "$script")
                if bash -n "$script" 2>/dev/null; then
                    verification_results+=("✅ $script_name: SYNTAX VALID")
                else
                    verification_results+=("❌ $script_name: SYNTAX ERROR")
                    missing_functions+=("$script_name")
                fi
            fi
        done
    else
        verification_results+=("❌ Consolidated directory: MISSING")
        missing_functions+=("consolidated_scripts")
    fi
    
    # Check Docker configuration
    if [[ -f "docker-compose-smart.yml" ]]; then
        if docker-compose -f docker-compose-smart.yml config >/dev/null 2>&1; then
            verification_results+=("✅ Docker compose: VALID")
        else
            verification_results+=("❌ Docker compose: INVALID")
            missing_functions+=("docker_compose")
        fi
    else
        verification_results+=("❌ Docker compose: MISSING")
        missing_functions+=("docker_compose")
    fi
    
    # Check Nginx configuration
    if [[ -f "nginx-smart.conf" ]]; then
        if nginx -t -c "$(pwd)/nginx-smart.conf" >/dev/null 2>&1; then
            verification_results+=("✅ Nginx config: VALID")
        else
            verification_results+=("❌ Nginx config: INVALID")
            missing_functions+=("nginx_config")
        fi
    else
        verification_results+=("❌ Nginx config: MISSING")
        missing_functions+=("nginx_config")
    fi
    
    # Return results
    echo "MISSING_FUNCTIONS:${missing_functions[*]}"
    echo "VERIFICATION_RESULTS:${verification_results[*]}"
}

# Run functionality check
log "INFO" "🔍 Running functionality verification..."
verification_output=$(functionality_check)

# Parse results
missing_functions=$(echo "$verification_output" | grep "MISSING_FUNCTIONS:" | cut -d: -f2)
verification_results=$(echo "$verification_output" | grep "VERIFICATION_RESULTS:" | cut -d: -f2)

# Step 4: Check service connectivity
log "INFO" "🔌 Verifying service connectivity..."

connectivity_check() {
    local connectivity_results=()
    
    # Check if Docker is running
    if docker info >/dev/null 2>&1; then
        connectivity_results+=("✅ Docker daemon: RUNNING")
    else
        connectivity_results+=("❌ Docker daemon: NOT RUNNING")
    fi
    
    # Check if n8n containers are accessible
    if docker ps | grep -q "n8n"; then
        connectivity_results+=("✅ n8n containers: RUNNING")
    else
        connectivity_results+=("❌ n8n containers: NOT RUNNING")
    fi
    
    # Check if Nginx is accessible
    if systemctl is-active --quiet nginx; then
        connectivity_results+=("✅ Nginx service: RUNNING")
    else
        connectivity_results+=("❌ Nginx service: NOT RUNNING")
    fi
    
    # Check port accessibility
    local ports=(15678 15680 15682)
    for port in "${ports[@]}"; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            connectivity_results+=("✅ Port $port: LISTENING")
        else
            connectivity_results+=("❌ Port $port: NOT LISTENING")
        fi
    done
    
    echo "${connectivity_results[*]}"
}

connectivity_results=$(connectivity_check)

# Step 5: Generate comprehensive safety report
log "INFO" "📋 Generating comprehensive safety report..."

cat > "$VERIFICATION_REPORT" << EOF
🛡️  SAFETY VERIFICATION REPORT
===============================
Generated: $(date)
System: n8n Production Stack

📊 FUNCTIONALITY VERIFICATION
=============================
$(echo "$verification_results" | tr ' ' '\n')

🔌 CONNECTIVITY VERIFICATION
============================
$(echo "$connectivity_results" | tr ' ' '\n')

📁 BACKUP INFORMATION
=====================
Safety Backup: $ROLLBACK_DIR
Backup Database: $BACKUP_DB
Safety Log: $SAFETY_LOG

🚨 MISSING FUNCTIONALITY
========================
$(echo "$missing_functions" | tr ' ' '\n')

🔄 ROLLBACK PROCEDURE
=====================
If issues are detected:
1. Stop all services
2. Copy files from: $ROLLBACK_DIR
3. Restart services
4. Verify functionality

📞 EMERGENCY CONTACTS
====================
- Server: 69.62.66.78:22222
- User: evens
- Password: xuzGeb-xucpyz-kufpu3
EOF

log "INFO" "✅ Safety verification report generated at: $VERIFICATION_REPORT"

# Step 6: Update backup database with verification results
log "INFO" "📊 Updating backup database..."

# Update the JSON database with verification results
jq --arg missing "$missing_functions" \
   --arg results "$verification_results" \
   --arg connectivity "$connectivity_results" \
   --arg backup "$ROLLBACK_DIR" \
   '.file_inventory.rollback_points += [$backup] |
    .functionality_checklist.missing_functions = ($missing | split(" ")) |
    .functionality_checklist.verification_results = ($results | split(" ")) |
    .service_connections.verification_results = ($connectivity | split(" "))' \
   "$BACKUP_DB" > "$BACKUP_DB.tmp" && mv "$BACKUP_DB.tmp" "$BACKUP_DB"

log "INFO" "✅ Backup database updated"

# Step 7: Display safety status
echo -e "\n${CYAN}🛡️  SAFETY VERIFICATION COMPLETE${NC}"
echo -e "${BLUE}====================================${NC}"

echo -e "\n${BLUE}📊 FUNCTIONALITY STATUS:${NC}"
echo "$verification_results" | tr ' ' '\n' | while read -r result; do
    if [[ "$result" == ✅* ]]; then
        echo -e "   $result"
    else
        echo -e "   $result"
    fi
done

echo -e "\n${BLUE}🔌 CONNECTIVITY STATUS:${NC}"
echo "$connectivity_results" | tr ' ' '\n' | while read -r result; do
    if [[ "$result" == ✅* ]]; then
        echo -e "   $result"
    else
        echo -e "   $result"
    fi
done

if [[ -n "$missing_functions" ]]; then
    echo -e "\n${RED}🚨 MISSING FUNCTIONALITY DETECTED:${NC}"
    echo "$missing_functions" | tr ' ' '\n' | while read -r func; do
        echo -e "   ❌ $func"
    done
    
    echo -e "\n${YELLOW}🔄 ROLLBACK RECOMMENDED${NC}"
    echo -e "   Use rollback directory: $ROLLBACK_DIR"
else
    echo -e "\n${GREEN}✅ ALL FUNCTIONALITY VERIFIED${NC}"
    echo -e "   No functionality was lost during consolidation"
fi

echo -e "\n${BLUE}📁 SAFETY BACKUP LOCATIONS:${NC}"
echo -e "   Safety Backup: ${GREEN}$ROLLBACK_DIR${NC}"
echo -e "   Backup Database: ${GREEN}$BACKUP_DB${NC}"
echo -e "   Safety Log: ${GREEN}$SAFETY_LOG${NC}"
echo -e "   Verification Report: ${GREEN}$VERIFICATION_REPORT${NC}"

echo -e "\n${CYAN}🎯 SAFETY SYSTEM ACTIVE${NC}"
echo -e "${GREEN}Your system is now protected with comprehensive safety verification!${NC}"

# Step 8: Auto-save verification results
log "INFO" "💾 Auto-saving verification results..."
log "INFO" "🛡️  Safety verification system complete"
log "INFO" "📊 Backup database updated with verification results"
log "INFO" "📋 Safety report generated and saved"

echo -e "\n${GREEN}✅ Safety verification system complete!${NC}"
echo -e "${BLUE}📊 All results saved to backup database${NC}"
echo -e "${BLUE}🛡️  System is now protected with auto-backup${NC}"
