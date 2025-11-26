# 🦂 Scorpion + n8n Integration Guide

Complete guide for integrating Scorpion AI with n8ncloud.tech workflows.

## 🔐 Authentication Setup

### 1. Generate API Key

```bash
# Generate a secure API key
openssl rand -hex 32
# Save this as your N8N_SCORPION_API_KEY
```

### 2. Add to Environment

Edit `apps/scorpion/.env.local`:

```env
# Scorpion API Key for n8n
SCORPION_API_KEY=your_generated_key_here
N8N_SCORPION_API_KEY=your_generated_key_here
```

## 🌐 Expose Scorpion to n8n Cloud

### Option A: Cloudflare Tunnel (Quick Setup)

```bash
# From project root
./cloudflare-tunnel.sh
```

This gives you a public URL like: `https://abc-123.trycloudflare.com`

### Option B: ngrok

```bash
ngrok http 3003
```

### Option C: Deploy to Cloud

Deploy Scorpion to Vercel, Railway, or Fly.io for permanent URL.

## 📡 Available API Endpoints

All endpoints require authentication via `X-API-Key` header.

### 1. Ask Council

Get expert opinions from Scorpion's council of agents.

```http
POST https://your-url.com/api/n8n/council

Headers:
X-API-Key: your_api_key_here
Content-Type: application/json

Body:
{
  "question": "Should we use microservices or monolith?",
  "context": "We have a team of 5 developers..."
}

Response:
{
  "success": true,
  "question": "...",
  "consensus": "The council recommends...",
  "votes": [...],
  "score": 8.5,
  "timestamp": "2025-01-08T..."
}
```

### 2. Search Knowledge Base

Search Scorpion's RAG knowledge store.

```http
POST https://your-url.com/api/n8n/knowledge

Headers:
X-API-Key: your_api_key_here
Content-Type: application/json

Body:
{
  "query": "database migration patterns",
  "limit": 5,
  "category": "architecture"
}

Response:
{
  "success": true,
  "query": "...",
  "results": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "category": "architecture",
      "tags": [...],
      "relevance": 0.95
    }
  ],
  "count": 5
}
```

### 3. Call Specific Agent

Execute a task with a specific Scorpion agent.

```http
POST https://your-url.com/api/n8n/agent

Headers:
X-API-Key: your_api_key_here
Content-Type: application/json

Body:
{
  "agent": "architectus",
  "task": "Review this API design",
  "context": "..."
}

Response:
{
  "success": true,
  "agent": "Architectus",
  "role": "System Architect & Infrastructure Expert",
  "task": "...",
  "response": "...",
  "timestamp": "..."
}
```

**Available Agents:**
- `architectus` - System architecture & infrastructure
- `analytica` - Data analysis & patterns
- `pragmaton` - Practical implementation

### 4. Smart Webhook (Auto-routing)

One endpoint that routes to the right service.

```http
POST https://your-url.com/api/n8n/webhook

Headers:
X-API-Key: your_api_key_here
Content-Type: application/json

Body:
{
  "action": "ask-council",
  "payload": {
    "question": "..."
  }
}
```

**Available Actions:**
- `ask-council`
- `search-knowledge`
- `call-agent`
- `analyze-workflow`

## 🔨 n8n Workflow Examples

### Example 1: Customer Email → Scorpion Analysis

```json
{
  "nodes": [
    {
      "type": "EmailTrigger",
      "name": "New Customer Email"
    },
    {
      "type": "HTTP Request",
      "name": "Ask Scorpion Council",
      "parameters": {
        "method": "POST",
        "url": "https://your-url.trycloudflare.com/api/n8n/council",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "X-API-Key",
          "value": "={{$credentials.scorpionApiKey}}"
        },
        "bodyParameters": {
          "question": "How should we respond to this customer inquiry?",
          "context": "={{$json.body}}"
        }
      }
    },
    {
      "type": "SendEmail",
      "name": "Send Response",
      "parameters": {
        "body": "={{$json.consensus}}"
      }
    }
  ]
}
```

### Example 2: Search Scorpion Knowledge

```json
{
  "nodes": [
    {
      "type": "Webhook",
      "name": "Trigger"
    },
    {
      "type": "HTTP Request",
      "name": "Search Knowledge",
      "parameters": {
        "method": "POST",
        "url": "https://your-url.trycloudflare.com/api/n8n/knowledge",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "X-API-Key",
          "value": "{{$credentials.scorpionApiKey}}"
        },
        "bodyParameters": {
          "query": "={{$json.searchTerm}}",
          "limit": 10
        }
      }
    }
  ]
}
```

### Example 3: Call Specific Agent

```json
{
  "nodes": [
    {
      "type": "Webhook",
      "name": "Code Review Request"
    },
    {
      "type": "HTTP Request",
      "name": "Architectus Review",
      "parameters": {
        "method": "POST",
        "url": "https://your-url.trycloudflare.com/api/n8n/agent",
        "authentication": "headerAuth",
        "bodyParameters": {
          "agent": "architectus",
          "task": "Review this code for architectural issues",
          "context": "={{$json.code}}"
        }
      }
    }
  ]
}
```

## 🔧 n8n Credentials Setup

1. Go to n8n → Credentials
2. Add new → Header Auth
3. Name: "Scorpion API"
4. Header Name: `X-API-Key`
5. Header Value: `your_api_key_here`

## 🚀 Testing

### Test with curl

```bash
# Test council endpoint
curl -X POST https://your-url.trycloudflare.com/api/n8n/council \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the best programming language?"}'

# Test knowledge search
curl -X POST https://your-url.trycloudflare.com/api/n8n/knowledge \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"query": "workflow patterns", "limit": 3}'

# Test agent
curl -X POST https://your-url.trycloudflare.com/api/n8n/agent \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"agent": "pragmaton", "task": "Suggest optimizations"}'
```

## 📊 Rate Limits

- 100 requests per minute per API key
- 1000 requests per hour per API key
- Council deliberations may take 5-10 seconds

## 🔒 Security Best Practices

1. **Never expose API keys in n8n workflow JSON** - Use credentials
2. **Rotate keys regularly** - Generate new keys monthly
3. **Use HTTPS only** - Cloudflare Tunnel provides this
4. **Monitor usage** - Check Scorpion logs for suspicious activity
5. **Whitelist IPs** (optional) - Add IP filtering if needed

## 🐛 Troubleshooting

### "Unauthorized" Error

- Check your API key is correct
- Ensure `X-API-Key` header is set
- Verify key is in `.env.local` and server restarted

### "Cannot connect to localhost"

- Scorpion must be running (`pnpm dev`)
- Tunnel must be active (`./cloudflare-tunnel.sh`)
- Check firewall settings

### Slow Response Times

- Council deliberations take 5-10 seconds (multiple LLM calls)
- Knowledge search is fast (<1 second)
- Consider caching results in n8n

## 📚 Next Steps

1. ✅ Set up API authentication
2. ✅ Start Cloudflare Tunnel
3. ✅ Test endpoints with curl
4. ✅ Create first n8n workflow
5. ✅ Add Scorpion credentials to n8n
6. ✅ Build intelligent automation!

## 🦂 **Welcome to the Scorpion + n8n hybrid intelligence stack!**

