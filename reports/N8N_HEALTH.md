# n8n Health Report

## Overview
**Status**: 🔍 Needs investigation via n8n-mcp  
**Last Updated**: $(date)  
**Report Type**: Template (requires n8n-mcp data)

## Instance Information

### Basic Details
| Item | Status | Notes |
|------|--------|-------|
| n8n URL | ❓ TBD | Check if accessible |
| n8n Version | ❓ TBD | Current version |
| Instance Status | ❓ TBD | Running/stopped/error |
| Database Connection | ❓ TBD | PostgreSQL status |

### Container Status
| Service | Status | Port | Health |
|---------|--------|------|--------|
| n8n | ❓ TBD | 5678 | ❓ TBD |
| postgres | ❓ TBD | 5432 | ❓ TBD |

## Workflow Analysis

### Workflow Count
**Total Workflows**: 61 (from local validation)  
**Valid JSON**: ✅ 61/61  
**Duplicate Detection**: 🔍 Needs n8n-mcp validation

### Workflow Categories
| Category | Count | Status |
|----------|-------|--------|
| AI/ML | 15+ | ✅ Valid |
| Webhooks | 2 | ✅ Valid |
| Agency Operations | 2 | ✅ Valid |
| Knowledge Chatbots | 2 | ✅ Valid |
| Custom Models | 2 | ✅ Valid |
| Content Team | 4 | ✅ Valid |
| Marketplace | 2 | ✅ Valid |
| Enhanced | 2 | ✅ Valid |
| Imported | 15+ | ✅ Valid |

### Workflow Health
| Metric | Status | Details |
|--------|--------|---------|
| JSON Validation | ✅ Pass | All 61 workflows valid |
| Duplicate Detection | 🔍 TBD | Needs n8n-mcp |
| Execution Status | 🔍 TBD | Needs n8n-mcp |
| Error Rate | 🔍 TBD | Needs n8n-mcp |

## System Health

### Resource Usage
| Resource | Status | Details |
|----------|--------|---------|
| CPU Usage | 🔍 TBD | Needs monitoring |
| Memory Usage | 🔍 TBD | Needs monitoring |
| Disk Space | 🔍 TBD | Needs monitoring |
| Network I/O | 🔍 TBD | Needs monitoring |

### Service Health
| Service | Status | Last Check | Issues |
|---------|--------|------------|---------|
| n8n API | 🔍 TBD | Never | Unknown |
| Database | 🔍 TBD | Never | Unknown |
| Webhooks | 🔍 TBD | Never | Unknown |
| Cron Jobs | 🔍 TBD | Never | Unknown |

## Configuration Status

### Docker Compose
**File**: `infra/docker/docker-compose.yml`  
**Status**: ✅ Configured

| Setting | Value | Status |
|---------|-------|--------|
| n8n Port | 5678 | ✅ Configured |
| Database Port | 5432 | ✅ Configured |
| Authentication | Basic Auth | ✅ Enabled |
| Database Type | PostgreSQL | ✅ Configured |

### Environment Variables
| Variable | Status | Notes |
|----------|--------|-------|
| N8N_BASIC_AUTH_ACTIVE | ✅ Set | Basic auth enabled |
| N8N_BASIC_AUTH_USER | ✅ Set | admin |
| N8N_BASIC_AUTH_PASSWORD | ⚠️ Default | changeme (needs change) |
| DB_TYPE | ✅ Set | postgresdb |
| DB_POSTGRESDB_HOST | ✅ Set | postgres |

## Issues and Recommendations

### 🔴 Critical Issues
1. **Default Passwords**
   - n8n admin password: `changeme`
   - PostgreSQL password: `n8n`
   - **Action**: Change immediately

2. **Health Monitoring**
   - No active health checks
   - No performance monitoring
   - **Action**: Implement monitoring

### 🟡 High Priority
1. **Instance Validation**
   - n8n instance status unknown
   - Database connectivity untested
   - **Action**: Test connectivity

2. **Workflow Management**
   - Duplicate detection needed
   - Execution monitoring needed
   - **Action**: Enable n8n-mcp

### 🟢 Medium Priority
1. **Performance Optimization**
   - Resource usage unknown
   - Scaling configuration needed
   - **Action**: Monitor and optimize

2. **Backup Strategy**
   - Workflow backup needed
   - Database backup needed
   - **Action**: Implement backup

## Required Actions

### Immediate (Today)
1. **Test n8n Connectivity**
   ```bash
   # Check if n8n is running
   curl -u admin:changeme http://localhost:5678/healthz
   
   # Check database connection
   docker exec n8n-postgres pg_isready
   ```

2. **Change Default Passwords**
   ```bash
   # Set secure passwords
   export N8N_BASIC_AUTH_PASSWORD="secure_password_123"
   export DB_POSTGRESDB_PASSWORD="secure_db_password_456"
   
   # Restart services
   DRY_RUN=0 make restart
   ```

### This Week
1. **Enable n8n-mcp Integration**
   - Configure n8n-mcp tool
   - Test workflow validation
   - Enable duplicate detection

2. **Implement Monitoring**
   - Set up health checks
   - Configure alerts
   - Monitor resource usage

### This Month
1. **Performance Optimization**
   - Analyze workflow performance
   - Optimize resource usage
   - Implement scaling

2. **Backup Strategy**
   - Automated workflow backup
   - Database backup
   - Disaster recovery plan

## n8n-mcp Integration

### Required Setup
**Status**: 🔍 Needs configuration

| Component | Status | Notes |
|-----------|--------|-------|
| n8n-mcp Server | ❓ TBD | Check if enabled |
| Authentication | ❓ TBD | API key setup |
| Workflow Access | ❓ TBD | Read permissions |
| Health Checks | ❓ TBD | Monitoring access |

### Expected Capabilities
1. **Workflow Management**
   - List all workflows
   - Validate workflow JSON
   - Detect duplicates
   - Monitor execution

2. **System Health**
   - Instance status
   - Resource usage
   - Error monitoring
   - Performance metrics

3. **Configuration**
   - Environment variables
   - Database settings
   - Authentication status
   - Service configuration

## Monitoring Commands

### Local Health Check
```bash
# Check container status
make status

# Check logs
make logs

# Run health check
make doctor

# Validate workflows
make wf-validate
```

### n8n API Check
```bash
# Health endpoint
curl -u admin:changeme http://localhost:5678/healthz

# Workflows endpoint
curl -u admin:changeme http://localhost:5678/api/v1/workflows

# Database status
curl -u admin:changeme http://localhost:5678/api/v1/health
```

## Next Steps

### 1. Enable n8n-mcp
- Verify n8n-mcp tool availability
- Configure authentication
- Test basic connectivity

### 2. Populate Report
- Run health checks via n8n-mcp
- Update status information
- Identify actual issues

### 3. Implement Fixes
- Resolve critical issues
- Set up monitoring
- Optimize performance

---
*Generated by Discovery & Context Harvest process*  
*Note: This report requires n8n-mcp integration for complete data*
