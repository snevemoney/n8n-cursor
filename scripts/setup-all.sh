#!/bin/bash
set -e

echo "🚀 LightningFlow AI - Complete Setup"
echo "===================================="

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Detected macOS - setting up local development"
    
    # Add local domains to /etc/hosts
    echo "📝 Adding local domains to /etc/hosts..."
    if ! grep -q "lightningflow.local" /etc/hosts; then
        echo "127.0.0.1 lightningflow.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 app.lightningflow.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 ops.lightningflow.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 api.lightningflow.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 n8n.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 open-webui.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 anythingllm.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 mail.local" | sudo tee -a /etc/hosts
        echo "127.0.0.1 logs.local" | sudo tee -a /etc/hosts
        echo "✅ Added local domains to /etc/hosts"
    else
        echo "✅ Local domains already in /etc/hosts"
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        echo "Installing pnpm..."
        npm install -g pnpm
        pnpm install
    fi
    
    # Create .env.dev if it doesn't exist
    if [ ! -f ".env.dev" ]; then
        echo "📝 Creating .env.dev from template..."
        cp env.dev.example .env.dev
        echo "⚠️  Please edit .env.dev with your actual values:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE"
        echo "   - LNBITS_API_KEY"
    fi
    
    # Start local development stack
    echo "🐳 Starting local development stack..."
    docker compose -f infra/docker/docker-compose.dev.yml up -d --build
    
    echo ""
    echo "🎉 Local development setup complete!"
    echo ""
    echo "Access your services at:"
    echo "  🌐 Landing:     http://lightningflow.local"
    echo "  📊 Dashboard:   http://app.lightningflow.local"
    echo "  🔧 Ops:         http://ops.lightningflow.local"
    echo "  🔌 API:         http://api.lightningflow.local/healthz"
    echo "  ⚡ n8n:         http://n8n.local"
    echo "  🤖 Open WebUI:  http://open-webui.local"
    echo "  📚 AnythingLLM: http://anythingllm.local"
    echo "  📧 Email:       http://mail.local"
    echo "  📋 Logs:        http://logs.local"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.dev with your actual values"
    echo "2. Restart: docker compose -f infra/docker/docker-compose.dev.yml restart"
    echo "3. Check health: ./scripts/health-check.sh"
    
else
    echo "🖥️  Detected Linux - setting up for VPS deployment"
    
    # Check if we have the required files
    if [ ! -f "infra/docker/docker-compose.prod.yml" ]; then
        echo "❌ Production compose file not found"
        exit 1
    fi
    
    # Create .env.production if it doesn't exist
    if [ ! -f ".env.production" ]; then
        echo "📝 Creating .env.production from template..."
        cp env.dev.example .env.production
        echo "⚠️  Please edit .env.production with your production values"
    fi
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo "🐳 Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "⚠️  Please log out and back in for Docker group changes to take effect"
    fi
    
    # Install Caddy if not present
    if ! command -v caddy &> /dev/null; then
        echo "🌐 Installing Caddy..."
        sudo apt update
        sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
        sudo apt update
        sudo apt install caddy
    fi
    
    echo ""
    echo "🎉 VPS setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.production with your production values"
    echo "2. Configure Caddy: sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile"
    echo "3. Start services: docker compose -f infra/docker/docker-compose.prod.yml up -d"
    echo "4. Reload Caddy: sudo systemctl reload caddy"
    echo "5. Check health: ./scripts/smoke.sh"
fi
