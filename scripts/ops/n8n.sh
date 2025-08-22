#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/infra/docker/docker-compose.yml"

source "$SCRIPT_DIR/../utils/lib.sh"

# Default values
export DRY_RUN=${DRY_RUN:-1}
export COMPOSE_FILE

log_info "n8n operations script"

case "${1:-}" in
up)
  log_info "Starting n8n services..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE up -d"
  else
    cd "$PROJECT_ROOT/infra/docker"
    docker compose up -d
    log_info "n8n services started"
  fi
  ;;
down)
  log_info "Stopping n8n services..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE down"
  else
    cd "$PROJECT_ROOT/infra/docker"
    docker compose down
    log_info "n8n services stopped"
  fi
  ;;
restart)
  log_info "Restarting n8n services..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE restart"
  else
    cd "$PROJECT_ROOT/infra/docker"
    docker compose restart
    log_info "n8n services restarted"
  fi
  ;;
status)
  log_info "Checking n8n services status..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE ps"
  else
    cd "$PROJECT_ROOT/infra/docker"
    docker compose ps
  fi
  ;;
logs)
  log_info "Showing n8n services logs..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE logs -f"
  else
    cd "$PROJECT_ROOT/infra/docker"
    docker compose logs -f
  fi
  ;;
backup)
  log_info "Creating n8n backup..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Backup would be created in backups/ directory"
  else
    cd "$PROJECT_ROOT"
    mkdir -p backups
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U n8n n8n >"backups/n8n_backup_$(date +%Y%m%d_%H%M%S).sql"
    log_info "Backup created successfully"
  fi
  ;;
restore)
  log_info "Restoring n8n from backup..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Restore would be performed from backups/ directory"
  else
    cd "$PROJECT_ROOT"
    if [[ -z "${2:-}" ]]; then
      log_error "Please specify backup file: $0 restore <backup_file>"
      exit 1
    fi
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U n8n n8n <"backups/$2"
    log_info "Restore completed successfully"
  fi
  ;;
*)
  log_error "Usage: $0 {up|down|restart|status|logs|backup|restore}"
  exit 1
  ;;
esac

log_info "n8n operation completed"
