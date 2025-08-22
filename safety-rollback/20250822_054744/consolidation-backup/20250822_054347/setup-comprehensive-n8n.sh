#!/bin/bash

echo "🚀 Setting up Comprehensive n8n MCP Server with 39 Tools"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Start n8n with Docker Compose
echo "📦 Starting n8n with Docker Compose..."
docker-compose up -d

# Wait for n8n to be ready
echo "⏳ Waiting for n8n to be ready..."
sleep 10

# Check if n8n is running
if curl -s http://localhost:5678 >/dev/null; then
  echo "✅ n8n is running at http://localhost:5678"
  echo "🔑 Login with: admin / yourStrongPassword123"
else
  echo "❌ n8n is not responding. Check Docker logs with: docker-compose logs n8n"
  exit 1
fi

# Install dependencies if needed
echo "📚 Installing MCP dependencies..."
npm install

# Make the MCP server executable
chmod +x tools/mcp-servers/comprehensive-n8n-server.mjs

echo ""
echo "🎯 Your Comprehensive n8n MCP Server is ready!"
echo ""
echo "📋 What you now have:"
echo "   • 39 comprehensive n8n tools"
echo "   • Local n8n instance running on port 5678"
echo "   • MCP server configured in Cursor"
echo ""
echo "🔧 To use in Cursor:"
echo "   1. Restart Cursor to load the new MCP configuration"
echo "   2. The 'comprehensive-n8n' server will appear in MCP Tools"
echo "   3. All 39 tools will be available for workflow automation"
echo ""
echo "🌐 Access n8n at: http://localhost:5678"
echo "🔑 Username: admin"
echo "🔑 Password: yourStrongPassword123"
echo ""
echo "📚 Available Tools:"
echo "   • 8 Workflow Management tools"
echo "   • 6 Node Management tools"
echo "   • 4 Connection Management tools"
echo "   • 8 Credential Management tools"
echo "   • 6 Execution Management tools"
echo "   • 4 Webhook Management tools"
echo "   • 3 Validation tools"
echo ""
echo "🚀 You're all set! Start building amazing n8n workflows!"
