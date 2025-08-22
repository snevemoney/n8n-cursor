#!/bin/bash

# MCP Guardian - Ensures n8n API key never fails
# Created to protect against MCP tool failures

set -euo pipefail

# Configuration
MCP_FILE="/home/evens/.cursor/mcp.json"
BACKUP_DIR="/home/evens/.cursor/backups"
LOG_FILE="/home/evens/logs/mcp_guardian.log"
API_URL="https://n8ncloud.tech/api/v1"

# Current working API key (PERMANENT BACKUP)
WORKING_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NjQxNzY0fQ.i23-xVHsClrhfdHisuZnB7YTHYoYkowveDEt9xC_dPU"

# Create backup directory
mkdir -p "$BACKUP_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to test API key
test_api_key() {
  local key="$1"
  local response
  response=$(curl -s -H "X-N8N-API-KEY: $key" "$API_URL/workflows" 2>/dev/null)

  if echo "$response" | jq -e '.data' >/dev/null 2>&1; then
    return 0 # Success
  else
    return 1 # Failed
  fi
}

# Function to extract current API key from MCP config
get_current_api_key() {
  if [[ -f "$MCP_FILE" ]]; then
    jq -r '.mcpServers."n8n-mcp".env.N8N_API_KEY // empty' "$MCP_FILE" 2>/dev/null || echo ""
  else
    echo ""
  fi
}

# Function to restore working API key
restore_working_key() {
  log "🔧 RESTORING WORKING API KEY"

  # Create backup of current config
  if [[ -f "$MCP_FILE" ]]; then
    cp "$MCP_FILE" "$BACKUP_DIR/mcp.json.backup.$(date +%Y%m%d_%H%M%S)"
  fi

  # Update the API key in the JSON file
  jq --arg key "$WORKING_API_KEY" '.mcpServers."n8n-mcp".env.N8N_API_KEY = $key' "$MCP_FILE" >"$MCP_FILE.tmp" && mv "$MCP_FILE.tmp" "$MCP_FILE"

  log "✅ API key restored successfully"
}

# Main monitoring function
monitor_mcp() {
  log "🔍 Starting MCP Guardian monitoring..."

  # Check if MCP file exists
  if [[ ! -f "$MCP_FILE" ]]; then
    log "❌ MCP file not found: $MCP_FILE"
    return 1
  fi

  # Get current API key
  current_key=$(get_current_api_key)

  if [[ -z "$current_key" ]]; then
    log "❌ No API key found in MCP config"
    restore_working_key
    return 0
  fi

  # Test current API key
  if test_api_key "$current_key"; then
    log "✅ Current API key is working (${current_key:0:20}...)"
  else
    log "❌ Current API key failed (${current_key:0:20}...)"
    log "🔧 Restoring known working key..."
    restore_working_key

    # Test the restored key
    if test_api_key "$WORKING_API_KEY"; then
      log "✅ Working API key restored successfully"
    else
      log "🚨 CRITICAL: Even the backup API key is failing!"
      return 1
    fi
  fi
}

# Command line interface
case "${1:-monitor}" in
"monitor")
  monitor_mcp
  ;;
"restore")
  restore_working_key
  ;;
"test")
  current_key=$(get_current_api_key)
  if [[ -n "$current_key" ]] && test_api_key "$current_key"; then
    echo "✅ API key is working"
  else
    echo "❌ API key is not working"
    exit 1
  fi
  ;;
"backup")
  if [[ -f "$MCP_FILE" ]]; then
    backup_file="$BACKUP_DIR/mcp.json.manual.$(date +%Y%m%d_%H%M%S)"
    cp "$MCP_FILE" "$backup_file"
    echo "✅ MCP config backed up to: $backup_file"
  else
    echo "❌ MCP file not found"
    exit 1
  fi
  ;;
*)
  echo "Usage: $0 {monitor|restore|test|backup}"
  echo "  monitor  - Check and fix API key if needed (default)"
  echo "  restore  - Force restore the working API key"
  echo "  test     - Test current API key"
  echo "  backup   - Create manual backup"
  exit 1
  ;;
esac
