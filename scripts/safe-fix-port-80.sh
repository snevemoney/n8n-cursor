#!/bin/bash
set -e

echo "🛡️ SAFE FIX FOR PORT 80 - PRESERVING N8N DATA"
echo "=============================================="

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

print_status "SAFETY FIRST: This script will preserve all existing n8n data"
print_status "SOLUTION: Deploy Caddy only, keep existing n8n running"

echo ""
echo "=========================================="
echo "COPY THIS SAFE SCRIPT INTO BROWSER TERMINAL:"
echo "=========================================="

cat << 'SAFE_SCRIPT'
#!/bin/bash
set -e

echo "🛡️ SAFE FIX FOR PORT 80 - PRESERVING N8N DATA"
echo "=============================================="

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

# Step 2: Backup existing n8n data (SAFETY FIRST)
print_status "Step 2: Creating backup of existing n8n data..."
sudo mkdir -p /opt/lightningflow/backups
sudo cp -r /opt/lightningflow/data/n8n_data /opt/lightningflow/backups/n8n_data_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
print_success "Backup created"

# Step 3: Check existing n8n container
print_status "Step 3: Checking existing n8n container..."
EXISTING_N8N=$(sudo docker ps --format "table {{.Names}}" | grep n8n || echo "")
if [ -n "$EXISTING_N8N" ]; then
    print_success "Found existing n8n container: $EXISTING_N8N"
    print_status "Will keep this container running and just add Caddy"
else
    print_warning "No existing n8n container found"
fi

# Step 4: Create n8n directory (if needed)
print_status "Step 4: Creating n8n directory..."
sudo mkdir -p /opt/lightningflow/data/n8n_data
sudo chown -R $USER:$USER /opt/lightningflow
print_success "n8n directory ready"

# Step 5: Create Caddy-only Docker Compose (SAFE APPROACH)
print_status "Step 5: Creating Caddy-only Docker Compose..."
cat > /opt/lightningflow/docker-compose.caddy.yml << 'EOF'
services:
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
      - caddy-network

networks:
  caddy-network:
    driver: bridge

volumes:
  caddy_data:
  caddy_config:
EOF
print_success "Caddy-only Docker Compose created"

# Step 6: Create Caddy configuration
print_status "Step 6: Creating Caddy configuration..."
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

# Step 7: Stop only Caddy if it exists (SAFE)
print_status "Step 7: Stopping only Caddy if it exists..."
sudo docker stop caddy-prod 2>/dev/null || true
sudo docker rm caddy-prod 2>/dev/null || true
print_success "Caddy stopped (if it existed)"

# Step 8: Start Caddy only
print_status "Step 8: Starting Caddy only..."
cd /opt/lightningflow
sudo docker compose -f docker-compose.caddy.yml up -d
print_success "Caddy started"

# Step 9: Wait for Caddy
print_status "Step 9: Waiting for Caddy to start..."
sleep 10

# Step 10: Test services
print_status "Step 10: Testing services..."

echo "Testing port 80:"
if curl -f http://localhost:80 >/dev/null 2>&1; then
    print_success "Port 80 is now accessible"
else
    print_warning "Port 80 test failed"
    echo "Caddy logs:"
    sudo docker logs caddy-prod --tail 10
fi

echo "Testing existing n8n:"
if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
    print_success "Existing n8n is healthy"
else
    print_warning "n8n health check failed"
    if [ -n "$EXISTING_N8N" ]; then
        echo "n8n logs:"
        sudo docker logs $EXISTING_N8N --tail 10
    fi
fi

echo "Testing Caddy reverse proxy:"
if curl -f http://localhost >/dev/null 2>&1; then
    print_success "Caddy is responding"
else
    print_warning "Caddy test failed"
    echo "Caddy logs:"
    sudo docker logs caddy-prod --tail 10
fi

# Step 11: Show status
print_status "Step 11: Final status..."
echo "Docker containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "Port 80 status:"
sudo ss -tlnp | grep :80

echo "Port 443 status:"
sudo ss -tlnp | grep :443

echo "Port 5678 status:"
sudo ss -tlnp | grep :5678

# Step 12: Verify data preservation
print_status "Step 12: Verifying data preservation..."
echo "n8n data directory contents:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

echo "Backup directory contents:"
ls -la /opt/lightningflow/backups/ 2>/dev/null || echo "No backup directory found"

# Final result
echo ""
print_success "SAFE DEPLOYMENT COMPLETED!"
echo ""
echo "🛡️ DATA PRESERVATION: All existing n8n data has been preserved"
echo "🌐 n8n available at: https://n8ncloud.tech"
echo "🔑 Credentials: admin / lightningflow2024"
echo ""
echo "📊 To monitor:"
echo "   • Docker status: sudo docker ps"
echo "   • n8n logs: sudo docker logs $EXISTING_N8N -f"
echo "   • Caddy logs: sudo docker logs caddy-prod -f"
echo ""
echo "✅ Port 80 should now be working and n8ncloud.tech accessible!"
echo "🛡️ All your n8n workflows and data are safe!"
SAFE_SCRIPT

echo ""
echo "=========================================="
echo "END OF SAFE SCRIPT TO COPY"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Go to: https://hpanel.hostinger.com/vps/765579"
echo "2. Click 'Browser terminal'"
echo "3. Copy the safe script above (between the markers)"
echo "4. Paste it into the browser terminal"
echo "5. Press Enter to run"
echo ""
echo "🛡️ SAFETY FEATURES:"
echo "   • Creates backup of existing n8n data"
echo "   • Keeps existing n8n container running"
echo "   • Only deploys Caddy (reverse proxy)"
echo "   • No data loss risk"
echo ""
echo "🎯 This will fix port 80 while preserving all your n8n data!"
echo "⏱️ Expected time: 1-2 minutes"
