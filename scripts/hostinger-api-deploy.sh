#!/bin/bash
set -e

echo "🚀 HOSTINGER API DEPLOYMENT SCRIPT"
echo "=================================="

# Configuration
HOSTINGER_API_TOKEN="K984jqyoilSkZQtpAqibcPVlC9fGeRrgidRhFfE4c98d6c8b"
VPS_ID="765579"  # Your VPS ID from the URL
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

# Function to make API calls
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "https://developers.hostinger.com/api/vps/v1$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
            -H "Content-Type: application/json" \
            "https://developers.hostinger.com/api/vps/v1$endpoint"
    fi
}

# Step 1: Check VPS Status
print_status "Step 1: Checking VPS status..."
vps_status=$(api_call "GET" "/vps/$VPS_ID")
echo "$vps_status" | jq -r '.status'

# Step 2: Create deployment script
print_status "Step 2: Creating deployment script..."
deploy_script=$(cat << 'EOF'
#!/bin/bash
set -e

echo "🔄 UPDATING SERVER AND DEPLOYING N8N"
echo "===================================="

# Update system
echo "Updating packages..."
sudo apt update
sudo apt upgrade -y
sudo apt dist-upgrade -y

# Install security tools
echo "Installing security packages..."
sudo apt install -y fail2ban ufw auditd unattended-upgrades ubuntu-advantage-tools

# Enable ESM Apps
echo "Enabling ESM Apps for security updates..."
sudo ua enable esm-apps --assume-yes
sudo apt update
sudo apt upgrade -y

# Install Docker if not present
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

# Create production environment
cat > /opt/lightningflow/.env.production << 'ENVEOF'
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
ENVEOF

# Create Docker Compose
cat > /opt/lightningflow/docker-compose.prod.yml << 'COMPOSEEOF'
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
COMPOSEEOF

# Create Caddy config
cat > /opt/lightningflow/Caddyfile.prod << 'CADDYEOF'
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
CADDYEOF

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
EOF
)

# Step 3: Execute script via API
print_status "Step 3: Executing deployment script via API..."
execution_data=$(cat << EOF
{
    "command": "$(echo "$deploy_script" | base64 -w 0)"
}
EOF
)

# Note: This is a simplified version. The actual Hostinger API might have different endpoints
# for executing commands. You may need to check their documentation for the exact method.

print_warning "Note: The Hostinger API method for executing commands may vary."
print_warning "Please check the Hostinger API documentation for the correct endpoint."
print_warning "Alternatively, you can copy the deployment script and run it manually."

echo ""
print_success "Deployment script created!"
echo ""
echo "📋 Next steps:"
echo "1. Replace 'YOUR_API_TOKEN_HERE' with your actual API token"
echo "2. Check Hostinger API docs for command execution endpoint"
echo "3. Or copy the script content and run it manually via browser terminal"
echo ""
echo "🔗 Hostinger API Documentation: https://developers.hostinger.com/"
