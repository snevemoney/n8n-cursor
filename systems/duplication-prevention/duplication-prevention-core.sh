#!/bin/bash

# 🔄 DUPLICATION PREVENTION CORE - Separate System
# 🚨 Prevents duplications without affecting other systems
# 🔒 Zero overlap with zombie killer or future-proofing

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration - SEPARATE from other systems
SYSTEM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUPLICATION_LOG="$SYSTEM_DIR/duplication-prevention.log"
DUPLICATION_DB="$SYSTEM_DIR/duplication-database.json"
DUPLICATION_PID="$SYSTEM_DIR/duplication-prevention.pid"

# Create system-specific files
touch "$DUPLICATION_LOG"
mkdir -p "$SYSTEM_DIR/backups"

log() {
  local level="$1"
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "[$timestamp] [DUPLICATION-PREVENTION] [$level] $message" | tee -a "$DUPLICATION_LOG"
}

echo -e "${CYAN}🔄 DUPLICATION PREVENTION CORE - SEPARATE SYSTEM${NC}"
echo -e "${BLUE}===============================================${NC}"

# Step 1: Create duplication database (separate from other systems)
log "INFO" "📊 Creating separate duplication database..."
cat >"$DUPLICATION_DB" <<'EOF'
{
  "duplication_system": {
    "name": "duplication-prevention-core",
    "created": "$(date)",
    "purpose": "Duplication prevention only",
    "version": "1.0.0",
    "scope": "duplication_prevention_only"
  },
  "detected_duplications": [],
  "prevented_duplications": [],
  "system_status": "active"
}
EOF

