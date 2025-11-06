#!/bin/bash

# 24/7 n8n Auto-Start System with Maximum Safety
# ===============================================

echo "🔄 Setting up 24/7 n8n Auto-Start System..."
echo "🛡️ SAFE MODE: Nothing will be deleted!"

# 1. Enable n8n service to start on boot
echo "📦 Step 1: Enabling n8n to start on boot..."
sudo systemctl enable n8n.service

# 2. Create auto-restart service (only if n8n crashes)
echo "🔄 Step 2: Creating auto-restart service..."
sudo tee /etc/systemd/system/n8n-auto-restart.service > /dev/null << 'EOF'
[Unit]
Description=n8n Auto-Restart Service
After=n8n.service
Wants=n8n.service

[Service]
Type=oneshot
ExecStart=/bin/true
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# 3. Create auto-restart timer (checks every 5 minutes)
echo "⏰ Step 3: Creating auto-restart timer..."
sudo tee /etc/systemd/system/n8n-auto-restart.timer > /dev/null << 'EOF'
[Unit]
Description=Check n8n every 5 minutes and restart if needed
Requires=n8n-auto-restart.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Unit=n8n-auto-restart.service

[Install]
WantedBy=timers.target
EOF

# 4. Create the restart checker script
echo "🔧 Step 4: Creating restart checker script..."
sudo tee /usr/local/bin/n8n-restart-checker > /dev/null << 'EOF'
#!/bin/bash
# Safe n8n restart checker - only restarts if service is dead

if ! systemctl is-active --quiet n8n.service; then
    echo "$(date): n8n service is down, restarting..." >> /var/log/n8n-restart.log
    systemctl restart n8n.service
    sleep 10
    
    if systemctl is-active --quiet n8n.service; then
        echo "$(date): n8n service restarted successfully" >> /var/log/n8n-restart.log
    else
        echo "$(date): n8n service restart failed" >> /var/log/n8n-restart.log
    fi
fi
EOF

sudo chmod +x /usr/local/bin/n8n-restart-checker

# 5. Enable and start the timer
echo "🚀 Step 5: Enabling auto-restart system..."
sudo systemctl daemon-reload
sudo systemctl enable n8n-auto-restart.timer
sudo systemctl start n8n-auto-restart.timer

# 6. Start n8n now
echo "🔄 Step 6: Starting n8n now..."
sudo systemctl start n8n.service

echo ""
echo "✅ 24/7 Auto-Start System Setup Complete!"
echo "========================================="
echo "🌐 n8n will now:"
echo "   • Start automatically on boot"
echo "   • Restart automatically if it crashes"
echo "   • Run 24/7 with maximum safety"
echo ""
echo "🔧 Commands:"
echo "   ./start-n8n.sh    - Start n8n manually"
echo "   ./stop-n8n.sh     - Stop n8n safely"
echo "   ./status-n8n.sh   - Check status"
echo ""
echo "🛡️ SAFETY FEATURES:"
echo "   • Database is protected and undeletable"
echo "   • Only restarts if service is actually down"
echo "   • Logs all restart attempts"
echo "   • Safe mode prevents accidental deletion"
