#!/usr/bin/env bash
set -euo pipefail

# Setup Monitoring - Configure health monitoring and maintenance cron jobs
# Usage: ./scripts/setup-monitoring.sh

echo "🔧 Setting up health monitoring and maintenance..."

# Create health log directory
mkdir -p "$HOME/logs"
HEALTH_LOG="$HOME/logs/health.log"
touch "$HEALTH_LOG"

echo "📝 Health log: $HEALTH_LOG"

# Get current directory (where the scripts are located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Repository directory: $REPO_DIR"

# Function to add cron job if it doesn't exist
add_cron_job() {
    local schedule="$1"
    local command="$2"
    local description="$3"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$command"; then
        echo "ℹ️  Cron job already exists: $description"
    else
        # Add the cron job
        (crontab -l 2>/dev/null; echo "$schedule $command # $description") | crontab -
        echo "✅ Added cron job: $description"
    fi
}

echo ""
echo "⏰ Setting up cron jobs..."

# Health monitoring - every 5 minutes
add_cron_job "*/5 * * * *" "cd $REPO_DIR && $SCRIPT_DIR/health-monitor.sh int >> $HEALTH_LOG 2>&1" "Health monitoring every 5 minutes"

# Weekly Docker cleanup - every Sunday at 2 AM
add_cron_job "0 2 * * 0" "cd $REPO_DIR && docker system prune -f >> $HEALTH_LOG 2>&1" "Weekly Docker cleanup"

# Daily log rotation - every day at 3 AM
add_cron_job "0 3 * * *" "cd $REPO_DIR && find $HOME/logs -name '*.log' -size +100M -exec truncate -s 50M {} \\;" "Daily log rotation"

# Weekly backup - every Sunday at 1 AM
add_cron_job "0 1 * * 0" "cd $REPO_DIR && $SCRIPT_DIR/backup.sh >> $HEALTH_LOG 2>&1" "Weekly backup"

# Monthly security scan - first day of month at 4 AM
add_cron_job "0 4 1 * *" "cd $REPO_DIR && $SCRIPT_DIR/validate/security-check.sh >> $HEALTH_LOG 2>&1" "Monthly security scan"

# Port binding check - every hour
add_cron_job "0 * * * *" "cd $REPO_DIR && $SCRIPT_DIR/validate/ports-check.sh >> $HEALTH_LOG 2>&1" "Hourly port binding check"

# System resource monitoring - every 15 minutes
add_cron_job "*/15 * * * *" "cd $REPO_DIR && echo \"\$(date): CPU: \$(top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1)%, Memory: \$(free | grep Mem | awk '{printf \"%.1f\", \$3/\$2 * 100.0}')%, Disk: \$(df / | tail -1 | awk '{print \$5}' | cut -d'%' -f1)%\" >> $HEALTH_LOG" "System resource monitoring"

echo ""
echo "📋 Current cron jobs:"
crontab -l

echo ""
echo "🔍 Monitoring setup complete!"
echo ""
echo "📊 Health monitoring will:"
echo "  - Check all services every 5 minutes"
echo "  - Monitor system resources every 15 minutes"
echo "  - Check port bindings every hour"
echo "  - Run security scans monthly"
echo "  - Clean up Docker weekly"
echo "  - Rotate logs daily"
echo "  - Create backups weekly"
echo ""
echo "📝 Logs will be written to: $HEALTH_LOG"
echo "🔍 View logs with: tail -f $HEALTH_LOG"
echo "📋 View cron jobs with: crontab -l"
echo ""
echo "✅ Setup complete!"