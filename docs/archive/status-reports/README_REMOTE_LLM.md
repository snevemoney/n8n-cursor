# Remote LLM Setup - Quick Start

## 🎯 What This Does

Sets up a remote LLM server on your KVM2 without touching n8n or its database.

**Architecture:**
- UI stays on localhost (your Mac)
- Scorpion backend stays on localhost
- LLM runs on KVM2 (remote server)
- n8n and its DB remain completely untouched

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Connect to KVM2

Use whatever you normally use to SSH into your server:

```bash
ssh <your-user>@<KVM2_IP>
# OR your existing shortcut
```

### Step 2: Run Setup Script

Once on KVM2:

```bash
cd ~/n8n-cursor  # or wherever your repo is
./scripts/setup-remote-llm-safe.sh
```

This will:
- ✅ Identify n8n/postgres containers (read-only, won't touch them)
- ✅ Create new `ollama` container (isolated from n8n)
- ✅ Test local endpoint

### Step 3: Configure Caddy

On KVM2:

```bash
sudo nano /etc/caddy/Caddyfile
```

**Add this at the bottom** (don't edit existing n8n blocks):

```
llm.n8ncloud.tech {
    reverse_proxy 127.0.0.1:11434
}
```

Then:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Step 4: Verify

On KVM2:

```bash
./scripts/verify-setup-safe.sh
```

On your Mac:

```bash
curl https://llm.n8ncloud.tech/api/tags
```

### Step 5: Connect Scorpion

On your Mac:

```bash
cd apps/scorpion
# Verify OLLAMA_URL is set
grep OLLAMA_URL .env.local

# If not set:
echo "OLLAMA_URL=https://llm.n8ncloud.tech" >> .env.local

# Restart Scorpion
pnpm dev
```

### Step 6: Test

```bash
# Test health
curl http://localhost:3003/api/health | jq

# Test chat
curl -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

---

## 🛡️ Safety Guarantees

**What we do:**
- ✅ Add new `ollama` container (isolated)
- ✅ Add new Caddy site block (separate from n8n)
- ✅ Edit only `apps/scorpion/.env.local`

**What we never do:**
- ❌ Touch n8n containers
- ❌ Touch n8n database
- ❌ Modify n8n Caddy blocks
- ❌ Edit n8n env files

---

## 📚 Full Documentation

- **Detailed Guide**: `docs/REMOTE_LLM_SETUP_SAFE.md`
- **Safety Checklist**: `docs/SAFETY_CHECKLIST.md`
- **Quick Start**: `docs/QUICK_START_REMOTE_LLM.md`

---

## 🧪 Test Concurrency

Once everything is working:

```bash
cd apps/scorpion
./scripts/test-concurrency.sh 8
```

Start with 8 concurrent tests, adjust based on server capacity.

---

## 🆘 Troubleshooting

**Ollama not responding:**
```bash
docker logs ollama
docker restart ollama
```

**Caddy validation fails:**
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
# Fix syntax, then reload
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
```

---

## ✅ Done!

Your remote LLM is now set up and Scorpion is using it, while n8n remains completely untouched.

