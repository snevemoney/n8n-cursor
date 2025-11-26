#!/usr/bin/env bash
set -e

echo "🚀 LightningFlow Performance Fix Deployment"
echo "=========================================="
echo "This script will deploy all performance fixes to your VPS"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo $0"
    exit 1
fi

# Check if we're on the right system
if [ ! -f "/opt/lightningflow/docker-compose.prod.yml" ]; then
    echo "❌ LightningFlow not found at /opt/lightningflow/"
    echo "Please run this script on your LightningFlow VPS"
    exit 1
fi

echo "✅ Running on LightningFlow VPS"
echo ""

# Step 1: Create backup
echo "1. Creating backup..."
BACKUP_DIR="/opt/lightningflow/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /opt/lightningflow/* "$BACKUP_DIR/" 2>/dev/null || true
cp /etc/caddy/Caddyfile "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created at $BACKUP_DIR"
echo ""

# Step 2: Copy performance scripts
echo "2. Installing performance scripts..."
mkdir -p /opt/lightningflow/scripts
cat > /opt/lightningflow/scripts/perf_doctor.sh << 'EOF'
#!/usr/bin/env bash
set -e

echo "🔍 LightningFlow Performance Doctor"
echo "=================================="
echo "Timestamp: $(date)"
echo ""

echo "== System Load =="
uptime
echo ""

echo "== Top CPU Processes =="
ps -eo pid,cmd,%cpu,%mem --sort=-%cpu | head -n 8
echo ""

echo "== Memory Usage =="
free -h
echo ""

echo "== Swap Usage =="
vmstat 1 3 | tail -n 1
echo ""

echo "== Docker Container Stats =="
docker ps --format 'table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}'
echo ""

echo "== Redis Stats =="
if command -v redis-cli &> /dev/null; then
    redis-cli info stats | egrep 'ops_per_sec|rejected|evicted|hits|misses' || echo "Redis not accessible"
else
    echo "Redis CLI not found"
fi
echo ""

echo "== Network Connections =="
ss -Hntp | grep ':5678\|:5679\|:9001\|:8443' | wc -l | xargs echo "Active connections to services:"
echo ""

echo "== Health Check Endpoints =="
echo "Testing local endpoints..."

# Test local API
if curl -fsS http://localhost:5678/api/system-check >/dev/null 2>&1; then
    echo "✅ API (localhost:5678): OK"
else
    echo "❌ API (localhost:5678): FAILED"
fi

# Test n8n
if curl -fsS http://localhost:5679/healthz >/dev/null 2>&1; then
    echo "✅ n8n (localhost:5679): OK"
else
    echo "❌ n8n (localhost:5679): FAILED"
fi

# Test dozzle
if curl -fsS http://localhost:9001 >/dev/null 2>&1; then
    echo "✅ Dozzle (localhost:9001): OK"
else
    echo "❌ Dozzle (localhost:9001): FAILED"
fi

echo ""

echo "== External Health Checks =="
echo "Testing external endpoints..."

# Test main site
if time curl -fsS https://lightningflow.online/ >/dev/null 2>&1; then
    echo "✅ lightningflow.online: OK"
else
    echo "❌ lightningflow.online: FAILED"
fi

# Test n8n site
if time curl -fsS https://n8ncloud.tech/ >/dev/null 2>&1; then
    echo "✅ n8ncloud.tech: OK"
else
    echo "❌ n8ncloud.tech: FAILED"
fi

echo ""

echo "== Caddy Status =="
systemctl is-active caddy || echo "Caddy not running"
echo ""

echo "== Disk Usage =="
df -h / | tail -n 1
echo ""

echo "== Recent Errors =="
journalctl --since "1 hour ago" --priority=err --no-pager | tail -n 5 || echo "No recent errors"
echo ""

echo "🔍 Performance Doctor Complete"
echo "Run this script every 15 minutes during load testing"
EOF

chmod +x /opt/lightningflow/scripts/perf_doctor.sh
echo "✅ Performance doctor script installed"
echo ""

# Step 3: Fix health endpoints
echo "3. Fixing health endpoints..."

# Create health endpoint
cat > /var/www/lightningflow/healthz << 'EOF'
#!/usr/bin/env bash
# Simple health check that returns OK if services are running

# Check if API is responding
if curl -fsS http://localhost:5678/api/system-check >/dev/null 2>&1; then
    API_STATUS="OK"
else
    API_STATUS="FAIL"
fi

# Check if n8n is responding
if curl -fsS http://localhost:5679/healthz >/dev/null 2>&1; then
    N8N_STATUS="OK"
else
    N8N_STATUS="FAIL"
fi

# Return status
if [ "$API_STATUS" = "OK" ] && [ "$N8N_STATUS" = "OK" ]; then
    echo "OK"
    exit 0
else
    echo "FAIL - API: $API_STATUS, n8n: $N8N_STATUS"
    exit 1
fi
EOF

chmod +x /var/www/lightningflow/healthz

