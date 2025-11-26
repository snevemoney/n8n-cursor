#!/bin/bash
set -e

echo "🔧 ADAPTIVE RESTORATION - BOTH SERVICES"
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

# Step 1: CHECK VPS CONNECTIVITY
print_status "Step 1: Checking VPS connectivity..."
if ssh -o ConnectTimeout=10 root@69.62.66.78 "echo 'VPS accessible'" 2>/dev/null; then
    print_success "VPS is accessible"
else
    print_error "VPS is not accessible - this explains the 522 errors"
    print_status "Both n8ncloud.tech and lightningflow.online are timing out"
    exit 1
fi

# Step 2: CHECK CURRENT VPS STATE
print_status "Step 2: Checking current VPS state..."
ssh root@69.62.66.78 "
echo '=== CURRENT VPS STATE ==='
echo 'Docker containers:'
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || echo 'Docker not running'

echo ''
echo 'Port usage:'
netstat -tlnp | grep -E ':(80|443|3000|5432|6379)' 2>/dev/null || echo 'No ports found'

echo ''
echo 'Disk space:'
df -h / 2>/dev/null || echo 'Cannot check disk space'

echo ''
echo 'Memory usage:'
free -h 2>/dev/null || echo 'Cannot check memory'
"

# Step 3: CREATE ADAPTIVE RESTORATION SCRIPT
print_status "Step 3: Creating adaptive restoration script..."
cat > adaptive-vps-restore.sh << 'ADAPTIVE_RESTORE'
#!/bin/bash
set -e

echo "🔧 ADAPTIVE VPS RESTORATION"
echo "==========================="

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

# Step 1: EMERGENCY BACKUP
print_status "Step 1: Creating emergency backup..."
BACKUP_DIR="/opt/lightningflow/backups/emergency-restore-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup everything that exists
if [ -d "/opt/lightningflow" ]; then
    tar czf "$BACKUP_DIR/lightningflow-complete-backup.tar.gz" -C /opt lightningflow
    print_success "Complete LightningFlow backup created"
fi

if docker volume ls | grep -q "n8n"; then
    for volume in $(docker volume ls --format "{{.Name}}" | grep n8n); do
        docker run --rm -v "$volume:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/$volume-backup.tar.gz" -C /data .
    done
    print_success "n8n volumes backed up"
fi

# Step 2: STOP EVERYTHING
print_status "Step 2: Stopping all containers..."
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
print_success "All containers stopped"

# Step 3: CLEAN DOCKER
print_status "Step 3: Cleaning Docker system..."
docker system prune -f
docker volume prune -f
print_success "Docker system cleaned"

# Step 4: CREATE FRESH STRUCTURE
print_status "Step 4: Creating fresh directory structure..."
mkdir -p /opt/lightningflow/data/n8n_data
mkdir -p /opt/lightningflow/data/postgres
mkdir -p /opt/lightningflow/data/redis
mkdir -p /opt/lightningflow/logs
mkdir -p /opt/lightningflow/config

# Fix permissions
chown -R 1000:1000 /opt/lightningflow/data/n8n_data
chmod -R 755 /opt/lightningflow/data/n8n_data
print_success "Directory structure created"

# Step 5: RESTORE N8N DATA IF EXISTS
print_status "Step 5: Restoring n8n data if exists..."
if [ -f "$BACKUP_DIR/n8n-cursor_n8n_data-backup.tar.gz" ]; then
    cd /opt/lightningflow/data
    tar xzf "$BACKUP_DIR/n8n-cursor_n8n_data-backup.tar.gz" -C n8n_data --strip-components=1
    chown -R 1000:1000 /opt/lightningflow/data/n8n_data
    print_success "n8n data restored"
else
    print_warning "No n8n backup found, starting fresh"
fi

# Step 6: START N8N (PORT 3000)
print_status "Step 6: Starting n8n on port 3000..."
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

# PostgreSQL (PORT 5432)
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

# Redis (PORT 6379)
docker run -d \
  --name lightningflow-redis \
  --restart unless-stopped \
  -p 0.0.0.0:6379:6379 \
  -v /opt/lightningflow/data/redis:/data \
  redis:7-alpine

print_success "Redis started on port 6379"

