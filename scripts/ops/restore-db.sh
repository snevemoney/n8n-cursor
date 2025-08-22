#!/usr/bin/env bash
# Database Restore Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

# Check for required environment variable
if [[ -z "${MASTER_UNLOCK:-}" ]]; then
  log_error "MASTER_UNLOCK environment variable is required for database restore"
  log_info "Set it with: export MASTER_UNLOCK='your_encryption_key'"
  exit 1
fi

# Get backup file from argument
BACKUP_FILE="${1:-}"
if [[ -z "$BACKUP_FILE" ]]; then
  log_error "Usage: $0 <backup_file.sql.gz>"
  log_info "Available backups:"
  ls -la "$PROJECT_ROOT/backups/db/"*.sql.gz 2>/dev/null || log_info "No backups found"
  exit 1
fi

# Verify backup file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
  log_error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

log_info "Database Restore"
log_info "================"
log_info "Backup file: $BACKUP_FILE"
log_info "MASTER_UNLOCK: ${MASTER_UNLOCK:0:8}... (truncated)"

# Check if running in DRY_RUN mode
if [[ "${DRY_RUN:-1}" == "1" ]]; then
  log_warn "[DRY-RUN] Would restore database from: $BACKUP_FILE"
  log_warn "[DRY-RUN] This will OVERWRITE the current database!"
  log_warn "[DRY-RUN] Commands that would be executed:"
  log_warn "[DRY-RUN] 1. Stop n8n service"
  log_warn "[DRY-RUN] 2. Drop and recreate database"
  log_warn "[DRY-RUN] 3. Restore from backup"
  log_warn "[DRY-RUN] 4. Restart services"
  log_warn "[DRY-RUN] Set DRY_RUN=0 to execute actual restore"
  exit 0
fi

# Double confirmation for restore
log_warn "⚠️  WARNING: This will OVERWRITE the current database!"
log_warn "⚠️  Make sure you have a current backup before proceeding."
log_warn "⚠️  Press Ctrl+C to cancel, or wait 10 seconds to continue..."
sleep 10

# Check if PostgreSQL container is running
if ! docker ps --filter "name=n8n-postgres" --filter "status=running" | grep -q n8n-postgres; then
  log_error "PostgreSQL container (n8n-postgres) is not running"
  log_info "Start the services with: DRY_RUN=0 make up"
  exit 1
fi

log_info "Stopping n8n service..."
docker stop n8n 2>/dev/null || true

log_info "Preparing database for restore..."
# Drop and recreate database
docker exec n8n-postgres psql -U n8n -d postgres -c "DROP DATABASE IF EXISTS n8n;"
docker exec n8n-postgres psql -U n8n -d postgres -c "CREATE DATABASE n8n;"

log_info "Restoring database from backup..."
if gunzip -c "$BACKUP_FILE" | docker exec -i n8n-postgres psql -U n8n -d n8n; then
  log_info "✅ Database restore completed successfully"

  log_info "Restarting n8n service..."
  docker start n8n

  # Wait for n8n to start
  log_info "Waiting for n8n to start..."
  sleep 5

  # Verify n8n is running
  if docker ps --filter "name=n8n" --filter "status=running" | grep -q n8n; then
    log_info "✅ n8n service restarted successfully"
    log_info "✅ Database restore complete"
  else
    log_error "❌ n8n failed to start after restore"
    exit 1
  fi
else
  log_error "❌ Database restore failed"
  log_info "Attempting to restart n8n anyway..."
  docker start n8n || true
  exit 1
fi
