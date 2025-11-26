# Quick Start: Remote LLM Setup (Safe for n8n)

## 🎯 Goal

Set up remote LLM on KVM2 without touching n8n database or containers.

## ⚡ 5-Minute Setup

### Step 1: DNS (2 minutes)

**On your domain provider:**
- Add A record: `llm` → `YOUR_KVM2_IP`

**Test:**
```bash
ping llm.n8ncloud.tech
```

### Step 2: SSH to KVM2 (1 minute)

```bash
ssh youruser@YOUR_KVM2_IP
```

### Step 3: Run Setup Script (2 minutes)

**On KVM2:**

```bash
# Download and run the safe setup script
cd /tmp
curl -O https://raw.githubusercontent.com/your-repo/scripts/setup-remote-llm-safe.sh
# OR if you have the repo:
cd /path/to/n8n-cursor
./scripts/setup-remote-llm-safe.sh
```

**Or manually:**

```bash
# Start Ollama
docker run -d \
  --name ollama \
  -p 127.0.0.1:11434:11434 \
  --restart unless-stopped \
  ollama/ollama

# Test it
curl http://127.0.0.1:11434/api/tags
```

### Step 4: Configure Caddy (1 minute)

**On KVM2:**

```bash
# Edit Caddyfile
sudo nano /etc/caddy/Caddyfile

# Add at the bottom:
llm.n8ncloud.tech {
    reverse_proxy 127.0.0.1:11434
}

# Validate
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload
sudo systemctl reload caddy
```

### Step 5: Verify (30 seconds)

**On KVM2:**

```bash
./scripts/verify-setup-safe.sh
```

**On Mac:**

```bash
curl https://llm.n8ncloud.tech/api/tags
```

### Step 6: Connect Scorpion (30 seconds)

**On Mac:**

```bash
cd apps/scorpion

# Verify OLLAMA_URL is set
grep OLLAMA_URL .env.local

# If not set, add it:
echo "OLLAMA_URL=https://llm.n8ncloud.tech" >> .env.local

# Restart Scorpion
pnpm dev
```

### Step 7: Test (30 seconds)

```bash
# Test health
curl http://localhost:3003/api/health | jq

# Test chat
curl -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

## ✅ Done!

Your remote LLM is now set up and Scorpion is using it.

## 🧪 Test Concurrency

```bash
cd apps/scorpion
./scripts/test-concurrency.sh 8
```

## 🛡️ Safety Reminders

- ✅ Only added NEW container (ollama)
- ✅ Only added NEW Caddy block
- ✅ Only edited Scorpion env
- ❌ Did NOT touch n8n containers
- ❌ Did NOT touch n8n database
- ❌ Did NOT modify n8n Caddy block

## 📚 Full Documentation

- **Detailed Guide**: `docs/REMOTE_LLM_SETUP_SAFE.md`
- **Safety Checklist**: `docs/SAFETY_CHECKLIST.md`
- **Architecture Map**: `docs/REMOTE_LLM_SETUP.md`

## 🆘 Troubleshooting

**Ollama not responding:**
```bash
docker logs ollama
docker restart ollama
```

**Caddy validation fails:**
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
# Fix syntax errors, then reload
```

**n8n stopped working:**
```bash
# Restore Caddyfile backup
sudo cp /etc/caddy/Caddyfile.backup /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

**Public endpoint not reachable:**
```bash
# Test DNS
ping llm.n8ncloud.tech

# Test from KVM2
curl https://llm.n8ncloud.tech/api/tags

# Check Caddy logs
sudo journalctl -u caddy -n 50
```

