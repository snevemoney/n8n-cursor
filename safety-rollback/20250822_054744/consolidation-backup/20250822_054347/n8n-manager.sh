#!/bin/bash

# n8n Project Manager - Quick Commands for evens's n8n Environment
# ================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

echo "�� n8n Project Manager"
echo "====================="

case "${1:-help}" in
"status")
  echo "🔍 Checking n8n Status..."
  curl -s -o /dev/null -w "n8n Web: %{http_code}\n" https://n8ncloud.tech
  sudo systemctl is-active n8n-original && echo "✅ n8n Service: Active" || echo "❌ n8n Service: Inactive"
  sudo systemctl is-active docker-port-blocker && echo "✅ Port Protection: Active" || echo "❌ Port Protection: Inactive"
  ;;
"restart")
  echo "🔄 Restarting n8n safely..."
  sudo systemctl restart n8n-original
  sleep 5
  $0 status
  ;;
"protect")
  echo "🛡️ Enforcing Docker protection..."
  $SCRIPTS_DIR/docker_isolation_system.sh emergency
  ;;
"backup")
  echo "📦 Backing up n8n data..."
  $SCRIPTS_DIR/docker_management_rules.sh backup
  ;;
"restore")
  if [ -z "$2" ]; then
    echo "Usage: $0 restore API_KEY"
    echo "Get API key from n8n Settings > API"
  else
    echo "🔄 Restoring workflows..."
    $SCRIPTS_DIR/complete_restore.sh "$2"
  fi
  ;;
"logs")
  echo "📋 n8n Service Logs (last 20 lines):"
  sudo journalctl -u n8n-original -n 20 --no-pager
  ;;
"workflows")
  echo "📁 Available Workflows:"
  ls -1 $PROJECT_DIR/workflows/*.json 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      workflow_name=$(grep -o '"name":"[^"]*"' "$file" | head -1 | cut -d'"' -f4)
      echo "   📄 $(basename "$file") - $workflow_name"
    fi
  done
  ;;
"rules")
  echo "📋 Docker Rules Documentation:"
  cat $PROJECT_DIR/docs/DOCKER_RULES.md
  ;;
"mcp")
  echo "🔧 Testing MCP Configuration:"
  $SCRIPTS_DIR/test_mcp.sh
  ;;
"business-status")
  echo "🏢 BUSINESS-GRADE N8N STATUS"
  echo "============================="
  echo "📦 Docker Container: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep n8n || echo 'NOT RUNNING')"
  echo "🔒 Port Guardian: $(systemctl is-active n8n-port-guardian.service)"
  echo "🏥 Health Monitor: $(systemctl is-active n8n-health-monitor.service)"
  echo "💾 Auto Backup: $(systemctl is-active n8n-auto-backup.timer)"
  echo "🌐 Web Interface: $(curl -s --max-time 3 http://localhost:5678 >/dev/null && echo 'ONLINE' || echo 'OFFLINE')"
  echo "🌍 Domain Access: $(curl -s --max-time 3 https://n8ncloud.tech >/dev/null && echo 'ONLINE' || echo 'OFFLINE')"
  echo ""
  echo "📊 Recent Health Events:"
  tail -3 /home/evens/n8n-cursor/logs/health.log 2>/dev/null || echo "No health events logged yet"
  ;;
"emergency-recovery")
  echo "🚨 Initiating Emergency Recovery..."
  $SCRIPTS_DIR/emergency_recovery.sh
  ;;
"business-logs")
  echo "📋 BUSINESS SYSTEM LOGS"
  echo "======================="
  echo "🏥 Health Monitor (last 10 lines):"
  tail -10 /home/evens/n8n-cursor/logs/health.log 2>/dev/null || echo "No health logs yet"
  echo ""
  echo "💾 Backup Log (last 5 lines):"
  tail -5 /home/evens/n8n-cursor/logs/backup.log 2>/dev/null || echo "No backup logs yet"
  ;;
"force-backup")
  echo "💾 Creating manual backup..."
  /usr/local/bin/n8n-auto-backup
  echo "✅ Manual backup completed"
  ;;
"comprehensive-backup")
  echo "📦 Creating comprehensive system backup..."
  $SCRIPTS_DIR/comprehensive_backup.sh
  ;;
"comprehensive-restore")
  echo "🚨 Starting comprehensive system restoration..."
  $SCRIPTS_DIR/comprehensive_restore.sh
  ;;
"list-backups")
  echo "📁 Available Backups:"
  echo "===================="
  echo "📊 Hourly Data Backups:"
  ls -la /home/evens/n8n-cursor/backups/n8n_data_* 2>/dev/null | tail -10 || echo "   No data backups found"
  echo ""
  echo "📦 Comprehensive System Backups:"
  ls -la /home/evens/n8n-cursor/backups/complete_backup_*.tar.gz 2>/dev/null | tail -10 || echo "   No comprehensive backups found"
  ;;
"restore-from")
  if [ -z "$2" ]; then
    echo "❌ Please specify backup file:"
    echo "   Usage: $0 restore-from /path/to/backup.tar.gz"
    exit 1
  fi
  echo "🚨 Restoring from specific backup: $2"
  $SCRIPTS_DIR/comprehensive_restore.sh "$2"
  ;;
*)
  echo "Available Commands:"
  echo "  $0 status     - Check n8n and protection status"
  echo "  $0 restart    - Safely restart n8n service"
  echo "  $0 protect    - Enforce Docker protection"
  echo "  $0 backup     - Backup n8n data"
  echo "  $0 restore    - Restore workflows (needs API key)"
  echo "  $0 logs       - View n8n service logs"
  echo "  $0 workflows  - List available workflows"
  echo "  $0 rules      - Show Docker rules documentation"
  echo ""
  echo "📁 Project Structure:"
  echo "  ~/n8n-cursor/scripts/     - Management scripts"
  echo "  ~/n8n-cursor/docs/        - Documentation"
  echo "  ~/n8n-cursor/workflows/   - Workflow files"
  echo ""
  echo "🛡️ Protection Status:"
  sudo systemctl is-active n8n-original >/dev/null && echo "  ✅ n8n Service Protected" || echo "  ❌ n8n Service Needs Setup"
  sudo systemctl is-active docker-port-blocker >/dev/null && echo "  ✅ Docker Conflicts Blocked" || echo "  ❌ Docker Protection Needs Setup"
  ;;
esac
