#!/bin/bash
set -e

echo "🔍 HOSTINGER VPS STATUS CHECK"
echo "============================="

# Configuration
HOSTINGER_API_TOKEN="K984jqyoilSkZQtpAqibcPVlC9fGeRrgidRhFfE4c98d6c8b"
VPS_ID="765579"
SERVER_IP="69.62.66.78"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
echo "VPS Status: $vps_status"

# Step 2: Check if VPS is running
if echo "$vps_status" | grep -q "running"; then
    print_success "VPS is running"
else
    print_warning "VPS is not running, attempting to start..."
    start_result=$(api_call "POST" "/vps/$VPS_ID/start")
    echo "Start result: $start_result"
fi

# Step 3: Test connectivity
print_status "Step 2: Testing connectivity..."
if ping -c 1 $SERVER_IP >/dev/null 2>&1; then
    print_success "VPS is reachable via ping"
else
    print_warning "VPS not reachable via ping, but this might be normal"
fi

# Step 4: Test HTTP
print_status "Step 3: Testing HTTP connectivity..."
if curl -s --connect-timeout 5 http://$SERVER_IP >/dev/null 2>&1; then
    print_success "HTTP is working"
else
    print_warning "HTTP not responding"
fi

# Step 5: Test n8ncloud.tech
print_status "Step 4: Testing n8ncloud.tech..."
if curl -s --connect-timeout 5 https://n8ncloud.tech >/dev/null 2>&1; then
    print_success "n8ncloud.tech is accessible"
else
    print_warning "n8ncloud.tech not accessible"
fi

echo ""
print_status "VPS Check Complete!"
echo ""
echo "📋 If VPS is not working:"
echo "1. Go to Hostinger VPS panel"
echo "2. Use the browser terminal to access the VPS"
echo "3. Or restart the VPS from the panel"
echo ""
echo "🔗 Hostinger VPS Panel: https://hpanel.hostinger.com/vps/$VPS_ID"
