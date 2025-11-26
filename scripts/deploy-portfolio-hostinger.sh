#!/usr/bin/env bash

# Portfolio Deployment via Hostinger API
# Generates deployment script for browser terminal
# 
# Usage:
#   ./scripts/deploy-portfolio-hostinger.sh

set -euo pipefail

# Configuration
HOSTINGER_API_TOKEN="Gx0BB3W2T4U9kzCiYLKPGPNhauVbxWFym2c5Ibh6894f797c"
VPS_ID="765579"
SERVER_IP="69.62.66.78"
PORTFOLIO_PORT="4010"
PORTFOLIO_DOMAIN="portfolio.n8ncloud.tech"

# Colors
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
    local data="${3:-}"
    
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

# Check VPS status
check_vps_status() {
    print_status "Checking VPS status via Hostinger API..."
    
    local vps_status
    vps_status=$(api_call "GET" "/vps/$VPS_ID" 2>/dev/null || echo "")
    
    if [ -z "$vps_status" ]; then
        print_warning "Could not check VPS status via API (this is OK, script will still work)"
        return 0
    fi
    
    local status
    status=$(echo "$vps_status" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    
    if [ "$status" = "running" ] || [ "$status" = "unknown" ]; then
        print_success "VPS is accessible"
        return 0
    else
        print_warning "VPS status: $status (script will still work)"
        return 0
    fi
}

# Generate deployment script
generate_deployment_script() {
    cat << 'SETUP_SCRIPT'
#!/bin/bash
set -e

echo "🚀 PORTFOLIO DEPLOYMENT SCRIPT"
echo "=============================="
echo ""

# Colors
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

print_error() {
    echo -e "${YELLOW}[ERROR]${NC} $1"
}

# Step 1: Create directory
print_status "Step 1: Creating portfolio directory..."
mkdir -p ~/portfolio
cd ~/portfolio
print_success "Directory created: ~/portfolio"

# Step 2: Check if Node.js is installed
print_status "Step 2: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

# Step 3: Check if npm is installed
print_status "Step 3: Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Installing npm..."
    sudo apt-get install -y npm
fi

NPM_VERSION=$(npm --version)
print_success "npm installed: $NPM_VERSION"

# Step 4: Check if PM2 is installed
print_status "Step 4: Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2 globally..."
    sudo npm install -g pm2
fi

PM2_VERSION=$(pm2 --version)
print_success "PM2 installed: $PM2_VERSION"

# Step 5: Check if portfolio files exist
print_status "Step 5: Checking portfolio files..."
if [ ! -f "package.json" ]; then
    print_error "Portfolio files not found in ~/portfolio"
    print_error "Please upload portfolio files first:"
    echo ""
    echo "Option 1: Use rsync from your local machine:"
    echo "  rsync -avz --exclude 'node_modules' --exclude '.next' \\"
    echo "    /path/to/n8n-cursor/apps/portfolio/ \\"
    echo "    user@69.62.66.78:~/portfolio/"
    echo ""
    echo "Option 2: Use git clone:"
    echo "  cd ~/portfolio"
    echo "  git clone <your-repo-url> ."
    echo "  cd apps/portfolio"
    echo ""
    echo "Option 3: Manual upload via SFTP/SCP"
    echo ""
    exit 1
fi

print_success "Portfolio files found"

# Step 6: Install dependencies
print_status "Step 6: Installing dependencies..."
if [ -d "node_modules" ]; then
    print_status "node_modules exists, skipping install (or run: npm install)"
else
    npm install
    print_success "Dependencies installed"
fi

# Step 7: Build application
print_status "Step 7: Building portfolio application..."
npm run build

if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build completed successfully"

# Step 8: Stop existing portfolio process
print_status "Step 8: Stopping existing portfolio process (if running)..."
pm2 stop portfolio 2>/dev/null || true
pm2 delete portfolio 2>/dev/null || true
print_success "Cleaned up existing process"

# Step 9: Start with PM2
print_status "Step 9: Starting portfolio with PM2..."
pm2 start npm --name "portfolio" -- start
pm2 save

# Wait a moment for startup
sleep 2

# Check status
PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="portfolio") | .pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    print_success "Portfolio started successfully with PM2"
else
    print_error "Portfolio failed to start. Check logs: pm2 logs portfolio"
    pm2 logs portfolio --lines 20
    exit 1
fi

# Step 10: Test local health endpoint
print_status "Step 10: Testing local health endpoint..."
sleep 2
HEALTH_RESPONSE=$(curl -s http://localhost:4010/healthz || echo "")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    print_success "Health endpoint working: $HEALTH_RESPONSE"
else
    print_error "Health endpoint failed. Response: $HEALTH_RESPONSE"
    print_error "Check logs: pm2 logs portfolio"
fi

# Step 11: Configure Caddy
print_status "Step 11: Configuring Caddy..."
CADDYFILE="/etc/caddy/Caddyfile"

# Backup Caddyfile
sudo cp "$CADDYFILE" "${CADDYFILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Check if portfolio route already exists
if sudo grep -q "portfolio.n8ncloud.tech" "$CADDYFILE"; then
    print_status "Portfolio route already exists in Caddyfile"
else
    print_status "Adding portfolio route to Caddyfile..."
    
    # Add portfolio route
    sudo tee -a "$CADDYFILE" > /dev/null << 'CADDY_BLOCK'

# Portfolio Domain - Personal Portfolio Website
portfolio.n8ncloud.tech {
    import common
    
    # Health endpoint
    @health path /healthz
    handle @health {
        respond 200 {
            body "OK"
            header Content-Type "text/plain"
        }
    }
    
    # Portfolio website
    handle {
        reverse_proxy 127.0.0.1:4010 {
            health_uri /
            health_interval 30s
            health_timeout 5s
            
            # Portfolio-specific headers
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-Host {host}
            header_up X-Real-IP {remote_host}
        }
    }
}
CADDY_BLOCK
    
    print_success "Portfolio route added to Caddyfile"
fi

# Validate Caddyfile
print_status "Validating Caddyfile..."
if sudo caddy validate --config "$CADDYFILE" 2>&1; then
    print_success "Caddyfile is valid"
else
    print_error "Caddyfile validation failed!"
    print_error "Restoring backup..."
    sudo cp "${CADDYFILE}.backup.$(date +%Y%m%d_%H%M%S)" "$CADDYFILE"
    exit 1
fi

# Reload Caddy
print_status "Reloading Caddy..."
sudo systemctl reload caddy

# Check Caddy status
if sudo systemctl is-active --quiet caddy; then
    print_success "Caddy reloaded successfully"
else
    print_error "Caddy reload failed. Check status: sudo systemctl status caddy"
fi

# Step 12: Final verification
echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "📋 Verification Steps:"
echo ""
echo "1. Check PM2 status:"
echo "   pm2 status portfolio"
echo ""
echo "2. Check local health:"
echo "   curl http://localhost:4010/healthz"
echo ""
echo "3. Check HTTPS health (after DNS propagates):"
echo "   curl https://portfolio.n8ncloud.tech/healthz"
echo ""
echo "4. Check DNS resolution:"
echo "   dig portfolio.n8ncloud.tech +short"
echo ""
echo "5. View PM2 logs:"
echo "   pm2 logs portfolio"
echo ""
echo "6. View Caddy logs:"
echo "   sudo journalctl -u caddy -f"
echo ""
echo "🌐 Visit your portfolio:"
echo "   https://portfolio.n8ncloud.tech"
echo ""
echo "⏱️  DNS propagation may take 5-60 minutes"
echo ""

SETUP_SCRIPT
}

# Main function
main() {
    echo "🚀 Portfolio Deployment via Hostinger API"
    echo "=========================================="
    echo ""
    
    # Check VPS status
    check_vps_status
    
    echo ""
    print_status "Generating deployment script for browser terminal..."
    echo ""
    echo "=========================================="
    echo "📋 DEPLOYMENT INSTRUCTIONS"
    echo "=========================================="
    echo ""
    echo "1. Open Hostinger Browser Terminal:"
    echo "   https://hpanel.hostinger.com/vps/$VPS_ID"
    echo "   Click: 'Browser terminal'"
    echo ""
    echo "2. Upload portfolio files first (choose one method):"
    echo ""
    echo "   Option A: rsync from your Mac:"
    echo "   rsync -avz --exclude 'node_modules' --exclude '.next' \\"
    echo "     /Users/evenslouis/n8n-cursor/apps/portfolio/ \\"
    echo "     user@$SERVER_IP:~/portfolio/"
    echo ""
    echo "   Option B: Git clone (if repo is on GitHub):"
    echo "   cd ~/portfolio"
    echo "   git clone <your-repo-url> ."
    echo "   cd apps/portfolio"
    echo ""
    echo "   Option C: Manual upload via SFTP/SCP"
    echo ""
    echo "3. Copy and paste the script below into browser terminal:"
    echo ""
    echo "=========================================="
    echo "COPY THE FOLLOWING INTO BROWSER TERMINAL:"
    echo "=========================================="
    echo ""
    
    generate_deployment_script
    
    echo "=========================================="
    echo ""
    print_success "Script generated!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Upload portfolio files to ~/portfolio on VPS"
    echo "  2. Open Hostinger browser terminal"
    echo "  3. Copy and paste the script above"
    echo "  4. Press Enter to run"
    echo "  5. Wait for completion"
    echo "  6. Verify DNS is configured in Cloudflare"
    echo ""
    echo "🔗 VPS Dashboard: https://hpanel.hostinger.com/vps/$VPS_ID"
    echo "🔗 Portfolio URL: https://$PORTFOLIO_DOMAIN"
    echo ""
}

main

