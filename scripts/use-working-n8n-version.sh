#!/bin/bash
set -e

echo "🔧 USING WORKING N8N VERSION"
echo "============================"

echo "COPY THIS WORKING VERSION SCRIPT INTO YOUR TERMINAL:"

cat << 'WORKING_VERSION'
#!/bin/bash
set -e

echo "🔧 USING WORKING N8N VERSION"
echo "============================"

# Step 1: CHECK AVAILABLE VERSIONS
echo "Step 1: Checking available n8n versions..."
echo "Available n8n images:"
docker images | grep n8n

# Step 2: USE LATEST VERSION (WHICH EXISTS)
echo "Step 2: Using latest n8n version (which exists)..."
docker pull n8nio/n8n:latest

# Step 3: TEST THE LATEST VERSION
echo "Step 3: Testing latest version..."
docker run --rm -d --name n8n-test-latest \
  -p 127.0.0.1:5679:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  n8nio/n8n:latest

echo "Waiting 30 seconds for test..."
sleep 30

echo "Testing latest version:"
curl -f http://localhost:5679/healthz && echo "✅ LATEST VERSION WORKING" || echo "❌ LATEST VERSION FAILED"

docker stop n8n-test-latest

# Step 4: START N8N WITH LATEST VERSION
echo "Step 4: Starting n8n with latest version..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true

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
  n8nio/n8n:latest

# Step 5: WAIT FOR N8N TO START
echo "Step 5: Waiting for n8n to start (90 seconds)..."
sleep 90

# Step 6: TEST N8N
echo "Step 6: Testing n8n..."
curl -f http://localhost:5678/healthz && echo "✅ N8N IS WORKING!" || echo "❌ N8N TEST FAILED"

# Step 7: CHECK LOGS
echo "Step 7: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 8: TEST CADDY
echo "Step 8: Testing Caddy..."
curl -f http://localhost:80 && echo "✅ CADDY: WORKING" || echo "❌ CADDY: FAILED"

# Step 9: TEST EXTERNAL
echo "Step 9: Testing external..."
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 10: SHOW STATUS
echo "Step 10: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 WORKING VERSION COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo "📦 Using n8n version: latest"
WORKING_VERSION

echo ""
echo "=========================================="
echo "END OF WORKING VERSION SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🔧 This will use a working n8n version that exists!"
echo "⏱️ Expected time: 2 minutes"