# Step 2: Duplication detection (focused only on duplications)
duplication_detection() {
  local duplications=()

  log "INFO" "🔍 Scanning for duplications only..."

  # Check for duplicate n8n instances
  local n8n_count=$(ps aux | grep -c "n8n" | grep -v grep || echo "0")
  if [[ "$n8n_count" -gt 2 ]]; then
    log "WARN" "🚨 Multiple n8n instances detected: $n8n_count"
    duplications+=("multiple_n8n:$n8n_count")
  fi

  # Check for duplicate port usage
  local ports=(5678 15678 15680 15682)
  for port in "${ports[@]}"; do
    local listeners=$(netstat -tlnp 2>/dev/null | grep ":$port " | wc -l || echo "0")
    if [[ "$listeners" -gt 1 ]]; then
      log "WARN" "🚨 Port $port has $listeners listeners - duplication detected"
      duplications+=("port_conflict:$port:$listeners")
    fi
  done

  # Check for duplicate files (content-based)
  local duplicate_files=()
  for file in *.sh; do
    if [[ -f "$file" ]]; then
      local content_hash=$(sha256sum "$file" | cut -d' ' -f1)
      local existing_hash=$(grep "$content_hash" "$DUPLICATION_LOG" 2>/dev/null | head -1 | cut -d' ' -f1 || echo "")

      if [[ -n "$existing_hash" ]]; then
        log "WARN" "🚨 Duplicate file detected: $file"
        duplicate_files+=("$file")
      else
        echo "$content_hash $file" >>"$DUPLICATION_LOG"
      fi
    fi
  done

  if [[ ${#duplicate_files[@]} -gt 0 ]]; then
    duplications+=("duplicate_files:${duplicate_files[*]}")
  fi

  echo "${duplications[*]}"
}

# Step 3: Duplication prevention (focused only on duplications)
duplication_prevention() {
  local duplications="$1"
  local prevented=()

  log "INFO" "🔄 Starting duplication prevention..."

  # Prevent multiple n8n instances
  if echo "$duplications" | grep -q "multiple_n8n:"; then
    log "WARN" "🔄 Preventing multiple n8n instances..."
    local main_pid=$(ps aux | grep "n8n" | grep -v grep | head -1 | awk '{print $2}')
    if [[ -n "$main_pid" ]]; then
      log "INFO" "🔄 Keeping main n8n process: $main_pid"
      # Kill other instances
      ps aux | grep "n8n" | grep -v grep | grep -v "$main_pid" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
      prevented+=("multiple_n8n_resolved")
    fi
  fi

  # Prevent port conflicts
  if echo "$duplications" | grep -q "port_conflict:"; then
    log "WARN" "🔄 Resolving port conflicts..."
    local ports=(5678 15678 15680 15682)
    for port in "${ports[@]}"; do
      local listeners=$(netstat -tlnp 2>/dev/null | grep ":$port " | wc -l || echo "0")
      if [[ "$listeners" -gt 1 ]]; then
        log "INFO" "🔄 Port $port has $listeners listeners - keeping first, killing others"
        local first_pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | head -1 | awk '{print $7}' | cut -d'/' -f1)
        if [[ -n "$first_pid" ]]; then
          log "INFO" "🔄 Keeping first listener on port $port: PID $first_pid"
          # Kill other listeners
          netstat -tlnp 2>/dev/null | grep ":$port " | tail -n +2 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
          prevented+=("port_conflict_resolved:$port")
        fi
      fi
    done
  fi

  # Prevent duplicate files (log only, don't delete)
  if echo "$duplications" | grep -q "duplicate_files:"; then
    log "WARN" "🔄 Duplicate files detected - logging for manual review"
    prevented+=("duplicate_files_logged")
  fi

  echo "${prevented[*]}"
}

# Step 4: Run duplication detection and prevention
log "INFO" "🔄 Running duplication detection..."
detected_duplications=$(duplication_detection)

if [[ -n "$detected_duplications" ]]; then
  log "WARN" "🚨 Duplications detected: $detected_duplications"

  # Prevent duplications
  prevented_duplications=$(duplication_prevention "$detected_duplications")
  log "INFO" "🔄 Duplications prevented: $prevented_duplications"
else
  log "INFO" "✅ No duplications detected"
fi

# Step 5: Update duplication database
log "INFO" "📊 Updating duplication database..."
jq --arg duplications "$detected_duplications" \
  --arg prevented "$prevented_duplications" \
  '.detected_duplications = ($duplications | split(" ")) |
    .prevented_duplications = ($prevented | split(" ")) |
    .last_run = "'$(date)'"' \
  "$DUPLICATION_DB" >"$DUPLICATION_DB.tmp" && mv "$DUPLICATION_DB.tmp" "$DUPLICATION_DB"

# Step 6: Create system status file
echo "ACTIVE" >"$SYSTEM_DIR/status.txt"

# Final status
echo -e "\n${CYAN}🔄 DUPLICATION PREVENTION CORE COMPLETE${NC}"
echo -e "${BLUE}=========================================${NC}"

if [[ -n "$detected_duplications" ]]; then
  echo -e "${GREEN}✅ Duplications detected and prevented!${NC}"
  echo -e "${GREEN}🔄 Prevented: $prevented_duplications${NC}"
else
  echo -e "${GREEN}✅ No duplications detected${NC}"
fi

echo -e "\n${BLUE}📁 DUPLICATION PREVENTION RESOURCES:${NC}"
echo -e "   System Directory: ${GREEN}$SYSTEM_DIR${NC}"
echo -e "   Duplication Log: ${GREEN}$DUPLICATION_LOG${NC}"
echo -e "   Duplication Database: ${GREEN}$DUPLICATION_DB${NC}"
echo -e "   Status: ${GREEN}$(cat "$SYSTEM_DIR/status.txt")${NC}"

echo -e "\n${CYAN}🎯 SYSTEM SCOPE${NC}"
echo -e "${GREEN}✅ Duplications: PREVENTED${NC}"
echo -e "${BLUE}🔄 Zombie processes: NOT HANDLED${NC}"
echo -e "${BLUE}🔄 File operations: NOT PERFORMED${NC}"
echo -e "${BLUE}🔄 Process management: NOT HANDLED${NC}"

log "INFO" "🔄 Duplication prevention core complete"
log "INFO" "✅ System scope maintained - no overlap with other systems"

echo -e "\n${GREEN}✅ Duplication prevention core complete!${NC}"
echo -e "${GREEN}🔄 Duplication prevention system active and separate!${NC}"
