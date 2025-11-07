# 🎯 Get Your Local UI Running on lightningflow.online

## 🚀 The Goal
**Go to `https://lightningflow.online` and see your local UI running in production!**

## ✅ What You Now Have

### 🏗️ **Complete Production Infrastructure**
- **Docker Compose**: `infra/docker/docker-compose.prod.yml`
- **Caddy Configuration**: `infra/caddy/Caddyfile.prod`
- **Environment Template**: `env.production.template`
- **Deployment Script**: `./scripts/deploy-to-production.sh`
- **Health Monitoring**: `./scripts/smoke.sh`
- **Rollback Capability**: `./scripts/rollback-prod.sh`

### 🌐 **Production Domains**
- **Landing**: `https://lightningflow.online`
- **Dashboard**: `https://app.lightningflow.online`
- **Ops**: `https://ops.lightningflow.online`
- **n8n**: `https://n8ncloud.tech`

## 🚀 **3 Steps to Production**

### **Step 1: Configure Production Environment**
```bash
# Copy the production template
cp env.production.template .env.production

# Edit with your actual production values
nano .env.production
```

**Fill in these values:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your production Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your production Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Your production Supabase service role key
- `LNBITS_API_KEY` - Your production LNbits wallet key
- `JWT_SECRET` - A secure random string for JWT signing

### **Step 2: Deploy to Production**
```bash
# One command to deploy your local UI to production
./scripts/deploy-to-production.sh
```

### **Step 3: Verify Deployment**
```bash
# Test your production deployment
./scripts/smoke.sh

# Or test manually
curl https://lightningflow.online/healthz
curl https://app.lightningflow.online/healthz
curl https://ops.lightningflow.online/healthz
curl https://n8ncloud.tech/healthz
```

## 🔧 **Prerequisites (One-time Setup)**

### **1. DNS Configuration**
Make sure these domains point to your VPS IP:
- `lightningflow.online` → Your VPS IP
- `app.lightningflow.online` → Your VPS IP
- `ops.lightningflow.online` → Your VPS IP
- `n8ncloud.tech` → Your VPS IP

### **2. Cloudflare Configuration**
- **SSL/TLS Mode**: Full (strict)
- **Proxy Status**: Proxied (orange cloud)
- **Security**: Enable WAF rules

### **3. VPS Setup**
```bash
# On your VPS, make sure you have:
- Docker and Docker Compose installed
- Caddy installed and running
- Ports 80 and 443 open
```

## 🎯 **What Happens When You Deploy**

### **The Deployment Script Will:**
1. ✅ **Build production Docker images** from your local code
2. ✅ **Deploy services** using Docker Compose
3. ✅ **Configure Caddy** for production routing
4. ✅ **Start all services** (landing, web, ops, api, worker, n8n, redis)
5. ✅ **Run health checks** to verify everything is working
6. ✅ **Show you the URLs** where your UI is now accessible

### **After Deployment:**
- **Your landing page** will be at `https://lightningflow.online`
- **Your customer dashboard** will be at `https://app.lightningflow.online`
- **Your internal ops panel** will be at `https://ops.lightningflow.online`
- **Your n8n instance** will be at `https://n8ncloud.tech`

## 🏥 **Health Monitoring**

### **Health Check URLs**
```bash
# Test these to make sure everything is working:
curl https://lightningflow.online/healthz
curl https://app.lightningflow.online/healthz
curl https://ops.lightningflow.online/healthz
curl https://n8ncloud.tech/healthz
```

### **Expected Response**
```json
{
  "ok": true,
  "ts": 1234567890,
  "app": "landing|web|ops|n8n",
  "environment": "production"
}
```

## 🔄 **If Something Goes Wrong**

### **Quick Rollback**
```bash
# Rollback to previous version
./scripts/rollback-prod.sh
```

### **Troubleshooting**
```bash
# Diagnose 502 issues
./scripts/diagnose-502.sh

# Auto-fix common issues
./scripts/fix-502.sh

# Check service status
docker compose -f infra/docker/docker-compose.prod.yml ps

# View logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f
```

## 📊 **Monitor Your Deployment**

### **Check Service Health**
```bash
# Monitor all services
docker compose -f infra/docker/docker-compose.prod.yml ps

# Watch logs in real-time
docker compose -f infra/docker/docker-compose.prod.yml logs -f
```

### **Performance Testing**
```bash
# Quick performance test
npx autocannon -c 20 -d 15 https://lightningflow.online/api/healthz

# Load test
npx autocannon -c 100 -d 60 https://lightningflow.online/api/healthz
```

## 🎉 **Success!**

Once deployment is complete:

1. **Open your browser**
2. **Go to `https://lightningflow.online`**
3. **See your local UI running in production!** 🎉

## 🆘 **Need Help?**

### **Common Issues & Solutions**

#### **502 Bad Gateway**
```bash
./scripts/diagnose-502.sh
./scripts/fix-502.sh
```

#### **Services Not Starting**
```bash
docker compose -f infra/docker/docker-compose.prod.yml logs -f
docker compose -f infra/docker/docker-compose.prod.yml ps
```

#### **Caddy Issues**
```bash
sudo systemctl status caddy
sudo journalctl -u caddy -f
sudo caddy validate --config /etc/caddy/Caddyfile
```

#### **DNS Issues**
- Verify domains point to your VPS IP
- Check Cloudflare SSL/TLS mode is "Full (strict)"
- Wait for DNS propagation (can take up to 24 hours)

---

## 🚀 **Ready to Deploy?**

**Run this command to get your local UI running on `lightningflow.online`:**

```bash
./scripts/deploy-to-production.sh
```

**This will take your local UI and deploy it to production in minutes!** ⚡

---

**🎯 Your goal: Go to `https://lightningflow.online` and see your local UI running in production!**
