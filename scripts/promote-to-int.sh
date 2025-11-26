#!/bin/bash
set -e

echo "🚀 Promoting to Integration Environment"
echo "======================================"

# Check if we're on the right branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "int" ]; then
    echo "❌ You must be on the 'int' branch to promote to Integration"
    echo "Current branch: $current_branch"
    echo "Run: git checkout int"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    exit 1
fi

echo "✅ Branch check passed"

# Build and test locally first
echo "🔨 Building and testing locally..."
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test

echo "✅ Local tests passed"

# Push to trigger CI
echo "📤 Pushing to trigger Integration deployment..."
git push origin int

echo "🎉 Promotion to Integration initiated!"
echo ""
echo "Next steps:"
echo "1. Monitor CI: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "2. Check Integration health: https://int.lightningflow.online/healthz"
echo "3. Test Integration: https://int.lightningflow.online"
echo "4. Once Integration is stable, promote to Staging: ./scripts/promote-to-staging.sh"
