#!/bin/bash
set -e

echo "🚀 Simple Production Deployment"
echo "==============================="

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ You must be on the 'main' branch to deploy to Production"
    echo "Current branch: $current_branch"
    echo "Run: git checkout main"
    exit 1
fi

echo "✅ Branch check passed"

# Build production images (skip linting)
echo "🐳 Building production Docker images..."
docker build -t lfai-landing:prod apps/lightningflow/landing
docker build -t lfai-web:prod apps/lightningflow/web
docker build -t lfai-ops:prod apps/lightningflow/ops
docker build -t lfai-api:prod apps/n8n-cursor/backend

echo "✅ Production images built"

# Check if we're on the VPS
if [ -f "/etc/caddy/Caddyfile" ]; then
    echo "🖥️  Detected VPS environment - deploying to production..."
    
    # Stop any existing services
    echo "🛑 Stopping existing services..."
    docker compose -f infra/docker/docker-compose.prod.yml down 2>/dev/null || true
    
    # Start production stack
    echo "🚀 Starting production stack..."
    docker compose -f infra/docker/docker-compose.prod.yml up -d
    
    # Configure Caddy for production
    echo "🌐 Configuring Caddy for production..."
    sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
    sudo caddy validate --config /etc/caddy/Caddyfile
    sudo systemctl reload caddy
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Run smoke test
    echo "🏥 Running production smoke test..."
    ./scripts/smoke.sh
    
    echo ""
    echo "🎉 Production deployment complete!"
    echo "================================"
    echo ""
    echo "Your local UI is now running at:"
    echo "  🌐 Landing:     https://evenslouis.ca/lightningflow"
    echo "  📊 Dashboard:   https://app.lightningflow.online"
    echo "  🔧 Ops:         https://ops.lightningflow.online"
    echo "  ⚡ n8n:         https://n8ncloud.tech"
    echo ""
    echo "Health check: https://evenslouis.ca/lightningflow/healthz"
    echo ""
    echo "If you need to rollback: ./scripts/rollback-prod.sh"
    
else
    echo "💻 Local environment detected - preparing for VPS deployment..."
    
    # Create production deployment package
    echo "📦 Creating production deployment package..."
    
    # Create deployment directory
    mkdir -p deploy/production
    
    # Copy production files
    cp infra/docker/docker-compose.prod.yml deploy/production/
    cp infra/caddy/Caddyfile.prod deploy/production/
    cp scripts/smoke.sh deploy/production/
    cp scripts/rollback-prod.sh deploy/production/
    
    # Create deployment script
    cat > deploy/production/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying to Production VPS..."
echo "================================="

# Stop existing services
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Configure Caddy
sudo cp Caddyfile.prod /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

# Wait for services
sleep 30

# Run smoke test
./smoke.sh

echo "✅ Production deployment complete!"
EOF
    
    chmod +x deploy/production/deploy.sh
    
    echo ""
    echo "📦 Production deployment package created!"
    echo "======================================"
    echo ""
    echo "Next steps:"
    echo "1. Upload to your VPS:"
    echo "   scp -r deploy/production/* user@your-vps:~/"
    echo ""
    echo "2. SSH to your VPS and run:"
    echo "   cd ~"
    echo "   ./deploy.sh"
    echo ""
    echo "3. Your UI will be available at:"
    echo "   https://evenslouis.ca/lightningflow"
    echo ""
    echo "4. If you need to rollback:"
    echo "   ./rollback-prod.sh"
fi
