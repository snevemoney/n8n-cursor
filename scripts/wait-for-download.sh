#!/bin/bash
set -e

echo "📥 WAITING FOR N8N DOWNLOAD TO COMPLETE"
echo "======================================="

echo "COPY THIS DOWNLOAD WAIT SCRIPT INTO YOUR TERMINAL:"

cat << 'DOWNLOAD_WAIT'
#!/bin/bash
set -e

echo "📥 WAITING FOR N8N DOWNLOAD TO COMPLETE"
echo "======================================="

# Step 1: CHECK CURRENT DOWNLOAD STATUS
echo "Step 1: Checking current download status..."
echo "Docker images:"
docker images | grep n8n || echo "No n8n images found"

echo "Docker pull status:"
docker pull n8nio/n8n:1.69.0-alpine

# Step 2: WAIT FOR DOWNLOAD TO COMPLETE
echo "Step 2: Waiting for download to complete..."
echo "This may take a few minutes for 150MB download..."

# Check if image exists and is complete
while ! docker images | grep -q "n8nio/n8n.*1.69.0-alpine"; do
    echo "⏳ Still downloading... (checking every 10 seconds)"
    sleep 10
done

echo "✅ Download completed!"

# Step 3: VERIFY IMAGE SIZE
echo "Step 3: Verifying image size..."
docker images | grep "n8nio/n8n.*1.69.0-alpine"

# Step 4: TEST THE COMPLETE IMAGE
echo "Step 4: Testing the complete image..."
docker run --rm -d --name n8n-test-complete \
  -p 127.0.0.1:5679:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  n8nio/n8n:1.69.0-alpine

echo "Waiting 30 seconds for test..."
sleep 30

echo "Testing complete image:"
curl -f http://localhost:5679/healthz && echo "✅ COMPLETE IMAGE WORKING" || echo "❌ COMPLETE IMAGE FAILED"

docker stop n8n-test-complete

# Step 5: START N8N WITH COMPLETE IMAGE
echo "Step 5: Starting n8n with complete image..."
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
  n8nio/n8n:1.69.0-alpine

# Step 6: WAIT FOR N8N TO START
echo "Step 6: Waiting for n8n to start (90 seconds)..."
sleep 90

# Step 7: TEST N8N
echo "Step 7: Testing n8n..."
curl -f http://localhost:5678/healthz && echo "✅ N8N IS WORKING!" || echo "❌ N8N TEST FAILED"

# Step 8: CHECK LOGS
echo "Step 8: Checking n8n logs..."
docker logs n8n-prod --tail 10

# Step 9: TEST EXTERNAL
echo "Step 9: Testing external..."
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 10: SHOW STATUS
echo "Step 10: Final status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📥 DOWNLOAD COMPLETE!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo "📦 Using complete n8n version: 1.69.0-alpine"
DOWNLOAD_WAIT

echo ""
echo "=========================================="
echo "END OF DOWNLOAD WAIT SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo "4. Wait for the 150MB download to complete"
echo ""
echo "📥 This will wait for the complete download!"
echo "⏱️ Expected time: 3-5 minutes (depending on connection)"
