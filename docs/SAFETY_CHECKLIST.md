# Safety Checklist – Protect n8n and Its Database

This checklist is to make sure the remote LLM setup **never** breaks n8n or its database.

---

## 0. Golden Rules

- ❌ Do **NOT**:
  - Edit n8n's `.env` files
  - Stop/remove `n8n` or `postgres` containers
  - Remove any Docker volumes related to n8n
  - Run `docker system prune -a`
  - Run `DROP DATABASE` or `DROP SCHEMA` in Postgres

- ✅ You **MAY**:
  - Add a **new** container for `ollama`
  - Add a **new** site block in the Caddyfile
  - Edit **only** `apps/scorpion/.env.local`
  - Run read-only verification scripts

---

## 1. Pre-flight Server Checks

Before doing anything on KVM2:

1. SSH into the server:
   ```bash
   ssh <user>@<KVM2_IP>
   # OR use your existing shortcut (ssh kvm2, etc.)
   ```

2. List containers:
   ```bash
   docker ps
   ```

3. Identify and protect:
   - Any container whose name contains `n8n`
   - Any container whose name contains `postgres` or `db`

✅ **Rule**: Do not stop/remove/edit those containers.

---

## 2. DNS & Networking

1. In your DNS:
   - Create an A record:
     - Name/Host: `llm`
     - Domain: `n8ncloud.tech`
     - Value: `<KVM2_PUBLIC_IP>`

2. From your Mac:
   ```bash
   ping llm.n8ncloud.tech
   ```
   - If it resolves to your KVM2 IP → ✅ good.
   - If not, wait a few minutes for DNS propagation.

---

## 3. Safe Caddy Updates

1. Open the Caddyfile (example path):
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```

2. **Do not modify** the existing n8n block.

3. Add a **new** block for the LLM:
   ```
   llm.n8ncloud.tech {
       reverse_proxy 127.0.0.1:11434
   }
   ```

4. Validate before reloading:
   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   ```
   - If OK → reload:
     ```bash
     sudo systemctl reload caddy
     ```
   - If NOT OK → fix errors, validate again, do not reload until valid.

---

## 4. Safe Ollama / LLM Setup

1. Confirm Docker is installed:
   ```bash
   docker --version
   ```

2. Start new container (only if ollama doesn't exist):
   ```bash
   docker ps -a --format '{{.Names}}' | grep -w ollama || docker run -d \
     --name ollama \
     -p 127.0.0.1:11434:11434 \
     --restart unless-stopped \
     ollama/ollama
   ```

3. Test from the server:
   ```bash
   curl http://127.0.0.1:11434/api/tags
   ```
   - JSON output → ✅ ok.

---

## 5. Safe Scorpion Config

1. Edit `apps/scorpion/.env.local` only:
   ```
   OLLAMA_URL=https://llm.n8ncloud.tech
   ```

2. Restart Scorpion dev server:
   ```bash
   cd apps/scorpion
   pnpm dev
   ```

---

## 6. Verification Steps

1. On KVM2, run:
   ```bash
   cd ~/n8n-cursor  # or wherever your repo is
   ./scripts/verify-setup-safe.sh
   ```

2. On your Mac (inside repo):
   ```bash
   cd apps/scorpion
   ./scripts/verify-remote-llm.sh
   ./scripts/test-concurrency.sh 4
   ```

If all verifications pass, the remote LLM is live, and n8n remains untouched.

---

## 7. Emergency Recovery

If something feels wrong:

1. Check n8n container status:
   ```bash
   docker ps | grep n8n
   ```

2. Check logs:
   ```bash
   docker logs n8n --tail 100
   ```

3. Check DB container (if named postgres or similar):
   ```bash
   docker ps | grep postgres
   docker logs <postgres_container_name> --tail 100
   ```

If n8n is down, do not delete anything. Restart relevant containers instead:
   ```bash
   docker restart n8n
   docker restart <postgres_container_name>
   ```

---

## Quick Reference

| What | Command | Safe? |
|------|---------|-------|
| List containers | `docker ps` | ✅ Safe |
| Start Ollama | `docker run -d --name ollama ...` | ✅ Safe |
| Edit Caddyfile (add) | `sudo nano /etc/caddy/Caddyfile` | ✅ Safe (add only) |
| Validate Caddy | `sudo caddy validate ...` | ✅ Safe |
| Reload Caddy | `sudo systemctl reload caddy` | ✅ Safe |
| Stop n8n | `docker stop n8n` | ❌ DANGEROUS |
| Remove volumes | `docker volume rm ...` | ❌ DANGEROUS |
| System prune | `docker system prune -a` | ❌ DANGEROUS |
