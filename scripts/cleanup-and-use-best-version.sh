#!/bin/bash
set -e

echo "🧹 CLEANUP DUPLICATES & USE BEST VERSION"
echo "========================================="

echo "COPY THIS CLEANUP SCRIPT INTO YOUR TERMINAL:"

cat << 'CLEANUP_SCRIPT'
#!/bin/bash
set -e

echo "🧹 CLEANUP DUPLICATES & USE BEST VERSION"
echo "========================================="

# Step 1: SHOW CURRENT IMAGES
echo "Step 1: Current n8n images:"
docker images | grep n8n

# Step 2: CLEANUP DUPLICATES
echo "Step 2: Cleaning up duplicates..."
echo "Removing untagged duplicate:"
docker rmi 25cd04f978f7 2>/dev/null || echo "Already removed or doesn't exist"

echo "Removing old versions (keeping latest):"
docker rmi n8nio/n8n:1.99.0 2>/dev/null || echo "Already removed or doesn't exist"
docker rmi n8nio/n8n:1.28.0 2>/dev/null || echo "Already removed or doesn't exist"

# Step 3: SHOW CLEANED IMAGES
echo "Step 3: After cleanup:"
docker images | grep n8n

# Step 4: USE LATEST VERSION
echo "Step 4: Using latest version..."
docker pull n8nio/n8n:latest

# Step 5: TEST LATEST VERSION
echo "Step 5: Testing latest version..."
docker run --rm -d --name n8n-test-clean \
  -p 127.0.0.1:5679:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  n8nio/n8n:latest

echo "Waiting 30 seconds for test..."
sleep 30

echo "Testing latest version:"
curl -f http://localhost:5679/healthz && echo "✅ LATEST VERSION WORKING" || echo "❌ LATEST VERSION FAILED"

docker stop n8n-test-clean

# Step 6: START N8N WITH LATEST
echo "Step 6: Starting n8n with latest version..."
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

# Step 7: WAIT FOR N8N
echo "Step 7: Waiting for n8n (90 seconds)..."
sleep 90

# Step 8: TEST N8N
echo "Step 8: Testing n8n..."
curl -f http://localhost:5678/healthz && echo "✅ N8N IS WORKING!" || echo "❌ N8N TEST FAILED"

# Step 9: CHECK LOGS
echo "Step 9: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 10: TEST EXTERNAL
echo "Step 10: Testing external..."
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 11: SHOW FINAL STATUS
echo "Step 11: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🧹 CLEANUP COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo "📦 Using: n8nio/n8n:latest (clean, no duplicates)"
CLEANUP_SCRIPT

echo ""
echo "=========================================="
echo "END OF CLEANUP SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🧹 This will clean up duplicates and use the best version!"
echo "⏱️ Expected time: 2 minutes"
