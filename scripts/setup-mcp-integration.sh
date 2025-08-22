#!/bin/bash

echo "🚀 Setting up MCP Integration with n8n..."
echo "=========================================="

# Check if n8n is running
if ! curl -s "https://n8ncloud.tech/api/v1/version" >/dev/null; then
  echo "❌ n8n is not accessible. Please start n8n first."
  exit 1
fi

echo "✅ n8n is accessible"

# Create MCP integration directory
MCP_DIR="/home/evens/n8n-cursor/mcp-integration"
mkdir -p "$MCP_DIR"

echo "📁 Created MCP integration directory: $MCP_DIR"

# Copy MCP server configurations
cp /home/evens/n8n-cursor/tools/mcp-servers/comprehensive-n8n-server.mjs "$MCP_DIR/"
cp /home/evens/.cursor/mcp.json "$MCP_DIR/cursor-mcp-backup.json"

echo "📋 Copied MCP server configurations"

# Create n8n MCP client configuration
cat >"$MCP_DIR/n8n-mcp-client.json" <<'EOF'
{
  "mcpClientTool": {
    "servers": {
      "tavily-remote": {
        "command": "npx",
        "args": ["-y", "mcp-remote", "https://mcp.tavily.com/mcp/?tavilyApiKey=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"],
        "description": "Tavily AI web search and extraction tools"
      },
      "n8n-automation": {
        "command": "node",
        "args": ["/home/evens/n8n-cursor/tools/mcp-servers/comprehensive-n8n-server.mjs"],
        "env": {
          "N8N_BASE_URL": "https://n8ncloud.tech",
          "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NjQxNzY0fQ.i23-xVHsClrhfdHisuZnB7YTHYoYkowveDEt9xC_dPU"
        },
        "description": "n8n automation and workflow management tools"
      }
    }
  }
}
EOF

echo "📝 Created n8n MCP client configuration"

# Create integration guide
cat >"$MCP_DIR/INTEGRATION_GUIDE.md" <<'EOF'
# MCP Integration Guide for n8n

## 🎯 What This Setup Provides

### 1. Tavily MCP Server
- **tavily-search**: Real-time web search
- **tavily-extract**: Extract data from web pages
- **tavily-map**: Create website structure maps
- **tavily-crawl**: Systematic website exploration

### 2. n8n Automation MCP Server
- **39 tools** for workflow management
- **Workflow operations**: create, update, delete, activate
- **Execution management**: list, retry, stop, trigger
- **Credential management**: list, create, update, delete
- **Node operations**: validate, test, list

## 🔧 How to Use in Your Workflow

### Step 1: Configure MCP Client Tool
1. In your n8n workflow, select the "MCP Client Tool" node
2. Choose the server: `tavily-remote` or `n8n-automation`
3. Select the specific tool you want to use
4. Configure the parameters

### Step 2: Example Configurations

#### Tavily Search Example:
```json
{
  "server": "tavily-remote",
  "tool": "tavily-search",
  "parameters": {
    "query": "{{ $json.searchQuery }}",
    "max_results": 5,
    "search_depth": "basic"
  }
}
```

#### n8n Workflow Management Example:
```json
{
  "server": "n8n-automation",
  "tool": "workflows.list",
  "parameters": {
    "limit": 10,
    "active": true
  }
}
```

## 🚀 Benefits

1. **End-to-End Integration**: Connect external AI tools directly to n8n
2. **Real-Time Web Search**: Use Tavily for dynamic content
3. **Automated Workflow Management**: Control n8n programmatically
4. **Scalable Architecture**: Add more MCP servers as needed

## 📁 Files Created

- `n8n-mcp-client.json`: Main configuration for n8n
- `cursor-mcp-backup.json`: Backup of your Cursor MCP settings
- `comprehensive-n8n-server.mjs`: n8n MCP server script

## 🔍 Testing

Test the integration by:
1. Running a simple Tavily search
2. Listing your n8n workflows
3. Creating a test workflow via MCP

## 🆘 Troubleshooting

- Ensure n8n is running and accessible
- Check API keys are valid
- Verify MCP server processes are running
- Check n8n logs for any errors
EOF

echo "📚 Created integration guide: $MCP_DIR/INTEGRATION_GUIDE.md"

echo ""
echo "🎉 MCP Integration Setup Complete!"
echo "=================================="
echo ""
echo "📁 Files created in: $MCP_DIR"
echo "📖 Read the integration guide for next steps"
echo ""
echo "🔧 To use in your workflow:"
echo "   1. Open your n8n workflow"
echo "   2. Configure the 'MCP Client Tool' node"
echo "   3. Select 'tavily-remote' or 'n8n-automation' server"
echo "   4. Choose the specific tool you need"
echo ""
echo "🚀 Your workflow now has access to:"
echo "   • Tavily AI web search and extraction"
echo "   • n8n automation and management tools"
echo "   • End-to-end MCP integration"
