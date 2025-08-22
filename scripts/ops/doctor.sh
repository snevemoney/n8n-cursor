#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)
COMPOSE_FILE="$PROJECT_ROOT/infra/docker/docker-compose.yml"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "n8n-cursor Doctor - System Health Check"

# Check environment
log_info "== Environment =="
if [[ -f "$PROJECT_ROOT/.env" ]] || [[ -f "$PROJECT_ROOT/.env.local" ]]; then
    log_info "OK: .env present (or .env.local)"
else
    log_warn "WARN: .env file not found"
fi

# Check required commands
log_info "== Dependencies =="
for cmd in docker jq; do
    if command -v "$cmd" &> /dev/null; then
        log_info "OK: $cmd installed"
    else
        log_error "ERROR: $cmd not found"
    fi
done

# Check Docker
log_info "== Docker =="
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        log_info "OK: daemon running"
    else
        log_error "ERROR: Docker daemon not accessible"
    fi
else
    log_error "ERROR: Docker not installed"
fi

# Check compose
if command -v docker &> /dev/null; then
    if docker compose version &> /dev/null; then
        log_info "OK: compose present"
    else
        log_error "ERROR: Docker Compose not available"
    fi
fi

# Check compose file
if [[ -f "$COMPOSE_FILE" ]]; then
    log_info "OK: docker-compose.yml found"
    if [[ "$DRY_RUN" == "1" ]]; then
        log_info "[DRY-RUN] docker compose -f $COMPOSE_FILE config >/dev/null"
    else
        if docker compose -f "$COMPOSE_FILE" config >/dev/null 2>&1; then
            log_info "OK: compose file valid"
        else
            log_error "ERROR: compose file invalid"
        fi
    fi
else
    log_error "ERROR: docker-compose.yml not found at $COMPOSE_FILE"
fi

# Check disk space
log_info "== Disk space =="
df -h . | tail -1 | awk '{print "Filesystem: " $1 ", Size: " $2 ", Used: " $3 ", Avail: " $4 ", Use%: " $5}'

# Check ports
log_info "== Ports =="
for port in 5678 5432; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        log_warn "Port $port busy"
    else
        log_info "Port $port available"
    fi
done

# Check directory structure
log_info "== Repository Structure =="
required_dirs=(
    "infra/docker"
    "scripts/ops"
    "scripts/workflows"
    "scripts/safety"
    "scripts/utils"
    "scripts/bin"
    "workflows"
    "templates"
    "docs"
    "reports"
    "apps/repo-brain"
    "config"
    "backups"
    "logs"
)

for dir in "${required_dirs[@]}"; do
    if [[ -d "$PROJECT_ROOT/$dir" ]]; then
        log_info "OK: $dir exists"
    else
        log_warn "WARN: $dir missing"
    fi
done

# Check core files
log_info "== Core Files =="
core_files=(
    "Makefile"
    "scripts/utils/lib.sh"
    "scripts/safety/structure-guard.sh"
    "config/repo.schema"
)

for file in "${core_files[@]}"; do
    if [[ -f "$PROJECT_ROOT/$file" ]]; then
        log_info "OK: $file exists"
    else
        log_error "ERROR: $file missing"
    fi
done

# Summary
log_info "== Summary =="
if [[ $? -eq 0 ]]; then
    log_info "Doctor: all checks passed"
else
    log_warn "Doctor: issues found"
    exit 1
fi
