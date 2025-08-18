# AI Agent Workflow with Tools, Memory, and Output Parser

This n8n workflow implements an intelligent AI agent that can search the internet, manage emails, maintain conversation context, and provide structured responses.

## Features

- **AI-Powered Conversations**: Uses OpenRouter to access various LLM models
- **Internet Search**: Integrated Tavily search tool for real-time web information
- **Email Management**: Gmail integration for reading, sending, and drafting emails
- **Conversation Memory**: Maintains context across multiple interactions
- **Structured Output**: Ensures consistent JSON response format

## Workflow Components

### 1. AI Agent Node
The central orchestrator that:
- Processes user queries
- Coordinates tool usage
- Manages conversation flow
- Applies system prompts

### 2. OpenRouter Chat Model
- Provides LLM capabilities
- Supports multiple AI models
- Handles token management

### 3. Gmail Tool
Enables:
- Reading emails
- Sending emails
- Creating drafts
- Searching inbox

### 4. Tavily Search Tool
- Real-time internet searches
- News and information retrieval
- Configurable search depth
- Returns structured results

### 5. Simple Memory
- Buffer window memory (10 messages)
- Session-based context retention
- Conversation history management

### 6. Structured Output Parser
Ensures responses follow this schema:
```json
{
  "subject": "Main topic or email subject",
  "email": "Detailed content or email body",
  "searchResults": [
    {
      "title": "Result title",
      "url": "Source URL",
      "snippet": "Brief description"
    }
  ],
  "actionsTaken": ["List of performed actions"]
}
```

## Setup Instructions

### 1. Prerequisites
- n8n instance (self-hosted or cloud)
- OpenRouter API account
- Gmail account with OAuth2 enabled
- Tavily API key (optional - dev key included)

### 2. Configuration Steps

1. **Import the Workflow**
   - Copy the contents of `ai-agent-workflow.json`
   - In n8n, go to Workflows → Import
   - Paste the JSON and click Import

2. **Configure Credentials**

   a. **OpenRouter API**
   - Go to Credentials → New
   - Select "OpenRouter API"
   - Add your API key from https://openrouter.ai/keys
   
   b. **Gmail OAuth2**
   - Create OAuth2 credentials in Google Cloud Console
   - Configure redirect URI: `https://your-n8n-instance.com/rest/oauth2-credential/callback`
   - Add credentials in n8n

   c. **Tavily API** (in the HTTP Request node)
   - Replace `{{YOUR_TAVILY_API_KEY}}` with your key
   - Or use the provided dev key for testing

3. **Update Placeholders**
   - Replace all `{{YOUR_*}}` placeholders in the workflow
   - Set your instance ID

### 3. Webhook Configuration
If using webhooks:
- Note the webhook URL after saving
- Configure in external services as needed

## Usage Examples

### Basic Query
```json
{
  "query": "Search for the latest news about AI and compose an email summary"
}
```

### Email Composition
```json
{
  "query": "Write a professional email about project updates to the team"
}
```

### Research Task
```json
{
  "query": "Research best practices for API security and create an email report"
}
```

### Multi-Tool Usage
```json
{
  "query": "Check my recent emails about the budget meeting and search for financial planning tips"
}
```

## Input Format

The workflow expects input in this format:
```json
{
  "query": "Your question or request here",
  "sessionId": "optional-session-id-for-memory"
}
```

## Output Format

All responses follow the structured schema:
```json
{
  "subject": "Summary or email subject line",
  "email": "Detailed response or email body",
  "searchResults": [
    // Array of search results if internet search was used
  ],
  "actionsTaken": [
    "Searched internet for: topic",
    "Composed email response",
    // Other actions performed
  ]
}
```

## Advanced Configuration

### Memory Settings
- `windowSize`: Number of messages to remember (default: 10)
- `sessionIdType`: How to identify sessions
- `sessionKey`: Field name for session ID

### Search Tool Options
- `search_depth`: "basic" or "advanced"
- `max_results`: Number of results (1-10)
- `topic`: "general", "news", etc.
- `include_raw_content`: Full page content

### Agent System Prompt
Customize the AI's behavior by modifying the system message in the AI Agent node.

## Troubleshooting

### Common Issues

1. **"Credentials not found" error**
   - Ensure all credentials are properly configured
   - Check credential IDs match in the workflow

2. **Tool not responding**
   - Verify API keys are valid
   - Check rate limits
   - Ensure proper network connectivity

3. **Memory not persisting**
   - Include sessionId in your input
   - Check memory node configuration

4. **Output format issues**
   - Verify output parser schema
   - Ensure agent system prompt mentions structured output

## Best Practices

1. **Session Management**
   - Always include sessionId for conversation continuity
   - Use unique IDs per user/conversation

2. **Tool Usage**
   - Be specific in queries to trigger appropriate tools
   - Combine tools for comprehensive responses

3. **Error Handling**
   - Add error handling nodes for production use
   - Log tool failures for debugging

4. **Performance**
   - Monitor token usage in OpenRouter
   - Adjust memory window size as needed
   - Cache frequent search results

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use n8n's credential management
   - Rotate keys regularly

2. **Gmail Access**
   - Limit OAuth2 scopes to minimum required
   - Review connected apps regularly

3. **Data Privacy**
   - Be cautious with sensitive information
   - Consider data retention policies
   - Implement access controls

## Extending the Workflow

### Adding New Tools
1. Add tool node to canvas
2. Connect to AI Agent's tool input
3. Update system prompt to describe new capability

### Custom Output Formats
1. Modify the output parser schema
2. Update system prompt accordingly
3. Adjust downstream processing

### Integration Points
- Webhook triggers for external systems
- Database nodes for persistence
- Notification nodes for alerts

## Support and Resources

- n8n Documentation: https://docs.n8n.io
- OpenRouter Docs: https://openrouter.ai/docs
- Tavily API: https://tavily.com/docs
- Gmail API: https://developers.google.com/gmail/api

## License

This workflow template is provided as-is for use with n8n.