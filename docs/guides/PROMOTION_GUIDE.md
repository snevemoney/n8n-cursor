# 🚀 LightningFlow AI - Complete E2E Promotion Guide

## Overview

This guide walks you through promoting your local UI changes through all environments to production using our complete E2E promotion pipeline.

## 🏗️ Environment Architecture

```
Local Development → Integration → Staging → Production
     ↓                ↓            ↓          ↓
  lightningflow    int.lightningflow   staging.lightningflow   lightningflow
     .local           .online            .online              .online
```

## 🎯 Promotion Flow

### 1. **Local Development** (`lightningflow.local`)
- **Purpose**: Development and testing
- **Access**: `http://lightningflow.local`
- **Setup**: `./scripts/setup-all.sh`

### 2. **Integration** (`int.lightningflow.online`)
- **Purpose**: Automated testing and validation
- **Access**: `https://int.lightningflow.online`
- **Trigger**: Push to `int` branch
- **CI**: Auto-deploy with tests

### 3. **Staging** (`staging.lightningflow.online`)
- **Purpose**: Pre-production testing and E2E validation
- **Access**: `https://staging.lightningflow.online`
- **Trigger**: Push to `staging` branch
- **CI**: Deploy + E2E tests + Performance tests

### 4. **Production** (`lightningflow.online`)
- **Purpose**: Live production environment
- **Access**: `https://lightningflow.online`
- **Trigger**: Push to `main` branch
- **CI**: Blue/green deployment with health gates

## 🚀 Quick Start - Complete E2E Promotion

### Option 1: Automated E2E Promotion (Recommended)
```bash
# One command to promote through all environments
./scripts/promote-e2e.sh
```

This script will:
1. ✅ Check prerequisites and run local tests
2. 🚀 Promote to Integration and wait for deployment
3. 🧪 Promote to Staging and wait for deployment
4. ⚠️ Ask for confirmation before Production
5. 🎯 Promote to Production and wait for deployment
6. 🏥 Run final health checks on all environments

### Option 2: Manual Step-by-Step Promotion
```bash
# Step 1: Promote to Integration
./scripts/promote-to-int.sh

# Step 2: Promote to Staging
./scripts/promote-to-staging.sh

# Step 3: Promote to Production
./scripts/promote-to-prod.sh
```

## 🔧 Environment Setup

### VPS Setup (One-time)
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

### Local Development Setup
```bash
# Set up local development
./scripts/setup-all.sh

# Access your local services
open http://lightningflow.local
open http://app.lightningflow.local
open http://n8n.local
```

## 📋 Promotion Checklist

### Before Starting
- [ ] All local tests pass (`pnpm test`)
- [ ] No uncommitted changes (`git status`)
- [ ] Environment files configured (`.env.int`, `.env.staging`, `.env.production`)
- [ ] DNS configured for all domains
- [ ] CI/CD secrets configured in GitHub

### Integration Promotion
- [ ] Push to `int` branch
- [ ] Monitor CI: GitHub Actions
- [ ] Check health: `https://int.lightningflow.online/healthz`
- [ ] Test functionality: `https://int.lightningflow.online`

### Staging Promotion
- [ ] Integration is healthy
- [ ] Push to `staging` branch
- [ ] Monitor CI: GitHub Actions
- [ ] Check health: `https://staging.lightningflow.online/healthz`
- [ ] Run E2E tests
- [ ] Test functionality: `https://staging.lightningflow.online`

### Production Promotion
- [ ] Staging is healthy
- [ ] E2E tests pass
- [ ] Push to `main` branch
- [ ] Monitor CI: GitHub Actions
- [ ] Check health: `https://lightningflow.online/healthz`
- [ ] Monitor production for issues
- [ ] Be ready to rollback if needed

## 🏥 Health Monitoring

### Health Check URLs
```bash
# Integration
curl https://int.lightningflow.online/healthz

# Staging
curl https://staging.lightningflow.online/healthz

# Production
curl https://lightningflow.online/healthz
```

