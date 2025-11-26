# Cursor MCP Credential Management Guide

## 🎯 Enhanced Auto-Credential Detection & Binding

Your MCP server now has **professional-grade credential management** that automatically detects, matches, and safely binds credentials when building n8n workflows through Cursor chat.

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
# Run the automated setup
npm run mcp:setup

# Test credential detection
npm run mcp:test

# Start MCP server
npm run mcp:start
```

### 2. Configure Cursor
Add this to your Cursor MCP settings:
```json
{
  "mcpServers": {
    "n8n-automation": {
      "command": "node",
      "args": ["/home/evens/n8n-cursor/tools/mcp-servers/n8n-server.mjs"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-n8n-api-key-here"
      }
    }
  }
}
```

### 3. Test in Cursor
```
"List my n8n credentials and create a workflow with automatic credential binding"
```

## 💡 Magic Commands for Cursor

### Credential Discovery
```
"Show me all available credentials and their types"
"Find the best credential for an OpenAI node"
"List credentials excluding staging and test ones"
```

### Smart Workflow Creation
```
"Create a lead generation workflow with OpenAI qualification - auto-detect credentials"
"Build a content creation pipeline with automatic credential binding"
"Make a Supabase + OpenAI workflow with proper authentication"
```

### Advanced Operations
```
"Test my OpenAI credential with a canary workflow"
"Apply my Stripe credential to the payment processing node with confirm:true"
"Show me credential compatibility for HTTP Request nodes"
```

## 🔍 How Auto-Detection Works

### 1. **Smart Discovery**
```javascript
// The MCP server automatically finds credentials
credentials.list() → {
  "credentials": [
    {"id":"12","name":"OpenAI (prod)","type":"openAiApi","nodesAccess":["n8n-nodes-base.openAi"]},
    {"id":"18","name":"Supabase API","type":"httpHeaderAuth","nodesAccess":["n8n-nodes-base.httpRequest"]},
    {"id":"21","name":"PostgreSQL DB","type":"postgres","nodesAccess":["n8n-nodes-base.postgres"]}
  ]
}
```

### 2. **Intelligent Matching**
```javascript
// Auto-match credentials to nodes
credentials.matchForNode({
  nodeType: "n8n-nodes-base.openAi"
}) → {
  "match": {"id":"12","name":"OpenAI (prod)","type":"openAiApi"},
  "matchReason": "exact_node_match"
}

// With service hints
credentials.matchForNode({
  nodeType: "n8n-nodes-base.httpRequest",
  hints: {"service": "supabase"}
}) → {
  "match": {"id":"18","name":"Supabase API","type":"httpHeaderAuth"},
  "matchReason": "service_hint_supabase"
}
```

### 3. **Safe Binding**
```javascript
// Apply credentials without exposing secrets
workflows.applyCredential({
  workflowJson: {...},
  nodeId: "openai-node",
  credentialType: "openAiApi", 
  credentialId: "12",
  confirm: true
})
```

### 4. **Canary Testing**
```javascript
// Test credentials safely before use
credentials.canaryTest({
  credentialId: "12",
  credentialType: "openAiApi"
}) → {
  "success": true,
  "message": "Credential appears to be working"
}
```

## 🛡️ Security Features

### **No Secret Exposure**
- Only returns safe metadata: `id`, `name`, `type`, `nodesAccess`
- **Never** returns actual API keys or passwords
- Credentials applied by reference only

### **Smart Filtering**
- Auto-excludes staging/test credentials
- Patterns: `"test"`, `"staging"`, `"_old"`, `"(do not use)"`
- Override with explicit inclusion if needed

### **Confirmation Required**
- All write operations require `confirm:true`
- Credential binding requires explicit confirmation
- Prevents accidental modifications

### **Canary Testing**
- Safe credential validation before first use
- Creates temporary test workflows
- Auto-cleanup after testing

## 🎯 Workflow Creation Examples

### Example 1: Auto-Detected Lead Generation
```
User: "Create a lead generation workflow with OpenAI qualification"

Cursor + MCP Process:
1. credentials.list → Discover available credentials
2. credentials.matchForNode({nodeType:'n8n-nodes-base.openAi'}) → Find OpenAI credential
3. Build workflow structure
4. workflows.applyCredential → Bind OpenAI credential safely  
5. validate.workflow → Ensure correctness
6. workflows.create({confirm:true}) → Deploy with credentials
7. webhooks.trigger → Test end-to-end
```

### Example 2: Multi-Service Integration
```
User: "Build a content pipeline: webhook → research with OpenAI → save to Supabase → email notification"

