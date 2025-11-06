# 🚀 Installation Guide

## Prerequisites

- **Node.js 20+** with npm/pnpm
- **Docker Desktop** with compose support
- **Git** for version control

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo>
cd n8n-cursor
pnpm install
```

### 2. Environment Configuration

Copy and configure environment files:

```bash
# LightningFlow AI
cp apps/lightningflow/.env.example apps/lightningflow/.env.local

# n8n-cursor (dev tools)
cp apps/n8n-cursor/.env.example apps/n8n-cursor/.env.local
```

### 3. Start Services

```bash
# Start Traefik proxy
make up-proxy

# Start LightningFlow AI
make up-lfa

# Start n8n (optional)
make up-n8n
```

## Environment Variables

### LightningFlow AI (.env.local)

```bash
# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Lightning Network
LIGHTNING_NETWORK="testnet"
```

### n8n-cursor (.env.local)

```bash
# n8n Instance
N8N_BASE_URL="https://your-n8n-instance.com"
N8N_EMAIL="admin@example.com"
N8N_PASSWORD="your-password"

# MCP Configuration
MCP_SERVER_URL="http://localhost:3001"
```

## Development Commands

```bash
# Install dependencies
make i

# Run checks
make check

# Start specific services
make up-lfa      # LightningFlow AI
make up-n8n      # n8n
make up-proxy    # Traefik

# View logs
make logs

# Stop all services
make down
```

## Port Registry

| Service | Port | Purpose |
|---------|------|---------|
| Traefik | 80/443 | Reverse proxy |
| LightningFlow Web | 3080 | Main UI |
| LightningFlow API | 3081 | Backend API |
| n8n UI | 5678 | Workflow editor |
| n8n Webhooks | 5679 | Webhook endpoint |
| PostgreSQL | 5432 | Database |
| Redis | 6380 | Cache/Queue |

## Troubleshooting

### Port Conflicts
```bash
make ports  # Check port availability
```

### Structure Issues
```bash
node tooling/scripts/verify-structure.mjs
```

### Service Health
```bash
docker compose -p lfa ps
docker compose -p n8n ps
```
