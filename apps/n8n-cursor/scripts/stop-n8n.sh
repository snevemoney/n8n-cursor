#!/bin/bash

# Simple n8n Stopper - Safe Way to Stop
# ======================================

echo "🛑 Stopping n8n safely..."

# Stop n8n service
sudo systemctl stop n8n.service

# Check if stopped
if systemctl is-active --quiet n8n.service; then
    echo "❌ n8n is still running"
else
    echo "✅ n8n stopped successfully"
    echo "💡 To start again: ./start-n8n.sh"
fi
