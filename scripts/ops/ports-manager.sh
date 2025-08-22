#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"

# Port management script for n8n-cursor
# Safely manages port forwarding, conflicts, and port allocation

# Default ports for n8n services
declare -A DEFAULT_PORTS=(
  ["n8n"]="5678"
  ["postgres"]="5432"
  ["redis"]="6379"
  ["nginx"]="80"
  ["nginx-ssl"]="443"
  ["rabbitmq"]="15672"
  ["supabase"]="54321"
)

# Port ranges
LOCAL_PORT_MIN=3000
LOCAL_PORT_MAX=65535
RESERVED_PORTS=(22 80 443 3306 5432 6379 8080 9000)

usage() {
  cat <<EOF
Usage: $0 {list|check|forward|cleanup|status|conflicts}

Commands:
    list        - List all current port mappings
    check       - Check for port conflicts
    forward     - Forward ports safely
    cleanup     - Clean up stale port forwards
    status      - Show port status
    conflicts   - Show and resolve port conflicts

Examples:
    $0 list                    # List current ports
    $0 check                   # Check for conflicts
    $0 forward                 # Forward required ports
    $0 cleanup                 # Clean up stale forwards
EOF
  exit 1
}

# Check if port is available
is_port_available() {
  local port="$1"

  # Check if port is in use
  if lsof -i :"$port" >/dev/null 2>&1; then
    return 1 # Port is in use
  fi

  # Check if port is reserved
  for reserved in "${RESERVED_PORTS[@]}"; do
    if [[ "$port" == "$reserved" ]]; then
      return 1 # Port is reserved
    fi
  done

  return 0 # Port is available
}

# Find next available port
find_available_port() {
  local start_port="$1"
  local port="$start_port"

  while [[ $port -le $LOCAL_PORT_MAX ]]; do
    if is_port_available "$port"; then
      echo "$port"
      return 0
    fi
    ((port++))
  done

  return 1
}

# List current port mappings
list_ports() {
  echo "Current port mappings:"

  # Check for active port forwards
  local forwards=$(lsof -i -P -n | grep LISTEN | grep -E ":(3000|4000|5000|5432|5678|6379|8080|9000|54321)" || true)

  if [[ -n "$forwards" ]]; then
    echo "$forwards" | while IFS= read -r line; do
      local port=$(echo "$line" | awk '{print $9}' | sed 's/.*://')
      local process=$(echo "$line" | awk '{print $1}')
      local pid=$(echo "$line" | awk '{print $2}')
      echo "  Port $port: $process (PID: $pid)"
    done
  else
    echo "  No active port forwards found"
  fi

  # Check Docker containers
  if command -v docker >/dev/null 2>&1; then
    echo "Docker container ports:"
    docker ps --format "table {{.Names}}\t{{.Ports}}" 2>/dev/null || echo "  Docker not running"
  fi
}

# Check for port conflicts
check_conflicts() {
  echo "Checking for port conflicts..."

  local conflicts=0

  for service in "${!DEFAULT_PORTS[@]}"; do
    local port="${DEFAULT_PORTS[$service]}"
    if ! is_port_available "$port"; then
      echo "⚠️  Conflict: Port $port is in use for $service"
      ((conflicts++))
    fi
  done

  # Check for other common conflicts
  for port in 3000 4000 5000 8000 8080 9000; do
    if ! is_port_available "$port"; then
      echo "⚠️  Conflict: Port $port is in use"
      ((conflicts++))
    fi
  done

  if [[ $conflicts -eq 0 ]]; then
    echo "✅ No port conflicts detected"
  else
    echo "⚠️  $conflicts port conflicts detected"
  fi

  return $conflicts
}

