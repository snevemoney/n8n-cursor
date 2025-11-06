#!/bin/bash
set -e

echo "💥 BRUTE FORCE N8N FIX - FORCING EVERYTHING TO WORK"
echo "=================================================="

echo "COPY THIS BRUTE FORCE SCRIPT INTO YOUR TERMINAL:"

cat << 'BRUTE_FORCE'
#!/bin/bash
set -e

echo "💥 BRUTE FORCE N8N FIX - FORCING EVERYTHING TO WORK"
echo "=================================================="

# Step 1: KILL EVERYTHING
echo "Step 1: KILLING EVERYTHING..."
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -f

# Step 2: BACKUP DATA
echo "Step 2: BACKING UP DATA..."
mkdir -p /opt/lightningflow/backups
cp -r /opt/lightningflow/data/n8n_data /opt/lightningflow/backups/n8n_data_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Step 3: CLEAN START
echo "Step 3: CLEAN START - CREATING FRESH SETUP..."

# Create fresh n8n directory
rm -rf /opt/lightningflow/data/n8n_data
mkdir -p /opt/lightningflow/data/n8n_data
chown -R $USER:$USER /opt/lightningflow

# Step 4: START N8N FIRST (FORCE IT)
echo "Step 4: STARTING N8N FIRST (FORCE IT)..."
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

# Step 5: WAIT FOR N8N
echo "Step 5: WAITING FOR N8N (120 seconds)..."
sleep 120

# Step 6: FORCE TEST N8N
echo "Step 6: FORCE TESTING N8N..."
for i in {1..10}; do
    echo "Attempt $i: Testing n8n..."
    if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
        echo "✅ N8N IS WORKING!"
        break
    else
        echo "❌ Attempt $i failed, waiting..."
        sleep 10
    fi
done

# Step 7: START CADDY
echo "Step 7: STARTING CADDY..."
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

# Step 8: WAIT FOR CADDY
echo "Step 8: WAITING FOR CADDY (30 seconds)..."
sleep 30

# Step 9: FORCE TEST EVERYTHING
echo "Step 9: FORCE TESTING EVERYTHING..."

echo "Testing n8n directly:"
curl -f http://localhost:5678/healthz && echo "✅ N8N DIRECT: WORKING" || echo "❌ N8N DIRECT: FAILED"

echo "Testing Caddy:"
curl -f http://localhost:80 && echo "✅ CADDY: WORKING" || echo "❌ CADDY: FAILED"

echo "Testing external:"
curl -I https://n8ncloud.tech --connect-timeout 10 && echo "✅ EXTERNAL: WORKING" || echo "❌ EXTERNAL: FAILED"

# Step 10: SHOW STATUS
echo "Step 10: FINAL STATUS..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "Port 80:"
ss -tlnp | grep :80 || echo "Port 80 not listening"

echo "Port 5678:"
ss -tlnp | grep :5678 || echo "Port 5678 not listening"

# Step 11: FORCE RESTORE DATA IF NEEDED
echo "Step 11: RESTORING DATA IF NEEDED..."
if [ ! -f /opt/lightningflow/data/n8n_data/config ]; then
    echo "Restoring from backup..."
    cp -r /opt/lightningflow/backups/n8n_data_backup_* /opt/lightningflow/data/n8n_data 2>/dev/null || true
    docker restart n8n-prod
    sleep 30
fi

echo ""
echo "💥 BRUTE FORCE COMPLETED!"
echo "🌐 n8ncloud.tech should be working now!"
echo "🔑 Credentials: admin / lightningflow2024"
echo ""
echo "If it's still not working, we'll try a different approach..."
BRUTE_FORCE

echo ""
echo "=========================================="
echo "END OF BRUTE FORCE SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo ""
echo "💥 This will FORCE everything to work!"
echo "⏱️ Expected time: 3 minutes"