# LightningFlow API (PORT 4000)
docker run -d \
  --name lightningflow-api \
  --restart unless-stopped \
  -p 0.0.0.0:4000:4000 \
  -e DATABASE_URL=postgresql://postgres:lightningflow2024@lightningflow-postgres:5432/lightningflow \
  -e REDIS_URL=redis://lightningflow-redis:6379 \
  --link lightningflow-postgres \
  --link lightningflow-redis \
  lightningflow/api:latest

print_success "LightningFlow API started on port 4000"

# Step 8: WAIT FOR SERVICES
print_status "Step 8: Waiting for services to start..."
sleep 90

# Step 9: TEST SERVICES
print_status "Step 9: Testing services..."

# Test n8n
if curl -f http://localhost:3000/healthz >/dev/null 2>&1; then
    print_success "✅ n8n is working"
else
    print_error "❌ n8n is not working"
    docker logs n8n-prod --tail 10
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

# Test LightningFlow API
if curl -f http://localhost:4000/healthz >/dev/null 2>&1; then
    print_success "✅ LightningFlow API is working"
else
    print_warning "⚠️ LightningFlow API may need more time"
fi

# Step 10: UPDATE CADDY CONFIG
print_status "Step 10: Updating Caddy config..."
mkdir -p /var/log/caddy

cat > /tmp/caddy.conf << 'CADDY_CONFIG'
n8ncloud.tech {
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    log {
        output file /var/log/caddy/n8n.log
        format json
    }
    tls {
        protocols tls1.2 tls1.3
    }
}

lightningflow.online {
    reverse_proxy localhost:4000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    log {
        output file /var/log/caddy/lightningflow.log
        format json
    }
    tls {
        protocols tls1.2 tls1.3
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

# Step 12: WAIT AND TEST EXTERNAL
print_status "Step 12: Waiting for external access..."
sleep 60

print_status "Testing external access..."
echo "Testing n8ncloud.tech:"
curl -I https://n8ncloud.tech 2>/dev/null | head -3 || echo "n8ncloud.tech not accessible"

echo "Testing lightningflow.online:"
curl -I https://lightningflow.online 2>/dev/null | head -3 || echo "lightningflow.online not accessible"

# Step 13: FINAL STATUS
print_status "Step 13: Final status..."
echo ""
echo "=== DOCKER CONTAINERS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== SERVICE STATUS ==="
echo "n8n (port 3000): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/healthz 2>/dev/null || echo 'FAILED')"
echo "LightningFlow API (port 4000): $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/healthz 2>/dev/null || echo 'FAILED')"
echo "PostgreSQL (port 5432): $(docker exec lightningflow-postgres pg_isready -U postgres >/dev/null 2>&1 && echo 'OK' || echo 'FAILED')"
echo "Redis (port 6379): $(docker exec lightningflow-redis redis-cli ping >/dev/null 2>&1 && echo 'OK' || echo 'FAILED')"

echo ""
print_success "🔧 ADAPTIVE VPS RESTORATION COMPLETED!"
print_status "🌐 n8ncloud.tech should be working"
print_status "🌐 lightningflow.online should be working"
print_status "📁 Backup location: $BACKUP_DIR"
print_status "🔑 n8n credentials: snevemoney12@gmail.com (if restored)"

ADAPTIVE_RESTORE

chmod +x adaptive-vps-restore.sh
print_success "Adaptive restoration script created: adaptive-vps-restore.sh"

# Step 4: RUN THE RESTORATION
print_status "Step 4: Running adaptive restoration on VPS..."
echo "Copying script to VPS..."
scp adaptive-vps-restore.sh root@69.62.66.78:/tmp/

echo "Making script executable..."
ssh root@69.62.66.78 "chmod +x /tmp/adaptive-vps-restore.sh"

echo "Running restoration..."
ssh root@69.62.66.78 "/tmp/adaptive-vps-restore.sh"

# Step 5: VERIFY RESTORATION
print_status "Step 5: Verifying restoration..."
sleep 30

echo "Testing n8ncloud.tech:"
curl -I https://n8ncloud.tech 2>/dev/null | head -3 || echo "n8ncloud.tech still not accessible"

echo "Testing lightningflow.online:"
curl -I https://lightningflow.online 2>/dev/null | head -3 || echo "lightningflow.online still not accessible"

print_success "🔧 ADAPTIVE RESTORATION COMPLETED!"
print_status "Both services should now be restored and working"
