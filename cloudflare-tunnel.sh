#!/bin/bash
#
# Cloudflare Tunnel Setup for Scorpion
# Exposes local Scorpion to the internet securely
#

echo "🦂 Setting up Cloudflare Tunnel for Scorpion..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📥 Installing cloudflared..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflared
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    else
        echo "❌ Unsupported OS. Please install cloudflared manually from:"
        echo "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
fi

echo "✅ cloudflared installed"

# Check if Scorpion is running
if ! curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo "⚠️  Scorpion doesn't appear to be running on port 3003"
    echo "   Please start Scorpion first: cd apps/scorpion && pnpm dev"
    exit 1
fi

echo "✅ Scorpion is running on localhost:3003"

# Start tunnel
echo ""
echo "🌐 Starting tunnel..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your Scorpion API will be accessible at the URL shown below."
echo "Use this URL in your n8n workflows:"
echo ""
echo "  POST https://your-tunnel-url.trycloudflare.com/api/n8n/council"
echo "  Headers: X-API-Key: your-api-key-here"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the tunnel"
echo ""

cloudflared tunnel --url http://localhost:3003

