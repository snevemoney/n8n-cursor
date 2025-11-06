#!/bin/bash
set -e

echo "🚀 FINAL N8N FIX - COMPREHENSIVE SOLUTION"
echo "=========================================="

echo "COPY THIS FINAL FIX SCRIPT INTO YOUR TERMINAL:"

cat << 'FINAL_FIX'
#!/bin/bash
set -e

echo "🚀 FINAL N8N FIX - COMPREHENSIVE SOLUTION"
echo "=========================================="

# Step 1: STOP EVERYTHING AND CLEAN UP
echo "Step 1: Stopping everything and cleaning up..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true
docker stop caddy-prod 2>/dev/null || true
docker rm caddy-prod 2>/dev/null || true

# Step 2: CHECK WHAT'S USING PORTS
echo "Step 2: Checking what's using ports..."
echo "Port 5678:"
netstat -tlnp | grep 5678 || echo "Port 5678 is free"
echo "Port 3000:"
netstat -tlnp | grep 3000 || echo "Port 3000 is free"

# Step 3: START N8N ON PORT 3000 (AVOID CONFLICT)
echo "Step 3: Starting n8n on port 3000..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:3000:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=false \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=lightningflow2024 \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:1.28.0

# Step 4: WAIT FOR N8N
echo "Step 4: Waiting for n8n (60 seconds)..."
sleep 60

# Step 5: TEST N8N ON PORT 3000
echo "Step 5: Testing n8n on port 3000..."
curl -f http://localhost:3000/healthz && echo "✅ N8N WORKING ON PORT 3000!" || echo "❌ N8N FAILED ON PORT 3000"

# Step 6: CHECK N8N LOGS
echo "Step 6: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 7: UPDATE CADDY CONFIG FOR PORT 3000
echo "Step 7: Updating Caddy config for port 3000..."
cat > /opt/lightningflow/Caddyfile.prod << 'CADDY_CONFIG'
n8ncloud.tech {
    reverse_proxy localhost:3000
    log {
        output file /var/log/caddy/n8ncloud.log
        format json
    }
}
CADDY_CONFIG

# Step 8: START CADDY WITH NEW CONFIG
echo "Step 8: Starting Caddy with new config..."
docker run -d \
  --name caddy-prod \
  --restart unless-stopped \
  -p 0.0.0.0:80:80 \
  -p 0.0.0.0:443:443 \
  -p 443:443/udp \
  -p 2019:2019 \
  -v /opt/lightningflow/Caddyfile.prod:/etc/caddy/Caddyfile \
  -v /opt/lightningflow/caddy_data:/data \
  -v /opt/lightningflow/caddy_config:/config \
  -v /var/log/caddy:/var/log/caddy \
  caddy:latest

# Step 9: WAIT FOR CADDY
echo "Step 9: Waiting for Caddy (30 seconds)..."
sleep 30

# Step 10: TEST EXTERNAL ACCESS
echo "Step 10: Testing external access..."
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 11: SHOW FINAL STATUS
echo "Step 11: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🚀 FINAL FIX COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo "📦 Using: n8nio/n8n:1.28.0 on port 3000"
echo "🔧 Caddy updated to proxy to port 3000"
FINAL_FIX

echo ""
echo "=========================================="
echo "END OF FINAL FIX SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🚀 This will fix everything in one go!"
echo "⏱️ Expected time: 2 minutes"
echo ""
echo "💡 This script:"
echo "   - Stops all containers"
echo "   - Checks for port conflicts"
echo "   - Starts n8n on port 3000 (avoiding 5678)"
echo "   - Updates Caddy to use port 3000"
echo "   - Tests everything"
