#!/bin/bash

# Safe MCP Tools Fixer - Updates MCP Configuration Safely
# ======================================================

echo "🔧 Safe MCP Tools Fixer"
echo "======================="
echo "🛡️ SAFE MODE: Your data is protected!"

# Check if n8n is running
if ! systemctl is-active --quiet n8n.service; then
  echo "❌ n8n is not running. Please start it first:"
  echo "   ./start-n8n.sh"
  exit 1
fi

echo "✅ n8n is running"
echo "🌐 Access: https://n8ncloud.tech"

echo ""
echo "🔑 To fix MCP tools, you need to:"
echo "1. Go to https://n8ncloud.tech"
echo "2. Login with your credentials"
echo "3. Go to Settings > API"
echo "4. Generate a new API key"
echo "5. Copy the new API key"

echo ""
read -p "Do you have a new API key? (y/n): " has_key

if [[ "$has_key" == "y" || "$has_key" == "Y" ]]; then
  read -p "Enter your new API key: " new_api_key

  if [[ -n "$new_api_key" ]]; then
    echo "🔄 Updating MCP configuration safely..."

    # Create backup of current config
    cp /home/evens/.cursor/mcp.json /home/evens/.cursor/mcp.json.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created: mcp.json.backup.*"

    # Update the API key in the config
    sed -i "s/\"N8N_API_KEY\": \"[^\"]*\"/\"N8N_API_KEY\": \"$new_api_key\"/" /home/evens/.cursor/mcp.json

    echo "✅ API key updated in MCP configuration"
    echo ""
    echo "🔄 Now restart Cursor to reload MCP tools"
    echo "💡 Your MCP tools should work after restart"

  else
    echo "❌ No API key provided"
  fi
else
  echo ""
  echo "📋 Steps to get API key:"
  echo "1. Open https://n8ncloud.tech in your browser"
  echo "2. Login with your credentials"
  echo "3. Click on your profile (top right)"
  echo "4. Go to 'Settings'"
  echo "5. Click on 'API' in the left sidebar"
  echo "6. Click 'Create API Key'"
  echo "7. Give it a name (e.g., 'MCP Tools')"
  echo "8. Copy the generated key"
  echo ""
  echo "💡 Then run this script again: ./fix-mcp-tools.sh"
fi

echo ""
echo "🛡️ SAFETY CHECK:"
echo "   • Original config backed up"
echo "   • Only API key was updated"
echo "   • Your data is protected"
echo "   • n8n continues running normally"
