#!/bin/bash

# Simple n8n Status Checker
# =========================

echo "🔍 n8n Status Check"
echo "=================="

# Service status
if systemctl is-active --quiet n8n.service; then
  echo "✅ Service: RUNNING"
  echo "🌐 Web Access: https://n8ncloud.tech"
  echo "🔧 Local Access: http://localhost:5678"
else
  echo "❌ Service: STOPPED"
  echo "💡 Start with: ./start-n8n.sh"
fi

echo ""
echo "📊 Quick Info:"
echo "   Database: /home/n8n/.n8n/database.sqlite"
echo "   Logs: sudo journalctl -u n8n.service -f"
echo "   Config: /home/n8n/.n8n/config"
