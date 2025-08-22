# Backup & Recovery Guide

## Overview

This guide covers backup and recovery procedures for the n8n-cursor project, including repository data, database, and n8n workflows.

## Backup Types

### 1. Repository Backup
**Frequency**: Daily  
**Command**: `DRY_RUN=0 make backup`  
**Location**: `backups/repo/`  
**Retention**: 30 days  

Creates a compressed archive of the entire repository excluding:
- `node_modules/`
- `logs/`
- `backups/`
- Temporary files

### 2. Database Backup
**Frequency**: Daily  
**Command**: `DRY_RUN=0 make db-backup`  
**Location**: `backups/db/`  
**Retention**: 7 days  

Creates a compressed PostgreSQL dump of the n8n database including:
- All tables and data
- Sequences and indexes
- User permissions

### 3. n8n Workflows Backup
**Frequency**: Daily  
**Command**: `DRY_RUN=0 make n8n-backup`  
**Location**: `backups/n8n/`  
**Retention**: 30 days  

Exports all workflow JSON files with metadata:
- Workflow definitions
- Export timestamp
- Validation status

## Automated Backup Schedule

### Using Systemd Timers

Create systemd timer units for automated backups:

#### 1. Database Backup Timer

```bash
# /etc/systemd/system/n8n-db-backup.service
[Unit]
Description=n8n Database Backup
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/n8n-cursor
Environment=DRY_RUN=0
ExecStart=/usr/bin/make db-backup
```

```bash
# /etc/systemd/system/n8n-db-backup.timer
[Unit]
Description=Run n8n database backup daily
Requires=n8n-db-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

#### 2. n8n Workflows Backup Timer

```bash
# /etc/systemd/system/n8n-workflows-backup.service
[Unit]
Description=n8n Workflows Backup
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/n8n-cursor
Environment=DRY_RUN=0
ExecStart=/usr/bin/make n8n-backup
```

```bash
# /etc/systemd/system/n8n-workflows-backup.timer
[Unit]
Description=Run n8n workflows backup daily
Requires=n8n-workflows-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

#### 3. Enable Timers

```bash
sudo systemctl enable n8n-db-backup.timer
sudo systemctl enable n8n-workflows-backup.timer
sudo systemctl start n8n-db-backup.timer
sudo systemctl start n8n-workflows-backup.timer

# Check status
sudo systemctl list-timers | grep n8n
```

## Recovery Procedures

### Database Recovery

1. **Stop n8n service** (to prevent data corruption):
   ```bash
   docker stop n8n
   ```

2. **Restore from backup**:
   ```bash
   export MASTER_UNLOCK="your_encryption_key"
   DRY_RUN=0 make db-restore FILE="backups/db/n8n_backup_YYYYMMDD_HHMMSS.sql.gz"
   ```

3. **Verify restoration**:
   ```bash
   make health
   ```

### Complete System Recovery

1. **Fresh server setup**:
   ```bash
   git clone https://github.com/your-org/n8n-cursor.git
   cd n8n-cursor
   git checkout main
   ```

2. **Restore repository backup** (if needed):
   ```bash
   # Extract backup to temporary location
   tar -xzf backups/repo/repo_backup_YYYYMMDD.tar.gz -C /tmp/
   
   # Copy specific files/directories as needed
   ```

3. **Restore database**:
   ```bash
   export MASTER_UNLOCK="your_encryption_key"
   DRY_RUN=0 make up  # Start PostgreSQL
   DRY_RUN=0 make db-restore FILE="path/to/backup.sql.gz"
   ```

4. **Start services**:
   ```bash
   DRY_RUN=0 make up
   make health
   ```

## Backup Verification

### Monthly Verification Process

1. **Test restore to temporary environment**:
   ```bash
   # Create test database
   docker run --name test-postgres -e POSTGRES_PASSWORD=test -d postgres:15
   
   # Test restore
   gunzip -c backup.sql.gz | docker exec -i test-postgres psql -U postgres
   
   # Verify data
   docker exec test-postgres psql -U postgres -c "SELECT COUNT(*) FROM workflows;"
   
   # Cleanup
   docker rm -f test-postgres
   ```

2. **Workflow backup verification**:
   ```bash
   # Verify JSON structure
   gunzip -c backups/n8n/n8n_workflows_YYYYMMDD.json.gz | jq '.workflows | length'
   
   # Validate individual workflows
   make wf-validate
   ```

## Backup Security

### Encryption at Rest

For sensitive environments, encrypt backups:

```bash
# Encrypt database backup
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt for restore
gpg --decrypt backup.sql.gz.gpg | make db-restore FILE=-
```

### Offsite Storage

Consider storing backups offsite:

```bash
# AWS S3 example
aws s3 sync backups/ s3://your-backup-bucket/n8n-cursor/

# rsync to remote server
rsync -avz backups/ user@backup-server:/backups/n8n-cursor/
```

## Monitoring & Alerts

### Backup Success Monitoring

Add to your monitoring system:

```bash
#!/bin/bash
# /usr/local/bin/check-backups.sh

BACKUP_DIR="/path/to/n8n-cursor/backups"
ALERT_EMAIL="admin@yourdomain.com"

# Check if today's backups exist
TODAY=$(date +%Y%m%d)

if [[ ! -f $BACKUP_DIR/db/n8n_backup_${TODAY}_*.sql.gz ]]; then
  echo "Missing database backup for $TODAY" | mail -s "Backup Alert" $ALERT_EMAIL
fi

if [[ ! -f $BACKUP_DIR/n8n/n8n_workflows_${TODAY}_*.json.gz ]]; then
  echo "Missing workflows backup for $TODAY" | mail -s "Backup Alert" $ALERT_EMAIL
fi
```

## Troubleshooting

### Common Issues

1. **"MASTER_UNLOCK not set"**:
   - Set the environment variable: `export MASTER_UNLOCK="your_key"`

2. **"PostgreSQL container not running"**:
   - Start services: `DRY_RUN=0 make up`

3. **"Backup file is empty"**:
   - Check Docker container logs: `docker logs n8n-postgres`
   - Verify PostgreSQL connectivity

4. **"Restore failed"**:
   - Check backup file integrity: `gunzip -t backup.sql.gz`
   - Verify PostgreSQL version compatibility

### Emergency Contacts

- **Primary**: Your operations team
- **Secondary**: Database administrator
- **Escalation**: CTO/Technical lead

## Backup Checklist

### Daily
- [ ] Database backup completed
- [ ] Workflows backup completed
- [ ] Backup files verified (non-empty)

### Weekly
- [ ] Backup retention cleanup executed
- [ ] Backup size trending reviewed

### Monthly
- [ ] Test restore performed
- [ ] Backup verification completed
- [ ] Recovery procedures tested
- [ ] Documentation updated

---

**Last Updated**: $(date)  
**Document Owner**: DevOps Team
