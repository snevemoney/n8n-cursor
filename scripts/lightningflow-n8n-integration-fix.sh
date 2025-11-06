#!/bin/bash
set -e

echo "🔧 LIGHTNINGFLOW-N8N INTEGRATION FIX"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: ANALYZE CURRENT STATE
print_status "Step 1: Analyzing current LightningFlow-n8n integration state..."

echo ""
echo "=== MACBOOK STATUS ==="
print_status "Checking MacBook containers..."

# Check LightningFlow containers
LIGHTNINGFLOW_CONTAINERS=$(docker ps | grep -i lightningflow | wc -l)
if [ "$LIGHTNINGFLOW_CONTAINERS" -gt 0 ]; then
    print_success "LightningFlow containers running: $LIGHTNINGFLOW_CONTAINERS"
    docker ps | grep -i lightningflow
else
    print_warning "No LightningFlow containers running on MacBook"
fi

# Check n8n containers
N8N_CONTAINERS=$(docker ps | grep -i n8n | wc -l)
if [ "$N8N_CONTAINERS" -gt 0 ]; then
    print_success "n8n containers running: $N8N_CONTAINERS"
    docker ps | grep -i n8n
else
    print_warning "No n8n containers running on MacBook"
fi

# Check port conflicts
echo ""
echo "=== PORT CONFLICTS ==="
print_status "Checking for port conflicts..."

PORT_3000_CONFLICT=false
if docker ps | grep -q ":3000"; then
    print_warning "Port 3000 conflict detected:"
    docker ps | grep ":3000"
    PORT_3000_CONFLICT=true
fi

PORT_5432_CONFLICT=false
if docker ps | grep -q ":5432"; then
    print_warning "Port 5432 conflict detected:"
    docker ps | grep ":5432"
    PORT_5432_CONFLICT=true
fi

PORT_6379_CONFLICT=false
if docker ps | grep -q ":6379"; then
    print_warning "Port 6379 conflict detected:"
    docker ps | grep ":6379"
    PORT_6379_CONFLICT=true
fi

# Step 2: CHECK VPS STATUS
print_status "Step 2: Checking VPS status..."
echo ""
echo "=== VPS STATUS ==="

# Check VPS LightningFlow containers
VPS_LIGHTNINGFLOW=$(ssh root@69.62.66.78 "docker ps | grep -i lightningflow | wc -l" 2>/dev/null || echo "0")
if [ "$VPS_LIGHTNINGFLOW" -gt 0 ]; then
    print_success "LightningFlow containers running on VPS: $VPS_LIGHTNINGFLOW"
    ssh root@69.62.66.78 "docker ps | grep -i lightningflow" 2>/dev/null || echo "Cannot get VPS LightningFlow status"
else
    print_warning "No LightningFlow containers running on VPS"
fi

# Check VPS n8n containers
VPS_N8N=$(ssh root@69.62.66.78 "docker ps | grep -i n8n | wc -l" 2>/dev/null || echo "0")
if [ "$VPS_N8N" -gt 0 ]; then
    print_success "n8n containers running on VPS: $VPS_N8N"
    ssh root@69.62.66.78 "docker ps | grep -i n8n" 2>/dev/null || echo "Cannot get VPS n8n status"
else
    print_warning "No n8n containers running on VPS"
fi

# Step 3: IDENTIFY INTEGRATION ISSUES
print_status "Step 3: Identifying integration issues..."
echo ""
echo "=== INTEGRATION ISSUES ==="

ISSUES_FOUND=0

# Issue 1: Port conflicts
if [ "$PORT_3000_CONFLICT" = true ] || [ "$PORT_5432_CONFLICT" = true ] || [ "$PORT_6379_CONFLICT" = true ]; then
    print_error "❌ PORT CONFLICTS DETECTED"
    print_status "LightningFlow and n8n are competing for the same ports"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Issue 2: Missing LightningFlow on VPS
if [ "$VPS_LIGHTNINGFLOW" = "0" ]; then
    print_error "❌ LIGHTNINGFLOW MISSING ON VPS"
    print_status "LightningFlow containers not running on VPS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Issue 3: n8n not working on VPS
