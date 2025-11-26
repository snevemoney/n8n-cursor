#!/bin/bash
set -e

echo "🚀 Promoting to Production Environment"
echo "====================================="

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ You must be on the 'main' branch to promote to Production"
    echo "Current branch: $current_branch"
    echo "Run: git checkout main"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    exit 1
fi

echo "✅ Branch check passed"

# Check if Staging is healthy
echo "🏥 Checking Staging environment health..."
if ! curl -fsS https://staging.lightningflow.online/healthz >/dev/null 2>&1; then
    echo "❌ Staging environment is not healthy. Please fix Staging first."
    echo "Check: https://staging.lightningflow.online/healthz"
    exit 1
fi

echo "✅ Staging environment is healthy"

# Final confirmation
echo "⚠️  WARNING: You are about to deploy to PRODUCTION!"
echo "This will affect real users and real data."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Production deployment cancelled"
    exit 1
fi

# Build and test locally first
echo "🔨 Building and testing locally..."
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test

echo "✅ Local tests passed"

# Push to trigger CI
echo "📤 Pushing to trigger Production deployment..."
git push origin main

echo "🎉 Promotion to Production initiated!"
echo ""
echo "Next steps:"
echo "1. Monitor CI: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "2. Check Production health: https://lightningflow.online/healthz"
echo "3. Monitor Production: https://lightningflow.online"
echo "4. Watch for any issues and be ready to rollback if needed"
echo "5. Rollback command: ./scripts/rollback-prod.sh"
