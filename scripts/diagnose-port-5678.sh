#!/bin/bash
set -e

echo "🔍 DIAGNOSE PORT 5678 ISSUE"
echo "==========================="

echo "COPY THIS DIAGNOSTIC SCRIPT INTO YOUR TERMINAL:"

cat << 'DIAGNOSE_PORT'
#!/bin/bash
set -e

echo "🔍 DIAGNOSE PORT 5678 ISSUE"
echo "==========================="

# Step 1: CHECK WHAT'S USING PORT 5678
echo "Step 1: Checking what's using port 5678..."
echo "Netstat output:"
netstat -tlnp | grep 5678 || echo "No process found on 5678"

echo "Lsof output:"
lsof -i :5678 || echo "No process found on 5678"

# Step 2: CHECK DOCKER CONTAINERS
echo "Step 2: Checking Docker containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep 5678 || echo "No Docker container using 5678"

# Step 3: CHECK IF N8N IS RUNNING
echo "Step 3: Checking if n8n is running..."
docker ps | grep n8n || echo "No n8n container running"

# Step 4: CHECK N8N LOGS
echo "Step 4: Checking n8n logs..."
docker logs n8n-prod --tail 20 2>/dev/null || echo "No n8n logs found"

# Step 5: TEST PORT DIRECTLY
echo "Step 5: Testing port 5678 directly..."
echo "Testing localhost:5678:"
curl -v http://localhost:5678/healthz 2>&1 | head -10 || echo "Connection failed"

echo "Testing 127.0.0.1:5678:"
curl -v http://127.0.0.1:5678/healthz 2>&1 | head -10 || echo "Connection failed"

# Step 6: CHECK CADDY CONFIG
echo "Step 6: Checking Caddy configuration..."
docker exec caddy-prod cat /etc/caddy/Caddyfile 2>/dev/null || echo "Caddy config not found"

# Step 7: CHECK CADDY LOGS
echo "Step 7: Checking Caddy logs..."
docker logs caddy-prod --tail 10 2>/dev/null || echo "No Caddy logs found"

# Step 8: CHECK FIREWALL
echo "Step 8: Checking firewall status..."
ufw status 2>/dev/null || echo "UFW not available"

# Step 9: CHECK DOCKER NETWORKS
echo "Step 9: Checking Docker networks..."
docker network ls
docker network inspect bridge 2>/dev/null | grep -A 10 "Containers" || echo "Bridge network not found"

# Step 10: TRY DIFFERENT PORT
echo "Step 10: Testing n8n on different port..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true

echo "Starting n8n on port 3000 instead of 5678..."
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

echo "Waiting 30 seconds..."
sleep 30

echo "Testing n8n on port 3000:"
curl -f http://localhost:3000/healthz && echo "✅ N8N WORKING ON PORT 3000!" || echo "❌ N8N FAILED ON PORT 3000"

# Step 11: SHOW FINAL STATUS
echo "Step 11: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔍 DIAGNOSTIC COMPLETED!"
echo "📊 Check the output above for clues about the port issue"
echo "🌐 If n8n works on port 3000, we'll update Caddy to use that port"
DIAGNOSE_PORT

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
echo "🔍 This will diagnose what's blocking port 5678!"
echo "⏱️ Expected time: 1 minute"
echo ""
echo "💡 We'll find the root cause and fix it!"
