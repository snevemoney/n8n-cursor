#!/bin/bash

# Docker Isolation System - Prevent ALL Docker conflicts with evens's services
# ===========================================================================

echo "🛡️ Docker Isolation & Conflict Prevention System"
echo "================================================"

# Rule 1: Use non-conflicting ports for ALL Docker services
DOCKER_N8N_PORT=15678 # Different port to avoid conflicts
HOST_N8N_PORT=5678    # Your real n8n port

# Rule 2: Create isolated Docker network range
DOCKER_SUBNET="172.30.0.0/16" # Dedicated subnet for Docker

# Rule 3: Map Docker services to isolated ports with nginx reverse proxy
setup_isolated_docker() {
  echo "🔧 Setting up isolated Docker environment..."

  # Stop any existing Docker containers
  docker stop $(docker ps -q) 2>/dev/null || true
  docker rm $(docker ps -aq) 2>/dev/null || true

  # Create isolated network
  docker network create --driver bridge --subnet=$DOCKER_SUBNET n8n-isolated 2>/dev/null || true

  echo "✅ Docker isolation network created"
}

# Rule 4: Create nginx reverse proxy to handle routing
setup_nginx_proxy() {
  echo "🌐 Setting up nginx proxy for Docker isolation..."

  cat >/tmp/docker-n8n-proxy.conf <<'NGINX_CONF'
# Docker n8n isolation proxy
upstream docker-n8n {
    server 127.0.0.1:15678;
}

server {
    listen 15680;  # Isolated access port for Docker n8n
    server_name docker-n8n.local;
    
    location / {
        proxy_pass http://docker-n8n;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX_CONF

  sudo cp /tmp/docker-n8n-proxy.conf /etc/nginx/sites-available/docker-n8n-proxy
  sudo ln -sf /etc/nginx/sites-available/docker-n8n-proxy /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx

  echo "✅ Nginx proxy configured for Docker isolation"
}

# Rule 5: Create isolated docker-compose with non-conflicting ports
create_isolated_compose() {
  echo "📝 Creating isolated Docker Compose configuration..."

  cat >docker-compose-isolated.yml <<'COMPOSE_EOF'
version: '3.8'

services:
  n8n-isolated:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "15678:5678"  # Map to isolated port
    environment:
      - N8N_HOST=docker-n8n.local
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_EDITOR_BASE_URL=http://localhost:15680/
      - WEBHOOK_URL=http://localhost:15680/
      - N8N_SECURE_COOKIE=false
      - N8N_LOG_LEVEL=info
      - DB_SQLITE_POOL_SIZE=10
      - N8N_RUNNERS_ENABLED=true
    volumes:
      - n8n_isolated_data:/home/node/.n8n
    networks:
      - n8n-isolated

volumes:
  n8n_isolated_data:

networks:
  n8n-isolated:
    external: true
COMPOSE_EOF

  echo "✅ Isolated Docker Compose created"
}

# Rule 6: Port conflict prevention system
prevent_port_conflicts() {
  echo "🚫 Implementing port conflict prevention..."

  # Create port reservation system
  cat >/etc/docker/daemon.json <<'DAEMON_EOF'
{
  "bip": "172.30.1.1/24",
  "fixed-cidr": "172.30.1.0/25",
  "default-address-pools": [
    {
      "base": "172.30.0.0/16",
      "size": 24
    }
  ],
  "userland-proxy": false
}
DAEMON_EOF

  sudo systemctl restart docker
  echo "✅ Docker daemon configured for isolation"
}

# Rule 7: Service isolation check
check_service_isolation() {
  echo "🔍 Checking service isolation..."

  echo "Host n8n service check:"
  if ps aux | grep -v grep | grep -q "n8n.*5678"; then
    echo "✅ Host n8n service detected on port 5678"
  else
    echo "⚠️  Host n8n service not detected"
  fi

  echo "Docker service check:"
  if docker ps | grep -q "15678"; then
    echo "✅ Docker n8n service on isolated port 15678"
  else
    echo "⚠️  Docker n8n service not running"
  fi

  echo "Port conflict check:"
  if netstat -tulpn | grep -q ":5678.*docker"; then
    echo "❌ CONFLICT: Docker is using host port 5678"
    return 1
  else
    echo "✅ No port conflicts detected"
  fi
}

# Rule 8: Emergency isolation enforcement
emergency_isolate() {
  echo "🚨 Emergency Docker isolation enforcement..."

  # Kill all Docker processes using host ports
  sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true

  # Stop Docker service
  sudo systemctl stop docker

  # Restart your host n8n service
  if systemctl is-active --quiet n8n-original; then
    sudo systemctl restart n8n-original
  else
    # Start your original n8n
    sudo -u n8n /usr/bin/n8n &
  fi

  # Restart Docker with isolation
  sudo systemctl start docker
  setup_isolated_docker

  echo "✅ Emergency isolation completed"
}

# Main execution
case "${1:-help}" in
"setup")
  setup_isolated_docker
  setup_nginx_proxy
  create_isolated_compose
  prevent_port_conflicts
  ;;
"start")
  setup_isolated_docker
  docker-compose -f docker-compose-isolated.yml up -d
  check_service_isolation
  ;;
"stop")
  docker-compose -f docker-compose-isolated.yml down
  ;;
"emergency")
  emergency_isolate
  ;;
"check")
  check_service_isolation
  ;;
*)
  echo "Docker Isolation System - Prevent ALL conflicts"
  echo "=============================================="
  echo ""
  echo "Usage:"
  echo "  ./docker_isolation_system.sh setup     - Set up complete isolation"
  echo "  ./docker_isolation_system.sh start     - Start isolated Docker n8n"
  echo "  ./docker_isolation_system.sh stop      - Stop Docker services"
  echo "  ./docker_isolation_system.sh emergency - Emergency isolation"
  echo "  ./docker_isolation_system.sh check     - Check isolation status"
  echo ""
  echo "Isolation Rules:"
  echo "1. Docker uses ports 15678+ (never 5678)"
  echo "2. Docker uses isolated network 172.30.x.x"
  echo "3. Nginx proxy handles routing"
  echo "4. Host services always have priority"
  echo "5. Emergency isolation if conflicts occur"
  echo ""
  echo "Access:"
  echo "- Host n8n:   https://n8ncloud.tech (port 5678)"
  echo "- Docker n8n: http://localhost:15680 (isolated)"
  ;;
esac
