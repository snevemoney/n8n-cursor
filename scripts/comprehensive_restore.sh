#!/bin/bash

# Comprehensive N8N Restoration System
# Handles complete restoration including Docker, nginx, and 502 gateway fixes

BACKUP_ROOT="/home/evens/n8n-cursor/backups"

echo "🚨 COMPREHENSIVE N8N RESTORATION STARTING..."
echo "============================================"

# Function to wait for service to be ready
wait_for_service() {
  local service_name=$1
  local max_attempts=$2
  local attempt=1

  echo "⏳ Waiting for $service_name to be ready..."
  while [ $attempt -le $max_attempts ]; do
    if curl -s --max-time 5 "$service_name" >/dev/null 2>&1; then
      echo "   ✅ $service_name is responding"
      return 0
    fi
    echo "   ⏳ Attempt $attempt/$max_attempts - $service_name not ready yet..."
    sleep 5
    ((attempt++))
  done
  echo "   ❌ $service_name failed to respond after $max_attempts attempts"
  return 1
}

# Function to fix 502 gateway issues
fix_502_gateway() {
  echo "🔧 FIXING 502 GATEWAY ISSUES..."
  echo "==============================="

  echo "🛑 Step 1: Stop all conflicting services..."
  sudo systemctl stop nginx 2>/dev/null || true
  docker-compose down 2>/dev/null || true
  sudo pkill -f "n8n" 2>/dev/null || true
  sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true

  echo "⏳ Step 2: Wait for ports to be released..."
  sleep 10

  echo "🐳 Step 3: Start Docker container first..."
  cd /home/evens/n8n-cursor
  docker-compose up -d

  echo "⏳ Step 4: Wait for n8n to be fully ready..."
  wait_for_service "http://localhost:5678" 12

  echo "🌐 Step 5: Configure and start nginx..."
  # Ensure nginx config is correct
  sudo tee /etc/nginx/sites-available/n8n >/dev/null <<'EOF'
server {
    listen 80;
    server_name n8ncloud.tech;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_buffer_size 4k;
    }
}
EOF

  # Enable the site
  sudo ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/n8n

  # Test nginx config
  if sudo nginx -t >/dev/null 2>&1; then
    echo "   ✅ Nginx configuration is valid"
    sudo systemctl start nginx
    sudo systemctl enable nginx
  else
    echo "   ❌ Nginx configuration error, checking..."
    sudo nginx -t
    return 1
  fi

  echo "⏳ Step 6: Wait for domain access to be ready..."
  wait_for_service "https://n8ncloud.tech" 6

  echo "✅ 502 Gateway issues resolved!"
}

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "📁 No specific backup provided, finding latest..."
  LATEST_BACKUP=$(ls -t "$BACKUP_ROOT"/complete_backup_*.tar.gz 2>/dev/null | head -1)
  if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No comprehensive backups found!"
    echo "   Creating emergency backup from original data..."
    /home/evens/n8n-cursor/scripts/comprehensive_backup.sh
    exit 1
  fi
  BACKUP_FILE="$LATEST_BACKUP"
else
  BACKUP_FILE="$1"
fi

echo "📁 Using backup: $(basename "$BACKUP_FILE")"

# Extract backup
RESTORE_DIR="/tmp/n8n_restore_$$"
mkdir -p "$RESTORE_DIR"
cd "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE"

EXTRACTED_DIR=$(find . -name "complete_backup_*" -type d | head -1)
if [ -z "$EXTRACTED_DIR" ]; then
  echo "❌ Failed to extract backup file"
  exit 1
fi

cd "$EXTRACTED_DIR"

echo "🛑 Step 1: Stop all services safely..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop n8n-docker.service 2>/dev/null || true
sudo systemctl stop n8n-port-guardian.service 2>/dev/null || true
sudo systemctl stop n8n-health-monitor.service 2>/dev/null || true
docker-compose down 2>/dev/null || true
sudo pkill -f "n8n" 2>/dev/null || true
sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true

