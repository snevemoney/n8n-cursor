#!/bin/bash
set -e

echo "🚀 Promoting to Staging Environment"
echo "==================================="

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "staging" ]; then
    echo "❌ You must be on the 'staging' branch to promote to Staging"
    echo "Current branch: $current_branch"
    echo "Run: git checkout staging"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    exit 1
fi

echo "✅ Branch check passed"

# Check if Integration is healthy
echo "🏥 Checking Integration environment health..."
if ! curl -fsS https://int.lightningflow.online/healthz >/dev/null 2>&1; then
    echo "❌ Integration environment is not healthy. Please fix Integration first."
    echo "Check: https://int.lightningflow.online/healthz"
    exit 1
fi

echo "✅ Integration environment is healthy"

# Build and test locally first
echo "🔨 Building and testing locally..."
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test

echo "✅ Local tests passed"

# Push to trigger CI
echo "📤 Pushing to trigger Staging deployment..."
git push origin staging

echo "🎉 Promotion to Staging initiated!"
echo ""
echo "Next steps:"
echo "1. Monitor CI: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "2. Check Staging health: https://staging.lightningflow.online/healthz"
echo "3. Test Staging: https://staging.lightningflow.online"
echo "4. Run E2E tests on Staging"
echo "5. Once Staging is stable, promote to Production: ./scripts/promote-to-prod.sh"
