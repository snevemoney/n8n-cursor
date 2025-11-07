#!/usr/bin/env bash
set -euo pipefail

echo "🚀 LightningFlow Production Deployment Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y curl wget git jq gettext-base software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker if not present
if ! command -v docker >/dev/null 2>&1; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    print_status "Docker already installed"
fi

# Install Docker Compose if not present
if ! docker compose version >/dev/null 2>&1; then
    print_status "Installing Docker Compose..."
    apt-get install -y docker-compose-plugin
else
    print_status "Docker Compose already installed"
fi

# Install Caddy
print_status "Installing Caddy..."
if ! command -v caddy >/dev/null 2>&1; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y
    apt-get install -y caddy
else
    print_status "Caddy already installed, updating..."
    apt-get update -y && apt-get install -y caddy
fi

# Configure firewall
print_status "Configuring firewall..."
if command -v ufw >/dev/null 2>&1; then
    ufw allow 22/tcp || true
    ufw allow 80/tcp || true
    ufw allow 443/tcp || true
    print_success "Firewall configured"
fi

# Create production directories
print_status "Creating production directories..."
mkdir -p /opt/lightningflow/{n8n,dozzle,code-server}
mkdir -p /var/www/lightningflow

# Create placeholder index.html
cat > /var/www/lightningflow/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightningFlow Online</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { text-align: center; max-width: 600px; }
        h1 { font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        p { font-size: 1.2rem; margin-bottom: 15px; opacity: 0.9; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
        .service { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px); }
        .service h3 { margin: 0 0 10px 0; }
        .service a { color: white; text-decoration: none; }
        .service a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚡ LightningFlow</h1>
        <p>Your AI-powered workflow automation platform is online!</p>
        
        <div class="services">
            <div class="service">
                <h3>🚀 API</h3>
                <a href="/api">API Service</a>
            </div>
            <div class="service">
                <h3>📊 Logs</h3>
                <a href="/logs">Docker Logs</a>
            </div>
            <div class="service">
                <h3>💻 IDE</h3>
                <a href="/ide">Web IDE</a>
            </div>
        </div>
        
        <p style="margin-top: 40px; opacity: 0.7;">
            n8n workflows: <a href="https://n8ncloud.tech" style="color: white;">n8ncloud.tech</a>
        </p>
    </div>
</body>
</html>
EOF

# Create production environment file
print_status "Creating production environment file..."
cat > /opt/lightningflow/.env.production << 'EOF'
# ── Cloudflare ───────────────────────────────────────────
CF_API_TOKEN=PASTE_YOUR_CLOUDFLARE_API_TOKEN_HERE
CF_ZONE_NAME=lightningflow.online
CF_PROXIED=true

# ── VPS / network ────────────────────────────────────────
VPS_PUBLIC_IP=69.62.66.78

# ── Caddy upstreams (all must listen on localhost only) ─
API_UPSTREAM=localhost:5678
LOGS_UPSTREAM=localhost:9001
IDE_UPSTREAM=localhost:8443

# ── Docker persistent dirs ────────────────────────────────
PROD_DATA_ROOT=/opt/lightningflow
N8N_DATA=${PROD_DATA_ROOT}/n8n
DOZZLE_DATA=${PROD_DATA_ROOT}/dozzle
CODE_SERVER_DATA=${PROD_DATA_ROOT}/code-server

# ── Secrets ──────────────────────────────────────────────
CODE_SERVER_PASSWORD=lightningflow2024
EOF

# Create Caddyfile
print_status "Creating Caddyfile..."
cat > /etc/caddy/Caddyfile << 'EOF'
lightningflow.online {
    encode gzip
    root * /var/www/lightningflow
    file_server

    handle_path /api/* {
        reverse_proxy localhost:5678
    }
    handle_path /logs/* {
        reverse_proxy localhost:9001
    }
    handle_path /ide/* {
        reverse_proxy localhost:8443
    }
}

www.lightningflow.online {
    redir https://lightningflow.online{uri}
}

# n8n (production)
n8ncloud.tech {
    encode gzip
    reverse_proxy localhost:5679 {
        flush_interval -1
    }
}
EOF

# Create Docker Compose file
print_status "Creating Docker Compose file..."
cat > /opt/lightningflow/docker-compose.prod.yml << 'EOF'
version: "3.9"

services:
  api:
    image: nginx:alpine
    restart: unless-stopped
    networks: [internal]
    ports:
      - "127.0.0.1:5678:80"
    volumes:
      - /var/www/lightningflow:/usr/share/nginx/html:ro
    command: ["nginx", "-g", "daemon off;"]

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    networks: [internal]
    environment:
      - N8N_HOST=n8ncloud.tech
      - N8N_PORT=5679
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8ncloud.tech/
      - N8N_EDITOR_BASE_URL=https://n8ncloud.tech
      - N8N_PUBLIC_URL=https://n8ncloud.tech
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=lightningflow2024
    ports:
      - "127.0.0.1:5679:5679"
    volumes:
      - /opt/lightningflow/n8n:/home/node/.n8n

  dozzle:
    image: amir20/dozzle:latest
    restart: unless-stopped
    networks: [internal]
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "127.0.0.1:9001:8080"

  code_server:
    image: lscr.io/linuxserver/code-server:latest
    restart: unless-stopped
    networks: [internal]
    environment:
      - PASSWORD=lightningflow2024
      - SUDO_PASSWORD=lightningflow2024
    volumes:
      - /opt/lightningflow/code-server:/config
    ports:
      - "127.0.0.1:8443:8443"

networks:
  internal:
    driver: bridge
EOF

# Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/lf-prod.service << 'EOF'
[Unit]
Description=LightningFlow Production Stack
After=network-online.target docker.service
Wants=network-online.target docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lightningflow
Environment=ENV_FILE=/opt/lightningflow/.env.production
ExecStart=/usr/bin/env bash -c 'docker compose -f docker-compose.prod.yml up -d'
ExecStop=/usr/bin/env bash -c 'docker compose -f docker-compose.prod.yml down'
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Start services
print_status "Starting production services..."
cd /opt/lightningflow
docker compose -f docker-compose.prod.yml up -d

# Enable and start systemd service
print_status "Configuring systemd service..."
systemctl daemon-reload
systemctl enable lf-prod.service
systemctl restart lf-prod.service

# Restart Caddy
print_status "Restarting Caddy..."
systemctl restart caddy

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Health check
print_status "Performing health checks..."
echo "🔍 Checking service status..."

# Check Docker containers
if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "Up"; then
    print_success "Docker services are running"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    print_error "Some Docker services failed to start"
    docker ps -a
fi

# Check Caddy
if systemctl is-active --quiet caddy; then
    print_success "Caddy is running"
else
    print_error "Caddy failed to start"
    systemctl status caddy
fi

# Test endpoints
print_status "Testing endpoints..."
echo "Testing localhost endpoints..."

# Test API endpoint
if curl -s http://localhost:5678 >/dev/null; then
    print_success "API endpoint (localhost:5678) is responding"
else
    print_warning "API endpoint (localhost:5678) is not responding"
fi

# Test n8n endpoint
if curl -s http://localhost:5679 >/dev/null; then
    print_success "n8n endpoint (localhost:5679) is responding"
else
    print_warning "n8n endpoint (localhost:5679) is not responding"
fi

# Test logs endpoint
if curl -s http://localhost:9001 >/dev/null; then
    print_success "Logs endpoint (localhost:9001) is responding"
else
    print_warning "Logs endpoint (localhost:9001) is not responding"
fi

# Test IDE endpoint
if curl -s http://localhost:8443 >/dev/null; then
    print_success "IDE endpoint (localhost:8443) is responding"
else
    print_warning "IDE endpoint (localhost:8443) is not responding"
fi

print_success "Production deployment completed!"
echo ""
echo "🌐 Your services are now available at:"
echo "   • Main site: https://lightningflow.online"
echo "   • API: https://lightningflow.online/api"
echo "   • Logs: https://lightningflow.online/logs"
echo "   • IDE: https://lightningflow.online/ide"
echo "   • n8n: https://n8ncloud.tech"
echo ""
echo "🔑 Default credentials:"
echo "   • n8n: admin / lightningflow2024"
echo "   • Code Server: lightningflow2024"
echo ""
echo "⚠️  IMPORTANT: Update the Cloudflare API token in /opt/lightningflow/.env.production"
echo "   Then run: bash /opt/lightningflow/sync-dns.sh"
echo ""
echo "📊 Check status: systemctl status lf-prod.service"
echo "📋 View logs: journalctl -u lf-prod.service -f"
