#!/usr/bin/env bash
set -euo pipefail

echo "🌐 Cloudflare DNS Sync Script"
echo "============================="

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
ENV_FILE="/opt/lightningflow/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
    print_error "Environment file not found: $ENV_FILE"
    print_error "Please run the deployment script first"
    exit 1
fi

# Source environment variables
source "$ENV_FILE"

# Check required variables
if [[ -z "$CF_API_TOKEN" || "$CF_API_TOKEN" == "PASTE_YOUR_CLOUDFLARE_API_TOKEN_HERE" ]]; then
    print_error "Please set your Cloudflare API token in $ENV_FILE"
    print_error "Get it from: Cloudflare → My Profile → API Tokens → Edit DNS for this zone"
    exit 1
fi

if [[ -z "$CF_ZONE_NAME" ]]; then
    print_error "CF_ZONE_NAME not set in environment file"
    exit 1
fi

if [[ -z "$VPS_PUBLIC_IP" ]]; then
    print_error "VPS_PUBLIC_IP not set in environment file"
    exit 1
fi

print_status "Zone: $CF_ZONE_NAME"
print_status "VPS IP: $VPS_PUBLIC_IP"
print_status "Proxied: ${CF_PROXIED:-true}"

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    print_error "curl is required but not installed"
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    print_status "Installing jq..."
    apt-get update -y && apt-get install -y jq
fi

# Cloudflare API authentication
AUTH_HEADERS=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")

# Get zone ID
print_status "Looking up zone ID for ${CF_ZONE_NAME}..."
ZONE_RESPONSE=$(curl -fsSL "https://api.cloudflare.com/client/v4/zones?name=${CF_ZONE_NAME}" "${AUTH_HEADERS[@]}")
ZONE_ID=$(echo "$ZONE_RESPONSE" | jq -r '.result[0].id')

if [[ "$ZONE_ID" == "null" || -z "$ZONE_ID" ]]; then
    print_error "Zone not found: ${CF_ZONE_NAME}"
    print_error "Response: $ZONE_RESPONSE"
    exit 1
fi

print_success "Zone ID: $ZONE_ID"

# Function to upsert A record
upsert_a_record() {
    local host="$1"
    local ip="$2"
    local proxied="${CF_PROXIED:-true}"
    
    local fqdn="${host}"
    [[ "$host" == "@" ]] || fqdn="${host}.${CF_ZONE_NAME}"
    
    print_status "Upserting A record: ${fqdn} → ${ip} (proxied=${proxied})"
    
    # Check if record exists
    local existing_record=$(curl -fsSL "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${fqdn}" "${AUTH_HEADERS[@]}" | jq -r '.result[0].id')
    
    local payload=$(jq -n \
        --arg type "A" \
        --arg name "$host" \
        --arg content "$ip" \
        --argjson proxied "$proxied" \
        --arg ttl "1" \
        '{type:$type,name:$name,content:$content,proxied:$proxied,ttl:$ttl}')
    
    if [[ "$existing_record" != "null" && -n "$existing_record" ]]; then
        # Update existing record
        local update_response=$(curl -fsSL -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existing_record}" "${AUTH_HEADERS[@]}" --data "$payload")
        if echo "$update_response" | jq -e '.success' >/dev/null; then
            print_success "Updated A record: ${fqdn}"
        else
            print_error "Failed to update A record: ${fqdn}"
            echo "$update_response" | jq '.'
        fi
    else
        # Create new record
        local create_response=$(curl -fsSL -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" "${AUTH_HEADERS[@]}" --data "$payload")
        if echo "$create_response" | jq -e '.success' >/dev/null; then
            print_success "Created A record: ${fqdn}"
        else
            print_error "Failed to create A record: ${fqdn}"
            echo "$create_response" | jq '.'
        fi
    fi
}

# Upsert A records
print_status "Syncing DNS records..."
upsert_a_record "@" "$VPS_PUBLIC_IP"
upsert_a_record "www" "$VPS_PUBLIC_IP"
upsert_a_record "api" "$VPS_PUBLIC_IP"

print_success "DNS sync completed!"
echo ""
echo "🌐 Your domain should now resolve to your VPS:"
echo "   • lightningflow.online → $VPS_PUBLIC_IP"
echo "   • www.lightningflow.online → $VPS_PUBLIC_IP"
echo "   • api.lightningflow.online → $VPS_PUBLIC_IP"
echo ""
echo "⏳ DNS changes may take a few minutes to propagate"
echo "🔒 Records are set to proxied (orange cloud) for security"
echo ""
echo "🧪 Test your setup:"
echo "   curl -I https://lightningflow.online"
echo "   curl -I https://n8ncloud.tech"
