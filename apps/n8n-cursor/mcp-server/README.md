# n8n MCP Server

This is the Model Context Protocol (MCP) server that allows Cursor to interact with n8n workflows remotely.

## Setup Instructions

### 1. Deploy to Server

Copy this entire `mcp-server/` folder to your n8n server:

```bash
# On your local machine
scp -r -P 22222 mcp-server/ evens@n8ncloud.tech:/home/evens/n8n-mcp/

# SSH to server and install
ssh -p 22222 evens@n8ncloud.tech
cd /home/evens/n8n-mcp
npm install
```

### 2. Get n8n API Key

1. Open your n8n web interface
2. Go to Settings → API
3. Create a new API key
4. Copy the key for use in Cursor configuration

### 3. Configure Cursor MCP

Add this to your Cursor settings (Settings → MCP):

```json
{
  "mcpServers": {
    "n8n": {
      "command": "ssh",
      "args": [
        "-p", "22222",
        "evens@n8ncloud.tech",
        "/home/evens/n8n-mcp/index.js"
      ],
      "env": {
        "N8N_URL": "https://n8ncloud.tech",
        "N8N_API_KEY": "YOUR_N8N_API_KEY_HERE",
        "N8N_WORKDIR": "/home/evens/n8n-cursor"
      },
      "disabled": false
    }
  }
}
```

### 4. Test the Connection

In any Cursor chat, try:

```
Use the n8n tool: n8n_list_workflows
```

## Available Tools

- **n8n_list_workflows** - List all workflows
- **n8n_get_workflow** - Get workflow details by ID
- **n8n_import_json** - Import workflow JSON object
- **n8n_import_file** - Import workflow from file path
- **n8n_compile_spec** - Convert YAML spec to n8n JSON
- **n8n_validate_spec** - Validate YAML workflow spec
- **n8n_explain** - Generate workflow explanation
- **n8n_activate_workflow** - Activate workflow by ID
- **n8n_deactivate_workflow** - Deactivate workflow by ID

## Usage Examples

### Chat → Workflow
1. Describe your workflow to Cursor
2. Cursor generates YAML spec
3. Use `n8n_compile_spec` to create JSON
4. Use `n8n_import_file` to import to n8n

### Explain Existing Workflow
```
Use the n8n tool: n8n_explain { "path": "/home/evens/n8n-cursor/workflows/my-workflow.json" }
```

### Import from Local File
```
Use the n8n tool: n8n_import_file { "path": "/home/evens/n8n-cursor/workflows/new-workflow.json" }
```
