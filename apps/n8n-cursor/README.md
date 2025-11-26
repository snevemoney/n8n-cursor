# 🛠️ n8n-cursor Development Workbench

**Development App** - Tools, scripts, and utilities for n8n workflow management and development automation.

## 🎯 Purpose

n8n-cursor provides development tools for:
- 📊 n8n workflow management and synchronization
- 🔧 Development automation scripts
- 🤖 MCP (Model Context Protocol) server
- 📝 Code generation and refactoring tools
- 🧪 Testing and validation utilities

## 🏗️ Architecture

- **Scripts**: Shell scripts for automation and maintenance
- **Tools**: Node.js utilities for workflow processing
- **MCP Server**: Model Context Protocol server for AI integration
- **Workflows**: n8n workflow definitions and templates
- **AI Prompts**: System prompts and development guides

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your n8n credentials

# Start MCP server (optional)
cd mcp-server && npm start
```

## 📁 Structure

```
apps/n8n-cursor/
├── scripts/              # Shell scripts and automation
│   ├── legacy/           # Legacy scripts (for cleanup)
│   └── duplicates/       # Duplicate scripts found
├── tools/                # Node.js utilities
├── mcp-server/           # MCP server for AI integration
├── workflows/            # n8n workflow definitions
│   ├── raw/              # Exported workflows
│   └── normalized/       # Cleaned workflows
├── ai/                   # AI prompts and guides
├── visualizations/       # Workflow diagrams and charts
└── README.md             # This file
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):
- `N8N_BASE_URL` - n8n instance URL
- `N8N_EMAIL` - n8n admin email
- `N8N_PASSWORD` - n8n admin password
- `MCP_SERVER_URL` - MCP server URL (optional)

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run specific test
pnpm test -- --grep "test name"

# Validate structure
node ../../tooling/scripts/verify-structure.mjs
```

## 🔧 Available Scripts

### Workflow Management
- `export-all-workflows.sh` - Export all workflows from n8n
- `import-workflows.sh` - Import workflows to n8n
- `fix-workflow-expressions.sh` - Fix broken workflow expressions

### Development Tools
- `consolidate.sh` - Deduplicate and standardize scripts
- `setup-mcp-integration.sh` - Configure MCP server
- `test-system.sh` - Run comprehensive system tests

### Maintenance
- `cleanup-unnecessary.sh` - Remove unnecessary files
- `remove-duplicates.sh` - Remove duplicate workflows
- `safe-cleanup.sh` - Safe cleanup with confirmation

## 🚫 Boundaries

**DO NOT** import from:
- `apps/lightningflow/*` (product code)
- Any other app directories

**ONLY** import from:
- `packages/shared-*` (shared utilities)
- Same app directory (`./`, `../`)

## 📊 MCP Server

The MCP server provides AI tools for:
- Workflow analysis and optimization
- Code generation and refactoring
- System monitoring and diagnostics
- Development automation

### Start MCP Server
```bash
cd mcp-server
npm start
```

### Configure Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "n8n-cursor": {
      "command": "node",
      "args": ["/path/to/apps/n8n-cursor/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

## 🔗 Dependencies

- **Shared packages**: `@shared/types`, `@shared/helpers`
- **External**: n8n API, OpenAI API (for AI tools)
- **Framework**: Node.js, TypeScript

## 📝 Development Guidelines

### Script Standards
- Use kebab-case for filenames
- Add `.sh` extension for shell scripts
- Include error handling and logging
- Document purpose and usage

### Workflow Management
- Store workflows in `workflows/raw/`
- Normalize workflows before committing
- Include metadata (version, owner, description)
- Test workflows before deployment

### Code Quality
- Follow TypeScript strict mode
- Add tests for critical functionality
- Use shared packages for common code
- Maintain clear separation from product code

## 🚀 Quick Commands

```bash
# Run consolidation
make consolidate

# Check structure
node ../../tooling/scripts/verify-structure.mjs

# Start MCP server
cd mcp-server && npm start

# Export workflows
./scripts/export-all-workflows.sh
```
