#!/bin/bash

# Business-Grade N8N Isolation and Persistence System
# This script implements comprehensive protection against Docker conflicts and data loss

set -e

echo "🏢 Setting up Business-Grade N8N Isolation System..."

# 1. DOCKER ISOLATION LAYER
echo "📦 Step 1: Docker Isolation Layer"

# Create dedicated Docker network for n8n only
docker network create n8n-business-network --driver bridge --subnet=172.30.0.0/16 2>/dev/null || true

# Stop any conflicting processes
sudo pkill -f "docker-proxy.*:5678" 2>/dev/null || true
sudo pkill -f "n8n" 2>/dev/null || true

# 2. PORT PROTECTION SYSTEM
echo "🔒 Step 2: Port Protection System"

# Create port blocker service that runs continuously
sudo tee /etc/systemd/system/n8n-port-guardian.service >/dev/null <<'EOF'
[Unit]
Description=N8N Port Guardian - Prevents Docker conflicts
After=network.target
Wants=docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/n8n-port-guardian
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

# Create the port guardian script
sudo tee /usr/local/bin/n8n-port-guardian >/dev/null <<'EOF'
#!/bin/bash
# N8N Port Guardian - Runs every 10 seconds

while true; do
    # Kill any docker-proxy processes trying to use our protected ports
    pkill -f "docker-proxy.*:5678" 2>/dev/null || true
    
    # Ensure our n8n services are running
    if ! systemctl is-active --quiet n8n-docker.service; then
        systemctl start n8n-docker.service 2>/dev/null || true
    fi
    
    # Check if port 5678 is free or belongs to our n8n
    PORT_OWNER=$(lsof -ti:5678 2>/dev/null || echo "")
    if [ ! -z "$PORT_OWNER" ]; then
        PROCESS_CMD=$(ps -p $PORT_OWNER -o comm= 2>/dev/null || echo "")
        if [[ "$PROCESS_CMD" != "docker-proxy" ]] && [[ "$PROCESS_CMD" != "node" ]]; then
            # Unknown process using our port, kill it
            kill -9 $PORT_OWNER 2>/dev/null || true
        fi
    fi
    
    sleep 10
done
EOF

sudo chmod +x /usr/local/bin/n8n-port-guardian

# 3. N8N PERSISTENCE LAYER
echo "💾 Step 3: N8N Persistence Layer"

# Create backup service that runs every hour
sudo tee /etc/systemd/system/n8n-auto-backup.service >/dev/null <<'EOF'
[Unit]
Description=N8N Auto Backup Service
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/n8n-auto-backup
User=evens
Group=docker
EOF

sudo tee /etc/systemd/system/n8n-auto-backup.timer >/dev/null <<'EOF'
[Unit]
Description=N8N Auto Backup Timer
Requires=n8n-auto-backup.service

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Create the backup script
sudo tee /usr/local/bin/n8n-auto-backup >/dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/evens/n8n-cursor/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