### Smoke Tests
```bash
# Integration smoke test
./scripts/smoke-int.sh

# Staging smoke test
./scripts/smoke-staging.sh

# Production smoke test
./scripts/smoke.sh
```

## 🔄 Rollback Procedures

### Production Rollback
```bash
# Rollback production to previous version
./scripts/rollback-prod.sh
```

### Manual Rollback
```bash
# Rollback using blue/green
./scripts/flip_blue.sh

# Check health after rollback
./scripts/smoke.sh
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **502 Bad Gateway**
```bash
# Diagnose the issue
./scripts/diagnose-502.sh

# Auto-fix common issues
./scripts/fix-502.sh
```

#### 2. **CI/CD Failures**
- Check GitHub Actions logs
- Verify environment variables
- Check Docker image builds
- Verify secrets are configured

#### 3. **Health Check Failures**
```bash
# Check service status
docker compose -f infra/docker/docker-compose.prod.yml ps

# Check logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f

# Check Caddy
sudo journalctl -u caddy -f
```

#### 4. **DNS Issues**
- Verify DNS records point to VPS
- Check Cloudflare SSL/TLS mode is "Full (strict)"
- Verify domain propagation

## 📊 Monitoring & Observability

### Logs
```bash
# Container logs
docker compose -f infra/docker/docker-compose.prod.yml logs -f

# Caddy logs
sudo journalctl -u caddy -f

# System logs
sudo journalctl -f
```

### Metrics
- **Health endpoints**: `/healthz` on all services
- **Prometheus metrics**: `/api/metrics` on API
- **Queue monitoring**: BullMQ job tracking
- **Performance**: Response times and error rates

## 🔒 Security Considerations

### Environment Isolation
- ✅ Separate Supabase projects for each environment
- ✅ Separate LNbits wallets for each environment
- ✅ Separate Redis instances for each environment
- ✅ Basic auth on staging/integration environments

### Secrets Management
- ✅ Environment variables for each stage
- ✅ No secrets in repository
- ✅ CI/CD secrets in GitHub
- ✅ Production secrets secured

## 📈 Performance Monitoring

### Key Metrics
- **Response Time**: < 200ms for health checks
- **Error Rate**: < 1% for production
- **Uptime**: > 99.9% for production
- **Queue Depth**: Monitor BullMQ job queues

### Performance Tests
```bash
# Quick performance test
npx autocannon -c 20 -d 15 https://lightningflow.online/api/healthz

# Load test
npx autocannon -c 100 -d 60 https://lightningflow.online/api/healthz
```

## 🎯 Best Practices

### Development
1. **Always test locally first**
2. **Use feature flags for new features**
3. **Keep commits small and focused**
4. **Write tests for new functionality**

### Promotion
1. **Never skip environments**
2. **Always wait for health checks**
3. **Monitor each environment before promoting**
4. **Be ready to rollback quickly**

### Production
1. **Monitor closely after deployment**
2. **Have rollback plan ready**
3. **Test critical paths after deployment**
4. **Keep production secrets secure**

## 🆘 Emergency Procedures

### Production Issues
1. **Immediate rollback**: `./scripts/rollback-prod.sh`
2. **Check health**: `./scripts/smoke.sh`
3. **Monitor logs**: `docker compose logs -f`
4. **Investigate root cause**
5. **Fix and re-deploy**

### Contact Information
- **GitHub Issues**: [Create Issue](https://github.com/yourorg/n8n-cursor/issues)
- **Monitoring**: Check health endpoints
- **Logs**: Docker and Caddy logs

---

## 🎉 Success!

Once you've completed the E2E promotion, you'll have:

- ✅ **Local development** with friendly domains
- ✅ **Integration environment** for automated testing
- ✅ **Staging environment** for pre-production validation
- ✅ **Production environment** with blue/green deployment
- ✅ **Complete monitoring** and health checks
- ✅ **Rollback capabilities** for quick recovery

**Your LightningFlow AI platform is now running across all environments! 🚀**
