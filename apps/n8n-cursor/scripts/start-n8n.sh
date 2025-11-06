#!/bin/bash

# Simple n8n Starter - One Command to Get Everything Working
# ===========================================================

echo "🚀 Starting n8n - Your Simple Way In..."

# Check if n8n is already running
if systemctl is-active --quiet n8n.service; then
    echo "✅ n8n is already running!"
    echo "🌐 Access at: https://n8ncloud.tech"
    echo "🔑 Login with your existing credentials"
    exit 0
fi

# Start n8n service
echo "🔄 Starting n8n service..."
sudo systemctl start n8n.service

# Wait for it to be ready
echo "⏳ Waiting for n8n to be ready..."
sleep 10

# Check status
if systemctl is-active --quiet n8n.service; then
    echo "✅ n8n is now running!"
    echo "🌐 Access at: https://n8ncloud.tech"
    echo "🔑 Login with your existing credentials"
    echo ""
    echo "💡 To stop: ./stop-n8n.sh"
    echo "💡 To check status: ./status-n8n.sh"
else
    echo "❌ n8n failed to start. Check logs: sudo journalctl -u n8n.service -n 20"
fi