# Backup Docker volume data
if [ -d "/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/n8n_data_$TIMESTAMP"
elif [ -d "/var/lib/docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/lib/docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/n8n_data_$TIMESTAMP"
fi

# Keep only last 24 backups (1 day worth)
cd "$BACKUP_DIR"
ls -t | tail -n +25 | xargs rm -rf 2>/dev/null || true

# Log backup status
echo "$(date): N8N backup completed - $TIMESTAMP" >> /home/evens/n8n-cursor/logs/backup.log
EOF

sudo chmod +x /usr/local/bin/n8n-auto-backup

# 4. HEALTH MONITORING SYSTEM
echo "🏥 Step 4: Health Monitoring System"

# Create health monitor service
sudo tee /etc/systemd/system/n8n-health-monitor.service >/dev/null <<'EOF'
[Unit]
Description=N8N Health Monitor
After=docker.service
Wants=docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/n8n-health-monitor
Restart=always
RestartSec=30
User=evens
Group=docker

[Install]
WantedBy=multi-user.target
EOF

# Create the health monitor script
sudo tee /usr/local/bin/n8n-health-monitor >/dev/null <<'EOF'
#!/bin/bash
# N8N Health Monitor - Checks every 30 seconds

LOG_FILE="/home/evens/n8n-cursor/logs/health.log"
mkdir -p "$(dirname "$LOG_FILE")"

while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Check if n8n container is running
    if ! docker ps | grep -q "n8n-cursor_n8n_1"; then
        echo "$TIMESTAMP: ERROR - N8N container not running, attempting restart..." >> "$LOG_FILE"
        cd /home/evens/n8n-cursor
        docker-compose up -d 2>> "$LOG_FILE"
        sleep 15
    fi
    
    # Check if n8n web interface is responding
    if ! curl -s --max-time 5 http://localhost:5678 > /dev/null 2>&1; then
        echo "$TIMESTAMP: WARNING - N8N web interface not responding" >> "$LOG_FILE"
        cd /home/evens/n8n-cursor
        docker-compose restart 2>> "$LOG_FILE"
        sleep 15
    fi
    
    # Check if nginx is properly proxying
    if ! curl -s --max-time 5 https://n8ncloud.tech > /dev/null 2>&1; then
        echo "$TIMESTAMP: WARNING - Nginx proxy not responding, restarting..." >> "$LOG_FILE"
        sudo systemctl restart nginx 2>> "$LOG_FILE"
    fi
    
    sleep 30
done
EOF

sudo chmod +x /usr/local/bin/n8n-health-monitor

# 5. BUSINESS RECOVERY SYSTEM
echo "🚀 Step 5: Business Recovery System"

# Create instant recovery script
tee /home/evens/n8n-cursor/scripts/instant_recovery.sh >/dev/null <<'EOF'
#!/bin/bash
# Instant N8N Recovery - Use when everything breaks

echo "🚨 EMERGENCY N8N RECOVERY INITIATED"

# Step 1: Stop everything
docker-compose down 2>/dev/null || true
sudo pkill -f "n8n" 2>/dev/null || true
sudo pkill -f "docker-proxy.*5678" 2>/dev/null || true

# Step 2: Restore from most recent backup
BACKUP_DIR="/home/evens/n8n-cursor/backups"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)

if [ ! -z "$LATEST_BACKUP" ]; then
    echo "📁 Restoring from backup: $LATEST_BACKUP"
    
    # Clear current data
    sudo rm -rf /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true
    sudo rm -rf /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/* 2>/dev/null || true
    
    # Restore from backup
    sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ 2>/dev/null || sudo cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
    
    # Fix permissions
    sudo chown -R 1000:1000 /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/ 2>/dev/null || sudo chown -R 1000:1000 /var/lib/docker/volumes/n8n-cursor_n8n_data/_data/
fi

# Step 3: Restart everything
cd /home/evens/n8n-cursor
docker-compose up -d

# Step 4: Wait and verify
sleep 15
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ RECOVERY SUCCESSFUL - N8N is running"
else
    echo "❌ RECOVERY FAILED - Manual intervention required"
fi
EOF

chmod +x /home/evens/n8n-cursor/scripts/instant_recovery.sh

# 6. ENABLE ALL SERVICES
echo "⚡ Step 6: Enabling All Protection Services"

# Enable and start all services
sudo systemctl daemon-reload
sudo systemctl enable n8n-docker.service
sudo systemctl enable n8n-port-guardian.service
sudo systemctl enable n8n-health-monitor.service
sudo systemctl enable n8n-auto-backup.timer

sudo systemctl start n8n-port-guardian.service
sudo systemctl start n8n-health-monitor.service
sudo systemctl start n8n-auto-backup.timer

# 7. CREATE MANAGEMENT INTERFACE
echo "🎛️ Step 7: Creating Management Interface"

# Update n8n-manager with business commands
tee -a /home/evens/n8n-cursor/n8n-manager.sh >/dev/null <<'EOF'

    "business-status")
        echo "🏢 Business-Grade N8N Status:"
        echo "================================"
        echo "📦 Docker Container: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep n8n || echo 'NOT RUNNING')"
        echo "🔒 Port Guardian: $(systemctl is-active n8n-port-guardian.service)"
        echo "🏥 Health Monitor: $(systemctl is-active n8n-health-monitor.service)"
        echo "💾 Auto Backup: $(systemctl is-active n8n-auto-backup.timer)"
        echo "🌐 Web Interface: $(curl -s --max-time 3 http://localhost:5678 > /dev/null && echo 'ONLINE' || echo 'OFFLINE')"
        echo "🌍 Domain Access: $(curl -s --max-time 3 https://n8ncloud.tech > /dev/null && echo 'ONLINE' || echo 'OFFLINE')"
        echo ""
        echo "📊 Recent Health Log:"
        tail -5 /home/evens/n8n-cursor/logs/health.log 2>/dev/null || echo "No health logs yet"
        ;;
    "emergency-recovery")
        echo "🚨 Initiating Emergency Recovery..."
        $SCRIPTS_DIR/instant_recovery.sh
        ;;
    "business-logs")
        echo "📋 Business System Logs:"
        echo "========================"
        echo "🏥 Health Monitor (last 10 lines):"
        tail -10 /home/evens/n8n-cursor/logs/health.log 2>/dev/null || echo "No health logs"
        echo ""
        echo "💾 Backup Log (last 5 lines):"
        tail -5 /home/evens/n8n-cursor/logs/backup.log 2>/dev/null || echo "No backup logs"
        ;;
EOF

echo ""
echo "✅ BUSINESS-GRADE N8N SYSTEM DEPLOYED!"
echo "========================================"
echo ""
echo "🛡️ Protection Systems Active:"
echo "- Port Guardian: Prevents Docker conflicts"
echo "- Health Monitor: Auto-restarts on failures"
echo "- Auto Backup: Hourly data protection"
echo "- Emergency Recovery: Instant restoration"
echo ""
echo "🎛️ Management Commands:"
echo "- ./n8n-manager.sh business-status"
echo "- ./n8n-manager.sh emergency-recovery"
echo "- ./n8n-manager.sh business-logs"
echo ""
echo "🚀 Your N8N is now business-grade reliable!"
