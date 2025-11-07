# 🚀 Quick Start - Get Local Services Running

## Current Issue
`open-webui.local` (and other `.local` domains) are not accessible because:
1. ❌ Docker is not running
2. ❌ `/etc/hosts` entries are missing
3. ❌ Services are not started

## Solution - Run These Commands

### Step 1: Add /etc/hosts Entries

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/setup-local-hosts.sh
```

Or manually:
```bash
sudo sh -c 'cat >> /etc/hosts << EOF

# LightningFlow Local Development
127.0.0.1 n8n.local
127.0.0.1 lightningflow.local
127.0.0.1 app.lightningflow.local
127.0.0.1 ops.lightningflow.local
127.0.0.1 api.lightningflow.local
127.0.0.1 open-webui.local
127.0.0.1 anythingllm.local
EOF'
```

### Step 2: Start Docker Desktop

**Important**: Make sure Docker Desktop is running on your Mac before proceeding.

### Step 3: Start All Services

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/start-local-services.sh
```

Or manually:
```bash
docker compose -f infra/docker/docker-compose.dev.yml up -d --build
```

### Step 4: Verify Services

```bash
# Check services are running
docker compose -f infra/docker/docker-compose.dev.yml ps

# Check if services are accessible
curl http://localhost:3004  # Open WebUI
curl http://localhost:3005  # AnythingLLM
curl http://localhost:5678  # n8n
```

### Step 5: Access Services

Once running, access at:
- **Open WebUI**: http://open-webui.local
- **AnythingLLM**: http://anythingllm.local
- **n8n**: http://n8n.local
- **LightningFlow**: http://lightningflow.local

## Troubleshooting

### If Docker won't start:
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Try again

### If /etc/hosts doesn't work:
1. Flush DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```
2. Try accessing via `localhost:PORT` instead:
   - http://localhost:3004 (Open WebUI)
   - http://localhost:3005 (AnythingLLM)

### If services won't start:
```bash
# Check logs
docker compose -f infra/docker/docker-compose.dev.yml logs open-webui
docker compose -f infra/docker/docker-compose.dev.yml logs anythingllm

# Restart services
docker compose -f infra/docker/docker-compose.dev.yml restart
```

## One-Command Setup (After Docker is Running)

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/complete-local-setup.sh
```

This will:
1. ✅ Setup /etc/hosts
2. ✅ Start all services
3. ✅ Verify everything works

