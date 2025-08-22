#!/usr/bin/env bash
# n8n Workflows Backup Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

# Configuration
BACKUP_DIR="$PROJECT_ROOT/backups/n8n"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/n8n_workflows_$DATE.json.gz"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

log_info "n8n Workflows Backup"
log_info "===================="

# Check if running in DRY_RUN mode
if [[ "${DRY_RUN:-1}" == "1" ]]; then
  log_info "[DRY-RUN] Would create n8n workflows backup:"
  log_info "[DRY-RUN] Backup file: $BACKUP_FILE"
  log_info "[DRY-RUN] Would copy from: $PROJECT_ROOT/workflows/"
  log_info "[DRY-RUN] Set DRY_RUN=0 to execute actual backup"
  exit 0
fi

# Check if workflows directory exists
if [[ ! -d "$PROJECT_ROOT/workflows" ]]; then
  log_error "Workflows directory not found: $PROJECT_ROOT/workflows"
  exit 1
fi

log_info "Creating n8n workflows backup..."
log_info "Backup file: $BACKUP_FILE"

# Create a JSON export of all workflows
TEMP_DIR=$(mktemp -d)
EXPORT_FILE="$TEMP_DIR/workflows_export.json"

# Initialize JSON array
echo '{"workflows": [' > "$EXPORT_FILE"

# Add each workflow to the export
first=true
for workflow_file in "$PROJECT_ROOT/workflows"/*.json; do
  if [[ -f "$workflow_file" ]]; then
    if [[ "$first" = true ]]; then
      first=false
    else
      echo ',' >> "$EXPORT_FILE"
    fi
    
    # Add workflow with metadata
    echo '  {' >> "$EXPORT_FILE"
    echo "    \"filename\": \"$(basename "$workflow_file")\"," >> "$EXPORT_FILE"
    echo "    \"exported_at\": \"$(date -Iseconds)\"," >> "$EXPORT_FILE"
    echo '    "workflow":' >> "$EXPORT_FILE"
    cat "$workflow_file" >> "$EXPORT_FILE"
    echo '  }' >> "$EXPORT_FILE"
  fi
done

# Close JSON array
echo ']}' >> "$EXPORT_FILE"

# Validate JSON
if jq . "$EXPORT_FILE" >/dev/null 2>&1; then
  log_info "✅ Workflows export JSON is valid"
else
  log_error "❌ Generated JSON is invalid"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Compress and move to backup location
if gzip -c "$EXPORT_FILE" > "$BACKUP_FILE"; then
  log_info "✅ n8n workflows backup created successfully"
  log_info "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
  
  # Count workflows
  WORKFLOW_COUNT=$(jq '.workflows | length' "$EXPORT_FILE")
  log_info "Workflows backed up: $WORKFLOW_COUNT"
  
  # Clean up temp directory
  rm -rf "$TEMP_DIR"
  
  # Clean up old backups (keep last 30 days)
  log_info "Cleaning up old backups (keeping last 30 days)..."
  find "$BACKUP_DIR" -name "n8n_workflows_*.json.gz" -mtime +30 -delete 2>/dev/null || true
  
  log_info "n8n workflows backup complete: $BACKUP_FILE"
else
  log_error "❌ n8n workflows backup failed"
  rm -rf "$TEMP_DIR"
  exit 1
fi
