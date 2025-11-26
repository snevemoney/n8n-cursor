# N8N Backup & Restore Procedures

## Overview
This document outlines the comprehensive backup and restore procedures for your business-grade n8n system, including specific fixes for 502 gateway issues.

## Backup Types

### 1. Automatic Hourly Backups
- **Location**: `/home/evens/n8n-cursor/backups/`
- **Frequency**: Every hour via `n8n-auto-backup.timer`
- **Content**: Docker volume data only
- **Retention**: 24 backups (24 hours)

### 2. Comprehensive Manual Backups
- **Script**: `./scripts/comprehensive_backup.sh`
- **Content**: 
  - Complete Docker data
  - Nginx configuration
  - System services
  - Project files
  - System state snapshot
- **Format**: Compressed tar.gz archives
- **Retention**: 10 backups

## Creating Backups

### Quick Data Backup
```bash
./n8n-manager.sh force-backup
```

### Comprehensive System Backup
```bash
./scripts/comprehensive_backup.sh
```

## Restoration Procedures

### 1. Quick Recovery (Data Only)
```bash
./n8n-manager.sh emergency-recovery
```
- Restores from most recent hourly backup
- Quick 2-3 minute process
- May not fix 502 gateway issues

### 2. Comprehensive Restoration (Full System)
```bash
./scripts/comprehensive_restore.sh
```
- Restores complete system state
- Includes 502 gateway fixes
- Takes 5-10 minutes
- Guarantees full functionality

### 3. Restore from Specific Backup
```bash
./scripts/comprehensive_restore.sh /path/to/backup.tar.gz
```

## 502 Gateway Issue Resolution

### The Problem
502 Bad Gateway errors occur when:
- Nginx starts before n8n is ready
- Docker container fails to bind to port 5678
- Service startup order is incorrect
- Network connectivity issues between nginx and n8n

### The Solution
The comprehensive restore script includes a `fix_502_gateway()` function that:

1. **Stops all services in correct order**:
   ```bash
   sudo systemctl stop nginx
   docker-compose down
   sudo pkill -f "n8n"
   sudo pkill -f "docker-proxy.*5678"
   ```

2. **Waits for ports to be released** (10 seconds)

3. **Starts Docker container first**:
   ```bash
   docker-compose up -d
   ```

4. **Waits for n8n to be fully ready** (up to 60 seconds):
   - Tests `http://localhost:5678` repeatedly
   - Only proceeds when n8n responds

5. **Reconfigures nginx with optimized settings**:
   - Proper proxy headers
   - WebSocket support
   - Timeout settings
   - Buffer configurations

6. **Starts nginx only after n8n is confirmed working**

7. **Verifies domain access** (up to 30 seconds)

### Manual 502 Fix
If you encounter 502 gateway errors:

```bash
# Quick fix attempt
sudo systemctl restart nginx

# If that fails, run comprehensive fix
./scripts/comprehensive_restore.sh
```

## Backup Management Commands

### Added to n8n-manager.sh:
```bash
./n8n-manager.sh comprehensive-backup    # Create full system backup
./n8n-manager.sh comprehensive-restore   # Restore from latest backup
./n8n-manager.sh list-backups           # Show available backups
./n8n-manager.sh restore-from <file>    # Restore from specific backup
```

## Verification Procedures

### After Any Restoration:
1. **Check container status**: `docker ps | grep n8n`
2. **Test local access**: `curl http://localhost:5678`
3. **Test domain access**: `curl https://n8ncloud.tech`
4. **Verify business status**: `./n8n-manager.sh business-status`

### Success Indicators:
- ✅ Docker container shows "Up" status
- ✅ Local access returns HTML content (not "Cannot GET /")
- ✅ Domain access returns HTML content (not 502 error)
- ✅ Business status shows all systems active

## Troubleshooting

### If Restoration Fails:

1. **Check Docker status**:
   ```bash
   docker-compose logs
   docker logs n8n-cursor_n8n_1
   ```

2. **Check nginx status**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Check port conflicts**:
   ```bash
   sudo lsof -i :5678
   ```

4. **Manual emergency procedure**:
   ```bash
   # Stop everything
   sudo systemctl stop nginx
   docker-compose down
   sudo pkill -f "n8n"
   
   # Restore from original source
   sudo cp -r /home/n8n/.n8n/* /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
   sudo chown -R 1000:1000 /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
   
   # Start with delays
   docker-compose up -d
   sleep 30
   sudo systemctl start nginx
   ```

## Business Continuity

### Regular Backup Schedule:
- **Hourly**: Automatic data backups
- **Daily**: Comprehensive manual backup before major changes
- **Weekly**: Full system verification and backup cleanup

### Disaster Recovery:
1. Keep comprehensive backups on external storage
2. Document any custom configurations
3. Test restoration procedures monthly
4. Maintain this documentation updated

## Security Notes

- Backups contain sensitive data (API keys, credentials)
- Ensure backup directory permissions are secure: `chmod 700 /home/evens/n8n-cursor/backups`
- Consider encrypting backups for off-site storage
- Never share backup files containing production credentials
