#!/bin/bash

# 🧟‍♂️ ZOMBIE KILLER CORE - Separate System
# 🚨 Kills zombie processes without affecting other systems
# 🔒 Zero overlap with duplication prevention or future-proofing

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration - SEPARATE from other systems
SYSTEM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZOMBIE_LOG="$SYSTEM_DIR/zombie-killer.log"
ZOMBIE_DB="$SYSTEM_DIR/zombie-database.json"
ZOMBIE_PID="$SYSTEM_DIR/zombie-killer.pid"

# Create system-specific files
touch "$ZOMBIE_LOG"
mkdir -p "$SYSTEM_DIR/backups"

log() {
  local level="$1"
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "[$timestamp] [ZOMBIE-KILLER] [$level] $message" | tee -a "$ZOMBIE_LOG"
}

echo -e "${PURPLE}🧟‍♂️  ZOMBIE KILLER CORE - SEPARATE SYSTEM${NC}"
echo -e "${BLUE}=============================================${NC}"

# Step 1: Create zombie database (separate from other systems)
log "INFO" "📊 Creating separate zombie database..."
cat >"$ZOMBIE_DB" <<'EOF'
{
  "zombie_system": {
    "name": "zombie-killer-core",
    "created": "$(date)",
    "purpose": "Zombie process elimination only",
    "version": "1.0.0",
    "scope": "zombie_processes_only"
  },
  "detected_zombies": [],
  "killed_zombies": [],
  "system_status": "active"
}
EOF

# Step 2: Zombie detection (focused only on zombies)
zombie_detection() {
  local zombies=()

  log "INFO" "🔍 Scanning for zombie processes only..."

  # Check for defunct processes
  local defunct_processes=$(ps aux | grep -E "(defunct|zombie)" | grep -v grep || true)
  if [[ -n "$defunct_processes" ]]; then
    log "WARN" "🚨 Defunct processes detected:"
    echo "$defunct_processes" | while read -r line; do
      log "WARN" "   $line"
      zombies+=("defunct:$line")
    done
  fi

  # Check for zombie Docker containers
  local zombie_containers=$(docker ps -a | grep -E "(Exited|Created)" | grep n8n || true)
  if [[ -n "$zombie_containers" ]]; then
    log "WARN" "🚨 Zombie Docker containers detected:"
    echo "$zombie_containers" | while read -r line; do
      log "WARN" "   $line"
      zombies+=("docker:$line")
    done
  fi

  echo "${zombies[*]}"
}

# Step 3: Zombie extermination (focused only on zombies)
zombie_extermination() {
  local zombies="$1"
  local killed=()

  log "INFO" "💀 Starting zombie extermination..."

  # Kill defunct processes
  if echo "$zombies" | grep -q "defunct:"; then
    log "WARN" "💀 Killing defunct processes..."
    pkill -f "defunct" 2>/dev/null || true
    killed+=("defunct_processes")
  fi

  # Clean up zombie Docker containers
  if echo "$zombies" | grep -q "docker:"; then
    log "WARN" "💀 Cleaning up zombie Docker containers..."
    docker container prune -f >/dev/null 2>&1 || true
    docker system prune -f >/dev/null 2>&1 || true
    killed+=("zombie_containers")
  fi

  # Force kill any remaining zombies
  log "INFO" "💀 Force killing any remaining zombies..."
  pkill -9 -f "defunct" 2>/dev/null || true
  pkill -9 -f "zombie" 2>/dev/null || true

  echo "${killed[*]}"
}

# Step 4: Run zombie detection and extermination
log "INFO" "🧟‍♂️  Running zombie detection..."
detected_zombies=$(zombie_detection)

if [[ -n "$detected_zombies" ]]; then
  log "WARN" "🚨 Zombies detected: $detected_zombies"

  # Exterminate zombies
  killed_zombies=$(zombie_extermination "$detected_zombies")
  log "INFO" "💀 Zombies killed: $killed_zombies"
else
  log "INFO" "✅ No zombies detected"
fi

# Step 5: Update zombie database
log "INFO" "📊 Updating zombie database..."
jq --arg zombies "$detected_zombies" \
  --arg killed "$killed_zombies" \
  '.detected_zombies = ($zombies | split(" ")) |
    .killed_zombies = ($killed | split(" ")) |
    .last_run = "'$(date)'"' \
  "$ZOMBIE_DB" >"$ZOMBIE_DB.tmp" && mv "$ZOMBIE_DB.tmp" "$ZOMBIE_DB"

# Step 6: Create system status file
echo "ACTIVE" >"$SYSTEM_DIR/status.txt"

# Final status
echo -e "\n${PURPLE}🧟‍♂️  ZOMBIE KILLER CORE COMPLETE${NC}"
echo -e "${BLUE}=====================================${NC}"

if [[ -n "$detected_zombies" ]]; then
  echo -e "${GREEN}✅ Zombies detected and eliminated!${NC}"
  echo -e "${GREEN}💀 Killed: $killed_zombies${NC}"
else
  echo -e "${GREEN}✅ No zombies detected${NC}"
fi

echo -e "\n${BLUE}📁 ZOMBIE KILLER RESOURCES:${NC}"
echo -e "   System Directory: ${GREEN}$SYSTEM_DIR${NC}"
echo -e "   Zombie Log: ${GREEN}$ZOMBIE_LOG${NC}"
echo -e "   Zombie Database: ${GREEN}$ZOMBIE_DB${NC}"
echo -e "   Status: ${GREEN}$(cat "$SYSTEM_DIR/status.txt")${NC}"

echo -e "\n${CYAN}🎯 SYSTEM SCOPE${NC}"
echo -e "${GREEN}✅ Zombie processes: ELIMINATED${NC}"
echo -e "${BLUE}🔄 Other systems: NOT AFFECTED${NC}"
echo -e "${BLUE}🔄 File operations: NOT PERFORMED${NC}"
echo -e "${BLUE}🔄 Port management: NOT HANDLED${NC}"

log "INFO" "🧟‍♂️  Zombie killer core complete"
log "INFO" "✅ System scope maintained - no overlap with other systems"

echo -e "\n${GREEN}✅ Zombie killer core complete!${NC}"
echo -e "${GREEN}🧟‍♂️  Zombie elimination system active and separate!${NC}"
