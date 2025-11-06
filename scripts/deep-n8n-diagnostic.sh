#!/bin/bash
set -e

echo "🔍 DEEP N8N DIAGNOSTIC - FINDING ROOT CAUSE"
echo "==========================================="

echo "COPY THIS DEEP DIAGNOSTIC INTO YOUR TERMINAL:"

cat << 'DEEP_DIAGNOSTIC'
#!/bin/bash
set -e

echo "🔍 DEEP N8N DIAGNOSTIC - FINDING ROOT CAUSE"
echo "==========================================="

# Step 1: SYSTEM CHECK
echo "Step 1: SYSTEM CHECK..."
echo "System load:"
uptime

echo "Memory usage:"
free -h

echo "Disk usage:"
df -h

echo "Docker status:"
docker info | head -10

# Step 2: CHECK ALL CONTAINERS
echo "Step 2: CHECKING ALL CONTAINERS..."
echo "Running containers:"
docker ps

echo "All containers (including stopped):"
docker ps -a

# Step 3: CHECK N8N LOGS IN DETAIL
echo "Step 3: CHECKING N8N LOGS IN DETAIL..."
if docker ps -a | grep -q n8n-prod; then
    echo "n8n container logs (last 50 lines):"
    docker logs n8n-prod --tail 50
else
    echo "No n8n-prod container found"
fi

# Step 4: CHECK PORT STATUS
echo "Step 4: CHECKING PORT STATUS..."
echo "Port 5678 status:"
ss -tlnp | grep 5678 || echo "Port 5678 not listening"

echo "All listening ports:"
ss -tlnp | head -20

# Step 5: CHECK N8N DATA DIRECTORY
echo "Step 5: CHECKING N8N DATA DIRECTORY..."
echo "n8n data directory:"
ls -la /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

echo "n8n data directory permissions:"
ls -ld /opt/lightningflow/data/n8n_data/ 2>/dev/null || echo "No n8n data directory found"

# Step 6: CHECK DOCKER VOLUMES
echo "Step 6: CHECKING DOCKER VOLUMES..."
echo "Docker volumes:"
docker volume ls

# Step 7: TEST N8N IMAGE
echo "Step 7: TESTING N8N IMAGE..."
echo "Testing n8n image pull:"
docker pull n8nio/n8n:latest

echo "Testing n8n image run (temporary):"
docker run --rm -d --name n8n-test \
  -p 127.0.0.1:5679:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  n8nio/n8n:latest

echo "Waiting 30 seconds for test container..."
sleep 30

echo "Testing test container:"
curl -f http://localhost:5679/healthz && echo "✅ TEST CONTAINER WORKING" || echo "❌ TEST CONTAINER FAILED"

echo "Stopping test container:"
docker stop n8n-test

# Step 8: CHECK SYSTEM RESOURCES
echo "Step 8: CHECKING SYSTEM RESOURCES..."
echo "CPU usage:"
mpstat 1 1

echo "Process count:"
ps aux | wc -l

echo "Docker processes:"
ps aux | grep docker

# Step 9: CHECK NETWORK
echo "Step 9: CHECKING NETWORK..."
echo "Network interfaces:"
ip addr show

echo "Routing table:"
ip route show

# Step 10: CHECK FIREWALL
echo "Step 10: CHECKING FIREWALL..."
echo "UFW status:"
ufw status || echo "UFW not installed"

echo "iptables rules:"
iptables -L -n | head -20

# Step 11: CHECK SYSTEMD SERVICES
echo "Step 11: CHECKING SYSTEMD SERVICES..."
echo "Docker service status:"
systemctl status docker --no-pager -l

echo "Systemd services:"
systemctl list-units --type=service --state=failed

# Step 12: CHECK LOGS
echo "Step 12: CHECKING SYSTEM LOGS..."
echo "Docker daemon logs:"
journalctl -u docker --no-pager -l --lines=20

echo "System logs (last 20 lines):"
journalctl --no-pager -l --lines=20

# Step 13: RECOMMENDATION
echo "Step 13: RECOMMENDATION..."
echo ""
echo "🔍 DIAGNOSTIC COMPLETE!"
echo ""
echo "Based on the results above, we can determine:"
echo "1. If it's a resource issue (memory/CPU)"
echo "2. If it's a Docker issue"
echo "3. If it's a network/firewall issue"
echo "4. If it's a data corruption issue"
echo "5. If it's an image issue"
echo ""
echo "Please run this diagnostic and share the output!"
DEEP_DIAGNOSTIC

echo ""
echo "=========================================="
echo "END OF DEEP DIAGNOSTIC SCRIPT"
echo "=========================================="
echo ""
echo "📋 Instructions:"
echo "1. Copy the script above (between the markers)"
echo "2. Paste it into your Hostinger browser terminal"
echo "3. Press Enter to run"
echo "4. Share the output so we can find the root cause!"
echo ""
echo "🔍 This will help us understand why n8n keeps failing!"
echo "⏱️ Expected time: 1 minute"
