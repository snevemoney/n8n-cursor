#!/bin/bash
set -e

echo "🔄 TRYING DIFFERENT N8N IMAGE"
echo "============================="

echo "COPY THIS DIFFERENT IMAGE SCRIPT INTO YOUR TERMINAL:"

cat << 'DIFFERENT_IMAGE'
#!/bin/bash
set -e

echo "🔄 TRYING DIFFERENT N8N IMAGE"
echo "============================="

# Step 1: STOP CURRENT N8N
echo "Step 1: Stopping current n8n..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true

# Step 2: TRY ALTERNATIVE IMAGE
echo "Step 2: Trying alternative n8n image..."
docker pull docker.n8n.io/n8nio/n8n:latest

# Step 3: TEST ALTERNATIVE IMAGE
echo "Step 3: Testing alternative image..."
docker run --rm -d --name n8n-test-alt \
  -p 127.0.0.1:5679:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  docker.n8n.io/n8nio/n8n:latest

echo "Waiting 30 seconds for test..."
sleep 30

echo "Testing alternative image:"
curl -f http://localhost:5679/healthz && echo "✅ ALTERNATIVE IMAGE WORKING" || echo "❌ ALTERNATIVE IMAGE FAILED"

docker stop n8n-test-alt

# Step 4: START N8N WITH ALTERNATIVE IMAGE
echo "Step 4: Starting n8n with alternative image..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:5678:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=false \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=lightningflow2024 \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n:latest

# Step 5: WAIT FOR N8N
echo "Step 5: Waiting for n8n (90 seconds)..."
sleep 90

# Step 6: TEST N8N
echo "Step 6: Testing n8n..."
curl -f http://localhost:5678/healthz && echo "✅ N8N IS WORKING!" || echo "❌ N8N TEST FAILED"

# Step 7: CHECK LOGS
echo "Step 7: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 8: TEST EXTERNAL
echo "Step 8: Testing external..."
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 9: SHOW STATUS
echo "Step 9: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔄 DIFFERENT IMAGE TEST COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo "📦 Using: docker.n8n.io/n8nio/n8n:latest"
DIFFERENT_IMAGE

echo ""
echo "=========================================="
echo "END OF DIFFERENT IMAGE SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🔄 This will try a different n8n image that might work!"
echo "⏱️ Expected time: 2 minutes"
