#!/bin/bash
set -e

echo "🔒 VPS N8N ACCOUNT BACKUP SCRIPT"
echo "================================="

# Create backup directory
BACKUP_DIR="/opt/lightningflow/backups/n8n-account-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup directory: $BACKUP_DIR"

# Step 1: Backup n8n data directory
echo "Step 1: Backing up n8n data directory..."
if [ -d "/opt/lightningflow/data/n8n_data" ]; then
    tar czf "$BACKUP_DIR/n8n-data-backup.tar.gz" -C /opt/lightningflow/data n8n_data
    echo "✅ n8n data backed up to $BACKUP_DIR/n8n-data-backup.tar.gz"
else
    echo "⚠️  No n8n data directory found"
fi

# Step 2: Backup Docker volumes
echo "Step 2: Backing up Docker volumes..."
if docker volume ls | grep -q "n8n"; then
    for volume in $(docker volume ls --format "{{.Name}}" | grep n8n); do
        echo "Backing up volume: $volume"
        docker run --rm -v "$volume:/data" -v "$BACKUP_DIR:/backup" alpine tar czf "/backup/$volume-backup.tar.gz" -C /data .
    done
    echo "✅ Docker volumes backed up"
else
    echo "⚠️  No n8n Docker volumes found"
fi

# Step 3: Check for user data
echo "Step 3: Checking for user data..."
if [ -f "$BACKUP_DIR/n8n-data-backup.tar.gz" ]; then
    echo "Extracting and checking n8n database..."
    cd "$BACKUP_DIR"
    tar xzf n8n-data-backup.tar.gz
    
    if [ -f "n8n_data/database.sqlite" ]; then
        echo "Installing sqlite and checking database..."
        docker run --rm -v "$(pwd)/n8n_data:/data" alpine sh -c "
            apk add --no-cache sqlite
            echo 'Users in database:'
            sqlite3 /data/database.sqlite 'SELECT id, email, firstName, lastName, createdAt FROM user;' 2>/dev/null || echo 'No users found'
            echo 'Workflows in database:'
            sqlite3 /data/database.sqlite 'SELECT id, name, active, createdAt FROM workflow_entity;' 2>/dev/null || echo 'No workflows found'
        "
    else
        echo "No database.sqlite found in backup"
    fi
fi

echo ""
echo "🔒 VPS BACKUP COMPLETED!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📋 Files created:"
ls -la "$BACKUP_DIR"

