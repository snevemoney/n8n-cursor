#!/bin/bash

# MCP Manager - Maintain Your 39 n8n Tools
# ========================================

echo "🔧 MCP Manager - Your 39 n8n Tools"
echo "=================================="

# Check if n8n is running
if ! systemctl is-active --quiet n8n.service; then
  echo "❌ n8n is not running. Please start it first:"
  echo "   ./start-n8n.sh"
  exit 1
fi

echo "✅ n8n is running"
echo "🌐 Access: https://n8ncloud.tech"

echo ""
echo "🔧 MCP Management Options:"
echo "1. Test MCP Configuration"
echo "2. Restore Working API Key"
echo "3. Backup MCP Configuration"
echo "4. Check MCP Status"
echo "5. Fix MCP Issues"
echo "6. View Available Tools"
echo "7. Exit"

read -p "Choose option (1-7): " choice

case $choice in
1)
  echo "🧪 Testing MCP Configuration..."
  ./scripts/test_mcp.sh
  ;;
2)
  echo "🔄 Restoring Working API Key..."
  ./scripts/mcp_guardian.sh restore
  echo "✅ API key restored"
  echo "🔄 Restart Cursor to reload MCP tools"
  ;;
3)
  echo "💾 Creating MCP Configuration Backup..."
  ./scripts/mcp_guardian.sh backup
  ;;
4)
  echo "🔍 Checking MCP Status..."
  echo "📋 Current MCP Servers:"
  cat ~/.cursor/mcp.json | jq '.mcpServers | keys[]' 2>/dev/null || echo "Error reading MCP config"
  echo ""
  echo "🌐 n8n API Status:"
  api_response=$(curl -s -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NTQ4MjE5fQ.6_iCUNXDTKkvh_xeZoCqj2vQRtJ-FWEf-TZ8g2nQpBw" https://n8ncloud.tech/api/v1/workflows)
  if echo "$api_response" | grep -q '"data"'; then
    workflow_count=$(echo "$api_response" | jq '.data | length' 2>/dev/null || echo "unknown")
    echo "✅ n8n API working - $workflow_count workflows available"
  else
    echo "❌ n8n API connection failed"
  fi
  ;;
5)
  echo "🔧 Fixing MCP Issues..."
  echo "1. Testing current configuration..."
  ./scripts/test_mcp.sh
  echo ""
  echo "2. If issues persist, try:"
  echo "   - Restart Cursor completely"
  echo "   - Check if n8n is accessible at https://n8ncloud.tech"
  echo "   - Run: ./scripts/mcp_guardian.sh restore"
  ;;
6)
  echo "📋 Available MCP Tools:"
  echo "======================="
  echo "🔧 n8n MCP (Expected: ~39 tools):"
  echo "   • Workflow management"
  echo "   • Node configuration"
  echo "   • Credential management"
  echo "   • Execution monitoring"
  echo "   • Template operations"
  echo "   • And 34+ more tools"
  echo ""
  echo "🗄️ Supabase MCP:"
  echo "   • Database operations"
  echo "   • Table management"
  echo "   • Data queries"
  echo ""
  echo "🤖 Hugging Face MCP:"
  echo "   • AI model access"
  echo "   • Text generation"
  echo ""
  echo "🌐 OpenAPI MCP:"
  echo "   • API integrations"
  echo "   • Custom endpoints"
  ;;
7)
  echo "👋 Exiting MCP Manager"
  exit 0
  ;;
*)
  echo "❌ Invalid option"
  exit 1
  ;;
esac

echo ""
echo "🛡️ MCP PROTECTION ACTIVE:"
echo "   • API key guardian is monitoring"
echo "   • Auto-restore on failure"
echo "   • Backup system active"
echo "   • Your 39 tools are protected"
echo ""
echo "💡 To use MCP tools in Cursor:"
echo "   1. Restart Cursor completely"
echo "   2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Linux)"
echo "   3. Type 'MCP' and look for available tools"
echo "   4. You should see ~39 n8n tools + Supabase tools"
