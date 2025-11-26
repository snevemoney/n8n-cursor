# 🚀 Deploy Your Local UI to lightningflow.online

## Quick Start - Get Your Local UI Running in Production

### Option 1: One-Command Deployment (Recommended)
```bash
# Deploy your local UI to production
./scripts/deploy-to-production.sh
```

### Option 2: Manual Step-by-Step Deployment
```bash
# 1. Build production images
docker build -t lfai-landing:prod apps/landing
docker build -t lfai-web:prod apps/lightningflow/web
docker build -t lfai-ops:prod apps/ops
docker build -t lfai-api:prod apps/n8n-cursor/backend

# 2. Deploy to production
docker compose -f infra/docker/docker-compose.prod.yml up -d

# 3. Configure Caddy
sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 4. Test deployment
./scripts/smoke.sh
```

## 🎯 What This Will Give You

After deployment, you'll be able to:

- **Go to `https://lightningflow.online`** and see your landing page
- **Go to `https://app.lightningflow.online`** and see your customer dashboard
- **Go to `https://ops.lightningflow.online`** and see your internal ops panel
- **Go to `https://n8ncloud.tech`** and access your n8n instance

## 🔧 Prerequisites

### 1. Environment Configuration
```bash
# Copy the production template
cp env.production.template .env.production

# Edit with your actual production values
nano .env.production
```

**Required values to fill in:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your production Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your production Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Your production Supabase service role key
- `LNBITS_API_KEY` - Your production LNbits wallet key
- `JWT_SECRET` - A secure random string for JWT signing

### 2. DNS Configuration
Make sure these domains point to your VPS IP:
- `lightningflow.online` → Your VPS IP
- `app.lightningflow.online` → Your VPS IP
- `ops.lightningflow.online` → Your VPS IP
- `n8ncloud.tech` → Your VPS IP

### 3. Cloudflare Configuration
- **SSL/TLS Mode**: Full (strict)
- **Proxy Status**: Proxied (orange cloud)
- **Security**: Enable WAF rules

## 🚀 Deployment Steps

### Step 1: Prepare Your Code
```bash
# Make sure you're on main branch
git checkout main

# Commit any changes
git add .
git commit -m "Deploy to production"

# Push to trigger CI/CD (if configured)
git push origin main
```

### Step 2: Deploy to Production
```bash
# Run the deployment script
./scripts/deploy-to-production.sh
```

### Step 3: Verify Deployment
```bash
# Check if services are running
docker compose -f infra/docker/docker-compose.prod.yml ps

# Test health endpoints
curl https://lightningflow.online/healthz
curl https://app.lightningflow.online/healthz
curl https://ops.lightningflow.online/healthz
curl https://n8ncloud.tech/healthz

# Run full smoke test
./scripts/smoke.sh
```

## 🏥 Health Monitoring

### Health Check URLs
- **Landing**: `https://lightningflow.online/healthz`
- **Dashboard**: `https://app.lightningflow.online/healthz`
- **Ops**: `https://ops.lightningflow.online/healthz`
- **n8n**: `https://n8ncloud.tech/healthz`

### Expected Response
```json
{
  "ok": true,
  "ts": 1234567890,
  "app": "landing|web|ops|n8n",
  "environment": "production"
}
```

## 🔄 Rollback (If Needed)

If something goes wrong:
```bash
# Quick rollback
./scripts/rollback-prod.sh

# Or manual rollback
./scripts/flip_blue.sh
```

## 🚨 Troubleshooting

### 502 Bad Gateway
```bash
# Diagnose the issue
./scripts/diagnose-502.sh

# Auto-fix common issues
./scripts/fix-502.sh
```

### Services Not Starting
```bash
# Check Docker logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f

# Check service status
docker compose -f infra/docker/docker-compose.prod.yml ps

# Restart services
docker compose -f infra/docker/docker-compose.prod.yml restart
```

### Caddy Issues
```bash
# Check Caddy status
sudo systemctl status caddy

# Check Caddy logs
sudo journalctl -u caddy -f

# Validate Caddy config
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
sudo systemctl reload caddy
```

## 📊 Monitoring After Deployment

### 1. Check Service Health
```bash
# Monitor all services
watch -n 5 'docker compose -f infra/docker/docker-compose.prod.yml ps'
```

### 2. Monitor Logs
```bash
# API logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f api

# Worker logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f worker

# n8n logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f n8n
```

### 3. Monitor Performance
```bash
# Quick performance test
npx autocannon -c 20 -d 15 https://lightningflow.online/api/healthz

# Load test
npx autocannon -c 100 -d 60 https://lightningflow.online/api/healthz
```

## 🎉 Success!

Once deployment is complete, you'll have:

- ✅ **Your local UI running at `https://lightningflow.online`**
- ✅ **Customer dashboard at `https://app.lightningflow.online`**
- ✅ **Internal ops panel at `https://ops.lightningflow.online`**
- ✅ **n8n instance at `https://n8ncloud.tech`**
- ✅ **Health monitoring and rollback capabilities**
- ✅ **Production-grade security and performance**

## 🆘 Need Help?

If you encounter issues:

1. **Run diagnostics**: `./scripts/diagnose-502.sh`
2. **Check logs**: `docker compose logs -f`
3. **Verify DNS**: Make sure domains point to your VPS
4. **Check Cloudflare**: Ensure SSL/TLS mode is "Full (strict)"
5. **Rollback if needed**: `./scripts/rollback-prod.sh`

---

**🚀 Your local UI is now ready to go live on `lightningflow.online`!**
