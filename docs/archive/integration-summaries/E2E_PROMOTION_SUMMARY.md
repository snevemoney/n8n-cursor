# 🎉 LightningFlow AI - Complete E2E Promotion Pipeline

## ✅ What We've Built

### 🏗️ **Complete Environment Architecture**
```
Local Development → Integration → Staging → Production
     ↓                ↓            ↓          ↓
  lightningflow    int.lightningflow   staging.lightningflow   lightningflow
     .local           .online            .online              .online
```

### 🐳 **Docker Infrastructure for Each Environment**
- **Integration**: `infra/docker/docker-compose.int.yml`
- **Staging**: `infra/docker/docker-compose.staging.yml`
- **Production**: `infra/docker/docker-compose.prod.yml`
- **Local Dev**: `infra/docker/docker-compose.dev.yml`

### 🌐 **Caddy Configurations for Each Environment**
- **Integration**: `infra/caddy/Caddyfile.int`
- **Staging**: `infra/caddy/Caddyfile.staging`
- **Production**: `infra/caddy/Caddyfile.prod`
- **Local Dev**: `infra/caddy/Caddyfile.dev`

### 🔧 **Environment Configuration**
- **Integration**: `env.int.example` → `.env.int`
- **Staging**: `env.staging.example` → `.env.staging`
- **Production**: `env.production.example` → `.env.production`
- **Local Dev**: `env.dev.example` → `.env.dev`

### 🚀 **CI/CD Pipelines**
- **Integration**: `.github/workflows/ci-int.yml` (auto-deploy on `int` branch)
- **Staging**: `.github/workflows/deploy-staging.yml` (deploy + E2E tests on `staging` branch)
- **Production**: `.github/workflows/deploy-prod.yml` (blue/green deploy on `main` branch)

### 📜 **Promotion Scripts**
- **Complete E2E**: `./scripts/promote-e2e.sh` - One command promotion through all environments
- **Individual**: `./scripts/promote-to-int.sh`, `./scripts/promote-to-staging.sh`, `./scripts/promote-to-prod.sh`
- **Rollback**: `./scripts/rollback-prod.sh`
- **Health Checks**: `./scripts/smoke-int.sh`, `./scripts/smoke-staging.sh`, `./scripts/smoke.sh`

## 🎯 **How to Promote Your Local UI to Production**

### **Option 1: Automated E2E Promotion (Recommended)**
```bash
# One command to promote through all environments
./scripts/promote-e2e.sh
```

This will:
1. ✅ Check prerequisites and run local tests
2. 🚀 Promote to Integration and wait for deployment
3. 🧪 Promote to Staging and wait for deployment
4. ⚠️ Ask for confirmation before Production
5. 🎯 Promote to Production and wait for deployment
6. 🏥 Run final health checks on all environments

### **Option 2: Manual Step-by-Step**
```bash
# Step 1: Promote to Integration
./scripts/promote-to-int.sh

# Step 2: Promote to Staging  
./scripts/promote-to-staging.sh

# Step 3: Promote to Production
./scripts/promote-to-prod.sh
```

## 🏗️ **Environment Setup**

### **VPS Setup (One-time)**
```bash
# Upload scripts to VPS
scp scripts/* user@your-vps:~/scripts/

# Set up all environments
./scripts/setup-environments.sh

# Configure environment files
nano .env.int
nano .env.staging
nano .env.production
```

### **Local Development Setup**
```bash
# Set up local development
./scripts/setup-all.sh

# Access your local services
open http://lightningflow.local
open http://app.lightningflow.local
open http://n8n.local
```

## 🔍 **Environment Details**

### **Integration Environment**
- **URL**: `https://int.lightningflow.online`
- **Purpose**: Automated testing and validation
- **Trigger**: Push to `int` branch
- **Features**: Auto-deploy, basic auth, separate data

### **Staging Environment**
- **URL**: `https://staging.lightningflow.online`
- **Purpose**: Pre-production testing and E2E validation
- **Trigger**: Push to `staging` branch
- **Features**: E2E tests, performance tests, basic auth

### **Production Environment**
- **URL**: `https://lightningflow.online`
- **Purpose**: Live production environment
- **Trigger**: Push to `main` branch
- **Features**: Blue/green deployment, health gates, monitoring

