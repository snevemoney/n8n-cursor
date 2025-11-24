# Remote LLM Setup - Safe for n8n Database

## 🛡️ Safety Rules (Read First!)

### ✅ SAFE Operations
- ✅ Adding new Docker containers (ollama)
- ✅ Adding new Caddy site blocks
- ✅ Editing `apps/scorpion/.env.local` only
- ✅ Running `docker ps`, `docker logs`
- ✅ Testing with `curl` commands

### ❌ NEVER Do These (Protects n8n DB)
- ❌ `docker system prune -a` (can delete volumes)
- ❌ `docker volume rm` on anything n8n-related
- ❌ `docker rm -f n8n` or anything with `postgres` in name
- ❌ Editing n8n's `.env` or docker-compose files
- ❌ `DROP DATABASE` or `DROP SCHEMA` in any DB client
- ❌ Removing or modifying existing Caddy blocks for n8n
- ❌ Stopping n8n or postgres containers

---

## Step-by-Step Setup (100% Safe for n8n)

### Step 0: Pre-Flight Safety Check

**On your KVM2 server, run these to see what's running:**

```bash
# List all containers (identify n8n/postgres)
docker ps

# List volumes (identify n8n/postgres volumes)
docker volume ls

# Check Caddyfile location
ls -la /etc/caddy/Caddyfile
```

**🧠 Mental Note**: Write down container names that have `n8n` or `postgres` in them. We will NOT touch these.

---

### Step 1: DNS Configuration (No Server Access Needed)

**On your domain provider (where n8ncloud.tech is registered):**

1. Go to DNS settings
2. Add A record:
   - **Host/Name**: `llm`
   - **Type**: `A`
   - **Value**: `YOUR_KVM2_PUBLIC_IP` (same IP as n8ncloud.tech)
   - **TTL**: Default (300 / auto)

**Test from your Mac:**

```bash
ping llm.n8ncloud.tech
```

Should resolve to your KVM2 IP. If not, wait a few minutes for DNS propagation.

---

### Step 2: SSH into KVM2

```bash
ssh youruser@YOUR_KVM2_IP
```

**All next commands run on the KVM2 server.**

---

### Step 3: Install Docker (If Not Already Installed)

**Check if Docker exists:**

```bash
docker --version
```

**If Docker is NOT installed:**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

**Then log out and back in:**

```bash
exit
# SSH back in
ssh youruser@YOUR_KVM2_IP
```

**If Docker IS already installed:** Skip to Step 4.

---

### Step 4: Start Ollama Container (Safe - New Container)

**This creates a brand-new container, separate from n8n:**

```bash
docker run -d \
  --name ollama \
  -p 127.0.0.1:11434:11434 \
  --restart unless-stopped \
  ollama/ollama
```

**Why this is safe:**
- ✅ New container name (`ollama`) - no conflict with n8n
- ✅ New port (11434) - doesn't touch n8n's port
- ✅ No volumes - nothing to do with databases
- ✅ Internal only (127.0.0.1) - safe from external access

**Verify it's running:**

```bash
docker ps | grep ollama
```

Should show the ollama container running.

**Test Ollama locally (on KVM2):**

```bash
curl http://127.0.0.1:11434/api/tags
```

Should return JSON (even empty `{"models":[]}` is fine).

---

### Step 5: Pull a Model (Optional - Can Do Later)

**If you want to test with a model immediately:**

```bash
docker exec -it ollama ollama pull llama3.2:1b
```

**Or pull a larger model:**

```bash
docker exec -it ollama ollama pull llama3.2:3b
```

**List available models:**

```bash
docker exec -it ollama ollama list
```

---

### Step 6: Configure Caddy (Safe - Adding New Site Only)

**⚠️ CRITICAL: We're ADDING a new site block, NOT editing existing n8n blocks.**

**6.1 Open Caddyfile:**

```bash
sudo nano /etc/caddy/Caddyfile
```

**6.2 Find existing n8n block (DO NOT EDIT IT):**

You might see something like:

```
n8n.n8ncloud.tech {
    reverse_proxy 127.0.0.1:5678
}
```

**⚠️ DO NOT TOUCH THIS BLOCK.**

**6.3 Add NEW block at the bottom:**

```
llm.n8ncloud.tech {
    reverse_proxy 127.0.0.1:11434
}
```

**6.4 Validate Caddyfile (safety check):**

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

**If it says "Valid configuration" → proceed.**

**If it says "error" → fix the typo, validate again.**

**6.5 Reload Caddy (safe - only reloads config):**

```bash
sudo systemctl reload caddy
```

**Or if using Caddy manually:**

```bash
# Find Caddy process and restart it
sudo pkill -USR1 caddy
```

**6.6 Verify n8n still works:**

From your Mac, test:

```bash
curl https://n8ncloud.tech/api/v1/healthz
```

Should still work. If it doesn't, check Caddyfile syntax.

---

### Step 7: Test Remote LLM Endpoint

