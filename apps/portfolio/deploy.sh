#!/bin/bash
# Portfolio Deployment Script
# This script builds and deploys the portfolio website

set -e

echo "🚀 Starting portfolio deployment..."

# Navigate to portfolio directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the Next.js app
echo "🔨 Building portfolio..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Build failed. .next directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Stop existing portfolio process if running
echo "🛑 Stopping existing portfolio process..."
pm2 stop portfolio 2>/dev/null || true
pm2 delete portfolio 2>/dev/null || true

# Start portfolio with PM2
echo "▶️  Starting portfolio on port 4010..."
pm2 start npm --name "portfolio" -- start

# Save PM2 process list
pm2 save

echo "✅ Portfolio deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update Caddyfile: Add portfolio.n8ncloud.tech → localhost:4010"
echo "   2. Reload Caddy: sudo systemctl reload caddy"
echo "   3. Visit: https://portfolio.n8ncloud.tech"
echo ""
echo "🔍 Check status: pm2 status portfolio"
echo "📊 View logs: pm2 logs portfolio"

