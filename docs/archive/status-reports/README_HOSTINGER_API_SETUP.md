# Remote LLM Setup via Hostinger API (No SSH Needed)

## 🎯 What This Does

Sets up remote LLM on your KVM2 using Hostinger's browser terminal - **no SSH required**.

**Uses your Hostinger API token to:**
- Check VPS status
- Generate safe setup scripts
- Provide copy-paste commands for browser terminal

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Generate Setup Script

On your Mac:

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/setup-remote-llm-hostinger-api.sh
```

This will:
- ✅ Check VPS status via API
- ✅ Generate safe setup script
- ✅ Display script for copy-paste

### Step 2: Copy Script to Browser Terminal

1. **Open Hostinger Dashboard:**
   - Go to: https://hpanel.hostinger.com/vps/765579
   - Click: **"Browser terminal"**

2. **Paste the script** from Step 1 output

3. **Press Enter** to run

The script will:
- ✅ Identify n8n/postgres containers (read-only, won't touch)
- ✅ Create new `ollama` container (isolated)
- ✅ Test local endpoint
- ✅ Show next steps

### Step 3: Configure Caddy

Still in browser terminal:

```bash
sudo nano /etc/caddy/Caddyfile
```

**Add at the bottom** (don't edit existing n8n blocks):

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

---

## 🔍 Verify Setup

### On KVM2 (Browser Terminal):

Generate verification script:

```bash
# On your Mac:
./scripts/verify-remote-llm-hostinger-api.sh
```

Copy the output script into browser terminal to verify everything is working.

### On Your Mac:

```bash
# Test public endpoint
curl https://llm.n8ncloud.tech/api/tags

# Test Scorpion health
curl http://localhost:3003/api/health | jq
```

---

## 🛡️ Safety Guarantees

**What the scripts do:**
- ✅ Only READ n8n/postgres containers (never modify)
- ✅ Only CREATE new `ollama` container (isolated)
- ✅ Only ADD new Caddy blocks (never edit existing)

**What they never do:**
- ❌ Touch n8n containers
- ❌ Touch n8n database
- ❌ Modify n8n Caddy blocks
- ❌ Edit n8n env files

---

## 📋 Scripts Available

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-remote-llm-hostinger-api.sh` | Generate setup script | Run on Mac, copy output to browser terminal |
| `verify-remote-llm-hostinger-api.sh` | Generate verification script | Run on Mac, copy output to browser terminal |
| `setup-remote-llm-safe.sh` | Direct setup (if SSH available) | Run directly on KVM2 |
| `verify-setup-safe.sh` | Direct verification (if SSH available) | Run directly on KVM2 |

---

## 🔧 Configuration

The scripts use:
- **API Token**: `Gx0BB3W2T4U9kzCiYLKPGPNhauVbxWFym2c5Ibh6894f797c`
- **VPS ID**: `765579`
- **Server IP**: `69.62.66.78`

To change these, edit the scripts directly.

---

## 🆘 Troubleshooting

**API check shows "unknown" state:**
- This is normal - the script still works
- The important part is the generated setup script

**Browser terminal not accessible:**
- Make sure you're logged into Hostinger
- Check VPS is running in dashboard

**Ollama container fails to start:**
- Check Docker is installed: `docker --version`
- Check logs: `docker logs ollama`

**Caddy validation fails:**
- Check syntax in Caddyfile
- Make sure you're only ADDING, not editing existing blocks

---

## ✅ Done!

Once setup is complete:
1. ✅ Ollama running on KVM2
2. ✅ Caddy configured with llm.n8ncloud.tech
3. ✅ DNS pointing to KVM2
4. ✅ Scorpion using remote LLM

Your remote LLM is now live, and n8n remains completely untouched!

