#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "n8n-cursor Ports Check"

# Check expected ports from docker-compose
log_info "== Expected Ports (from docker-compose.yml) =="
if [[ -f "$PROJECT_ROOT/infra/docker/docker-compose.yml" ]]; then
  log_info "n8n: 5678 (web interface)"
  log_info "PostgreSQL: 5432 (database)"
else
  log_warn "docker-compose.yml not found"
fi

# Check active listeners
log_info "== Active Port Listeners =="
if command -v ss &>/dev/null; then
  ss -tlnp | grep -E ":(5678|5432|80|443|22)" | while read -r line; do
    log_info "Active: $line"
  done
elif command -v netstat &>/dev/null; then
  netstat -tlnp 2>/dev/null | grep -E ":(5678|5432|80|443|22)" | while read -r line; do
    log_info "Active: $line"
  done
else
  log_warn "Neither ss nor netstat available"
fi

# Check for conflicts
log_info "== Port Conflicts =="
for port in 5678 5432 80 443; do
  if ss -tlnp 2>/dev/null | grep -q ":$port "; then
    log_warn "Port $port is busy"
  else
    log_info "Port $port available"
  fi
done

log_info "Ports check complete"
