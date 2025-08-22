#!/usr/bin/env bash
# Database Backup Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

# Configuration
BACKUP_DIR="$PROJECT_ROOT/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/n8n_backup_$DATE.sql.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

log_info "Database Backup"
log_info "==============="

# Check if running in DRY_RUN mode
if [[ "${DRY_RUN:-1}" == "1" ]]; then
  log_info "[DRY-RUN] Would create database backup:"
  log_info "[DRY-RUN] Backup file: $BACKUP_FILE"
  log_info "[DRY-RUN] Command: docker exec n8n-postgres pg_dump -U n8n -d n8n | gzip > $BACKUP_FILE"
  log_info "[DRY-RUN] Set DRY_RUN=0 to execute actual backup"
  exit 0
fi

# Check if PostgreSQL container is running
if ! docker ps --filter "name=n8n-postgres" --filter "status=running" | grep -q n8n-postgres; then
  log_error "PostgreSQL container (n8n-postgres) is not running"
  log_info "Start the services with: DRY_RUN=0 make up"
  exit 1
fi

log_info "Creating database backup..."
log_info "Backup file: $BACKUP_FILE"

# Create the backup
if docker exec n8n-postgres pg_dump -U n8n -d n8n | gzip >"$BACKUP_FILE"; then
  log_info "✅ Database backup created successfully"
  log_info "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

  # Verify backup
  if [[ -s "$BACKUP_FILE" ]]; then
    log_info "✅ Backup file verified (non-empty)"
  else
    log_error "❌ Backup file is empty"
    exit 1
  fi

  # Clean up old backups (keep last 7 days)
  log_info "Cleaning up old backups (keeping last 7 days)..."
  find "$BACKUP_DIR" -name "n8n_backup_*.sql.gz" -mtime +7 -delete 2>/dev/null || true

  log_info "Backup complete: $BACKUP_FILE"
else
  log_error "❌ Database backup failed"
  exit 1
fi
