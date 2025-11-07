# 🚀 LightningFlow Production Deployment Guide

This guide will walk you through deploying the complete production infrastructure for LightningFlow.

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ (your Hostinger VPS at 69.62.66.78)
- Root access to the VPS
- Cloudflare account with `lightningflow.online` domain
- Cloudflare API token with DNS edit permissions

## 🔑 Get Your Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use **Edit zone DNS** template
5. Set **Zone Resources** to `lightningflow.online`
6. Copy the generated token

## 🚀 Quick Deployment (One Command)

### Step 1: SSH into your VPS
```bash
ssh root@srv765579.hstgr.cloud
# or
ssh root@69.62.66.78
```

### Step 2: Download and run the deployment script
```bash
# Download the deployment script
curl -fsSL https://raw.githubusercontent.com/yourusername/n8n-cursor/main/deploy-production.sh -o deploy-production.sh

# Make it executable
chmod +x deploy-production.sh

# Run the deployment
./deploy-production.sh
```

## 🔧 Manual Deployment (Step by Step)

If you prefer to deploy manually or the script fails:

### 1. Update system and install dependencies
```bash
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git jq gettext-base docker.io docker-compose-plugin
```

### 2. Install Caddy
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y && apt-get install -y caddy
```

### 3. Create production directories
```bash
mkdir -p /opt/lightningflow/{n8n,dozzle,code-server}
mkdir -p /var/www/lightningflow
```

### 4. Deploy services
```bash
cd /opt/lightningflow
# Copy the docker-compose.prod.yml file and run:
docker compose -f docker-compose.prod.yml up -d
```

### 5. Configure Caddy
```bash
# Copy the Caddyfile.prod.tpl content to /etc/caddy/Caddyfile
systemctl restart caddy
```

## 🌐 DNS Configuration

After deployment, sync your Cloudflare DNS:

### Option 1: Use the sync script
```bash
# Download and run the DNS sync script
curl -fsSL https://raw.githubusercontent.com/yourusername/n8n-cursor/main/sync-cloudflare-dns.sh -o sync-cloudflare-dns.sh
chmod +x sync-cloudflare-dns.sh
./sync-cloudflare-dns.sh
```

### Option 2: Manual DNS setup
1. Go to Cloudflare → `lightningflow.online` → DNS
2. Add/update these A records:
   - `@` → `69.62.66.78` (proxied ☁️)
   - `www` → `69.62.66.78` (proxied ☁️)
   - `api` → `69.62.66.78` (proxied ☁️)

## 🧪 Verify Deployment

### Check service status
```bash
# Docker services
docker ps

# Caddy status
systemctl status caddy

# Systemd service
systemctl status lf-prod.service
```

### Test endpoints
```bash
# Local endpoints
curl -I http://localhost:5678  # API
curl -I http://localhost:5679  # n8n
curl -I http://localhost:9001  # Logs
curl -I http://localhost:8443  # IDE

# Public endpoints (after DNS sync)
curl -I https://lightningflow.online
curl -I https://n8ncloud.tech
```

## 🔑 Default Credentials

- **n8n**: `admin` / `lightningflow2024`
- **Code Server IDE**: `lightningflow2024`
- **API**: No authentication (configure as needed)

## 📊 Monitoring and Logs

### View service logs
```bash
# Docker logs
docker compose -f /opt/lightningflow/docker-compose.prod.yml logs -f

# Systemd service logs
journalctl -u lf-prod.service -f

# Caddy logs
journalctl -u caddy -f
```

### Check service health
```bash
# Service status
systemctl status lf-prod.service

# Container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Docker services are running: `docker ps`
   - Verify Caddy configuration: `systemctl status caddy`
   - Check service logs: `docker logs <container-name>`

2. **SSL Certificate Issues**
   - Ensure Cloudflare DNS is set to proxied (orange cloud)
   - Check Caddy logs: `journalctl -u caddy -f`
   - Verify domain resolution: `nslookup lightningflow.online`

3. **Service Won't Start**
   - Check Docker daemon: `systemctl status docker`
   - Verify ports aren't in use: `netstat -tlnp`
   - Check disk space: `df -h`

### Reset Everything
```bash
# Stop all services
systemctl stop lf-prod.service
docker compose -f /opt/lightningflow/docker-compose.prod.yml down

# Remove containers and volumes
docker compose -f /opt/lightflow/docker-compose.prod.yml down -v

# Restart fresh
./deploy-production.sh
```

## 🔄 Updates and Maintenance

### Update services
```bash
cd /opt/lightningflow
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Update Caddy
```bash
apt-get update -y && apt-get install -y caddy
systemctl restart caddy
```

### Backup data
```bash
# Backup n8n data
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz /opt/lightningflow/n8n

# Backup code-server data
tar -czf code-server-backup-$(date +%Y%m%d).tar.gz /opt/lightningflow/code-server
```

## 🌟 What You Get

After successful deployment:

- ✅ **Main Site**: `https://lightningflow.online`
- ✅ **API Service**: `https://lightningflow.online/api`
- ✅ **Logs Viewer**: `https://lightningflow.online/logs`
- ✅ **Web IDE**: `https://lightningflow.online/ide`
- ✅ **n8n Workflows**: `https://n8ncloud.tech`
- ✅ **Auto-start on reboot**
- ✅ **Automatic TLS certificates**
- ✅ **DDoS protection via Cloudflare**
- ✅ **Secure localhost-only backend services**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs
3. Verify network connectivity
4. Ensure all prerequisites are met

---

**Happy deploying! 🚀⚡**
