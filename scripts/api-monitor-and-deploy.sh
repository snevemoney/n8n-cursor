#!/bin/bash
set -e

echo "🔍 HOSTINGER API MONITORING & DEPLOYMENT"
echo "========================================"

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

# Function to get VPS status
get_vps_status() {
    local response=$(curl -s -X GET "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VPS_ID" \
        -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
        -H "Content-Type: application/json")
    
    echo "$response"
}

# Function to check VPS health
check_vps_health() {
    print_status "Checking VPS status via API..."
    
    local vps_data=$(get_vps_status)
    local state=$(echo "$vps_data" | jq -r '.state')
    local hostname=$(echo "$vps_data" | jq -r '.hostname')
    local ip=$(echo "$vps_data" | jq -r '.ipv4[0].address')
    local template=$(echo "$vps_data" | jq -r '.template.name')
    local actions_lock=$(echo "$vps_data" | jq -r '.actions_lock')
    
    echo "VPS Details:"
    echo "  State: $state"
    echo "  Hostname: $hostname"
    echo "  IP: $ip"
    echo "  Template: $template"
    echo "  Actions Lock: $actions_lock"
    
    if [ "$state" = "running" ]; then
        print_success "VPS is running"
        return 0
    else
        print_error "VPS is not running (state: $state)"
        return 1
    fi
}

# Function to check recent actions
check_recent_actions() {
    print_status "Checking recent VPS actions..."
    
    local actions=$(curl -s -X GET "https://developers.hostinger.com/api/vps/v1/virtual-machines/$VPS_ID/actions" \
        -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Recent actions:"
    echo "$actions" | jq -r '.data[0:5] | .[] | "  \(.name) - \(.state) - \(.created_at)"'
}

# Function to test external connectivity
test_external_connectivity() {
    print_status "Testing external connectivity..."
    
    # Test HTTP connectivity
    if curl -s --connect-timeout 10 http://$SERVER_IP >/dev/null 2>&1; then
        print_success "HTTP (port 80) is accessible"
    else
        print_warning "HTTP (port 80) is not accessible"
    fi
    
    # Test HTTPS connectivity
    if curl -s --connect-timeout 10 https://n8ncloud.tech >/dev/null 2>&1; then
        print_success "HTTPS (n8ncloud.tech) is accessible"
    else
        print_warning "HTTPS (n8ncloud.tech) is not accessible"
    fi
}

# Function to provide deployment instructions
provide_deployment_instructions() {
    print_status "Providing deployment instructions..."
    
    echo ""
    echo "=========================================="
    echo "DEPLOYMENT INSTRUCTIONS"
    echo "=========================================="
    echo ""
    echo "Since the API doesn't support direct VPS management,"
    echo "you need to use the Hostinger browser terminal:"
    echo ""
    echo "1. Go to: https://hpanel.hostinger.com/vps/765579"
    echo "2. Click 'Browser terminal'"
    echo "3. Copy and paste this deployment script:"
    echo ""
    echo "=========================================="
    echo "COPY THIS SCRIPT INTO BROWSER TERMINAL:"
    echo "=========================================="
    
    cat << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "🔄 FIXING N8NCLOUD.TECH - API MONITORED DEPLOYMENT"
echo "=================================================="

# Update system
echo "Updating packages..."
sudo apt update
sudo apt upgrade -y

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Create n8n directory
echo "Setting up n8n..."
sudo mkdir -p /opt/lightningflow/data/n8n_data
sudo chown -R $USER:$USER /opt/lightningflow

# Create Docker Compose
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

# Create Caddy config
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

# Deploy services
echo "Deploying services..."
cd /opt/lightningflow
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Test services
echo "Testing services..."
if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
    echo "✅ n8n is healthy"
else
    echo "❌ n8n health check failed"
    sudo docker logs n8n-prod --tail 10
fi

echo "✅ Deployment completed!"
echo "🌐 n8n available at: https://n8ncloud.tech"
echo "🔑 Credentials: admin / lightningflow2024"
DEPLOY_SCRIPT

    echo ""
    echo "=========================================="
    echo "END OF SCRIPT TO COPY"
    echo "=========================================="
    echo ""
    echo "4. Press Enter to run the deployment"
    echo "5. Wait 5-10 minutes for completion"
    echo "6. n8ncloud.tech will be working!"
}

# Main function
main() {
    echo "Starting API-based monitoring and deployment..."
    echo ""
    
    # Check VPS health
    if ! check_vps_health; then
        print_error "VPS is not ready for deployment"
        exit 1
    fi
    
    echo ""
    
    # Check recent actions
    check_recent_actions
    
    echo ""
    
    # Test external connectivity
    test_external_connectivity
    
    echo ""
    
    # Provide deployment instructions
    provide_deployment_instructions
    
    echo ""
    print_success "API monitoring complete!"
    echo ""
    echo "📊 API Token: $HOSTINGER_API_TOKEN"
    echo "🖥️ VPS ID: $VPS_ID"
    echo "🌐 Server IP: $SERVER_IP"
    echo ""
    echo "🔗 VPS Dashboard: https://hpanel.hostinger.com/vps/$VPS_ID"
    echo "🔗 API Documentation: https://developers.hostinger.com/"
}

# Run the main function
main
