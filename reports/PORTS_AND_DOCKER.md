# Ports and Docker Report

## Overview
**Status**: 🔍 Configuration analyzed, runtime status needs verification  
**Last Updated**: $(date)  
**Docker Compose**: ✅ Configured in infra/docker/

## Port Configuration

### Expected Ports (from docker-compose.yml)
| Port | Service | Purpose | Status |
|------|---------|---------|--------|
| 5678 | n8n | Workflow automation platform | 🔍 Needs verification |
| 5432 | PostgreSQL | Database backend | 🔍 Needs verification |

### Standard Ports (expected)
| Port | Service | Purpose | Status |
|------|---------|---------|--------|
| 22 | SSH | Secure shell access | 🔍 Needs verification |
| 80 | HTTP | Web server | 🔍 Needs verification |
| 443 | HTTPS | Secure web server | 🔍 Needs verification |

## Docker Services

### 1. n8n Service
**File**: `infra/docker/docker-compose.yml`  
**Status**: ✅ Configured

| Setting | Value | Notes |
|---------|-------|-------|
| Image | n8nio/n8n:latest | Latest stable version |
| Container Name | n8n | Easy identification |
| Port Mapping | 5678:5678 | Host:Container |
| Restart Policy | unless-stopped | Auto-restart on failure |
| Authentication | Basic Auth | Username: admin |

**Environment Variables**:
- `N8N_BASIC_AUTH_ACTIVE=true`
- `N8N_BASIC_AUTH_USER=admin`
- `N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-changeme}`
- `DB_TYPE=postgresdb`
- `DB_POSTGRESDB_HOST=postgres`
- `DB_POSTGRESDB_PORT=5432`
- `DB_POSTGRESDB_DATABASE=n8n`
- `DB_POSTGRESDB_USER=n8n`
- `DB_POSTGRESDB_PASSWORD=${DB_POSTGRESDB_PASSWORD:-n8n}`

### 2. PostgreSQL Service
**File**: `infra/docker/docker-compose.yml`  
**Status**: ✅ Configured

| Setting | Value | Notes |
|---------|-------|-------|
| Image | postgres:15 | PostgreSQL 15 |
| Container Name | n8n-postgres | Easy identification |
| Port Mapping | 5432:5432 | Host:Container |
| Restart Policy | unless-stopped | Auto-restart on failure |
| Database | n8n | Dedicated database |

**Environment Variables**:
- `POSTGRES_DB=n8n`
- `POSTGRES_USER=n8n`
- `POSTGRES_PASSWORD=${DB_POSTGRESDB_PASSWORD:-n8n}`

### 3. Additional Compose Files
**Status**: 🔍 Multiple configurations available

| File | Purpose | Status |
|------|---------|--------|
| `docker-compose.yml` | Main configuration | ✅ Active |
| `docker-compose-smart.yml` | Enhanced features | 🔍 Available |
| `docker-compose-isolated.yml` | Isolated deployment | 🔍 Available |
| `docker-compose.yml.backup` | Backup configuration | 🔍 Available |

## Port Conflicts and Issues

### Known Issues
1. **Default Passwords**
   - n8n: `changeme`
   - PostgreSQL: `n8n`
   - **Risk**: Security vulnerability
   - **Action**: Change immediately

2. **Port Exposure**
   - n8n port 5678 exposed to host
   - PostgreSQL port 5432 exposed to host
   - **Risk**: Potential external access
   - **Action**: Consider internal networking

### Potential Conflicts
| Port | Potential Conflict | Risk Level |
|------|-------------------|------------|
| 80 | Web server (nginx/apache) | Medium |
| 443 | HTTPS server | Medium |
| 5432 | Other PostgreSQL instances | High |
| 5678 | Other n8n instances | Medium |

## Docker Compose Status

### Current Status
**Command**: `make status`  
**Status**: 🔍 Needs verification

### Expected Output
```bash
# Expected container status
Name                Command               State           Ports
--------------------------------------------------------------------------------
n8n                docker-entrypoint.sh   Up      0.0.0.0:5678->5678/tcp
n8n-postgres       postgres              Up      0.0.0.0:5432->5432/tcp
```

