#!/bin/bash
set -e

echo "🔧 FIX PERMISSIONS - IMMEDIATE SOLUTION"
echo "======================================="

echo "COPY THIS PERMISSION FIX INTO YOUR TERMINAL:"

cat << 'PERMISSION_FIX'
#!/bin/bash
set -e

echo "🔧 FIX PERMISSIONS - IMMEDIATE SOLUTION"
echo "======================================="

# Step 1: STOP CURRENT N8N
echo "Step 1: Stopping current n8n..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true

# Step 2: FIX DATA DIRECTORY PERMISSIONS
echo "Step 2: Fixing data directory permissions..."
mkdir -p /opt/lightningflow/data/n8n_data
chown -R 1000:1000 /opt/lightningflow/data/n8n_data
chmod -R 755 /opt/lightningflow/data/n8n_data

echo "Permissions fixed:"
ls -la /opt/lightningflow/data/n8n_data/

# Step 3: START N8N WITH CORRECT USER
echo "Step 3: Starting n8n with correct user..."
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
  --user 1000:1000 \
  n8nio/n8n:1.28.0

# Step 4: WAIT FOR N8N
echo "Step 4: Waiting for n8n (60 seconds)..."
sleep 60

# Step 5: TEST N8N
echo "Step 5: Testing n8n..."
curl -f http://localhost:3000/healthz && echo "✅ N8N WORKING!" || echo "❌ N8N FAILED"

# Step 6: CHECK LOGS
echo "Step 6: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 7: SHOW STATUS
echo "Step 7: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 PERMISSION FIX COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
PERMISSION_FIX

echo ""
echo "=========================================="
echo "END OF PERMISSION FIX"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🔧 This will fix the permission denied error!"
echo "⏱️ Expected time: 1 minute"
echo ""
echo "💡 This fixes:"
echo "   - Permission denied on /home/node/.n8n/config"
echo "   - Command start not found error"
echo "   - Data directory ownership issues"