echo "💾 Step 2: Restore N8N data..."
if [ -d "docker_data/_data" ]; then
  # Clear current data
  sudo rm -rf /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true
  sudo rm -rf /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true

  # Restore data
  if [ -d "/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r docker_data/_data/* /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
    sudo chown -R 1000:1000 /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
    echo "   ✅ Data restored to snap location"
  elif [ -d "/var/lib/docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r docker_data/_data/* /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
    sudo chown -R 1000:1000 /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
    echo "   ✅ Data restored to standard location"
  fi
else
  echo "   ⚠️ No docker data found in backup"
fi

echo "⚙️ Step 3: Restore system services..."
if [ -d "system_services" ]; then
  sudo cp system_services/*.service /etc/systemd/system/ 2>/dev/null || true
  sudo cp system_services/*.timer /etc/systemd/system/ 2>/dev/null || true
  sudo systemctl daemon-reload
  echo "   ✅ System services restored"
fi

echo "📁 Step 4: Restore project files..."
if [ -d "n8n_project" ]; then
  cp -r n8n_project/* /home/evens/n8n-cursor/ 2>/dev/null || true
  chmod +x /home/evens/n8n-cursor/scripts/*.sh 2>/dev/null || true
  chmod +x /home/evens/n8n-cursor/n8n-manager.sh 2>/dev/null || true
  echo "   ✅ Project files restored"
fi

echo "🌐 Step 5: Restore nginx configuration..."
if [ -d "nginx_config" ]; then
  sudo cp nginx_config/n8n_site /etc/nginx/sites-available/n8n 2>/dev/null || true
  sudo ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/n8n 2>/dev/null || true
  echo "   ✅ Nginx configuration restored"
fi

echo "🚀 Step 6: Start services with 502 gateway protection..."
fix_502_gateway

echo "🛡️ Step 7: Restart protection services..."
sudo systemctl enable n8n-docker.service n8n-port-guardian.service n8n-health-monitor.service n8n-auto-backup.timer 2>/dev/null || true
sudo systemctl start n8n-port-guardian.service n8n-health-monitor.service n8n-auto-backup.timer 2>/dev/null || true

echo "🧪 Step 8: Final verification..."
sleep 10

# Test all endpoints
LOCAL_TEST=$(curl -s --max-time 10 http://localhost:5678 >/dev/null && echo "✅" || echo "❌")
DOMAIN_TEST=$(curl -s --max-time 10 https://n8ncloud.tech >/dev/null && echo "✅" || echo "❌")
CONTAINER_STATUS=$(docker ps | grep -q "n8n-cursor_n8n_1" && echo "✅" || echo "❌")

echo ""
echo "📊 RESTORATION RESULTS:"
echo "======================"
echo "🐳 Docker Container: $CONTAINER_STATUS"
echo "🌐 Local Access (localhost:5678): $LOCAL_TEST"
echo "🌍 Domain Access (n8ncloud.tech): $DOMAIN_TEST"
echo ""

# Cleanup
rm -rf "$RESTORE_DIR"

if [[ "$LOCAL_TEST" == "✅" && "$DOMAIN_TEST" == "✅" && "$CONTAINER_STATUS" == "✅" ]]; then
  echo "🎉 COMPREHENSIVE RESTORATION SUCCESSFUL!"
  echo "======================================="
  echo "Your N8N instance is fully restored and accessible."
  echo ""
  echo "📋 Next steps:"
  echo "1. Login to https://n8ncloud.tech and verify your workflows"
  echo "2. Test a workflow execution to ensure everything works"
  echo "3. Generate new API key if needed for MCP tools"
  echo "4. Run './n8n-manager.sh business-status' to verify protection systems"
else
  echo "⚠️ RESTORATION INCOMPLETE"
  echo "========================"
  echo "Some services may need manual attention:"

  if [[ "$CONTAINER_STATUS" == "❌" ]]; then
    echo "- Docker container is not running"
    echo "  Fix: cd /home/evens/n8n-cursor && docker-compose up -d"
  fi

  if [[ "$LOCAL_TEST" == "❌" ]]; then
    echo "- Local n8n interface is not responding"
    echo "  Fix: Check container logs with 'docker logs n8n-cursor_n8n_1'"
  fi

  if [[ "$DOMAIN_TEST" == "❌" ]]; then
    echo "- Domain access has 502 gateway error"
    echo "  Fix: Run 'sudo systemctl restart nginx' or re-run this script"
  fi
fi

echo ""
echo "🎛️ Management commands:"
echo "./n8n-manager.sh business-status     - Check system status"
echo "./n8n-manager.sh emergency-recovery  - Quick recovery if issues persist"
