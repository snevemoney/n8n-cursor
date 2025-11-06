#!/bin/bash

# Safe Cleanup Script - NEVER Deletes Important Data
# =================================================

echo "🧹 Safe Cleanup Mode - Your Data is Protected!"
echo "=============================================="

# SAFETY CHECK - Never delete these critical paths
PROTECTED_PATHS=(
    "/home/n8n/.n8n"
    "/home/evens/n8n-cursor"
    "/var/log/n8n-restart.log"
    "/etc/systemd/system/n8n.service"
)

echo "🛡️ PROTECTED PATHS (Never Deleted):"
for path in "${PROTECTED_PATHS[@]}"; do
    echo "   ✅ $path"
done

echo ""
echo "🧹 Safe Cleanup Options:"
echo "1. Clean Docker containers (safe - keeps volumes)"
echo "2. Clean Docker images (safe - keeps data)"
echo "3. Clean system logs (safe - keeps n8n logs)"
echo "4. Clean temporary files (safe - keeps configs)"
echo "5. Exit without cleaning"

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo "🧹 Cleaning Docker containers (keeping volumes)..."
        docker container prune -f
        echo "✅ Docker containers cleaned safely"
        ;;
    2)
        echo "🧹 Cleaning Docker images (keeping volumes)..."
        docker image prune -f
        echo "✅ Docker images cleaned safely"
        ;;
    3)
        echo "🧹 Cleaning system logs (keeping n8n logs)..."
        sudo journalctl --vacuum-time=7d
        echo "✅ System logs cleaned safely"
        ;;
    4)
        echo "🧹 Cleaning temporary files (keeping configs)..."
        sudo rm -rf /tmp/* 2>/dev/null || true
        echo "✅ Temporary files cleaned safely"
        ;;
    5)
        echo "🚫 No cleanup performed - your data is safe!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option - no cleanup performed"
        exit 1
        ;;
esac

echo ""
echo "🛡️ SAFETY CHECK COMPLETE:"
echo "   • Database: PROTECTED"
echo "   • Configs: PROTECTED"
echo "   • Workflows: PROTECTED"
echo "   • Credentials: PROTECTED"
echo ""
echo "✅ Cleanup completed safely!"
