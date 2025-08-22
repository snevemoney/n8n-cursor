#!/bin/bash

echo "🛡️ Creating N8N Protection Services..."

# 1. Port Guardian Service
sudo tee /etc/systemd/system/n8n-port-guardian.service >/dev/null <<'EOF'
[Unit]
Description=N8N Port Guardian - Prevents Docker conflicts
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/n8n-port-guardian
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
EOF

# 2. Port Guardian Script
sudo tee /usr/local/bin/n8n-port-guardian >/dev/null <<'EOF'
#!/bin/bash
while true; do
    pkill -f "docker-proxy.*:5678" 2>/dev/null || true
    if ! systemctl is-active --quiet n8n-docker.service; then
        systemctl start n8n-docker.service 2>/dev/null || true
    fi
    sleep 30
done
EOF

sudo chmod +x /usr/local/bin/n8n-port-guardian

# 3. Health Monitor Service
sudo tee /etc/systemd/system/n8n-health-monitor.service >/dev/null <<'EOF'
[Unit]
Description=N8N Health Monitor
After=docker.service

[Service]
Type=simple
ExecStart=/usr/local/bin/n8n-health-monitor
Restart=always
RestartSec=60
User=evens
Group=docker

[Install]
WantedBy=multi-user.target
EOF

# 4. Health Monitor Script
sudo tee /usr/local/bin/n8n-health-monitor >/dev/null <<'EOF'
#!/bin/bash
LOG_FILE="/home/evens/n8n-cursor/logs/health.log"

while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    if ! docker ps | grep -q "n8n-cursor_n8n_1"; then
        echo "$TIMESTAMP: N8N container down, restarting..." >> "$LOG_FILE"
        cd /home/evens/n8n-cursor && docker-compose up -d
        sleep 30
    fi
    
    if ! curl -s --max-time 5 http://localhost:5678 > /dev/null; then
        echo "$TIMESTAMP: N8N not responding, restarting..." >> "$LOG_FILE"
        cd /home/evens/n8n-cursor && docker-compose restart
        sleep 30
    fi
    
    sleep 60
done
EOF

sudo chmod +x /usr/local/bin/n8n-health-monitor

# 5. Auto Backup Service
sudo tee /etc/systemd/system/n8n-auto-backup.service >/dev/null <<'EOF'
[Unit]
Description=N8N Auto Backup

[Service]
Type=oneshot
ExecStart=/usr/local/bin/n8n-auto-backup
User=evens
EOF

sudo tee /etc/systemd/system/n8n-auto-backup.timer >/dev/null <<'EOF'
[Unit]
Description=N8N Auto Backup Timer

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
EOF

# 6. Auto Backup Script
sudo tee /usr/local/bin/n8n-auto-backup >/dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/home/evens/n8n-cursor/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

if [ -d "/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/n8n_data_$TIMESTAMP"
elif [ -d "/var/lib/docker/volumes/n8n-cursor_n8n_data/_data" ]; then
    sudo cp -r /var/lib/docker/volumes/n8n-cursor_n8n_data/_data "$BACKUP_DIR/n8n_data_$TIMESTAMP"
fi

cd "$BACKUP_DIR" && ls -t | tail -n +25 | xargs rm -rf 2>/dev/null || true
echo "$(date): Backup completed - $TIMESTAMP" >> /home/evens/n8n-cursor/logs/backup.log
EOF

sudo chmod +x /usr/local/bin/n8n-auto-backup

echo "✅ Protection services created!"
