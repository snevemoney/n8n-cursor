#!/usr/bin/env bash
# Health Endpoint Check Script
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils/lib.sh"

# Configuration
N8N_URL="${N8N_URL:-http://localhost:5678}"
HEALTH_ENDPOINT="${N8N_URL}/healthz"
TIMEOUT=10

log_info "Health Endpoint Check"
log_info "===================="
log_info "Checking: $HEALTH_ENDPOINT"

# Check if curl is available
if ! command -v curl &>/dev/null; then
  log_error "curl is not installed"
  exit 1
fi

# Function to check service health
check_service() {
  local service_name="$1"
  local check_command="$2"

  log_info "Checking $service_name..."
  if eval "$check_command" &>/dev/null; then
    log_info "✅ $service_name: OK"
    return 0
  else
    log_error "❌ $service_name: FAIL"
    return 1
  fi
}

# Check Docker services
log_info "== Docker Services =="
check_service "n8n container" "docker ps --filter 'name=n8n' --filter 'status=running' | grep -q n8n"
n8n_status=$?

check_service "PostgreSQL container" "docker ps --filter 'name=n8n-postgres' --filter 'status=running' | grep -q n8n-postgres"
postgres_status=$?

# Check network connectivity
log_info "== Network Connectivity =="
check_service "n8n port 5678" "nc -z localhost 5678"
port_status=$?

# Check health endpoint if available
log_info "== Health Endpoint =="
if curl -f -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" >/dev/null 2>&1; then
  log_info "✅ Health endpoint: OK"
  health_response=$(curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" 2>/dev/null)
  if [[ -n "$health_response" ]]; then
    log_info "Response: $health_response"
  fi
  endpoint_status=0
else
  log_warn "⚠️  Health endpoint: Not responding (this may be normal if not implemented)"
  log_info "Trying basic n8n endpoint..."
  if curl -f -s --max-time $TIMEOUT "$N8N_URL" >/dev/null 2>&1; then
    log_info "✅ n8n web interface: OK"
    endpoint_status=0
  else
    log_error "❌ n8n web interface: FAIL"
    endpoint_status=1
  fi
fi

# Check disk space
log_info "== Disk Space =="
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [[ $disk_usage -lt 80 ]]; then
  log_info "✅ Disk space: OK (${disk_usage}% used)"
  disk_status=0
elif [[ $disk_usage -lt 90 ]]; then
  log_warn "⚠️  Disk space: WARNING (${disk_usage}% used)"
  disk_status=0
else
  log_error "❌ Disk space: CRITICAL (${disk_usage}% used)"
  disk_status=1
fi

# Check memory usage
log_info "== Memory Usage =="
if command -v free &>/dev/null; then
  memory_usage=$(free | awk 'NR==2{printf "%.0f", $3/$2 * 100}')
  if [[ $memory_usage -lt 80 ]]; then
    log_info "✅ Memory usage: OK (${memory_usage}% used)"
    memory_status=0
  elif [[ $memory_usage -lt 90 ]]; then
    log_warn "⚠️  Memory usage: WARNING (${memory_usage}% used)"
    memory_status=0
  else
    log_error "❌ Memory usage: CRITICAL (${memory_usage}% used)"
    memory_status=1
  fi
else
  log_warn "⚠️  Memory check: Unavailable"
  memory_status=0
fi

# Overall health assessment
log_info "== Health Summary =="
total_checks=$((n8n_status + postgres_status + port_status + endpoint_status + disk_status + memory_status))

if [[ $total_checks -eq 0 ]]; then
  log_info "✅ Overall health: HEALTHY"
  exit 0
elif [[ $total_checks -le 2 ]]; then
  log_warn "⚠️  Overall health: DEGRADED ($total_checks issues)"
  exit 1
else
  log_error "❌ Overall health: UNHEALTHY ($total_checks issues)"
  exit 2
fi
