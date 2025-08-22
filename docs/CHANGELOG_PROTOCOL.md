# Protocol Changelog

This document tracks all protocol improvements, fixes, and enhancements applied to the n8n-cursor deployment pipeline.

## 🚀 **Deployment Pipeline Evolution**

### [2025-08-22] **Self-Healing Deploy with Rollback**
- **Issue**: SSH context access warnings, missing environment secrets
- **Fix**: Implemented self-healing deploy.yml with automatic rollback
- **Features Added**:
  - Fail-fast secret validation before deployment
  - Automatic rollback if health check fails after deploy
  - Clear logging with step-by-step progress indicators
  - Health check with 20-second timeout and rollback logic
- **Files Modified**: `.github/workflows/deploy.yml`
- **Health URL**: Configured via `HEALTH_URL` secret in GitHub environments

### [2025-08-22] **Port Management System**
- **Issue**: Unmanaged port forwarding, Cursor/VS Code auto-forwarding random ports
- **Fix**: Created single source of truth for port configuration
- **Features Added**:
  - `config/ports.yaml` - centralized port definitions
  - `scripts/ops/ports-check.sh` - comprehensive port validation
  - `make ports` - port status and conflict detection
  - Automatic port conflict resolution
- **Files Created**: 
  - `config/ports.yaml`
  - `scripts/ops/ports-check.sh`
  - `scripts/ops/ports-manager.sh`

### [2025-08-22] **Disaster Recovery Workflow**
- **Issue**: Complex disaster recovery with undefined contexts
- **Fix**: Simplified to 15-minute health monitoring
- **Features Added**:
  - Automated health checks every 15 minutes
  - Environment-based secret access
  - Simple, reliable monitoring
- **Files Modified**: `.github/workflows/disaster-recovery.yml`

### [2025-08-22] **Repository Structure Guard**
- **Issue**: Repository structure violations, files in wrong locations
- **Fix**: Implemented comprehensive structure validation
- **Features Added**:
  - `make guard` - structure validation
  - Pre-commit hooks for structure enforcement
  - CI pipeline integration
  - Policy-as-code implementation

## 🔧 **Protocol Rules & Standards**

### **Deployment Protocol**
1. **Environment Mapping**: `04-staging` → staging, `main` → production
2. **Secret Validation**: All required secrets must be present before deployment
3. **Health Check**: Deployment fails if health endpoint doesn't return 200
4. **Automatic Rollback**: Unhealthy deployments automatically rollback to previous commit
5. **Logging**: Clear step-by-step progress with emoji indicators

### **Port Management Protocol**
1. **Single Source of Truth**: All ports defined in `config/ports.yaml`
2. **Validation**: `make ports` checks actual vs expected port usage
3. **Conflict Resolution**: Automatic detection and resolution of port conflicts
4. **Development Ports**: Reserved ranges for Cursor/VS Code auto-forwarding

### **Security Protocol**
1. **No Secrets in Code**: All sensitive data via GitHub environment secrets
2. **Environment Isolation**: Staging and production use separate secret sets
3. **SSH Key Management**: Deploy keys with proper permissions (600)
4. **Health Endpoint Protection**: Health checks via HTTPS with proper authentication

## 📋 **Required GitHub Environment Secrets**

### **Both Environments (staging + production)**
| Secret Name | Purpose | Example |
|-------------|---------|---------|
| `SSH_HOST` | VPS IP address | `69.62.66.78` |
| `SSH_USER` | Linux username | `evens` |
| `SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PROJECT_PATH` | Server repo path | `/home/evens/n8n-cursor` |
| `HEALTH_URL` | Health endpoint | `https://n8ncloud.tech/healthz` |

## 🧪 **Validation Commands**

### **Pre-Deployment Validation**
```bash
make guard          # ✅ Repository structure
make doctor         # ✅ System health
make ports          # ✅ Port configuration
```

### **Post-Deployment Validation**
```bash
# Health endpoint should return 200
curl -f https://n8ncloud.tech/healthz

# Services should be running
make status
docker compose ps
```

## 🚨 **Troubleshooting Protocol**

### **Deployment Failures**
1. **Missing Secrets**: Check GitHub environment configuration
2. **SSH Issues**: Verify SSH key permissions and server access
3. **Health Check Failures**: Check service status and nginx configuration
4. **Port Conflicts**: Run `make ports` to identify conflicts

### **Rollback Scenarios**
1. **Automatic Rollback**: Triggered by health check failure
2. **Manual Rollback**: `git reset --hard HEAD~1` on server
3. **Service Recovery**: `DRY_RUN=0 make up` after rollback

## 🔄 **Continuous Improvement**

### **Protocol Updates**
- Every fix should be documented here with date and description
- Include the specific issue, solution, and files modified
- Track any new protocols or standards established

### **Automation Goals**
- [ ] Auto-documentation of deployment failures
- [ ] Slack/email notifications for critical issues
- [ ] Performance metrics collection
- [ ] Automated security scanning

---

**Last Updated**: 2025-08-22  
**Protocol Version**: 2.0  
**Status**: Production Ready ✅
