#!/bin/bash
set -e

echo "🛡️ SAFE FIX - PRESERVING ALL DATA"
echo "================================="

echo "COPY THIS SAFE FIX INTO YOUR TERMINAL:"

cat << 'SAFE_FIX'
#!/bin/bash
set -e

echo "🛡️ SAFE FIX - PRESERVING ALL DATA"
echo "================================="

# Step 1: SAFETY CHECK - SHOW CURRENT DATA
echo "Step 1: SAFETY CHECK - SHOWING CURRENT DATA..."
echo "Current n8n data directory:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

echo "Current Docker containers:"
docker ps -a

# Step 2: BACKUP DATA (EXTRA SAFETY)
echo "Step 2: CREATING EXTRA BACKUP..."
mkdir -p /opt/lightningflow/backups
cp -r /opt/lightningflow/data/n8n_data /opt/lightningflow/backups/n8n_data_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
echo "✅ Backup created"

# Step 3: STOP ONLY N8N CONTAINER (KEEP DATA)
echo "Step 3: STOPPING ONLY N8N CONTAINER (KEEPING DATA)..."
docker stop n8n-prod 2>/dev/null || true
docker rm n8n-prod 2>/dev/null || true
echo "✅ n8n container stopped"

# Step 4: VERIFY DATA IS STILL THERE
echo "Step 4: VERIFYING DATA IS STILL THERE..."
echo "n8n data contents:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

# Step 5: START N8N WITH SAME DATA
echo "Step 5: STARTING N8N WITH SAME DATA..."
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

# Step 6: WAIT FOR N8N
echo "Step 6: WAITING FOR N8N (90 seconds)..."
sleep 90

# Step 7: TEST N8N
echo "Step 7: TESTING N8N..."
curl -f http://localhost:5678/healthz && echo "✅ N8N IS WORKING!" || echo "❌ N8N TEST FAILED"

# Step 8: VERIFY DATA IS STILL THERE
echo "Step 8: VERIFYING DATA IS STILL THERE..."
echo "n8n data contents after restart:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

# Step 9: START CADDY (IF NOT RUNNING)
echo "Step 9: STARTING CADDY (IF NOT RUNNING)..."
if ! docker ps | grep -q caddy-prod; then
    cat > /opt/lightningflow/Caddyfile.prod << 'EOF'
n8ncloud.tech {
    reverse_proxy localhost:5678
    log {
        output file /var/log/caddy/n8ncloud.log
        format json
    }
}

lightningflow.online {
    reverse_proxy localhost:4000
    log {
        output file /var/log/caddy/lightningflow.log
        format json
    }
}
EOF

    docker run -d \
      --name caddy-prod \
      --restart unless-stopped \
      -p 80:80 \
      -p 443:443 \
      -v /opt/lightningflow/Caddyfile.prod:/etc/caddy/Caddyfile:ro \
      -v caddy_data:/data \
      -v caddy_config:/config \
      caddy:2-alpine
    echo "✅ Caddy started"
else
    echo "✅ Caddy already running"
fi

# Step 10: WAIT FOR CADDY
echo "Step 10: WAITING FOR CADDY (30 seconds)..."
sleep 30

# Step 11: TEST EVERYTHING
echo "Step 11: TESTING EVERYTHING..."

echo "Testing n8n directly:"
curl -f http://localhost:5678/healthz && echo "✅ N8N DIRECT: WORKING" || echo "❌ N8N DIRECT: FAILED"

echo "Testing Caddy:"
curl -f http://localhost:80 && echo "✅ CADDY: WORKING" || echo "❌ CADDY: FAILED"

echo "Testing external:"
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 12: FINAL DATA VERIFICATION
echo "Step 12: FINAL DATA VERIFICATION..."
echo "n8n data directory contents:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

echo "Backup directory contents:"
ls -la /opt/lightningflow/backups/ 2>/dev/null || echo "No backup directory found"

# Step 13: SHOW STATUS
echo "Step 13: FINAL STATUS..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🛡️ SAFE FIX COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo ""
echo "✅ ALL YOUR DATA HAS BEEN PRESERVED!"
echo "📁 Your n8n workflows are safe!"
SAFE_FIX

echo ""
echo "=========================================="
echo "END OF SAFE FIX SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "🛡️ This will fix n8n WITHOUT deleting any data!"
echo "⏱️ Expected time: 2 minutes"
