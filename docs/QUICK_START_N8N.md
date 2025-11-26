# 🚀 Quick Start: Scorpion + n8n

Get your Scorpion API accessible from n8ncloud.tech in 5 minutes.

## Step 1: Start Scorpion

```bash
cd apps/scorpion
pnpm dev
```

Wait for: `✓ Ready in X.Xs`

## Step 2: Expose to Internet

In a new terminal:

```bash
./cloudflare-tunnel.sh
```

You'll see a URL like: `https://random-name.trycloudflare.com`

**Copy this URL!** You'll need it for n8n.

## Step 3: Get Your API Key

```bash
# View your API key
grep SCORPION_API_KEY apps/scorpion/.env.local
```

**Copy the key** (everything after `=`)

## Step 4: Test from n8n

1. Go to n8ncloud.tech
2. Create new workflow
3. Add **HTTP Request** node
4. Configure:
   - Method: `POST`
   - URL: `https://your-tunnel-url.trycloudflare.com/api/n8n/council`
   - Authentication: `Header Auth`
     - Name: `X-API-Key`
     - Value: `your-api-key-here`
   - Body:
     ```json
     {
       "question": "What is the best way to handle errors?"
     }
     ```
5. Execute!

You should get a response with council consensus.

## Step 5: Save Credentials in n8n

1. n8n → Credentials → New
2. Type: "Header Auth"
3. Name: "Scorpion API"
4. Header Name: `X-API-Key`
5. Header Value: `your-key-here`
6. Save

Now you can reuse these credentials in all workflows!

## Available Endpoints

- `/api/n8n/council` - Ask council for opinions
- `/api/n8n/knowledge` - Search knowledge base
- `/api/n8n/agent` - Call specific agent
- `/api/n8n/webhook` - Smart auto-routing

See `docs/N8N_INTEGRATION_GUIDE.md` for complete API documentation.

## 🎉 You're done!

Scorpion is now accessible from your n8n workflows. Build intelligent automation! 🦂
