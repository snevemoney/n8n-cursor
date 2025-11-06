#!/bin/bash
set -e

echo "🔍 N8N DIAGNOSTIC & FIX"
echo "========================"

echo "COPY THIS DIAGNOSTIC SCRIPT INTO YOUR TERMINAL:"

cat << 'DIAGNOSTIC_SCRIPT'
#!/bin/bash
set -e

echo "🔍 N8N DIAGNOSTIC & FIX"
echo "========================"

# Step 1: Check n8n logs
echo "Step 1: Checking n8n logs..."
docker logs n8n-prod --tail 20

# Step 2: Check if n8n is actually listening
echo "Step 2: Checking if n8n is listening..."
netstat -tlnp | grep 5678 || echo "n8n not listening on 5678"

# Step 3: Test n8n directly
echo "Step 3: Testing n8n directly..."
curl -v http://localhost:5678/healthz || echo "Direct n8n test failed"

# Step 4: Check Caddy configuration
echo "Step 4: Checking Caddy configuration..."
docker exec caddy-prod cat /etc/caddy/Caddyfile

# Step 5: Check Caddy logs
echo "Step 5: Checking Caddy logs..."
docker logs caddy-prod --tail 10

# Step 6: Restart n8n with simpler config
echo "Step 6: Restarting n8n with simpler configuration..."
docker stop n8n-prod
docker rm n8n-prod

docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 127.0.0.1:5678:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=false \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=lightningflow2024 \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:latest

# Step 7: Wait longer for n8n to start
echo "Step 7: Waiting for n8n to start (60 seconds)..."
sleep 60

# Step 8: Test again
echo "Step 8: Testing n8n again..."
curl -f http://localhost:5678/healthz && echo "✅ n8n is healthy" || echo "❌ n8n still not responding"

# Step 9: Test Caddy proxy
echo "Step 9: Testing Caddy proxy..."
curl -f http://localhost:80 && echo "✅ Caddy is working" || echo "❌ Caddy test failed"

# Step 10: Show final status
echo "Step 10: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Test n8ncloud.tech now!"
echo "🔑 Credentials: admin / lightningflow2024"
DIAGNOSTIC_SCRIPT

echo ""
echo "=========================================="
echo "END OF DIAGNOSTIC SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🎯 This will diagnose and fix the n8n connection issue!"
echo "⏱️ Expected time: 2 minutes"