Auto-Detection Flow:
1. Webhook node → No credentials needed
2. OpenAI node → Auto-detect 'openAiApi' credential
3. HTTP Request (Supabase) → Match 'httpHeaderAuth' with Supabase hints
4. Email node → Auto-detect 'smtp' credential
5. Apply all credentials with single confirm
6. Test each credential with canary workflows
7. Deploy fully configured workflow
```

### Example 3: Database + AI Integration
```
User: "Create a customer insights workflow: PostgreSQL query → AI analysis → save results"

Smart Matching:
1. PostgreSQL node → Direct match to 'postgres' credential
2. OpenAI node → Direct match to 'openAiApi' credential  
3. HTTP Request (results) → Generic 'httpHeaderAuth' credential
4. Test database connection with safe query
5. Test AI credential with model list call
6. Deploy with all credentials bound
```

## 🔧 Advanced Configuration

### Custom Credential Matching
```javascript
// Prefer specific credential by name
credentials.matchForNode({
  nodeType: "n8n-nodes-base.httpRequest",
  hints: {"service": "api"},
  preferredName: "production"
})
```

### Exclusion Patterns
```javascript
// Custom exclusion patterns
credentials.list({
  excludePatterns: ["dev", "local", "backup"]
})
```

### Test Endpoint Override
```javascript
// Custom canary test endpoint
credentials.canaryTest({
  credentialId: "18",
  credentialType: "httpHeaderAuth", 
  testEndpoint: "https://api.myservice.com/health"
})
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**1. No Credentials Found**
```bash
# Check n8n connection
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/rest/credentials"

# Verify credentials exist in n8n UI
# Check API key permissions
```

**2. Credential Match Failed**
```javascript
// Debug matching
credentials.list() // See all available
credentials.matchForNode({nodeType, hints}) // Check specific match
credentials.types() // Verify type mappings
```

**3. Binding Failed**
```javascript
// Check workflow structure
validate.workflow({workflow}) // Ensure valid workflow
// Verify node exists before binding
// Confirm credential ID is correct
```

**4. Canary Test Failed**
```javascript
// Check credential configuration in n8n
// Verify API endpoints are accessible
// Review test endpoint URLs
```

### Debug Commands
```bash
# Test MCP server
npm run mcp:test

# Check n8n API
curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/rest/workflows"

# Validate MCP configuration  
node tools/mcp-servers/n8n-server.mjs --test
```

## 📚 Reference

### Available MCP Tools
- `credentials.list({type?, excludePatterns?})` - List safe credential metadata
- `credentials.types()` - Get credential types with node mappings
- `credentials.matchForNode({nodeType, hints?, preferredName?})` - Smart credential matching
- `workflows.applyCredential({workflowJson, nodeId, credentialType, credentialId, confirm})` - Safe binding
- `credentials.canaryTest({credentialId, credentialType, testEndpoint?})` - Safe testing

### Supported Credential Types
- `openAiApi` → OpenAI nodes
- `httpHeaderAuth` → HTTP Request nodes (with service hints)
- `httpBasicAuth` → HTTP Request nodes
- `postgres` → PostgreSQL nodes
- `smtp` → Email Send nodes
- `stripeApi` → Stripe nodes
- `discordApi` → Discord nodes
- `slackApi` → Slack nodes

### Service Hints
- `{service: "openai"}` → OpenAI credentials
- `{service: "supabase"}` → Supabase HTTP auth
- `{service: "api"}` → Generic HTTP auth
- `{service: "database"}` → Database credentials
- `{service: "email"}` → SMTP credentials

## 🎉 Pro Tips

### 1. **Batch Credential Detection**
```
"Create multiple workflows with auto-detected credentials: lead gen, content creation, and customer support"
```

### 2. **Environment-Aware Matching**
```javascript
// Production vs staging credential selection
credentials.list({excludePatterns: ["staging", "test"]})
```

### 3. **Credential Health Monitoring**
```
"Test all my production credentials and report their status"
```

### 4. **Smart Workflow Updates**
```
"Update my existing workflow to use the new production OpenAI credential"
```

### 5. **Cross-Service Integration**
```
"Build an automation that uses OpenAI for analysis, Supabase for storage, and Stripe for billing - auto-detect all credentials"
```

---

## 🚀 Ready to Chat with n8n!

Your enhanced MCP server now provides **enterprise-grade credential management** with:

✅ **Auto-detection** of available credentials  
✅ **Smart matching** based on node types and service hints  
✅ **Safe binding** without exposing secrets  
✅ **Canary testing** for credential validation  
✅ **Production-ready** filtering and safety protocols  

**Start creating workflows in Cursor with zero credential hassle!** 🎯