## 🏥 **Health Monitoring**

### **Health Check URLs**
```bash
# Integration
curl https://int.lightningflow.online/healthz

# Staging
curl https://staging.lightningflow.online/healthz

# Production
curl https://lightningflow.online/healthz
```

### **Smoke Tests**
```bash
# Integration smoke test
./scripts/smoke-int.sh

# Staging smoke test
./scripts/smoke-staging.sh

# Production smoke test
./scripts/smoke.sh
```

## 🔄 **Rollback Procedures**

### **Production Rollback**
```bash
# Rollback production to previous version
./scripts/rollback-prod.sh
```

### **Manual Rollback**
```bash
# Rollback using blue/green
./scripts/flip_blue.sh

# Check health after rollback
./scripts/smoke.sh
```

## 🚨 **Troubleshooting**

### **502 Bad Gateway**
```bash
# Diagnose the issue
./scripts/diagnose-502.sh

# Auto-fix common issues
./scripts/fix-502.sh
```

### **Health Check Failures**
```bash
# Check service status
docker compose -f infra/docker/docker-compose.prod.yml ps

# Check logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f

# Check Caddy
sudo journalctl -u caddy -f
```

## 🔒 **Security Features**

### **Environment Isolation**
- ✅ Separate Supabase projects for each environment
- ✅ Separate LNbits wallets for each environment
- ✅ Separate Redis instances for each environment
- ✅ Basic auth on staging/integration environments

### **Secrets Management**
- ✅ Environment variables for each stage
- ✅ No secrets in repository
- ✅ CI/CD secrets in GitHub
- ✅ Production secrets secured

## 📊 **Monitoring & Observability**

### **Logs**
```bash
# Container logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f

# Caddy logs
sudo journalctl -u caddy -f

# System logs
sudo journalctl -f
```

### **Metrics**
- **Health endpoints**: `/healthz` on all services
- **Prometheus metrics**: `/api/metrics` on API
- **Queue monitoring**: BullMQ job tracking
- **Performance**: Response times and error rates

## 🎯 **Best Practices**

### **Development**
1. **Always test locally first**
2. **Use feature flags for new features**
3. **Keep commits small and focused**
4. **Write tests for new functionality**

### **Promotion**
1. **Never skip environments**
2. **Always wait for health checks**
3. **Monitor each environment before promoting**
4. **Be ready to rollback quickly**

### **Production**
1. **Monitor closely after deployment**
2. **Have rollback plan ready**
3. **Test critical paths after deployment**
4. **Keep production secrets secure**

## 🆘 **Emergency Procedures**

### **Production Issues**
1. **Immediate rollback**: `./scripts/rollback-prod.sh`
2. **Check health**: `./scripts/smoke.sh`
3. **Monitor logs**: `docker compose logs -f`
4. **Investigate root cause**
5. **Fix and re-deploy**

## 📋 **Quick Reference**

### **Promotion Commands**
```bash
# Complete E2E promotion
./scripts/promote-e2e.sh

# Individual promotions
./scripts/promote-to-int.sh
./scripts/promote-to-staging.sh
./scripts/promote-to-prod.sh

# Rollback
./scripts/rollback-prod.sh
```

### **Health Checks**
```bash
# Integration
./scripts/smoke-int.sh

# Staging
./scripts/smoke-staging.sh

# Production
./scripts/smoke.sh
```

### **Environment URLs**
- **Local**: `http://lightningflow.local`
- **Integration**: `https://int.lightningflow.online`
- **Staging**: `https://staging.lightningflow.online`
- **Production**: `https://lightningflow.online`

## 🎉 **Success!**

You now have a **complete, production-ready E2E promotion pipeline** that:

- ✅ **Promotes your local UI** through all environments to production
- ✅ **Automates testing** and validation at each stage
- ✅ **Provides health monitoring** and rollback capabilities
- ✅ **Ensures security** with environment isolation
- ✅ **Scales reliably** with blue/green deployment
- ✅ **Monitors everything** with comprehensive observability

**Your LightningFlow AI platform is ready for enterprise-scale deployment! 🚀**

---

## 🚀 **Ready to Launch!**

Run this command to promote your local UI to production:

```bash
./scripts/promote-e2e.sh
```

This will take your local changes through Integration → Staging → Production with full testing and validation at each stage!
