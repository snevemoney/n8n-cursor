#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "Remote n8n repair script"

# Check if MASTER_UNLOCK is set
if [[ -z "${MASTER_UNLOCK:-}" ]]; then
    log_error "MASTER_UNLOCK environment variable not set"
    log_error "Set it with: export MASTER_UNLOCK='your_key_here'"
    exit 1
fi

log_info "MASTER_UNLOCK verified"

# Default remote settings
REMOTE_HOST="${REMOTE_HOST:-69.62.66.78}"
REMOTE_PORT="${REMOTE_PORT:-22222}"
REMOTE_USER="${REMOTE_USER:-evens}"
REMOTE_PATH="${REMOTE_PATH:-/home/evens/.n8n}"

log_info "Remote connection details:"
log_info "  Host: $REMOTE_HOST"
log_info "  Port: $REMOTE_PORT"
log_info "  User: $REMOTE_USER"
log_info "  Path: $REMOTE_PATH"

# Test SSH connection
log_info "== Testing SSH Connection =="
if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would test SSH connection to $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
else
    if ssh -p "$REMOTE_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_USER@$REMOTE_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
        log_info "✅ SSH connection successful"
    else
        log_error "❌ SSH connection failed"
        log_info "Troubleshooting steps:"
        log_info "1. Check if remote host is accessible"
        log_info "2. Verify SSH port is correct"
        log_info "3. Ensure SSH key authentication is set up"
        log_info "4. Check firewall settings"
        exit 1
    fi
fi

# Check remote n8n status
log_info "== Checking Remote n8n Status =="
if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would check remote n8n status"
else
    ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
        echo "=== Remote System Info ==="
        uname -a
        echo "=== Docker Status ==="
        docker ps --filter "name=n8n" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo "=== n8n Process Status ==="
        ps aux | grep n8n | grep -v grep || echo "No n8n processes found"
        echo "=== Port Usage ==="
        netstat -tuln | grep -E ':(5678|22222)' || echo "Ports not in use"
EOF
fi

# Repair options
log_info "== Repair Options =="
echo "1. Restart remote n8n services"
echo "2. Check remote logs"
echo "3. Backup remote data"
echo "4. Restore from local backup"
echo "5. Test webhook endpoints"
echo "6. Exit"

read -p "Select option (1-6): " choice

case $choice in
    1)
        log_info "Restarting remote n8n services..."
        if [[ "$DRY_RUN" == "1" ]]; then
            log_info "[DRY-RUN] Would restart remote services"
        else
            ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
                cd /home/evens/.n8n
                docker compose down
                docker compose up -d
                echo "Services restarted"
EOF
        fi
        ;;
    2)
        log_info "Checking remote logs..."
        if [[ "$DRY_RUN" == "1" ]]; then
            log_info "[DRY-RUN] Would check remote logs"
        else
            ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
                cd /home/evens/.n8n
                docker compose logs --tail=50 n8n
EOF
        fi
        ;;
    3)
        log_info "Creating remote backup..."
        if [[ "$DRY_RUN" == "1" ]]; then
            log_info "[DRY-RUN] Would create remote backup"
        else
            ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
                cd /home/evens/.n8n
                mkdir -p backups
                docker compose exec -T postgres pg_dump -U n8n n8n > "backups/remote_backup_$(date +%Y%m%d_%H%M%S).sql"
                echo "Backup created"
EOF
        fi
        ;;
    4)
        log_info "Restoring from local backup..."
        if [[ "$DRY_RUN" == "1" ]]; then
            log_info "[DRY-RUN] Would restore from local backup"
        else
            read -p "Enter backup file path: " backup_file
            if [[ -f "$backup_file" ]]; then
                scp -P "$REMOTE_PORT" "$backup_file" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
                ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST" << EOF
                    cd /home/evens/.n8n
                    docker compose exec -T postgres psql -U n8n n8n < "/tmp/$(basename "$backup_file")"
                    rm "/tmp/$(basename "$backup_file")"
                    echo "Restore completed"
EOF
            else
                log_error "Backup file not found: $backup_file"
            fi
        fi
        ;;
    5)
        log_info "Testing webhook endpoints..."
        if [[ "$DRY_RUN" == "1" ]]; then
            log_info "[DRY-RUN] Would test webhooks"
        else
            read -p "Enter webhook URL to test: " webhook_url
            if [[ -n "$webhook_url" ]]; then
                curl -X POST "$webhook_url" -H "Content-Type: application/json" -d '{"test": "webhook"}' || echo "Webhook test failed"
            fi
        fi
        ;;
    6)
        log_info "Exiting repair script"
        exit 0
        ;;
    *)
        log_error "Invalid option selected"
        exit 1
        ;;
esac

log_info "Remote repair operation completed"
