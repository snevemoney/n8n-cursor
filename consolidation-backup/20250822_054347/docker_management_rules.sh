#!/bin/bash

# Professional Docker Management Rules for evens's n8n Environment
# =============================================================

echo "�� Docker Management Rules & Cleanup Script"
echo "==========================================="

# Rule 1: Always backup data before any Docker operation
backup_n8n_data() {
  echo "📦 Rule 1: Backing up n8n data..."
  sudo cp -r /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ \
    /tmp/n8n_backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null
  echo "✅ Backup completed to /tmp/"
}

# Rule 2: Check for port conflicts before starting containers
check_port_conflicts() {
  echo "🔍 Rule 2: Checking for port conflicts..."
  if netstat -tulpn | grep -q ":5678 "; then
    echo "⚠️  Port 5678 is in use. Finding and stopping conflicting processes..."
    sudo lsof -ti:5678 | xargs -r sudo kill -9
    echo "✅ Port 5678 is now free"
  else
    echo "✅ Port 5678 is available"
  fi
}

# Rule 3: Clean stop and restart (no force unless necessary)
clean_docker_restart() {
  echo "🔄 Rule 3: Clean Docker restart..."
  docker-compose down --remove-orphans
  sleep 3
  check_port_conflicts
  docker-compose up -d
}

# Rule 4: Verify container health after start
verify_container_health() {
  echo "🏥 Rule 4: Verifying container health..."
  sleep 10
  if docker ps | grep -q "n8n-cursor_n8n_1.*Up"; then
    echo "✅ Container is running"
    # Check if n8n is responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200"; then
      echo "✅ n8n is responding on port 5678"
    else
      echo "⚠️  n8n container running but not responding yet (still starting up)"
    fi
  else
    echo "❌ Container failed to start"
    docker logs n8n-cursor_n8n_1 | tail -10
  fi
}

# Rule 5: Emergency cleanup (use only when things are stuck)
emergency_cleanup() {
  echo "🚨 Rule 5: Emergency cleanup..."
  docker kill $(docker ps -q) 2>/dev/null || true
  docker rm $(docker ps -aq) 2>/dev/null || true
  docker network prune -f
  sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true
  echo "✅ Emergency cleanup completed"
}

# Main execution
case "${1:-help}" in
"backup")
  backup_n8n_data
  ;;
"restart")
  backup_n8n_data
  clean_docker_restart
  verify_container_health
  ;;
"emergency")
  backup_n8n_data
  emergency_cleanup
  clean_docker_restart
  verify_container_health
  ;;
"check")
  check_port_conflicts
  verify_container_health
  ;;
*)
  echo "Usage:"
  echo "  ./docker_management_rules.sh backup    - Backup n8n data"
  echo "  ./docker_management_rules.sh restart   - Clean restart with rules"
  echo "  ./docker_management_rules.sh emergency - Emergency cleanup & restart"
  echo "  ./docker_management_rules.sh check     - Check current status"
  echo ""
  echo "Professional Docker Rules:"
  echo "1. Always backup before Docker operations"
  echo "2. Check for port conflicts before starting"
  echo "3. Use clean stops/starts (no force unless emergency)"
  echo "4. Verify container health after operations"
  echo "5. Emergency cleanup only when needed"
  ;;
esac
