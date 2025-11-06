#!/bin/bash

echo "🚨 EMERGENCY N8N RECOVERY INITIATED"
echo "=================================="

# Step 1: Stop everything
echo "🛑 Stopping all N8N services..."
docker-compose down 2>/dev/null || true
sudo pkill -f "n8n" 2>/dev/null || true
sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true

# Step 2: Find and restore from most recent backup
BACKUP_DIR="/home/evens/n8n-cursor/backups"
if [ -d "$BACKUP_DIR" ]; then
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)
    
    if [ ! -z "$LATEST_BACKUP" ]; then
        echo "📁 Restoring from backup: $LATEST_BACKUP"
        
        # Clear current data
        sudo rm -rf /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true
        sudo rm -rf /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true
        
        # Restore from backup
        if [ -d "/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data" ]; then
            sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
            sudo chown -R 1000:1000 /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/
        elif [ -d "/var/lib/docker/volumes/n8n-cursor_n8n_data/_data" ]; then
            sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
            sudo chown -R 1000:1000 /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
        fi
    else
        echo "📁 No backups found, restoring from original source..."
        # Restore from original n8n data
        if [ -d "/home/n8n/.n8n" ]; then
            sudo cp -r /home/n8n/.n8n/* /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ 2>/dev/null || sudo cp -r /home/n8n/.n8n/* /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
            sudo chown -R 1000:1000 /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ 2>/dev/null || sudo chown -R 1000:1000 /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
        fi
    fi
fi

# Step 3: Restart everything
echo "🚀 Restarting N8N services..."
cd /home/evens/n8n-cursor
docker-compose up -d

# Step 4: Wait and verify
echo "⏳ Waiting for N8N to start..."
sleep 20

# Step 5: Test all endpoints
echo "🧪 Testing N8N endpoints..."
LOCAL_TEST=$(curl -s --max-time 10 http://localhost:5678 > /dev/null && echo "✅" || echo "❌")
DOMAIN_TEST=$(curl -s --max-time 10 https://n8ncloud.tech > /dev/null && echo "✅" || echo "❌")

echo ""
echo "📊 RECOVERY RESULTS:"
echo "==================="
echo "Local (localhost:5678): $LOCAL_TEST"
echo "Domain (n8ncloud.tech): $DOMAIN_TEST"
echo ""

if [[ "$LOCAL_TEST" == "✅" ]]; then
    echo "🎉 EMERGENCY RECOVERY SUCCESSFUL!"
    echo "Your N8N instance is back online and ready for business."
else
    echo "⚠️ RECOVERY INCOMPLETE - Manual intervention may be required"
    echo "Check logs: docker logs n8n-cursor_n8n_1"
fi

echo ""
echo "📋 Next steps:"
echo "1. Verify your workflows are intact"
echo "2. Test a simple workflow execution"  
echo "3. Generate new API key if needed for MCP tools"