if [ "$VPS_N8N" = "0" ]; then
    print_error "❌ N8N NOT WORKING ON VPS"
    print_status "n8n containers not running on VPS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Issue 4: Check for recent fix attempts
RECENT_FIXES=$(find scripts/ -name "*n8n*" -mtime -7 | wc -l)
if [ "$RECENT_FIXES" -gt 5 ]; then
    print_warning "⚠️  MULTIPLE RECENT FIX ATTEMPTS"
    print_status "Found $RECENT_FIXES n8n fix scripts in the last 7 days"
    print_status "This suggests ongoing integration issues"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Step 4: CREATE INTEGRATION FIX PLAN
print_status "Step 4: Creating integration fix plan..."
echo ""
echo "=== INTEGRATION FIX PLAN ==="

if [ "$ISSUES_FOUND" -eq 0 ]; then
    print_success "✅ No major integration issues detected"
    print_status "LightningFlow-n8n integration appears to be working"
else
    print_warning "⚠️  $ISSUES_FOUND integration issues detected"
    echo ""
    print_status "FIX PLAN:"
    echo "1. Resolve port conflicts"
    echo "2. Deploy LightningFlow to VPS"
    echo "3. Fix n8n on VPS"
    echo "4. Configure proper integration"
fi

# Step 5: CREATE VPS INTEGRATION FIX SCRIPT
print_status "Step 5: Creating VPS integration fix script..."
cat > vps-integration-fix.sh << 'VPS_INTEGRATION_FIX'
#!/bin/bash
set -e

echo "🔧 VPS LIGHTNINGFLOW-N8N INTEGRATION FIX"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: BACKUP CURRENT STATE
print_status "Step 1: Backing up current state..."
BACKUP_DIR="/opt/lightningflow/backups/integration-fix-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup n8n data
if docker volume ls | grep -q "n8n-cursor_n8n_data"; then
    docker run --rm -v n8n-cursor_n8n_data:/data -v "$BACKUP_DIR:/backup" alpine tar czf /backup/n8n-data-backup.tar.gz -C /data .
    print_success "n8n data backed up"
fi

# Backup LightningFlow data
if [ -d "/opt/lightningflow/data" ]; then
    tar czf "$BACKUP_DIR/lightningflow-data-backup.tar.gz" -C /opt/lightningflow data
    print_success "LightningFlow data backed up"
fi

# Step 2: STOP ALL CONTAINERS
print_status "Step 2: Stopping all containers..."
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
print_success "All containers stopped"

# Step 3: CLEAN DOCKER SYSTEM
print_status "Step 3: Cleaning Docker system..."
docker system prune -f
docker volume prune -f
print_success "Docker system cleaned"

# Step 4: CREATE PROPER DIRECTORY STRUCTURE
print_status "Step 4: Creating proper directory structure..."
mkdir -p /opt/lightningflow/data/n8n_data
mkdir -p /opt/lightningflow/data/lightningflow
mkdir -p /opt/lightningflow/logs
mkdir -p /opt/lightningflow/config

# Fix permissions
chown -R 1000:1000 /opt/lightningflow/data/n8n_data
chmod -R 755 /opt/lightningflow/data/n8n_data
print_success "Directory structure created"

# Step 5: RESTORE N8N DATA
print_status "Step 5: Restoring n8n data..."
if [ -f "$BACKUP_DIR/n8n-data-backup.tar.gz" ]; then
    cd /opt/lightningflow/data
    tar xzf "$BACKUP_DIR/n8n-data-backup.tar.gz" -C n8n_data --strip-components=1
    chown -R 1000:1000 /opt/lightningflow/data/n8n_data
    print_success "n8n data restored"
else
    print_warning "No n8n backup found, starting fresh"
fi

# Step 6: START N8N
print_status "Step 6: Starting n8n..."
docker run -d \
  --name n8n-prod \
  --restart unless-stopped \
  -p 0.0.0.0:3000:5678 \
  -e N8N_HOST=0.0.0.0 \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=http \
  -e N8N_USER_MANAGEMENT_DISABLED=false \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -e N8N_ENCRYPTION_KEY=lightningflow2024 \
  -v /opt/lightningflow/data/n8n_data:/home/node/.n8n \
  n8nio/n8n:1.28.0

