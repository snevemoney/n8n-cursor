#!/bin/bash
set -e

echo "🔧 FIX CONNECTION RESET BY PEER"
echo "================================"

echo "COPY THIS CONNECTION RESET FIX INTO YOUR TERMINAL:"

cat << 'CONNECTION_FIX'
#!/bin/bash
set -e

echo "🔧 FIX CONNECTION RESET BY PEER"
echo "================================"

# Step 1: CHECK CURRENT STATUS
echo "Step 1: Checking current status..."
docker ps | grep n8n || echo "No n8n container running"

# Step 2: CHECK N8N LOGS FOR ERRORS
echo "Step 2: Checking n8n logs for errors..."
docker logs n8n-prod --tail 20 2>/dev/null || echo "No n8n logs found"

# Step 3: CHECK SYSTEM RESOURCES
echo "Step 3: Checking system resources..."
echo "Memory usage:"
free -h
echo "Disk usage:"
df -h /
echo "CPU load:"
uptime

# Step 4: STOP CURRENT N8N
echo "Step 4: Stopping current n8n..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true

# Step 5: CLEAN DOCKER SYSTEM
echo "Step 5: Cleaning Docker system..."
docker system prune -f
docker volume prune -f

# Step 6: TRY N8N WITH MINIMAL CONFIG
echo "Step 6: Starting n8n with minimal config..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:3000:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=true \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:1.28.0

# Step 7: WAIT AND CHECK LOGS
echo "Step 7: Waiting and checking logs..."
sleep 30
echo "Recent logs:"
docker logs n8n-prod --tail 10

# Step 8: TEST WITH DIFFERENT APPROACH
echo "Step 8: Testing with different approach..."
echo "Testing with curl verbose:"
curl -v http://localhost:3000/healthz 2>&1 | head -20 || echo "Connection failed"

# Step 9: CHECK IF N8N IS ACTUALLY RUNNING
echo "Step 9: Checking if n8n is actually running..."
docker exec n8n-prod ps aux 2>/dev/null || echo "Cannot exec into container"

# Step 10: TRY DIFFERENT IMAGE IF NEEDED
echo "Step 10: If still failing, trying different image..."
if ! curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
    echo "n8n still failing, trying different image..."
    docker stop n8n-prod
    docker rm n8n-prod
    
    echo "Trying n8nio/n8n:latest with different config..."
    docker run -d \
      --name n8n-prod \
      --restart unless-stopped \
      -p 0.0.0.0:3000:5678 \
      -e N8N_HOST=0.0.0.0 \
      -e N8N_PORT=5678 \
      -e N8N_PROTOCOL=http \
      -e N8N_USER_MANAGEMENT_DISABLED=true \
      -e N8N_BASIC_AUTH_ACTIVE=false \
      -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
      n8nio/n8n:latest
    
    sleep 30
    echo "Testing latest image:"
    curl -f http://localhost:3000/healthz && echo "✅ LATEST IMAGE WORKING!" || echo "❌ LATEST IMAGE FAILED"
fi

# Step 11: SHOW FINAL STATUS
echo "Step 11: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 CONNECTION RESET FIX COMPLETED!"
echo "📊 Check the output above for what worked"
echo "🌐 If n8n is working, we'll update Caddy next"
CONNECTION_FIX

echo ""
echo "=========================================="
echo "END OF CONNECTION RESET FIX"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🔧 This will diagnose and fix the connection reset issue!"
echo "⏱️ Expected time: 2 minutes"
echo ""
echo "💡 This script:"
echo "   - Checks system resources"
echo "   - Cleans Docker system"
echo "   - Tries minimal n8n config"
echo "   - Tests different approaches"


