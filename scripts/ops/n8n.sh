#!/bin/bash

# n8n Operations Management Script
# Handles all n8n service operations: up, down, restart, status, logs, backup, restore

set -Eeuo pipefail

# Source utility library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

# Configuration
readonly N8N_SERVICE="n8n-original"
readonly N8N_PORT="5678"
readonly N8N_URL="https://n8ncloud.tech"
readonly BACKUP_DIR="/home/evens/n8n-cursor/backups"
readonly LOG_DIR="/home/evens/n8n-cursor/logs"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Log file for this session
readonly LOG_FILE="$LOG_DIR/ops-$(date +%Y%m%d).log"

# Log to both console and file
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Function to check if n8n is running
is_n8n_running() {
    systemctl is-active --quiet "$N8N_SERVICE"
}

# Function to check if n8n is accessible
is_n8n_accessible() {
    curl -s --max-time 5 "$N8N_URL" >/dev/null 2>&1
}

# Function to start n8n
start_n8n() {
    log_info "Starting n8n service..."
    
    if is_n8n_running; then
        log_warn "n8n is already running"
        return 0
    fi
    
    if is_dry_run; then
        log_info "[DRY RUN] Would start n8n service"
        return 0
    fi
    
    if systemctl start "$N8N_SERVICE"; then
        log_info "n8n service started successfully"
        
        # Wait for service to be fully up
        local attempts=0
        while ! is_n8n_accessible && [[ $attempts -lt 30 ]]; do
            sleep 2
            ((attempts++))
        done
        
        if is_n8n_accessible; then
            log_info "n8n is now accessible at $N8N_URL"
        else
            log_warn "n8n service started but not yet accessible"
        fi
    else
        die "Failed to start n8n service"
    fi
}

# Function to stop n8n
stop_n8n() {
    log_info "Stopping n8n service..."
    
    if ! is_n8n_running; then
        log_warn "n8n is not running"
        return 0
    fi
    
    if is_dry_run; then
        log_info "[DRY RUN] Would stop n8n service"
        return 0
    fi
    
    if systemctl stop "$N8N_SERVICE"; then
        log_info "n8n service stopped successfully"
    else
        die "Failed to stop n8n service"
    fi
}

# Function to restart n8n
restart_n8n() {
    log_info "Restarting n8n service..."
    
    if is_dry_run; then
        log_info "[DRY RUN] Would restart n8n service"
        return 0
    fi
    
    if systemctl restart "$N8N_SERVICE"; then
        log_info "n8n service restarted successfully"
        
        # Wait for service to be fully up
        local attempts=0
        while ! is_n8n_accessible && [[ $attempts -lt 30 ]]; do
            sleep 2
            ((attempts++))
        done
        
        if is_n8n_accessible; then
            log_info "n8n is now accessible at $N8N_URL"
        else
            log_warn "n8n service restarted but not yet accessible"
        fi
    else
        die "Failed to restart n8n service"
    fi
}

# Function to show n8n status
show_status() {
    log_info "n8n Service Status"
    echo "=================="
    
    # Service status
    if is_n8n_running; then
        echo "✅ Service: ACTIVE"
    else
        echo "❌ Service: INACTIVE"
    fi
    
    # Port status
    if netstat -tlnp 2>/dev/null | grep -q ":$N8N_PORT "; then
        echo "✅ Port $N8N_PORT: LISTENING"
    else
        echo "❌ Port $N8N_PORT: NOT LISTENING"
    fi
    
    # Web accessibility
    if is_n8n_accessible; then
        echo "✅ Web Interface: ACCESSIBLE"
    else
        echo "❌ Web Interface: NOT ACCESSIBLE"
    fi
    
    # Docker status (if applicable)
    if command -v docker >/dev/null 2>&1; then
        local docker_status
        docker_status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep n8n || echo "No n8n containers")
        echo "🐳 Docker: $docker_status"
    fi
    
    # Systemd status
    echo ""
    echo "Systemd Status:"
    systemctl status "$N8N_SERVICE" --no-pager -l || true
}

# Function to show n8n logs
show_logs() {
    local lines="${1:-20}"
    
    log_info "Showing last $lines lines of n8n logs..."
    
    if is_dry_run; then
        log_info "[DRY RUN] Would show n8n logs"
        return 0
    fi
    
    journalctl -u "$N8N_SERVICE" -n "$lines" --no-pager
}

