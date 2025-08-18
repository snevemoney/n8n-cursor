# Quick Start Guide - AI Agent Workflow

## 🚀 Get Started in 5 Minutes

### Step 1: Import the Workflow

1. Open your n8n instance
2. Click **Workflows** → **Import**
3. Copy the entire content of `ai-agent-workflow.json`
4. Paste and click **Import**

### Step 2: Quick Configuration

#### Minimal Setup (Using Test APIs):

1. **OpenRouter** (Required)
   - Sign up at https://openrouter.ai
   - Get API key from https://openrouter.ai/keys
   - Add to n8n: Credentials → New → OpenRouter API

2. **Tavily Search** (Optional - Dev Key Included)
   - The workflow includes a development API key for testing
   - For production, get your key at https://tavily.com

3. **Gmail** (Optional for Email Features)
   - Skip if you only need search functionality
   - Otherwise, follow Gmail OAuth2 setup in README

### Step 3: Test Your Workflow

1. Open the imported workflow
2. Click **Execute Workflow**
3. Use this test input:
```json
{
  "query": "What is n8n and how does it work?",
  "sessionId": "quickstart-test"
}
```

### Step 4: Basic Usage Examples

#### Simple Search:
```json
{
  "query": "Latest news about artificial intelligence"
}
```

#### Email Composition:
```json
{
  "query": "Write a welcome email for new employees"
}
```

#### Research & Report:
```json
{
  "query": "Research cloud storage solutions and create a comparison email"
}
```

## 🎯 Common Use Cases

### 1. Customer Support Assistant
- Search knowledge base
- Draft response emails
- Maintain conversation context

### 2. Research Assistant
- Gather information from the web
- Compile research reports
- Create summary emails

### 3. Email Automation
- Generate professional emails
- Process email requests
- Auto-respond with context

### 4. Content Creation
- Research topics
- Generate email newsletters
- Create reports

## ⚡ Tips for Best Results

1. **Be Specific**: Clear, detailed queries get better results
2. **Use Session IDs**: Include sessionId for conversation continuity
3. **Combine Tools**: Ask to search AND compose emails for comprehensive responses

## 🔧 Troubleshooting

### "No credentials found"
→ Make sure to add OpenRouter credentials

### "Tool not activated"
→ Make queries more specific (e.g., "search for..." or "write an email...")

### "No response"
→ Check workflow execution logs for errors

## 📚 Next Steps

1. Read the full [README.md](./README.md) for detailed configuration
2. Explore [examples.md](./examples.md) for advanced usage
3. Run automated tests with `node test-workflow.js <webhook-url>`
4. Customize the system prompt for your use case

## 🆘 Need Help?

- Check n8n community: https://community.n8n.io
- OpenRouter docs: https://openrouter.ai/docs
- Review workflow logs for debugging

---

**Pro Tip**: Start with just the OpenRouter credential and search functionality. Add Gmail and other features as needed!