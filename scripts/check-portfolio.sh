#!/bin/bash
# Portfolio Deployment Validation Script
# Checks if portfolio is running correctly on VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PORT=4010
DOMAIN="portfolio.n8ncloud.tech"
LOCAL_URL="http://localhost:${PORT}"
HTTPS_URL="https://${DOMAIN}"
HEALTH_ENDPOINT="/healthz"

echo "🔍 Portfolio Deployment Validation"
echo "=================================="
echo ""

# Track failures
FAILURES=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        FAILURES=$((FAILURES + 1))
    fi
}

# 1. Check PM2 Process
echo "1. Checking PM2 Process..."
if pm2 list | grep -q "portfolio.*online"; then
    print_status 0 "PM2 process 'portfolio' is running"
    PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="portfolio") | .pm2_env.status' 2>/dev/null || echo "unknown")
    echo "   Status: $PM2_STATUS"
else
    print_status 1 "PM2 process 'portfolio' is NOT running"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   cd ~/portfolio"
    echo "   pm2 start npm --name 'portfolio' -- start"
    echo "   pm2 save"
    echo ""
fi

# 2. Check Local Health Endpoint
echo ""
echo "2. Checking Local Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${LOCAL_URL}${HEALTH_ENDPOINT}" 2>/dev/null || echo -e "\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q '"status":"ok"'; then
        print_status 0 "Local health endpoint responds correctly"
        echo "   Response: $BODY"
    else
        print_status 1 "Local health endpoint returns unexpected response"
        echo "   Response: $BODY"
    fi
else
    print_status 1 "Local health endpoint failed (HTTP $HTTP_CODE)"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   # Check if port $PORT is in use"
    echo "   sudo lsof -i :$PORT"
    echo "   # Check PM2 logs"
    echo "   pm2 logs portfolio --lines 50"
    echo "   # Restart portfolio"
    echo "   pm2 restart portfolio"
    echo ""
fi

# 3. Check HTTPS Health Endpoint
echo ""
echo "3. Checking HTTPS Health Endpoint..."
HTTPS_RESPONSE=$(curl -s -w "\n%{http_code}" "${HTTPS_URL}${HEALTH_ENDPOINT}" 2>/dev/null || echo -e "\n000")
HTTPS_CODE=$(echo "$HTTPS_RESPONSE" | tail -n1)
HTTPS_BODY=$(echo "$HTTPS_RESPONSE" | head -n-1)

if [ "$HTTPS_CODE" = "200" ]; then
    if echo "$HTTPS_BODY" | grep -q '"status":"ok"'; then
        print_status 0 "HTTPS health endpoint responds correctly"
        echo "   Response: $HTTPS_BODY"
    else
        print_status 1 "HTTPS health endpoint returns unexpected response"
        echo "   Response: $HTTPS_BODY"
    fi
elif [ "$HTTPS_CODE" = "000" ]; then
    print_status 1 "HTTPS endpoint unreachable (connection failed)"
    echo ""
    echo "   ${YELLOW}Possible issues:${NC}"
    echo "   - DNS not configured or not propagated"
    echo "   - Caddy not running or misconfigured"
    echo "   - Firewall blocking port 443"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   # Check DNS"
    echo "   dig $DOMAIN +short"
    echo "   # Check Caddy status"
    echo "   sudo systemctl status caddy"
    echo "   # Check Caddy logs"
    echo "   sudo journalctl -u caddy -f"
    echo "   # Validate Caddyfile"
    echo "   sudo caddy validate --config /etc/caddy/Caddyfile"
    echo "   # Reload Caddy"
    echo "   sudo systemctl reload caddy"
    echo ""
elif [ "$HTTPS_CODE" = "502" ] || [ "$HTTPS_CODE" = "503" ]; then
    print_status 1 "HTTPS endpoint returns $HTTPS_CODE (Bad Gateway/Service Unavailable)"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   # Check if portfolio is running on port $PORT"
    echo "   curl http://localhost:$PORT$HEALTH_ENDPOINT"
    echo "   # Check Caddy reverse proxy configuration"
    echo "   sudo grep -A 10 '$DOMAIN' /etc/caddy/Caddyfile"
    echo "   # Check Caddy logs"
    echo "   sudo journalctl -u caddy | tail -20"
    echo ""
else
    print_status 1 "HTTPS endpoint failed (HTTP $HTTPS_CODE)"
    echo "   Response: $HTTPS_BODY"
fi

# 4. Check DNS Resolution
echo ""
echo "4. Checking DNS Resolution..."
DNS_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -n1 || echo "")
if [ -n "$DNS_RESULT" ] && [ "$DNS_RESULT" != "127.0.0.1" ]; then
    print_status 0 "DNS resolves to: $DNS_RESULT"
else
    print_status 1 "DNS does not resolve correctly"
    echo "   Result: ${DNS_RESULT:-"No result"}"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   # Add A record in your DNS provider:"
    echo "   Name: portfolio"
    echo "   Type: A"
    echo "   Value: [Your VPS IP]"
    echo "   TTL: 3600"
    echo "   # Wait for DNS propagation (5-60 minutes)"
    echo "   # Verify: dig $DOMAIN +short"
    echo ""
fi

# 5. Check Caddy Status
echo ""
echo "5. Checking Caddy Service..."
if systemctl is-active --quiet caddy; then
    print_status 0 "Caddy service is running"
    CADDY_STATUS=$(sudo systemctl status caddy --no-pager | grep "Active:" | head -1)
    echo "   $CADDY_STATUS"
else
    print_status 1 "Caddy service is NOT running"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   sudo systemctl start caddy"
    echo "   sudo systemctl status caddy"
    echo ""
fi

# 6. Check Port Availability
echo ""
echo "6. Checking Port $PORT Availability..."
if lsof -i :$PORT >/dev/null 2>&1; then
    PORT_PROCESS=$(lsof -i :$PORT | tail -1 | awk '{print $1, $2}')
    print_status 0 "Port $PORT is in use by: $PORT_PROCESS"
else
    print_status 1 "Port $PORT is NOT in use (portfolio may not be running)"
    echo ""
    echo "   ${YELLOW}Fix instructions:${NC}"
    echo "   pm2 start npm --name 'portfolio' -- start"
    echo ""
fi

# Summary
echo ""
echo "=================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "🎉 Portfolio is live at: ${HTTPS_URL}"
    echo ""
    echo "Visit your site: ${HTTPS_URL}"
    exit 0
else
    echo -e "${RED}✗ $FAILURES check(s) failed${NC}"
    echo ""
    echo "Please review the errors above and follow the fix instructions."
    echo ""
    exit 1
fi