# Function to backup n8n data
backup_n8n() {
    local backup_name="n8n_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Creating n8n backup: $backup_name"
    
    if is_dry_run; then
        log_info "[DRY RUN] Would create backup at $backup_path"
        return 0
    fi
    
    mkdir -p "$backup_path"
    
    # Backup n8n data directory
    if [[ -d "/home/n8n/.n8n" ]]; then
        log_info "Backing up n8n data directory..."
        if cp -r "/home/n8n/.n8n" "$backup_path/"; then
            log_info "n8n data backed up successfully"
        else
            log_warn "Failed to backup n8n data directory"
        fi
    fi
    
    # Backup docker-compose files
    if [[ -f "docker-compose.yml" ]]; then
        log_info "Backing up docker-compose files..."
        cp docker-compose*.yml "$backup_path/" 2>/dev/null || true
    fi
    
    # Create backup manifest
    cat > "$backup_path/backup_manifest.txt" << EOF
n8n Backup Manifest
==================
Created: $(date)
Backup Name: $backup_name
Backup Path: $backup_path

Contents:
$(find "$backup_path" -type f | sort)
EOF
    
    log_info "Backup completed: $backup_path"
    log_info "Backup size: $(du -sh "$backup_path" | cut -f1)"
}

# Function to restore n8n data
restore_n8n() {
    local backup_path="$1"
    
    if [[ -z "$backup_path" ]]; then
        log_err "No backup path specified"
        return 1
    fi
    
    if [[ ! -d "$backup_path" ]]; then
        die "Backup directory not found: $backup_path"
    fi
    
    log_info "Restoring n8n from backup: $backup_path"
    
    if ! confirm "Are you sure you want to restore from this backup? This will overwrite current data."; then
        log_info "Restore cancelled by user"
        return 0
    fi
    
    if is_dry_run; then
        log_info "[DRY RUN] Would restore from $backup_path"
        return 0
    fi
    
    # Stop n8n before restore
    if is_n8n_running; then
        log_info "Stopping n8n service for restore..."
        stop_n8n
    fi
    
    # Restore n8n data
    if [[ -d "$backup_path/.n8n" ]]; then
        log_info "Restoring n8n data directory..."
        if cp -r "$backup_path/.n8n" "/home/n8n/"; then
            log_info "n8n data restored successfully"
        else
            die "Failed to restore n8n data"
        fi
    fi
    
    # Restart n8n
    log_info "Starting n8n service after restore..."
    start_n8n
    
    log_info "Restore completed successfully"
}

# Function to list available backups
list_backups() {
    log_info "Available n8n backups:"
    echo "========================"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log_warn "Backup directory not found: $BACKUP_DIR"
        return 0
    fi
    
    local backups
    backups=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "n8n_backup_*" | sort -r)
    
    if [[ -z "$backups" ]]; then
        log_warn "No backups found"
        return 0
    fi
    
    for backup in $backups; do
        local backup_name
        backup_name=$(basename "$backup")
        local backup_size
        backup_size=$(du -sh "$backup" | cut -f1)
        local backup_date
        backup_date=$(stat -c "%y" "$backup" | cut -d' ' -f1)
        
        echo "📦 $backup_name ($backup_size) - $backup_date"
    done
}

# Main function
main() {
    local subcommand="${1:-}"
    
    case "$subcommand" in
        "up"|"start")
            start_n8n
            ;;
        "down"|"stop")
            stop_n8n
            ;;
        "restart")
            restart_n8n
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "${2:-20}"
            ;;
        "backup")
            backup_n8n
            ;;
        "restore")
            restore_n8n "$2"
            ;;
        "list-backups")
            list_backups
            ;;
        "help"|"-h"|"--help")
            show_help \
                "n8n.sh" \
                "n8n Operations Management" \
                "up|down|restart|status|logs|backup|restore|list-backups" \
                "  n8n.sh up          # Start n8n service\n  n8n.sh status      # Show service status\n  n8n.sh backup      # Create backup\n  n8n.sh restore /path/to/backup  # Restore from backup"
            ;;
        "")
            log_err "No subcommand specified"
            show_help \
                "n8n.sh" \
                "n8n Operations Management" \
                "up|down|restart|status|logs|backup|restore|list-backups" \
                "  n8n.sh up          # Start n8n service\n  n8n.sh status      # Show service status\n  n8n.sh backup      # Create backup\n  n8n.sh restore /path/to/backup  # Restore from backup"
            exit 1
            ;;
        *)
            log_err "Invalid subcommand: $subcommand"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
