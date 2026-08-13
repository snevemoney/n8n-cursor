#!/bin/bash
set -e

echo "🚀 LightningFlow AI - Complete E2E Promotion Pipeline"
echo "====================================================="

# Function to check if a URL is healthy
check_health() {
    local url=$1
    local name=$2
    echo -n "Checking $name ($url)... "
    if curl -fsS "$url" >/dev/null 2>&1; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    local env=$1
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $env deployment to complete..."
    
    while [ $attempt -le $max_attempts ]; do
        case $env in
            "int")
                if check_health "https://int.lightningflow.online/healthz" "Integration"; then
                    return 0
                fi
                ;;
            "staging")
                if check_health "https://staging.lightningflow.online/healthz" "Staging"; then
                    return 0
                fi
                ;;
            "prod")
                if check_health "https://evenslouis.ca/lightningflow/healthz" "Production"; then
                    return 0
                fi
                ;;
        esac
        
        echo "Attempt $attempt/$max_attempts - waiting 30 seconds..."
        sleep 30
        attempt=$((attempt + 1))
    done
    
    echo "❌ $env deployment timed out"
    return 1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if we have the required branches
if ! git show-ref --verify --quiet refs/heads/int; then
    echo "❌ Integration branch 'int' not found. Creating it..."
    git checkout -b int
fi

if ! git show-ref --verify --quiet refs/heads/staging; then
    echo "❌ Staging branch 'staging' not found. Creating it..."
    git checkout -b staging
fi

if ! git show-ref --verify --quiet refs/heads/main; then
    echo "❌ Main branch 'main' not found. Creating it..."
    git checkout -b main
fi

echo "✅ Prerequisites check passed"

# Get current branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    git status --porcelain
    exit 1
fi

echo "✅ No uncommitted changes"

# Build and test locally
echo "🔨 Building and testing locally..."
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test

echo "✅ Local tests passed"

# Step 1: Promote to Integration
echo ""
echo "🚀 Step 1: Promoting to Integration Environment"
echo "=============================================="

git checkout int
git merge $current_branch --no-edit
git push origin int

echo "⏳ Integration deployment triggered..."

if wait_for_deployment "int"; then
    echo "✅ Integration deployment successful"
else
    echo "❌ Integration deployment failed"
    exit 1
fi

# Step 2: Promote to Staging
echo ""
echo "🚀 Step 2: Promoting to Staging Environment"
echo "=========================================="

git checkout staging
git merge int --no-edit
git push origin staging

echo "⏳ Staging deployment triggered..."

if wait_for_deployment "staging"; then
    echo "✅ Staging deployment successful"
else
    echo "❌ Staging deployment failed"
    exit 1
fi

# Step 3: Promote to Production
echo ""
echo "🚀 Step 3: Promoting to Production Environment"
echo "============================================="

# Final confirmation for production
echo "⚠️  WARNING: You are about to deploy to PRODUCTION!"
echo "This will affect real users and real data."
echo ""
read -p "Are you sure you want to continue to Production? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Production deployment cancelled"
    echo "✅ Staging deployment completed successfully"
    exit 0
fi

git checkout main
git merge staging --no-edit
git push origin main

echo "⏳ Production deployment triggered..."

if wait_for_deployment "prod"; then
    echo "✅ Production deployment successful"
else
    echo "❌ Production deployment failed"
    echo "🔄 Consider running rollback: ./scripts/rollback-prod.sh"
    exit 1
fi

# Final health check
echo ""
echo "🏥 Final Health Check"
echo "===================="

check_health "https://int.lightningflow.online/healthz" "Integration"
check_health "https://staging.lightningflow.online/healthz" "Staging"
check_health "https://evenslouis.ca/lightningflow/healthz" "Production"

echo ""
echo "🎉 Complete E2E Promotion Successful!"
echo "===================================="
echo ""
echo "All environments are now running the latest version:"
echo "  🔧 Integration: https://int.lightningflow.online"
echo "  🧪 Staging:     https://staging.lightningflow.online"
echo "  🚀 Production:  https://evenslouis.ca/lightningflow"
echo ""
echo "Next steps:"
echo "1. Monitor production for any issues"
echo "2. If issues arise, run: ./scripts/rollback-prod.sh"
echo "3. Check logs: docker compose -f infra/docker/docker-compose.prod.yml logs -f"
