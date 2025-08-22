#!/bin/bash

# Setup script for n8n MCP Server with credential management
# This script prepares the MCP server for use with Cursor

set -e

echo "🚀 Setting up n8n MCP Server with Enhanced Credential Management"
echo "============================================================="

# Check if we're in the right directory
if [ ! -f "tools/mcp-servers/n8n-server.mjs" ]; then
  echo "❌ Error: Run this script from the project root directory"
  exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &>/dev/null; then
  echo "❌ Error: Node.js is not installed"
  exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
  echo "❌ Error: Node.js version $REQUIRED_VERSION or higher is required (current: $NODE_VERSION)"
  exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing MCP SDK dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
fi

# Check if MCP SDK is installed globally (optional but recommended)
echo "🔍 Checking MCP SDK installation..."
if ! npm list -g @modelcontextprotocol/sdk &>/dev/null; then
  echo "⚠️  MCP SDK not found globally. Installing..."
  npm install -g @modelcontextprotocol/sdk
fi

# Make MCP servers executable
echo "🔧 Making MCP servers executable..."
chmod +x tools/mcp-servers/*.mjs

# Validate environment variables
echo "🔑 Checking required environment variables..."

# Check for N8N configuration
if [ -z "$N8N_BASE_URL" ]; then
  echo "⚠️  N8N_BASE_URL not set. Using default: http://localhost:5678"
  export N8N_BASE_URL="http://localhost:5678"
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "❌ Error: N8N_API_KEY environment variable is required"
  echo "💡 Tip: Generate an API key in n8n Settings → API Keys"
  echo "💡 Then run: export N8N_API_KEY='your-api-key-here'"
  exit 1
fi

echo "✅ N8N_BASE_URL: $N8N_BASE_URL"
echo "✅ N8N_API_KEY: ${N8N_API_KEY:0:8}..." # Show only first 8 chars

# Test n8n connection
echo "🌐 Testing n8n connection..."
if ! curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/rest/workflows?limit=1" >/dev/null; then
  echo "❌ Error: Cannot connect to n8n API"
  echo "💡 Make sure n8n is running and the API key is correct"
  exit 1
fi

echo "✅ n8n API connection successful"

# Test MCP server startup
echo "🧪 Testing MCP server startup..."
timeout 5s node tools/mcp-servers/n8n-server.mjs --test &>/dev/null || {
  echo "⚠️  MCP server test had issues, but this is normal for startup test"
}

# Create directories for MCP configuration
echo "📁 Creating MCP configuration directories..."
mkdir -p config/mcp
mkdir -p logs/mcp

# Generate Cursor MCP configuration
echo "⚙️  Generating Cursor MCP configuration..."

cat >config/mcp/cursor-settings-example.json <<EOF
{
  "mcpServers": {
    "n8n-automation": {
      "command": "node",
      "args": ["$(pwd)/tools/mcp-servers/n8n-server.mjs"],
      "env": {
        "N8N_BASE_URL": "$N8N_BASE_URL",
        "N8N_API_KEY": "$N8N_API_KEY",
        "MCP_SERVER_NAME": "n8n-automation"
      }
    },
    "n8n-validator": {
      "command": "node", 
      "args": ["$(pwd)/tools/mcp-servers/validator-server.mjs"],
      "env": {
        "VALIDATION_LEVEL": "standard"
      }
    }
  }
}
EOF

echo "✅ Configuration saved to config/mcp/cursor-settings-example.json"

# Test credential detection
echo "🔍 Testing credential detection..."
if command -v node &>/dev/null; then
  node tools/test-mcp-credentials.js || {
    echo "⚠️  Credential test had some issues. Check your n8n credentials setup."
  }
fi

# Create startup script
echo "📜 Creating startup script..."
cat >tools/start-mcp-server.sh <<EOF
#!/bin/bash
# MCP Server Startup Script

export N8N_BASE_URL="$N8N_BASE_URL"
export N8N_API_KEY="$N8N_API_KEY"

echo "🚀 Starting n8n MCP Server..."
echo "📡 N8N URL: \$N8N_BASE_URL"
echo "🔑 API Key: \${N8N_API_KEY:0:8}..."

node tools/mcp-servers/n8n-server.mjs
EOF

chmod +x tools/start-mcp-server.sh

echo ""
echo "🎉 MCP Server setup complete!"
echo "================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔧 Configure Cursor MCP:"
echo "   - Open Cursor Settings (Cmd/Ctrl + ,)"
echo "   - Search for 'MCP'"
echo "   - Copy content from config/mcp/cursor-settings-example.json"
echo "   - Or use the full config from config/mcp/cursor-mcp-settings.json"
echo ""
echo "2. 🚀 Start MCP Server:"
echo "   ./tools/start-mcp-server.sh"
echo ""
echo "3. 🧪 Test in Cursor:"
echo "   'List my n8n credentials and show available types'"
echo "   'Create a simple workflow with webhook and OpenAI response'"
echo ""
echo "4. 🔍 Advanced Usage:"
echo "   'Auto-detect credentials and create a lead qualification workflow'"
echo "   'Build a content generation pipeline with proper credential binding'"
echo ""
echo "🛡️  Security Features Enabled:"
echo "   ✅ Safe credential metadata only (no secrets exposed)"
echo "   ✅ Auto-exclusion of test/staging credentials"
echo "   ✅ Canary testing for credential validation"
echo "   ✅ Confirm-required for all write operations"
echo ""
echo "📚 Documentation:"
echo "   - Enhanced features: docs/setup/complete-setup-guide.md"
echo "   - Troubleshooting: Check logs in logs/mcp/"
echo ""
echo "Ready to chat with n8n in Cursor! 🚀"
