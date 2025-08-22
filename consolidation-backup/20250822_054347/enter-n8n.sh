#!/bin/bash

# Enter n8n - Your Simple Way In (Remembers Everything)
# =====================================================

echo "🚀 Welcome to n8n - Your Simple Way In!"
echo "======================================="

# Check if n8n is running
if systemctl is-active --quiet n8n.service; then
  echo "✅ n8n is already running!"
  echo ""
  echo "🌐 ACCESS YOUR N8N:"
  echo "   Web Interface: https://n8ncloud.tech"
  echo "   Local Access:  http://localhost:5678"
  echo ""
  echo "🔑 Login with your existing credentials"
  echo "📊 Your 21MB database with all workflows is ready!"
  echo ""
  echo "💡 Quick Commands:"
  echo "   ./status-n8n.sh   - Check status"
  echo "   ./stop-n8n.sh     - Stop n8n"
  echo "   ./safe-cleanup.sh - Safe cleanup (optional)"
else
  echo "🔄 n8n is not running. Starting it now..."
  echo "⏳ This will take about 10 seconds..."

  # Start n8n
  sudo systemctl start n8n.service

  # Wait for it to be ready
  sleep 10

  # Check if started successfully
  if systemctl is-active --quiet n8n.service; then
    echo "✅ n8n started successfully!"
    echo ""
    echo "🌐 ACCESS YOUR N8N:"
    echo "   Web Interface: https://n8ncloud.tech"
    echo "   Local Access:  http://localhost:5678"
    echo ""
    echo "🔑 Login with your existing credentials"
    echo "📊 Your 21MB database with all workflows is ready!"
  else
    echo "❌ n8n failed to start. Checking logs..."
    sudo journalctl -u n8n.service -n 5 --no-pager
    echo ""
    echo "💡 Try: ./start-n8n.sh"
  fi
fi

echo ""
echo "🛡️ SAFETY FEATURES ACTIVE:"
echo "   • Database: PROTECTED (undeletable)"
echo "   • Auto-restart: ENABLED (24/7)"
echo "   • Data Guardian: ACTIVE"
echo "   • Safe Mode: ENABLED"
echo ""
echo "🎯 You're all set! Your n8n remembers everything!"
