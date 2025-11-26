#!/bin/bash

# Comprehensive N8N Backup System
# Creates complete backups including Docker state, nginx config, and system services

BACKUP_ROOT="/home/evens/n8n-cursor/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BACKUP_ROOT/complete_backup_$TIMESTAMP"

echo "📦 COMPREHENSIVE N8N BACKUP STARTING..."
echo "======================================="

# Create backup directory structure
mkdir -p "$BACKUP_DIR"/{docker_data,nginx_config,system_services,n8n_project,logs}

echo "💾 Step 1: Backing up N8N Docker data..."
# Backup Docker volume data
if [ -d "/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/docker_data/"
    echo "   ✅ Docker data backed up from snap location"
elif [ -d "/var/lib/docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/lib/docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/docker_data/"
    echo "   ✅ Docker data backed up from standard location"
fi

echo "🌐 Step 2: Backing up Nginx configuration..."
# Backup nginx config
sudo cp /etc/nginx/sites-available/n8n "$BACKUP_DIR/nginx_config/n8n_site" 2>/dev/null || echo "   ⚠️ No nginx site config found"
sudo cp /etc/nginx/sites-enabled/n8n "$BACKUP_DIR/nginx_config/n8n_enabled" 2>/dev/null || echo "   ⚠️ No nginx enabled site found"
sudo cp /etc/nginx/nginx.conf "$BACKUP_DIR/nginx_config/nginx.conf" 2>/dev/null || echo "   ⚠️ No nginx.conf found"

echo "⚙️ Step 3: Backing up system services..."
# Backup systemd services
sudo cp /etc/systemd/system/n8n-docker.service "$BACKUP_DIR/system_services/" 2>/dev/null || echo "   ⚠️ No n8n-docker.service found"
sudo cp /etc/systemd/system/n8n-port-guardian.service "$BACKUP_DIR/system_services/" 2>/dev/null || echo "   ⚠️ No port-guardian.service found"
sudo cp /etc/systemd/system/n8n-health-monitor.service "$BACKUP_DIR/system_services/" 2>/dev/null || echo "   ⚠️ No health-monitor.service found"
sudo cp /etc/systemd/system/n8n-auto-backup.* "$BACKUP_DIR/system_services/" 2>/dev/null || echo "   ⚠️ No auto-backup services found"

echo "📁 Step 4: Backing up project files..."
# Backup entire project directory
cp -r /home/evens/n8n-cursor/* "$BACKUP_DIR/n8n_project/" 2>/dev/null || echo "   ⚠️ Some project files may not be accessible"

echo "📋 Step 5: Creating system state snapshot..."
# Create system state information
cat > "$BACKUP_DIR/system_state.txt" << EOF
# N8N System State Backup - $TIMESTAMP
# =====================================

## Docker Info
Docker version: $(docker --version)
Docker compose version: $(docker-compose --version)

## Container Status
$(docker ps -a | grep n8n)

## Network Info
$(docker network ls | grep n8n)

## Volume Info
$(docker volume ls | grep n8n)

## Service Status
n8n-docker.service: $(systemctl is-active n8n-docker.service 2>/dev/null || echo "not found")
n8n-port-guardian.service: $(systemctl is-active n8n-port-guardian.service 2>/dev/null || echo "not found")
n8n-health-monitor.service: $(systemctl is-active n8n-health-monitor.service 2>/dev/null || echo "not found")
n8n-auto-backup.timer: $(systemctl is-active n8n-auto-backup.timer 2>/dev/null || echo "not found")

## Nginx Status
nginx.service: $(systemctl is-active nginx.service 2>/dev/null || echo "not found")

## Port Status
$(netstat -tlnp | grep 5678 || echo "Port 5678 not in use")

## Process Status
$(ps aux | grep -E "(n8n|nginx)" | grep -v grep || echo "No n8n/nginx processes found")

EOF

echo "🗜️ Step 6: Creating compressed archive..."
# Create compressed backup
cd "$BACKUP_ROOT"
tar -czf "complete_backup_$TIMESTAMP.tar.gz" "complete_backup_$TIMESTAMP"
rm -rf "complete_backup_$TIMESTAMP"

echo "🧹 Step 7: Cleanup old backups..."
# Keep only last 10 complete backups
ls -t complete_backup_*.tar.gz | tail -n +11 | xargs rm -f 2>/dev/null || true

echo ""
echo "✅ COMPREHENSIVE BACKUP COMPLETED!"
echo "================================="
echo "📁 Backup location: $BACKUP_ROOT/complete_backup_$TIMESTAMP.tar.gz"
echo "📊 Backup size: $(du -h "$BACKUP_ROOT/complete_backup_$TIMESTAMP.tar.gz" | cut -f1)"
echo ""

# Log the backup
echo "$(date): Comprehensive backup completed - complete_backup_$TIMESTAMP.tar.gz" >> /home/evens/n8n-cursor/logs/backup.log
