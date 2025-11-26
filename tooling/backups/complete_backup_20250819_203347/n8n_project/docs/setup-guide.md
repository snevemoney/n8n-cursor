# 🛠️ Setup Guide

## Prerequisites

### Required Software
- n8n instance (self-hosted or cloud)
- Git
- Cursor or Claude Desktop with n8n-MCP configured

### Required API Keys
- OpenAI API key
- GitHub OAuth app credentials
- Slack app credentials
- Twitter/X API credentials (optional)
- Supabase project credentials (optional)

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/snevemoney/n8n-cursor.git
cd n8n-cursor
```

### 2. Import Workflows
1. Open your n8n instance
2. Navigate to Workflows
3. Click "Import from file"
4. Select workflow JSON files from `workflows/` directory
5. Import each workflow individually

### 3. Configure Credentials
1. Go to n8n Credentials section
2. Add OAuth2 credentials for:
   - GitHub
   - Slack
   - Twitter/X
3. Add API key credentials for:
   - OpenAI
   - Supabase

### 4. Update Workflow Settings
1. Open each imported workflow
2. Update credential assignments in nodes
3. Replace placeholder URLs and webhook endpoints
4. Test individual nodes

### 5. Activate Workflows
1. Review each workflow
2. Click the Active toggle
3. Monitor execution logs

## Environment Variables

Create `.env` file:
```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
OPENAI_API_KEY=sk-your-openai-key
GITHUB_TOKEN=ghp_your-github-token
```

## Troubleshooting

### Common Issues
1. **Credential errors**: Ensure OAuth apps are properly configured
2. **Webhook timeouts**: Check network connectivity
3. **API rate limits**: Implement proper error handling

### Testing
Use the test payloads in `examples/` directory to verify each workflow.
