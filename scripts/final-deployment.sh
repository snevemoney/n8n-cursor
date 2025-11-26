#!/bin/bash
set -e

echo "🚀 FINAL N8N DEPLOYMENT SCRIPT"
echo "==============================="

# Configuration
HOSTINGER_API_TOKEN="K984jqyoilSkZQtpAqibcPVlC9fGeRrgidRhFfE4c98d6c8b"
VPS_ID="765579"
SERVER_IP="69.62.66.78"

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

# Function to check VPS status via API
check_vps_status() {
    print_status "Checking VPS status via API..."
    local response=$(curl -s -X GET "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VPS_ID" \
        -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
        -H "Content-Type: application/json")
    
    local state=$(echo "$response" | jq -r '.state')
    echo "VPS State: $state"
    
    if [ "$state" = "running" ]; then
        print_success "VPS is running and ready for deployment"
        return 0
    else
        print_error "VPS is not running (state: $state)"
        return 1
    fi
}

# Main deployment script
main() {
    print_status "Starting deployment process..."
    
    # Check VPS status
    if ! check_vps_status; then
        print_error "VPS is not ready for deployment"
        exit 1
    fi
    
    print_status "VPS is ready! Now copy and paste this script into the Hostinger browser terminal:"
    echo ""
    echo "=========================================="
    echo "COPY THE FOLLOWING INTO BROWSER TERMINAL:"
    echo "=========================================="
    echo ""
    
    # The actual deployment script for browser terminal
    cat << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "🔄 UPDATING SERVER AND DEPLOYING N8N"
echo "===================================="

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

# Step 1: System Updates
print_status "Step 1: Updating package lists..."
sudo apt update

print_status "Step 2: Installing regular updates..."
sudo apt upgrade -y

print_status "Step 3: Installing security updates..."
sudo apt dist-upgrade -y

print_status "Step 4: Installing ESM Apps for additional security updates..."
sudo apt install ubuntu-advantage-tools -y
sudo ua enable esm-apps --assume-yes

print_status "Step 5: Installing ESM security updates..."
sudo apt update
sudo apt upgrade -y

print_status "Step 6: Installing security packages..."
sudo apt install -y fail2ban ufw auditd unattended-upgrades

print_status "Step 7: Configuring automatic security updates..."
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Step 2: Docker Setup
print_status "Step 8: Checking Docker status..."
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Step 3: n8n Setup
print_status "Step 9: Creating n8n data directory..."
sudo mkdir -p /opt/lightningflow/data/n8n_data
sudo chown -R $USER:$USER /opt/lightningflow

print_status "Step 10: Creating production environment file..."
cat > /opt/lightningflow/.env.production << 'EOF'
# Production Environment
NODE_ENV=production
PRIMARY_DOMAIN=lightningflow.online
N8N_EDITOR_BASE_URL=https://n8ncloud.tech
N8N_PUBLIC_URL=https://n8ncloud.tech
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_USER_MANAGEMENT_DISABLED=false
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=lightningflow2024
WEBHOOK_URL=https://n8ncloud.tech
EOF

print_status "Step 11: Creating production Docker Compose..."
cat > /opt/lightningflow/docker-compose.prod.yml << 'EOF'
version: '3.9'

services:
  n8n:
    image: n8nio/n8n:1.69.0-alpine
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

print_status "Step 12: Creating Caddy configuration..."
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

# Step 4: Deploy Services
print_status "Step 13: Stopping existing services..."
sudo docker compose -f /opt/lightningflow/docker-compose.prod.yml down 2>/dev/null || true

print_status "Step 14: Starting production services..."
cd /opt/lightningflow
sudo docker compose -f docker-compose.prod.yml up -d

print_status "Step 15: Waiting for services to start..."
sleep 30

# Step 5: Verification
print_status "Step 16: Checking service status..."
echo "Docker containers:"
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_status "Step 17: Testing n8n health endpoint..."
if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
    print_success "n8n is healthy and responding"
else
    print_warning "n8n health check failed, checking logs..."
    sudo docker logs n8n-prod --tail 20
fi

echo ""
print_status "Step 18: Testing Caddy configuration..."
if curl -f http://localhost >/dev/null 2>&1; then
    print_success "Caddy is responding on port 80"
else
    print_warning "Caddy not responding on port 80"
fi

# Step 6: Security Check
print_status "Step 19: Running security scan..."
echo "Checking for suspicious processes:"
ps aux | grep -i 'xmrig\|minerd\|kdevtmpfsi\|kinsing' || echo "No suspicious processes found"

echo "Checking high CPU processes:"
ps aux --sort=-%cpu | head -5

echo "Checking disk usage:"
df -h /

echo "Checking memory usage:"
free -h

# Final Status
echo ""
print_success "Server update and n8n deployment completed!"
echo ""
echo "🌐 Your services should now be available at:"
echo "   • n8n: https://n8ncloud.tech"
echo "   • Main site: https://lightningflow.online"
echo ""
echo "🔑 n8n credentials: admin / lightningflow2024"
echo ""
echo "📊 To monitor:"
echo "   • Docker status: sudo docker ps"
echo "   • n8n logs: sudo docker logs n8n-prod -f"
echo "   • Caddy logs: sudo docker logs caddy-prod -f"
echo ""
echo "🛡️ Security measures applied:"
echo "   • System updates installed"
echo "   • ESM Apps enabled for security updates"
echo "   • fail2ban, ufw, auditd installed"
echo "   • Automatic security updates configured"
DEPLOY_SCRIPT

    echo ""
    echo "=========================================="
    echo "END OF SCRIPT TO COPY"
    echo "=========================================="
    echo ""
    
    print_success "Deployment script ready!"
    echo ""
    echo "📋 Instructions:"
    echo "1. Go to your Hostinger VPS dashboard"
    echo "2. Click 'Browser terminal'"
    echo "3. Copy the script above (between the markers)"
    echo "4. Paste it into the browser terminal"
    echo "5. Press Enter to run"
    echo ""
    echo "⏱️ Expected time: 5-10 minutes"
    echo "🎯 Result: n8ncloud.tech will be working!"
}

# Run the main function
main
