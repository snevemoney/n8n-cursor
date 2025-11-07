# 🔧 Fix: open-webui.local Not Accessible

## Problem
Getting DNS error when accessing `http://open-webui.local/`

## Quick Fix (3 Steps)

### 1. Add /etc/hosts Entry

```bash
sudo sh -c 'echo "127.0.0.1 open-webui.local" >> /etc/hosts'
```

Or run the setup script:
```bash
cd /Users/evenslouis/n8n-cursor
./scripts/setup-local-hosts.sh
```

### 2. Start Docker Desktop

Make sure Docker Desktop is running (check menu bar for whale icon).

### 3. Start Services

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/start-local-services.sh
```

Or manually:
```bash
docker compose -f infra/docker/docker-compose.dev.yml up -d open-webui caddy
```

## Verify It Works

```bash
# Check service is running
docker ps | grep open-webui

# Test direct access (bypasses DNS)
curl http://localhost:3004

# Test via domain (requires /etc/hosts)
curl http://open-webui.local
```

## If Still Not Working

### Option 1: Use localhost:PORT directly
- http://localhost:3004 (works without /etc/hosts)

### Option 2: Check Caddy is running
```bash
docker compose -f infra/docker/docker-compose.dev.yml ps caddy
docker compose -f infra/docker/docker-compose.dev.yml logs caddy
```

### Option 3: Flush DNS cache
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## Full Setup (One Command)

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/complete-local-setup.sh
```

This does everything automatically!

