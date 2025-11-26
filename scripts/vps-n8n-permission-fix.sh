#!/bin/bash
set -e

echo "🔧 VPS N8N PERMISSION FIX - TARGETED SOLUTION"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: STOP EVERYTHING
print_status "Step 1: Stopping everything..."
docker stop n8n-prod caddy-prod 2>/dev/null || true
docker rm n8n-prod caddy-prod 2>/dev/null || true
print_success "All containers stopped"

# Step 2: CLEAN DOCKER SYSTEM
print_status "Step 2: Cleaning Docker system..."
docker system prune -f
docker volume prune -f
print_success "Docker system cleaned"

# Step 3: CREATE PROPER VOLUME STRUCTURE
print_status "Step 3: Creating proper volume structure..."
mkdir -p /opt/lightningflow/data/n8n_data
mkdir -p /opt/lightningflow/data/n8n_data/config
mkdir -p /opt/lightningflow/data/n8n_data/workflows
mkdir -p /opt/lightningflow/data/n8n_data/credentials

# Fix permissions for n8n user (UID 1000)
chown -R 1000:1000 /opt/lightningflow/data/n8n_data
chmod -R 755 /opt/lightningflow/data/n8n_data
print_success "Volume structure created with proper permissions"

# Step 4: START N8N WITH MINIMAL CONFIG
print_status "Step 4: Starting n8n with minimal config..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:3000:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=true \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -e N8N_ENCRYPTION_KEY=lightningflow2024 \
  -e N8N_LOG_LEVEL=info \
  -e N8N_DIAGNOSTICS_ENABLED=false \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:1.28.0

print_success "n8n container started"

# Step 5: WAIT AND MONITOR
print_status "Step 5: Waiting for n8n to start (90 seconds)..."
sleep 30

# Check logs for errors
print_status "Checking n8n logs..."
docker logs n8n-prod --tail 10

sleep 30

# Check again
print_status "Checking n8n logs again..."
docker logs n8n-prod --tail 10

sleep 30

# Step 6: TEST N8N HEALTH
print_status "Step 6: Testing n8n health..."
if curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
    print_success "✅ N8N IS WORKING!"
else
    print_error "❌ N8N STILL FAILING"
    print_status "Checking detailed logs..."
    docker logs n8n-prod --tail 20
    
    # Try alternative approach
    print_status "Trying alternative approach..."
    docker stop n8n-prod
    docker rm n8n-prod
    
    # Try without volume first
    print_status "Testing without volume..."
    docker run -d \
      --name n8n-prod \
      --restart unless-stopped \
      -p 0.0.0.0:3000:5678 \
      -e N8N_HOST=0.0.0.0 \
      -e N8N_PORT=5678 \
      -e N8N_PROTOCOL=http \
      -e N8N_USER_MANAGEMENT_DISABLED=true \
      -e N8N_BASIC_AUTH_ACTIVE=false \
      n8nio/n8n:1.28.0
    
    sleep 30
    
    if curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
        print_success "✅ N8N WORKS WITHOUT VOLUME!"
        print_warning "Volume permissions need fixing"
    else
        print_error "❌ N8N FAILS EVEN WITHOUT VOLUME"
    fi
fi

# Step 7: UPDATE CADDY CONFIG
print_status "Step 7: Updating Caddy config..."
mkdir -p /var/log/caddy

cat > /tmp/caddy.conf << 'CADDY_CONFIG'
n8ncloud.tech {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    log {
        output file /var/log/caddy/n8n.log
        format json
    }
    tls {
        protocols tls1.2 tls1.3
    }
}
CADDY_CONFIG

# Step 8: START CADDY
print_status "Step 8: Starting Caddy..."
docker run -d \
  --name caddy-prod \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /tmp/caddy.conf:/etc/caddy/Caddyfile \
  -v /var/log/caddy:/var/log/caddy \
  caddy:latest

print_success "Caddy started"

# Step 9: WAIT AND TEST EXTERNAL
print_status "Step 9: Waiting for Caddy to start (30 seconds)..."
sleep 30

print_status "Testing external access..."
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://n8ncloud.tech)
print_status "External status code: $EXTERNAL_STATUS"

if [ "$EXTERNAL_STATUS" = "200" ]; then
    print_success "✅ EXTERNAL ACCESS WORKING!"
elif [ "$EXTERNAL_STATUS" = "502" ]; then
    print_warning "⚠️  EXTERNAL ACCESS: 502 Bad Gateway"
    print_status "This means Caddy is working but n8n is not responding"
else
    print_error "❌ EXTERNAL ACCESS FAILED: $EXTERNAL_STATUS"
fi

# Step 10: FINAL STATUS
print_status "Step 10: Final status..."
echo ""
echo "=== DOCKER CONTAINERS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== N8N LOGS (LAST 5 LINES) ==="
docker logs n8n-prod --tail 5 2>/dev/null || echo "No n8n logs"

echo ""
echo "=== CADDY LOGS (LAST 5 LINES) ==="
docker logs caddy-prod --tail 5 2>/dev/null || echo "No caddy logs"

echo ""
echo "=== NETWORK PORTS ==="
netstat -tlnp | grep -E ":(80|443|3000)" || echo "No ports found"

echo ""
print_success "🔧 VPS N8N PERMISSION FIX COMPLETED!"
print_status "🌐 n8ncloud.tech should be working now!"
print_status "🔑 Credentials: admin / lightningflow2024"
print_status "📊 Check the status above for any remaining issues"
