#!/bin/bash
set -e

echo "🏗️  Setting up LightningFlow AI Environments"
echo "============================================"

# Check if we're on the VPS
if [ ! -f "/etc/caddy/Caddyfile" ]; then
    echo "❌ This script should be run on the VPS"
    exit 1
fi

echo "📝 Creating environment files..."

# Create .env.int if it doesn't exist
if [ ! -f ".env.int" ]; then
    echo "Creating .env.int from template..."
    cp env.int.example .env.int
    echo "⚠️  Please edit .env.int with your Integration values"
fi

# Create .env.staging if it doesn't exist
if [ ! -f ".env.staging" ]; then
    echo "Creating .env.staging from template..."
    cp env.staging.example .env.staging
    echo "⚠️  Please edit .env.staging with your Staging values"
fi

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production from template..."
    cp env.production.example .env.production
    echo "⚠️  Please edit .env.production with your Production values"
fi

echo "✅ Environment files created"

echo "🐳 Setting up Docker networks..."
# Create networks for each environment
docker network create lfai_int_private 2>/dev/null || true
docker network create lfai_staging_private 2>/dev/null || true
docker network create lfai_prod_private 2>/dev/null || true

echo "✅ Docker networks created"

echo "🌐 Setting up Caddy configurations..."
# Copy Caddy configurations
sudo cp infra/caddy/Caddyfile.int /etc/caddy/Caddyfile.int
sudo cp infra/caddy/Caddyfile.staging /etc/caddy/Caddyfile.staging
sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile.prod

echo "✅ Caddy configurations ready"

echo "🔧 Setting up systemd services..."
# Create systemd service for each environment
sudo tee /etc/systemd/system/lfai-int.service > /dev/null <<EOF
[Unit]
Description=LightningFlow AI Integration
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker compose -f infra/docker/docker-compose.int.yml up -d
ExecStop=/usr/bin/docker compose -f infra/docker/docker-compose.int.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/lfai-staging.service > /dev/null <<EOF
[Unit]
Description=LightningFlow AI Staging
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker compose -f infra/docker/docker-compose.staging.yml up -d
ExecStop=/usr/bin/docker compose -f infra/docker/docker-compose.staging.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/lfai-prod.service > /dev/null <<EOF
[Unit]
Description=LightningFlow AI Production
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker compose -f infra/docker/docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f infra/docker/docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

echo "✅ Systemd services created"

echo "🔐 Setting up basic auth credentials..."
# Create basic auth credentials for each environment
sudo mkdir -p /etc/caddy/auth

# Integration credentials
echo "admin:\$2a\$14\$example_hash_for_integration" | sudo tee /etc/caddy/auth/int.htpasswd > /dev/null

# Staging credentials  
echo "admin:\$2a\$14\$example_hash_for_staging" | sudo tee /etc/caddy/auth/staging.htpasswd > /dev/null

# Production credentials
echo "admin:\$2a\$14\$example_hash_for_production" | sudo tee /etc/caddy/auth/prod.htpasswd > /dev/null

echo "✅ Basic auth credentials created"

echo ""
echo "🎉 Environment setup complete!"
echo "============================="
echo ""
echo "Next steps:"
echo "1. Edit environment files with your actual values:"
echo "   - .env.int (Integration)"
echo "   - .env.staging (Staging)"
echo "   - .env.production (Production)"
echo ""
echo "2. Update basic auth credentials:"
echo "   - /etc/caddy/auth/int.htpasswd"
echo "   - /etc/caddy/auth/staging.htpasswd"
echo "   - /etc/caddy/auth/prod.htpasswd"
echo ""
echo "3. Configure DNS for your domains:"
echo "   - int.lightningflow.online"
echo "   - staging.lightningflow.online"
echo "   - lightningflow.online"
echo ""
echo "4. Start Integration environment:"
echo "   sudo systemctl start lfai-int"
echo "   sudo cp /etc/caddy/Caddyfile.int /etc/caddy/Caddyfile"
echo "   sudo systemctl reload caddy"
echo ""
echo "5. Test Integration:"
echo "   curl https://int.lightningflow.online/healthz"
