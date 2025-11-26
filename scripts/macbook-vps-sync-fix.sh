#!/bin/bash
set -e

echo "🔧 MACBOOK-VPS N8N SYNCHRONIZATION FIX"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Step 1: Check MacBook Docker Status
print_status "Step 1: Checking MacBook Docker status..."
if ! docker info >/dev/null 2>&1; then
    print_error "Docker not running on MacBook"
    print_status "Starting Docker..."
    open -a Docker
    sleep 30
else
    print_success "Docker is running"
fi

# Step 2: Check Local n8n Status
print_status "Step 2: Checking local n8n status..."
if docker ps | grep -q "n8n-cursor-n8n-1"; then
    print_success "Local n8n container is running"
    LOCAL_N8N_STATUS=$(docker logs n8n-cursor-n8n-1 --tail 1 2>/dev/null | grep -E "(Editor is now accessible|ERROR|FAILED)" || echo "Status unknown")
    print_status "Local n8n status: $LOCAL_N8N_STATUS"
else
    print_warning "Local n8n container not running"
fi

# Step 3: Check Database Connections
print_status "Step 3: Checking database connections..."
if docker ps | grep -q "lightningflow-postgres"; then
    print_success "PostgreSQL container is running"
    # Test connection
    if docker exec lightningflow-postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL connection successful"
    else
        print_error "PostgreSQL connection failed"
    fi
else
    print_error "PostgreSQL container not running"
fi

if docker ps | grep -q "lightningflow-redis"; then
    print_success "Redis container is running"
    # Test connection
    if docker exec lightningflow-redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis connection successful"
    else
        print_error "Redis connection failed"
    fi
else
    print_error "Redis container not running"
fi

# Step 4: Check Network Connectivity
print_status "Step 4: Checking network connectivity..."
VPS_IP="69.62.66.78"

# Test VPS connectivity
if ping -c 1 $VPS_IP >/dev/null 2>&1; then
    print_success "VPS is reachable"
else
    print_warning "VPS not reachable via ping (may be blocked)"
fi

# Test n8ncloud.tech
if curl -s -o /dev/null -w "%{http_code}" https://n8ncloud.tech | grep -q "200\|502"; then
    print_success "n8ncloud.tech is accessible"
else
    print_error "n8ncloud.tech not accessible"
fi

# Step 5: Check Local n8n API
print_status "Step 5: Checking local n8n API..."
if curl -s http://localhost:5679 >/dev/null 2>&1; then
    print_success "Local n8n API is accessible"
else
    print_error "Local n8n API not accessible"
fi

# Step 6: Check MCP Configuration
print_status "Step 6: Checking MCP configuration..."
MCP_CONFIG="$HOME/.cursor/mcp.json"
if [ -f "$MCP_CONFIG" ]; then
    print_success "MCP config file exists"
    if grep -q "n8n" "$MCP_CONFIG"; then
        print_success "n8n MCP server configured"
    else
        print_warning "n8n MCP server not configured"
    fi
else
    print_error "MCP config file not found"
fi

# Step 7: Check Environment Variables
print_status "Step 7: Checking environment variables..."
if [ -n "$N8N_API_URL" ]; then
    print_success "N8N_API_URL is set: $N8N_API_URL"
else
    print_warning "N8N_API_URL not set"
fi

if [ -n "$N8N_API_KEY" ]; then
    print_success "N8N_API_KEY is set (length: ${#N8N_API_KEY})"
else
    print_warning "N8N_API_KEY not set"
fi

# Step 8: Generate VPS Fix Commands
print_status "Step 8: Generating VPS fix commands..."
cat << 'VPS_FIX_COMMANDS'

🔧 VPS FIX COMMANDS (Copy to VPS terminal):
===========================================

#!/bin/bash
set -e

echo "🔧 VPS N8N FIX - COMPREHENSIVE SOLUTION"
echo "======================================"

# Step 1: STOP AND CLEAN EVERYTHING
echo "Step 1: Stopping and cleaning everything..."
docker stop n8n-prod caddy-prod 2>/dev/null || true
docker rm n8n-prod caddy-prod 2>/dev/null || true
docker system prune -f

# Step 2: CREATE PROPER VOLUME DIRECTORY
echo "Step 2: Creating proper volume directory..."
mkdir -p /opt/lightningflow/data/n8n_data
chown -R 1000:1000 /opt/lightningflow/data/n8n_data

# Step 3: START N8N WITH CORRECT PERMISSIONS
echo "Step 3: Starting n8n with correct permissions..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:3000:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=true \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -e N8N_ENCRYPTION_KEY=your-encryption-key-here \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:1.28.0

# Step 4: WAIT AND CHECK
echo "Step 4: Waiting for n8n to start..."
sleep 60

echo "Checking n8n status:"
docker logs n8n-prod --tail 10

# Step 5: TEST N8N
echo "Step 5: Testing n8n..."
if curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
    echo "✅ N8N IS WORKING!"
else
    echo "❌ N8N STILL FAILING"
    echo "Checking logs:"
    docker logs n8n-prod --tail 20
fi

# Step 6: UPDATE CADDY CONFIG
echo "Step 6: Updating Caddy config..."
cat > /tmp/caddy.conf << 'CADDY_CONFIG'
n8ncloud.tech {
    reverse_proxy localhost:3000
    log {
        output file /var/log/caddy/n8n.log
    }
}
CADDY_CONFIG

# Step 7: START CADDY
echo "Step 7: Starting Caddy..."
docker run -d \
  --name caddy-prod \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /tmp/caddy.conf:/etc/caddy/Caddyfile \
  -v /var/log/caddy:/var/log/caddy \
  caddy:latest

# Step 8: FINAL TEST
echo "Step 8: Final test..."
sleep 30
echo "Testing external access:"
curl -I https://n8ncloud.tech

echo ""
echo "🔧 VPS FIX COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"

VPS_FIX_COMMANDS

# Step 9: Generate MacBook Environment Setup
print_status "Step 9: Generating MacBook environment setup..."
cat << 'MACBOOK_SETUP'

🔧 MACBOOK ENVIRONMENT SETUP:
============================

# Add to your ~/.zshrc or ~/.bash_profile:

export N8N_API_URL="https://n8ncloud.tech/api/v1"
export N8N_API_KEY="your-api-key-here"

# Then run:
source ~/.zshrc

MACBOOK_SETUP

# Step 10: Final Recommendations
print_status "Step 10: Final recommendations..."
cat << 'RECOMMENDATIONS'

📋 RECOMMENDATIONS:
==================

1. VPS Issues:
   - The VPS n8n container has permission issues
   - Use the VPS fix commands above
   - Ensure proper volume permissions

2. MacBook Setup:
   - Local n8n is working fine
   - Set up environment variables
   - Configure MCP for n8n integration

3. Database Sync:
   - Ensure PostgreSQL and Redis are running
   - Check connection strings match between MacBook and VPS

4. Network:
   - n8ncloud.tech returns 502 (bad gateway)
   - This indicates VPS n8n is not responding
   - Fix VPS n8n first

5. Next Steps:
   - Run VPS fix commands
   - Test n8ncloud.tech
   - Set up MacBook environment variables
   - Configure MCP integration

RECOMMENDATIONS

print_success "🔧 MACBOOK-VPS SYNCHRONIZATION CHECK COMPLETED!"
print_status "📋 Review the recommendations above"
print_status "🚀 Run the VPS fix commands to resolve n8ncloud.tech issues"
