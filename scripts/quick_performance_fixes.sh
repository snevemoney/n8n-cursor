#!/usr/bin/env bash
set -e

echo "🚀 Quick Performance Fixes"
echo "=========================="

# 1. Check current resource usage
echo "1. Checking current resource usage..."
echo "CPU Load:"
uptime
echo ""
echo "Memory:"
free -h
echo ""
echo "Docker containers:"
docker ps --format 'table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}'
echo ""

# 2. Temporarily raise resource limits to test throttling hypothesis
echo "2. Raising resource limits temporarily..."

# Backup current compose file
cp /opt/lightningflow/docker-compose.prod.yml /opt/lightningflow/docker-compose.prod.yml.backup.$(date +%Y%m%d_%H%M%S)

# Create new compose file with higher limits
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

# 3. Restart services with new limits
echo "3. Restarting services with new resource limits..."
cd /opt/lightningflow
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 4. Wait for services to start
echo "4. Waiting for services to start..."
sleep 10

# 5. Check if services are healthy
echo "5. Checking service health..."
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

# 6. Test external endpoints
echo "6. Testing external endpoints..."
echo "Main site:"
time curl -fsS https://lightningflow.online/ >/dev/null && echo "✅ OK" || echo "❌ FAILED"

echo "Health endpoint:"
time curl -fsS https://lightningflow.online/healthz >/dev/null && echo "✅ OK" || echo "❌ FAILED"

echo "n8n site:"
time curl -fsS https://n8ncloud.tech/ >/dev/null && echo "✅ OK" || echo "❌ FAILED"

# 7. Show current resource usage
echo "7. Current resource usage after fixes:"
docker ps --format 'table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}'

echo ""
echo "✅ Quick performance fixes applied!"
echo "Run './scripts/perf_doctor.sh' to monitor performance"
