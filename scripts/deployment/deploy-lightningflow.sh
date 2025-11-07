#!/bin/bash
# LightningFlow Production Deployment - Run this on your VPS
# Copy this entire script and paste it into your remote Cursor terminal

echo "🚀 Deploying LightningFlow to Production..."

# Update system
apt-get update -y && apt-get upgrade -y

# Install required packages
apt-get install -y curl wget git jq gettext-base software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose
if ! docker compose version >/dev/null 2>&1; then
    apt-get install -y docker-compose-plugin
fi

# Install Caddy
if ! command -v caddy >/dev/null 2>&1; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y && apt-get install -y caddy
fi

# Create production directories
mkdir -p /opt/lightningflow/{n8n,dozzle,code-server}
mkdir -p /var/www/lightningflow

# Create beautiful landing page
cat > /var/www/lightningflow/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LightningFlow Online</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .container { text-align: center; max-width: 600px; }
        h1 { font-size: 3rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        p { font-size: 1.2rem; margin-bottom: 15px; opacity: 0.9; }
        .services { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-top: 40px; 
        }
        .service { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 10px; 
            backdrop-filter: blur(10px); 
            transition: transform 0.2s;
        }
        .service:hover { transform: translateY(-5px); }
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

# Create Docker Compose file
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

# Create Caddyfile
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

n8ncloud.tech {
    encode gzip
    reverse_proxy localhost:5679 {
        flush_interval -1
    }
}
EOF

# Start all services
cd /opt/lightningflow
docker compose -f docker-compose.prod.yml up -d

# Restart Caddy
systemctl restart caddy

# Test endpoints
echo "🧪 Testing endpoints..."
curl -I http://localhost:5678 || echo "API endpoint not responding"
curl -I http://localhost:5679 || echo "n8n endpoint not responding"
curl -I http://localhost:9001 || echo "Logs endpoint not responding"
curl -I http://localhost:8443 || echo "IDE endpoint not responding"

echo "🎉 LightningFlow deployment completed!"
echo "Your services are now available at:"
echo "• Main site: https://lightningflow.online"
echo "• n8n: https://n8ncloud.tech"
echo "• API: https://lightningflow.online/api"
echo "• Logs: https://lightningflow.online/logs"
echo "• IDE: https://lightningflow.online/ide"
