# Production Infrastructure

This directory contains the production infrastructure setup for LightningFlow.

## Quick Start

1. **Copy environment file:**
   ```bash
   cp infra/env/env.production.example infra/env/env.production
   ```

2. **Edit environment file:**
   - Add your Cloudflare API token
   - Verify VPS IP and upstream ports
   - Set strong passwords

3. **Bootstrap production:**
   ```bash
   make prod-bootstrap
   ```

4. **Check health:**
   ```bash
   make prod-health
   ```

## What Gets Deployed

- **Caddy** - Reverse proxy with automatic TLS
- **n8n** - Production workflow automation
- **Dozzle** - Docker logs viewer
- **Code Server** - Web-based IDE
- **Systemd service** - Auto-start on reboot

## Services

- `https://lightningflow.online` → Main application
- `https://lightningflow.online/api` → API service
- `https://lightningflow.online/logs` → Docker logs
- `https://lightningflow.online/ide` → Web IDE
- `https://n8ncloud.tech` → n8n workflow editor

## Commands

- `make prod-bootstrap` - Full production setup
- `make prod-health` - Health checks
- `make prod-down` - Stop production stack

## Security

- All services bind to localhost only
- Caddy handles TLS termination
- Cloudflare provides DDoS protection
- Strong passwords required for services
