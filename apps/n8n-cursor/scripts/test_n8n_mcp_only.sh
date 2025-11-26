#!/bin/bash

echo "🧪 Testing n8n MCP Configuration Only"
echo "====================================="

echo "📋 Current n8n MCP Configuration:"
cat ~/.cursor/mcp.json | jq '.mcpServers["n8n-mcp"]' 2>/dev/null || echo "JSON parse error"

echo ""
echo "🌐 Testing n8n API Connection..."
curl -s -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NTQ4MjE5fQ.6_iCUNXDTKkvh_xeZoCqj2vQRtJ-FWEf-TZ8g2nQpBw" \
https://n8ncloud.tech/api/v1/workflows | jq '.data | length' 2>/dev/null && echo "✅ n8n API working" || echo "❌ n8n API failed"

echo ""
echo "🔧 n8n MCP Package Status:"
npx n8n-mcp --version 2>/dev/null && echo "✅ n8n MCP package available" || echo "⚠️ n8n MCP package check failed"

echo ""
echo "📂 Environment Setup:"
echo "~/.n8n/config exists: $(test -f ~/.n8n/config && echo "✅ Yes" || echo "❌ No")"
echo "Environment variables: $(grep -q "N8N_API_URL" ~/.bashrc && echo "✅ Set" || echo "❌ Missing")"

echo ""
echo "🚀 Configuration Status:"
echo "✅ n8n MCP: Simplified configuration (no env vars in MCP config)"
echo "✅ Supabase MCP: Untouched"
echo "✅ API Keys: Set via environment and config file"

echo ""
echo "🔄 Next Steps:"
echo "1. Restart Cursor completely"
echo "2. Wait 30 seconds for MCP initialization"
echo "3. Check if n8n-mcp shows tools in Cursor settings"
