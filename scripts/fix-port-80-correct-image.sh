#!/bin/bash
set -e

echo "🔧 FIXING PORT 80 - N8NCLOUD.TECH DEPLOYMENT (CORRECTED)"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_status "DIAGNOSIS: Port 80 is blocked, n8n image tag was incorrect"
print_status "SOLUTION: Deploy n8n + Caddy with correct image tags"

echo ""
echo "=========================================="
echo "COPY THIS CORRECTED SCRIPT INTO BROWSER TERMINAL:"
echo "=========================================="

cat << 'FIX_SCRIPT'
#!/bin/bash
set -e

echo "🔧 FIXING PORT 80 - N8NCLOUD.TECH DEPLOYMENT (CORRECTED)"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Step 1: Check current status
print_status "Step 1: Checking current status..."
echo "Current processes on port 80:"
sudo ss -tlnp | grep :80 || echo "No processes on port 80"

echo "Current Docker containers:"
sudo docker ps -a || echo "No Docker containers found"

# Step 2: Stop existing n8n container
print_status "Step 2: Stopping existing n8n container..."
sudo docker stop n8n-cursor_n8n_1 2>/dev/null || true
sudo docker rm n8n-cursor_n8n_1 2>/dev/null || true
print_success "Existing n8n container stopped"

# Step 3: Create n8n directory
print_status "Step 3: Creating n8n directory..."
sudo mkdir -p /opt/lightningflow/data/n8n_data
sudo chown -R $USER:$USER /opt/lightningflow
print_success "n8n directory created"

# Step 4: Create Docker Compose with correct image
print_status "Step 4: Creating Docker Compose configuration..."
cat > /opt/lightningflow/docker-compose.prod.yml << 'EOF'
services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-prod
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_EDITOR_BASE_URL=https://n8ncloud.tech
      - N8N_PUBLIC_URL=https://n8ncloud.tech
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_USER_MANAGEMENT_DISABLED=false
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=lightningflow2024
      - WEBHOOK_URL=https://n8ncloud.tech
    volumes:
      - /opt/lightningflow/data/n8n_data:/home/node/.n8n
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    user: "node:node"
    networks:
      - n8n-network

  caddy:
    image: caddy:2-alpine
    container_name: caddy-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/lightningflow/Caddyfile.prod:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
EOF
print_success "Docker Compose configuration created"

# Step 5: Create Caddy configuration
print_status "Step 5: Creating Caddy configuration..."
cat > /opt/lightningflow/Caddyfile.prod << 'EOF'
n8ncloud.tech {
    reverse_proxy 127.0.0.1:5678
    log {
        output file /var/log/caddy/n8ncloud.log
        format json
    }
}

lightningflow.online {
    reverse_proxy 127.0.0.1:4000
    log {
        output file /var/log/caddy/lightningflow.log
        format json
    }
}
EOF
print_success "Caddy configuration created"

# Step 6: Start services
print_status "Step 6: Starting services..."
cd /opt/lightningflow
sudo docker compose -f docker-compose.prod.yml up -d
print_success "Services started"

# Step 7: Wait for services
print_status "Step 7: Waiting for services to start..."
sleep 30

# Step 8: Test services
print_status "Step 8: Testing services..."

echo "Testing port 80:"
if curl -f http://localhost:80 >/dev/null 2>&1; then
    print_success "Port 80 is now accessible"
else
    print_warning "Port 80 test failed"
fi

echo "Testing n8n health:"
if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
    print_success "n8n is healthy"
else
    print_warning "n8n health check failed"
    echo "n8n logs:"
    sudo docker logs n8n-prod --tail 10
fi

echo "Testing Caddy:"
if curl -f http://localhost >/dev/null 2>&1; then
    print_success "Caddy is responding"
else
    print_warning "Caddy test failed"
    echo "Caddy logs:"
    sudo docker logs caddy-prod --tail 10
fi

# Step 9: Show status
print_status "Step 9: Final status..."
echo "Docker containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "Port 80 status:"
sudo ss -tlnp | grep :80

echo "Port 443 status:"
sudo ss -tlnp | grep :443

echo "Port 5678 status:"
sudo ss -tlnp | grep :5678

# Final result
echo ""
print_success "DEPLOYMENT COMPLETED!"
echo ""
echo "🌐 n8n available at: https://n8ncloud.tech"
echo "🔑 Credentials: admin / lightningflow2024"
echo ""
echo "📊 To monitor:"
echo "   • Docker status: sudo docker ps"
echo "   • n8n logs: sudo docker logs n8n-prod -f"
echo "   • Caddy logs: sudo docker logs caddy-prod -f"
echo ""
echo "✅ Port 80 should now be working and n8ncloud.tech accessible!"
FIX_SCRIPT

echo ""
echo "=========================================="
echo "END OF CORRECTED SCRIPT TO COPY"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Go to: https://hpanel.hostinger.com/vps/765579"
echo "2. Click 'Browser terminal'"
echo "3. Copy the corrected script above (between the markers)"
echo "4. Paste it into the browser terminal"
echo "5. Press Enter to run"
echo ""
echo "🎯 This will fix the image issue and get n8ncloud.tech working!"
echo "⏱️ Expected time: 2-3 minutes"