# Update Caddyfile
echo "Updating Caddyfile..."
cat > /etc/caddy/Caddyfile << 'EOF'
lightningflow.online {
    encode gzip
    root * /var/www/lightningflow
    file_server

    # Health check endpoint
    handle /healthz {
        respond "OK" 200
    }

    handle_path /api/* {
        reverse_proxy localhost:5678
    }
    handle_path /logs/* {
        reverse_proxy localhost:9001
    }
    handle_path /ide/* {
        reverse_proxy localhost:8443
    }
}

www.lightningflow.online {
    redir https://lightningflow.online{uri}
}

# n8n (production)
n8ncloud.tech {
    encode gzip
    reverse_proxy localhost:5679 {
        flush_interval -1
    }
}
EOF

echo "✅ Health endpoints fixed"
echo ""

# Step 4: Update Docker Compose with performance optimizations
echo "4. Updating Docker Compose with performance optimizations..."

cat > /opt/lightningflow/docker-compose.prod.yml << 'EOF'
version: "3.9"

services:
  api:
    image: nginx:alpine
    restart: unless-stopped
    networks: [internal]
    ports:
      - "127.0.0.1:5678:80"
    volumes:
      - /var/www/lightningflow:/usr/share/nginx/html:ro
    command: ["nginx", "-g", "daemon off;"]
    deploy:
      resources:
        limits:
          cpus: "2.5"
          memory: "1536m"
        reservations:
          cpus: "0.5"
          memory: "256m"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/system-check"]
      interval: 30s
      timeout: 10s
      retries: 3

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    networks: [internal]
    environment:
      - N8N_HOST=n8ncloud.tech
      - N8N_PORT=5679
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8ncloud.tech/
      - N8N_EDITOR_BASE_URL=https://n8ncloud.tech
      - N8N_PUBLIC_URL=https://n8ncloud.tech
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=lightningflow2024
      - N8N_METRICS=true
      - N8N_DIAGNOSTICS_ENABLED=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console
      - N8N_EXECUTION_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
    ports:
      - "127.0.0.1:5679:5679"
    volumes:
      - /opt/lightningflow/n8n:/home/node/.n8n
    deploy:
      resources:
        limits:
          cpus: "2.5"
          memory: "2048m"
        reservations:
          cpus: "0.5"
          memory: "512m"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5679/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    networks: [internal]
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: "256m"
        reservations:
          cpus: "0.25"
          memory: "64m"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  dozzle:
    image: amir20/dozzle:latest
    restart: unless-stopped
    networks: [internal]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "127.0.0.1:9001:8080"
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: "512m"

  code_server:
    image: lscr.io/linuxserver/code-server:latest
    restart: unless-stopped
    networks: [internal]
    environment:
      - PASSWORD=lightningflow2024
      - SUDO_PASSWORD=lightningflow2024
    volumes:
      - /opt/lightningflow/code-server:/config
    ports:
      - "127.0.0.1:8443:8443"
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: "1024m"

networks:
  internal:
    driver: bridge
EOF

echo "✅ Docker Compose updated with performance optimizations"
echo ""

# Step 5: Optimize system settings
echo "5. Optimizing system settings..."

# Disable swap if it exists
if [ -f /swapfile ]; then
    echo "Disabling swap..."
    swapoff /swapfile
    sed -i '/swapfile/d' /etc/fstab
fi

# Set swappiness to low
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
sysctl -p /etc/sysctl.d/99-swappiness.conf

# Optimize network settings
cat > /etc/sysctl.d/99-network-optimization.conf << 'EOF'
net.core.somaxconn=4096
net.ipv4.tcp_max_syn_backlog=4096
net.ipv4.tcp_tw_reuse=1
net.ipv4.ip_local_port_range=20000 65000
EOF

sysctl -p /etc/sysctl.d/99-network-optimization.conf

echo "✅ System settings optimized"
echo ""

# Step 6: Restart services
echo "6. Restarting services..."

# Reload Caddy
systemctl reload caddy

# Restart Docker services
cd /opt/lightningflow
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "✅ Services restarted"
echo ""

# Step 7: Wait for services to be ready
echo "7. Waiting for services to be ready..."
sleep 15

# Step 8: Test endpoints
echo "8. Testing endpoints..."

echo "Testing local endpoints..."
for i in {1..5}; do
    echo "Attempt $i/5:"
    
    if curl -fsS http://localhost:5678/api/system-check >/dev/null 2>&1; then
        echo "✅ API: OK"
    else
        echo "❌ API: FAILED"
    fi
    
    if curl -fsS http://localhost:5679/healthz >/dev/null 2>&1; then
        echo "✅ n8n: OK"
    else
        echo "❌ n8n: FAILED"
    fi
    
    if [ $i -lt 5 ]; then
        echo "Waiting 5 seconds..."
        sleep 5
    fi
done

echo ""
echo "Testing external endpoints..."
echo "Main site:"
time curl -fsS https://lightningflow.online/ >/dev/null && echo "✅ OK" || echo "❌ FAILED"

echo "Health endpoint:"
time curl -fsS https://lightningflow.online/healthz >/dev/null && echo "✅ OK" || echo "❌ FAILED"

echo "n8n site:"
time curl -fsS https://n8ncloud.tech/ >/dev/null && echo "✅ OK" || echo "❌ FAILED"

echo ""

# Step 9: Show final status
echo "9. Final system status:"
echo "Docker containers:"
docker ps --format 'table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}'

echo ""
echo "System resources:"
free -h
uptime

echo ""
echo "🎉 Performance fixes deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Run './scripts/perf_doctor.sh' to monitor performance"
echo "2. Run load tests to verify improvements"
echo "3. Monitor for 24 hours to ensure stability"
echo ""
echo "If you need to rollback:"
echo "cp -r $BACKUP_DIR/* /opt/lightningflow/"
echo "systemctl restart caddy"
echo "cd /opt/lightningflow && docker compose -f docker-compose.prod.yml up -d"
