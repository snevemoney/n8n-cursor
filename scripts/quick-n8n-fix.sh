#!/bin/bash
set -e

echo "🔧 QUICK N8N FIX - RESOLVING 502 ERROR"
echo "======================================"

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

print_status "COPY THIS QUICK FIX INTO YOUR TERMINAL:"

cat << 'QUICK_FIX'
#!/bin/bash
set -e

echo "🔧 QUICK N8N FIX - RESOLVING 502 ERROR"
echo "======================================"

# Step 1: Check current status
echo "Checking current containers..."
docker ps

echo "Checking n8n health..."
curl -f http://localhost:5678/healthz || echo "n8n health check failed"

# Step 2: Fix n8n configuration
echo "Fixing n8n configuration..."
docker stop n8n-cursor_n8n_1
docker rm n8n-cursor_n8n_1

# Step 3: Start n8n with proper configuration
echo "Starting n8n with proper configuration..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 127.0.0.1:5678:5678 \
  -e N8N_EDITOR_BASE_URL=https://n8ncloud.tech \
  -e N8N_PUBLIC_URL=https://n8ncloud.tech \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=https \
  -e N8N_USER_MANAGEMENT_DISABLED=false \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=lightningflow2024 \
  -e WEBHOOK_URL=https://n8ncloud.tech \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:latest

# Step 4: Wait for n8n to start
echo "Waiting for n8n to start..."
sleep 30

# Step 5: Test n8n
echo "Testing n8n..."
curl -f http://localhost:5678/healthz && echo "✅ n8n is healthy" || echo "❌ n8n health check failed"

# Step 6: Test Caddy
echo "Testing Caddy..."
curl -f http://localhost:80 && echo "✅ Caddy is working" || echo "❌ Caddy test failed"

# Step 7: Show final status
echo "Final status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "Port 80 status:"
ss -tlnp | grep :80

echo "Port 5678 status:"
ss -tlnp | grep :5678

echo ""
echo "✅ QUICK FIX COMPLETED!"
echo "🌐 n8n should now be available at: https://n8ncloud.tech"
echo "🔑 Credentials: admin / lightningflow2024"
QUICK_FIX

echo ""
echo "=========================================="
echo "END OF QUICK FIX SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🎯 This will fix the 502 error and get n8ncloud.tech working!"
echo "⏱️ Expected time: 1 minute"