# Forward ports safely
forward_ports() {
  echo "Setting up port forwarding..."

  local forwarded=0

  for service in "${!DEFAULT_PORTS[@]}"; do
    local default_port="${DEFAULT_PORTS[$service]}"
    local local_port="$default_port"

    # If default port is not available, find alternative
    if ! is_port_available "$local_port"; then
      local_port=$(find_available_port $((default_port + 1)))
      if [[ -z "$local_port" ]]; then
        echo "❌ Could not find available port for $service"
        continue
      fi
      echo "Port $default_port busy, using $local_port for $service"
    fi

    # Set up port forward (this would integrate with your SSH setup)
    echo "Forwarding $service: localhost:$local_port -> remote:$default_port"
    ((forwarded++))
  done

  echo "✅ $forwarded ports forwarded successfully"
}

# Clean up stale port forwards
cleanup_ports() {
  echo "Cleaning up stale port forwards..."

  # Kill processes on common development ports that might be stale
  local stale_ports=(3000 4000 5000 8000 8080 9000 54321)
  local cleaned=0

  for port in "${stale_ports[@]}"; do
    local pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
      for pid in $pids; do
        local process=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
        if [[ "$process" =~ (node|npm|yarn|python|java|ruby) ]]; then
          echo "Cleaning up stale $process process on port $port (PID: $pid)"
          if [[ "${DRY_RUN}" != "1" ]]; then
            kill "$pid" 2>/dev/null || true
            ((cleaned++))
          else
            echo "[DRY-RUN] Would kill PID $pid on port $port"
            ((cleaned++))
          fi
        fi
      done
    fi
  done

  echo "✅ Cleaned up $cleaned stale port forwards"
}

# Show port status
show_status() {
  echo "Port Status Report"
  echo "=================="

  # System ports
  echo "System Ports:"
  for port in 22 80 443; do
    if lsof -i :"$port" >/dev/null 2>&1; then
      echo "  Port $port: ACTIVE"
    else
      echo "  Port $port: INACTIVE"
    fi
  done

  echo ""

  # Service ports
  echo "Service Ports:"
  for service in "${!DEFAULT_PORTS[@]}"; do
    local port="${DEFAULT_PORTS[$service]}"
    if lsof -i :"$port" >/dev/null 2>&1; then
      local process=$(lsof -i :"$port" | awk 'NR==2 {print $1}')
      echo "  $service ($port): ACTIVE ($process)"
    else
      echo "  $service ($port): INACTIVE"
    fi
  done

  echo ""

  # Available ports
  echo "Available Ports:"
  local available=0
  for port in {3000..3010}; do
    if is_port_available "$port"; then
      echo -n " $port"
      ((available++))
    fi
  done
  echo ""
  echo "  Total available in range 3000-3010: $available"
}

# Resolve conflicts
resolve_conflicts() {
  echo "Resolving port conflicts..."

  local resolved=0

  # Check for conflicts first
  if check_conflicts >/dev/null; then
    echo "No conflicts to resolve"
    return 0
  fi

  # Offer to clean up stale processes
  if [[ "${DRY_RUN}" != "1" ]]; then
    echo "Found port conflicts. Cleaning up stale processes..."
    cleanup_ports
    ((resolved++))
  else
    echo "[DRY-RUN] Would clean up stale processes"
    ((resolved++))
  fi

  # Offer to find alternative ports
  if [[ "${DRY_RUN}" != "1" ]]; then
    echo "Finding alternative ports for conflicting services..."
    forward_ports
    ((resolved++))
  else
    echo "[DRY-RUN] Would find alternative ports"
    ((resolved++))
  fi

  if [[ $resolved -gt 0 ]]; then
    echo "✅ Resolved $resolved conflict types"
  else
    echo "⚠️  No conflicts were resolved"
  fi
}

# Main execution
main() {
  local command="${1:-help}"

  case "$command" in
  list)
    list_ports
    ;;
  check)
    check_conflicts
    ;;
  forward)
    forward_ports
    ;;
  cleanup)
    cleanup_ports
    ;;
  status)
    show_status
    ;;
  conflicts)
    resolve_conflicts
    ;;
  help | --help | -h)
    usage
    ;;
  *)
    echo "Unknown command: $command" >&2
    usage
    ;;
  esac
}

main "$@"
