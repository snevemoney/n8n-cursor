#!/bin/bash
set -e

echo "🔄 Rolling back Production Environment"
echo "====================================="

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ You must be on the 'main' branch to rollback Production"
    echo "Current branch: $current_branch"
    echo "Run: git checkout main"
    exit 1
fi

# Final confirmation
echo "⚠️  WARNING: You are about to ROLLBACK PRODUCTION!"
echo "This will revert to the previous version."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Production rollback cancelled"
    exit 1
fi

# Rollback using blue/green
echo "🔄 Rolling back to BLUE stack..."
./scripts/flip_blue.sh

echo "🏥 Checking Production health after rollback..."
if curl -fsS https://lightningflow.online/healthz >/dev/null 2>&1; then
    echo "✅ Production rollback successful"
    echo "Production is now running the previous stable version"
else
    echo "❌ Production rollback failed - health check failed"
    echo "Manual intervention required"
    exit 1
fi

echo ""
echo "🎉 Production rollback complete!"
echo "Production is now running the previous stable version"
echo "Monitor: https://lightningflow.online/healthz"