**From your Mac:**

```bash
curl https://llm.n8ncloud.tech/api/tags
```

**Expected results:**
- ✅ JSON response → Success!
- ❌ Connection refused → Check firewall or Caddy
- ❌ Caddy error page → Check Caddyfile syntax
- ❌ HTML / not JSON → Wrong service

---

### Step 8: Verify Scorpion Configuration

**On your Mac, in the repo:**

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion
cat .env.local | grep OLLAMA_URL
```

**Should show:**

```
OLLAMA_URL=https://llm.n8ncloud.tech
```

**If not set, add it:**

```bash
echo "" >> .env.local
echo "# Ollama Configuration (Remote KVM2 Server)" >> .env.local
echo "OLLAMA_URL=https://llm.n8ncloud.tech" >> .env.local
```

---

### Step 9: Run Verification Script

**From your Mac:**

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion
./scripts/verify-remote-llm.sh
```

**Should show:**
- ✅ OLLAMA_URL configured
- ✅ Remote LLM reachable

---

### Step 10: Test with Scorpion

**Restart Scorpion (if running):**

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion
pnpm dev
```

**Test health endpoint:**

```bash
curl http://localhost:3003/api/health | jq
```

**Should show:**

```json
{
  "services": {
    "ollama": {
      "status": "up",
      "model": "..."
    }
  }
}
```

**Test single chat:**

```bash
curl -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

---

### Step 11: Run Concurrent Tests

**From your Mac:**

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion
./scripts/test-concurrency.sh 8
```

**Start with 8 concurrent tests, adjust based on server capacity.**

---

## Troubleshooting

### Issue: Ollama container won't start

```bash
# Check logs
docker logs ollama

# Check if port is already in use
netstat -tuln | grep 11434

# Restart container
docker restart ollama
```

### Issue: Caddy validation fails

```bash
# Check Caddyfile syntax
sudo caddy validate --config /etc/caddy/Caddyfile

# Common errors:
# - Missing closing brace }
# - Wrong indentation
# - Typo in domain name
```

### Issue: n8n stops working after Caddy reload

```bash
# Check Caddyfile for syntax errors
sudo caddy validate --config /etc/caddy/Caddyfile

# Check Caddy logs
sudo journalctl -u caddy -n 50

# Restore from backup if needed
sudo cp /etc/caddy/Caddyfile.backup /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

### Issue: Remote LLM not reachable

**Test from KVM2:**

```bash
# Test Ollama directly
curl http://127.0.0.1:11434/api/tags

# Test through Caddy (from KVM2)
curl https://llm.n8ncloud.tech/api/tags
```

**Test from Mac:**

```bash
# Test DNS resolution
ping llm.n8ncloud.tech

# Test HTTPS endpoint
curl -v https://llm.n8ncloud.tech/api/tags
```

---

## Safety Checklist

Before making any changes, verify:

- [ ] I've identified all n8n/postgres containers (`docker ps`)
- [ ] I've identified all n8n/postgres volumes (`docker volume ls`)
- [ ] I'm only adding NEW containers, not modifying existing ones
- [ ] I'm only adding NEW Caddy blocks, not editing n8n blocks
- [ ] I'm only editing `apps/scorpion/.env.local`, not n8n env files
- [ ] I've validated Caddyfile before reloading
- [ ] I've tested n8n still works after Caddy reload

---

## Quick Reference

| What | Command | Safe? |
|------|---------|-------|
| List containers | `docker ps` | ✅ Safe |
| List volumes | `docker volume ls` | ✅ Safe |
| Start Ollama | `docker run -d --name ollama ...` | ✅ Safe |
| View Ollama logs | `docker logs ollama` | ✅ Safe |
| Test Ollama | `curl http://127.0.0.1:11434/api/tags` | ✅ Safe |
| Edit Caddyfile | `sudo nano /etc/caddy/Caddyfile` | ✅ Safe (add only) |
| Validate Caddy | `sudo caddy validate --config /etc/caddy/Caddyfile` | ✅ Safe |
| Reload Caddy | `sudo systemctl reload caddy` | ✅ Safe |
| Test n8n | `curl https://n8ncloud.tech/api/v1/healthz` | ✅ Safe |
| Test LLM | `curl https://llm.n8ncloud.tech/api/tags` | ✅ Safe |
| Remove container | `docker rm -f ollama` | ✅ Safe (only ollama) |
| System prune | `docker system prune -a` | ❌ DANGEROUS |
| Remove volumes | `docker volume rm ...` | ❌ DANGEROUS (if n8n-related) |

---

## What We've Created

1. ✅ New Ollama container (isolated from n8n)
2. ✅ New Caddy site block (separate from n8n)
3. ✅ Updated Scorpion env (only Scorpion, not n8n)
4. ✅ Verification scripts (read-only, safe)
5. ✅ Test scripts (only test, don't modify)

**Nothing touches n8n's database, containers, or configuration.**

