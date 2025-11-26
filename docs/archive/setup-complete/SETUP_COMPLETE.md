# ✅ Setup Complete - Local Development Ready

## 🎉 What's Been Set Up

### ✅ Local Infrastructure
- **n8n**: http://n8n.local (port 5678)
- **LightningFlow Landing**: http://lightningflow.local (port 3000)
- **LightningFlow Dashboard**: http://app.lightningflow.local (port 3001)
- **Ops Dashboard**: http://ops.lightningflow.local (port 3002)
- **API**: http://api.lightningflow.local (port 4000)
- **Open WebUI**: http://open-webui.local (port 3004)
- **AnythingLLM**: http://anythingllm.local (port 3005)
- **Email (MailHog)**: http://mail.local (port 8025)
- **Logs (Dozzle)**: http://logs.local (port 7000)

### ✅ Production Sync System
- **API-based sync**: `scripts/sync-n8n-via-api.sh`
- **File-based sync**: `scripts/sync-production-to-local.sh`
- **Complete setup**: `scripts/complete-local-setup.sh`

### ✅ Configuration Files
- `infra/docker/docker-compose.dev.yml` - All services configured
- `infra/caddy/Caddyfile.dev` - All local domains routed
- `scripts/setup-local-hosts.sh` - /etc/hosts setup
- `scripts/start-local-services.sh` - Service startup

## 🚀 Quick Start

### Option 1: Complete Setup (One Command)

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/complete-local-setup.sh
```

This will:
1. ✅ Setup /etc/hosts entries
2. ✅ Start all Docker services
3. ✅ Verify everything is working

### Option 2: Step by Step

```bash
# 1. Setup local domains
./scripts/setup-local-hosts.sh

# 2. Start services
./scripts/start-local-services.sh

# 3. Sync production data (optional)
export PROD_N8N_API_KEY='your-key'
./scripts/sync-n8n-via-api.sh
```

## 📋 Prerequisites

1. **Docker Desktop**: Must be running
2. **Ollama** (for Open WebUI): Optional but recommended
   ```bash
   brew install ollama
   ollama serve
   ```
3. **Environment Variables**: Create `.env.dev` from `env.dev.example`

## 🔄 Syncing Production Data

### Method 1: API Sync (Recommended)

```bash
# Get API key from https://n8ncloud.tech → Settings → API
export PROD_N8N_API_KEY='your-api-key'

# Sync workflows
./scripts/sync-n8n-via-api.sh
```

### Method 2: Manual Export/Import

1. Export from production: https://n8ncloud.tech → Workflows → Export
2. Import to local: http://n8n.local → Workflows → Import

## 🎯 What's Next?

### 1. Start Services

```bash
./scripts/complete-local-setup.sh
```

### 2. Access Services

- **Scorpion Dashboard**: http://localhost:3003 (when running `pnpm --filter scorpion run dev`)
- **n8n**: http://n8n.local
- **LightningFlow**: http://lightningflow.local
- **Open WebUI**: http://open-webui.local
- **AnythingLLM**: http://anythingllm.local

### 3. Sync Production (Optional)

```bash
# Sync n8n workflows from production
export PROD_N8N_API_KEY='your-key'
./scripts/sync-n8n-via-api.sh
```

### 4. Configure Credentials

After syncing workflows, set up credentials in local n8n:
- Use **development/test** API keys (never production!)
- Go to http://n8n.local → Settings → Credentials

## 📚 Documentation

- **Local Setup**: `LOCAL_SETUP.md`
- **Production Sync**: `PRODUCTION_SYNC.md`
- **Access Guide**: `ACCESS_GUIDE.md`

## 🔍 Verification

Check everything is working:

```bash
# Verify setup
./scripts/verify-local-setup.sh

# Check service status
docker compose -f infra/docker/docker-compose.dev.yml ps

# View logs
docker compose -f infra/docker/docker-compose.dev.yml logs -f
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check ports are available
lsof -i :5678  # n8n
lsof -i :3004  # Open WebUI
```

### DNS Issues (.local domains)

```bash
# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Or use localhost:PORT directly
http://localhost:5678  # n8n
```

### Open WebUI Can't Connect to Ollama

1. Make sure Ollama is running: `ollama serve`
2. Check Ollama is accessible: `curl http://localhost:11434/api/tags`
3. Open WebUI should auto-detect it

## ✨ Features

- ✅ **Production URLs Unchanged**: n8ncloud.tech and lightningflow.online work as before
- ✅ **Local Development**: Full local stack with all services
- ✅ **Production Sync**: Safe, read-only sync from production
- ✅ **Automatic Backups**: All syncs create backups
- ✅ **Scorpion Integration**: Shows both production and local links

## 🎊 You're All Set!

Everything is configured and ready. Just run:

```bash
./scripts/complete-local-setup.sh
```

Then access your services at the `.local` domains!

