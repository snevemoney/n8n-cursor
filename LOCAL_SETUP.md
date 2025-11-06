# 🏠 Local Development Setup Guide

This guide will help you set up all local services (n8n, LightningFlow, Open WebUI, AnythingLLM) for development.

## Quick Start

### 1. Setup `/etc/hosts` entries

Run the setup script (requires sudo password):

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/setup-local-hosts.sh
```

Or manually add to `/etc/hosts`:

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

### 2. Start Docker Desktop

Make sure Docker Desktop is running on your Mac.

### 3. Start all services

```bash
cd /Users/evenslouis/n8n-cursor
./scripts/start-local-services.sh
```

Or manually:

```bash
docker compose -f infra/docker/docker-compose.dev.yml up -d --build
```

## Services & URLs

Once started, access services at:

| Service | URL | Description |
|---------|-----|-------------|
| **n8n** | http://n8n.local | Workflow automation |
| **LightningFlow Landing** | http://lightningflow.local | Marketing site |
| **LightningFlow Dashboard** | http://app.lightningflow.local | Customer dashboard |
| **Ops Dashboard** | http://ops.lightningflow.local | Internal admin |
| **API** | http://api.lightningflow.local/healthz | Backend API |
| **Open WebUI** | http://open-webui.local | Local LLM chat interface |
| **AnythingLLM** | http://anythingllm.local | Document chat & RAG |
| **Email (MailHog)** | http://mail.local | Email testing UI |
| **Logs (Dozzle)** | http://logs.local | Docker logs viewer |

## Prerequisites

### Ollama (for Open WebUI)

Open WebUI connects to Ollama for local LLM inference. Install Ollama:

```bash
# macOS
brew install ollama

# Or download from https://ollama.ai
```

Start Ollama:

```bash
ollama serve
```

Ollama runs on `http://localhost:11434` by default. Open WebUI is configured to connect to it automatically.

### Environment Variables

Create `.env.dev` file (if not exists):

```bash
cp env.dev.example .env.dev
```

Edit `.env.dev` with your values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `LNBITS_API_KEY` (optional for Lightning features)
- `WEBUI_SECRET_KEY` (optional, defaults to a placeholder)

## Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker info

# Check service status
docker compose -f infra/docker/docker-compose.dev.yml ps

# View logs
docker compose -f infra/docker/docker-compose.dev.yml logs -f [service-name]
```

### DNS resolution issues

If `.local` domains don't resolve:

1. Verify `/etc/hosts` entries:
   ```bash
   cat /etc/hosts | grep local
   ```

2. Flush DNS cache (macOS):
   ```bash
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   ```

3. Try accessing via `localhost:PORT` instead:
   - n8n: http://localhost:5678
   - Open WebUI: http://localhost:3004
   - AnythingLLM: http://localhost:3005

### Port conflicts

If ports are already in use:

1. Check what's using the port:
   ```bash
   lsof -i :5678  # for n8n
   lsof -i :3004  # for Open WebUI
   ```

2. Stop conflicting services or change ports in `docker-compose.dev.yml`

### Caddy needs sudo (port 80)

If you get permission errors for port 80:

1. Change Caddy port in `docker-compose.dev.yml`:
   ```yaml
   ports:
     - "8080:80"  # instead of "80:80"
   ```

2. Update Caddyfile.dev to use port 8080, or access services directly via their ports

### Open WebUI can't connect to Ollama

1. Make sure Ollama is running:
   ```bash
   ollama serve
   ```

2. Check Ollama is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. Verify Open WebUI container can reach host:
   - The `extra_hosts` configuration should allow `host.docker.internal:host-gateway`
   - If still failing, try `http://host.docker.internal:11434` in Open WebUI settings

## Stopping Services

```bash
# Stop all services
docker compose -f infra/docker/docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes data)
docker compose -f infra/docker/docker-compose.dev.yml down -v
```

## Updating Services

```bash
# Pull latest images and rebuild
docker compose -f infra/docker/docker-compose.dev.yml pull
docker compose -f infra/docker/docker-compose.dev.yml up -d --build
```

## Next Steps

1. **Access Scorpion Dashboard**: http://localhost:3003 (when running `pnpm --filter scorpion run dev`)
2. **Configure n8n**: Set up workflows at http://n8n.local
3. **Set up Open WebUI**: Create account and connect to Ollama
4. **Configure AnythingLLM**: Upload documents and set up RAG

## Integration with Scorpion

Scorpion automatically detects when running locally and shows both:
- **Production links** (always visible): https://n8ncloud.tech, https://lightningflow.online
- **Local links** (only when running locally): http://n8n.local, http://lightningflow.local

This allows you to:
- Keep production URLs unchanged
- Access local versions for development
- Switch between environments seamlessly

