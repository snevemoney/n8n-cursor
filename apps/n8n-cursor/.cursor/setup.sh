#!/bin/bash

# Background Agent Interactive Setup Script
# This script installs all dependencies needed for n8n workflow development

set -e

echo "🚀 Setting up n8n development environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update

# Install Node.js 20 (if not already installed)
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | cut -d'v' -f2) -lt 20 ]]; then
    echo "📥 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install system dependencies for headless Chrome/Puppeteer
echo "🖥️  Installing headless Chrome dependencies..."
sudo apt-get install -y --no-install-recommends \
    libnss3 libxss1 libxcomposite1 libxrandr2 libxdamage1 libasound2 \
    libgbm1 ca-certificates fonts-liberation libatk1.0-0 libgtk-3-0

# Install global npm packages
echo "🔧 Installing global npm tools..."
sudo npm install -g @mermaid-js/mermaid-cli puppeteer@22

# Navigate to workspace
cd /workspace

# Create .env file from template if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp environment.template .env
    echo "⚠️  Please edit .env file with your actual credentials!"
fi

# Install project dependencies
echo "📋 Installing project dependencies..."
npm ci || npm i

# Set Puppeteer environment variables
echo "🌐 Setting Puppeteer environment variables..."
export PUPPETEER_DISABLE_DEV_SHM_USAGE=true
export PUPPETEER_NO_SANDBOX=true
export NODE_ENV=production

# Add environment variables to bashrc for persistence
echo "export PUPPETEER_DISABLE_DEV_SHM_USAGE=true" >> ~/.bashrc
echo "export PUPPETEER_NO_SANDBOX=true" >> ~/.bashrc
echo "export NODE_ENV=production" >> ~/.bashrc

# Source environment variables if .env exists
if [ -f ".env" ]; then
    echo "🔧 Loading environment variables..."
    set -a
    source .env
    set +a
fi

# Test installations
echo "🧪 Testing installations..."
node --version
npm --version
mmdc --version || echo "⚠️  mermaid-cli may need manual installation"

echo ""
echo "✅ Setup complete! Ready for n8n development."
echo ""
echo "🎯 Available commands:"
echo "  npm run gen          - Generate diagrams and export to SVG"
echo "  npm run capture      - Take n8n workflow screenshots" 
echo "  npm run refresh      - Full regeneration + screenshots"
echo "  npm run watch        - Watch for changes"
echo "  npm run spec:validate - Validate YAML specifications"
echo "  npm run spec:build   - Build workflows from specs"
echo ""
echo "🔐 Environment setup:"
echo "  1. Edit .env file with your credentials"
echo "  2. Or set secrets in Cursor Background Agent:"
echo "     - N8N_BASE_URL=https://evenslouis.ca/n8n"
echo "     - N8N_EMAIL=your-email@example.com"
echo "     - N8N_PASSWORD=your-password"
echo ""
echo "🚀 Quick start:"
echo "  npm run refresh  # Generate all diagrams and screenshots"