### Health Checks
| Service | Health Endpoint | Expected Response |
|---------|-----------------|-------------------|
| n8n | http://localhost:5678/healthz | 200 OK |
| PostgreSQL | docker exec n8n-postgres pg_isready | accepting connections |

## Network Configuration

### Default Network
**Type**: Bridge network  
**Name**: n8n-cursor_default  
**Subnet**: 172.x.x.x/16 (Docker default)

### Port Bindings
| Service | Internal Port | External Port | Protocol |
|---------|---------------|---------------|----------|
| n8n | 5678 | 5678 | TCP |
| PostgreSQL | 5432 | 5432 | TCP |

### Volume Mounts
| Service | Host Path | Container Path | Purpose |
|---------|-----------|----------------|---------|
| n8n | n8n_data | /home/node/.n8n | Workflow data |
| PostgreSQL | postgres_data | /var/lib/postgresql/data | Database files |

## Security Considerations

### 🔴 Critical
1. **Default Passwords**
   ```bash
   # Change immediately
   export N8N_BASIC_AUTH_PASSWORD="secure_password_123"
   export DB_POSTGRESDB_PASSWORD="secure_db_password_456"
   ```

2. **Port Exposure**
   - Consider using internal Docker network
   - Restrict external access to necessary ports only

### 🟡 High Priority
1. **Container Isolation**
   - Ensure containers can't access host system
   - Use read-only root filesystem where possible

2. **Resource Limits**
   - Set memory and CPU limits
   - Prevent resource exhaustion attacks

### 🟢 Medium Priority
1. **Image Security**
   - Use specific image versions (not latest)
   - Regular security updates
   - Vulnerability scanning

2. **Logging and Monitoring**
   - Container log rotation
   - Security event monitoring
   - Performance metrics

## Troubleshooting

### Common Issues
1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :5678
   sudo ss -tlnp | grep :5678
   
   # Stop conflicting service
   sudo systemctl stop conflicting-service
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker logs n8n
   docker logs n8n-postgres
   
   # Check container status
   docker ps -a
   ```

3. **Connection Refused**
   ```bash
   # Test connectivity
   curl -v http://localhost:5678
   telnet localhost 5432
   
   # Check firewall
   sudo ufw status
   ```

### Debug Commands
```bash
# Check Docker status
docker ps
docker ps -a

# Check container logs
docker logs n8n
docker logs n8n-postgres

# Check port bindings
docker port n8n
docker port n8n-postgres

# Check network
docker network ls
docker network inspect n8n-cursor_default
```

## Next Steps

### Immediate (Today)
1. **Verify Service Status**
   ```bash
   make status
   docker ps
   ```

2. **Change Default Passwords**
   ```bash
   export N8N_BASIC_AUTH_PASSWORD="secure_password_123"
   export DB_POSTGRESDB_PASSWORD="secure_db_password_456"
   DRY_RUN=0 make restart
   ```

3. **Test Connectivity**
   ```bash
   curl -u admin:secure_password_123 http://localhost:5678/healthz
   docker exec n8n-postgres pg_isready
   ```

### This Week
1. **Security Hardening**
   - Implement internal networking
   - Set resource limits
   - Configure logging

2. **Monitoring Setup**
   - Health check automation
   - Performance monitoring
   - Alert configuration

### This Month
1. **Production Readiness**
   - Load balancing setup
   - Backup configuration
   - Disaster recovery plan

2. **Optimization**
   - Performance tuning
   - Resource optimization
   - Scaling preparation

## Commands Reference

### Docker Compose
```bash
# Start services
make up
DRY_RUN=0 make up

# Stop services
make down
DRY_RUN=0 make down

# Restart services
make restart
DRY_RUN=0 make restart

# Check status
make status

# View logs
make logs
```

### Docker Direct
```bash
# Container management
docker start n8n n8n-postgres
docker stop n8n n8n-postgres
docker restart n8n n8n-postgres

# Port checking
docker port n8n
docker port n8n-postgres

# Network inspection
docker network ls
docker network inspect n8n-cursor_default
```

---
*Generated by Discovery & Context Harvest process*