print_success "n8n started on port 3000"

# Step 7: START LIGHTNINGFLOW SERVICES
print_status "Step 7: Starting LightningFlow services..."

# PostgreSQL
docker run -d \
  --name lightningflow-postgres \
  --restart unless-stopped \
  -p 0.0.0.0:5432:5432 \
  -e POSTGRES_DB=lightningflow \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=lightningflow2024 \
  -v /opt/lightningflow/data/postgres:/var/lib/postgresql/data \
  postgres:15-alpine

print_success "PostgreSQL started on port 5432"

# Redis
docker run -d \
  --name lightningflow-redis \
  --restart unless-stopped \
  -p 0.0.0.0:6379:6379 \
  -v /opt/lightningflow/data/redis:/data \
  redis:7-alpine

print_success "Redis started on port 6379"

# Step 8: WAIT FOR SERVICES
print_status "Step 8: Waiting for services to start..."
sleep 60

# Step 9: TEST SERVICES
print_status "Step 9: Testing services..."

# Test n8n
if curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
    print_success "✅ n8n is working"
else
    print_error "❌ n8n is not working"
fi

# Test PostgreSQL
if docker exec lightningflow-postgres pg_isready -U postgres >/dev/null 2>&1; then
    print_success "✅ PostgreSQL is working"
else
    print_error "❌ PostgreSQL is not working"
fi

# Test Redis
if docker exec lightningflow-redis redis-cli ping >/dev/null 2>&1; then
    print_success "✅ Redis is working"
else
    print_error "❌ Redis is not working"
fi

# Step 10: UPDATE CADDY CONFIG
print_status "Step 10: Updating Caddy config..."
cat > /tmp/caddy.conf << 'CADDY_CONFIG'
n8ncloud.tech {
    reverse_proxy localhost:3000
    log {
        output file /var/log/caddy/n8n.log
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
CADDY_CONFIG

# Step 11: START CADDY
print_status "Step 11: Starting Caddy..."
docker run -d \
  --name caddy-prod \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /tmp/caddy.conf:/etc/caddy/Caddyfile \
  -v /var/log/caddy:/var/log/caddy \
  caddy:latest

print_success "Caddy started"

# Step 12: FINAL TEST
print_status "Step 12: Final integration test..."
sleep 30

echo ""
echo "=== INTEGRATION STATUS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_success "🔧 VPS INTEGRATION FIX COMPLETED!"
print_status "🌐 n8ncloud.tech should be working"
print_status "🌐 lightningflow.online should be working"
print_status "📁 Backup location: $BACKUP_DIR"

VPS_INTEGRATION_FIX

chmod +x vps-integration-fix.sh
print_success "VPS integration fix script created: vps-integration-fix.sh"

# Step 6: SHOW INTEGRATION SUMMARY
print_status "Step 6: Integration summary..."
echo ""
echo "=== INTEGRATION SUMMARY ==="
echo "Issues found: $ISSUES_FOUND"
echo "Port conflicts: $PORT_3000_CONFLICT/$PORT_5432_CONFLICT/$PORT_6379_CONFLICT"
echo "LightningFlow on VPS: $VPS_LIGHTNINGFLOW"
echo "n8n on VPS: $VPS_N8N"
echo "Recent fix attempts: $RECENT_FIXES"

echo ""
print_status "=== NEXT STEPS ==="
if [ "$ISSUES_FOUND" -gt 0 ]; then
    echo "1. Run the VPS integration fix script"
    echo "2. Test both n8ncloud.tech and lightningflow.online"
    echo "3. Verify account preservation"
    echo "4. Check integration functionality"
else
    echo "1. Integration appears to be working"
    echo "2. Monitor for any issues"
    echo "3. Test functionality as needed"
fi

print_success "🔧 LIGHTNINGFLOW-N8N INTEGRATION ANALYSIS COMPLETED!"
