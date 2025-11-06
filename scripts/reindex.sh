#!/bin/bash
set -e

# Reindex Script - Updates workspace documentation for Cursor
# Usage: bash scripts/reindex.sh

echo "🔄 Reindexing Workspace Documentation"
echo ""

# Create docs directory if it doesn't exist
mkdir -p docs

# Generate workspace map
echo "📁 Generating workspace map..."
tree -L 3 -I "node_modules|.git|.next|dist|build|coverage|.turbo" > docs/WORKSPACE_MAP.md 2>/dev/null || {
    echo "⚠️  tree command not found, using find instead"
    find . -type d -maxdepth 3 | grep -v -E "(node_modules|\.git|\.next|dist|build|coverage|\.turbo)" | sort > docs/WORKSPACE_MAP.md
}

# Generate routes documentation
echo "🛣️  Generating routes documentation..."
rg -n "route|handler|webhook|lnbits|lnurl|queue|bullmq" apps/ packages/ > docs/ROUTES.md 2>/dev/null || {
    echo "⚠️  ripgrep not found, using grep instead"
    grep -r -n "route\|handler\|webhook\|lnbits\|lnurl\|queue\|bullmq" apps/ packages/ > docs/ROUTES.md 2>/dev/null || echo "No routes found" > docs/ROUTES.md
}

# Generate API endpoints
echo "🔌 Generating API endpoints..."
find apps/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "export.*GET\|export.*POST\|export.*PUT\|export.*DELETE" 2>/dev/null | while read file; do
    echo "## $file" >> docs/API_ENDPOINTS.md
    grep -n "export.*GET\|export.*POST\|export.*PUT\|export.*DELETE" "$file" >> docs/API_ENDPOINTS.md
    echo "" >> docs/API_ENDPOINTS.md
done 2>/dev/null || echo "No API endpoints found" > docs/API_ENDPOINTS.md

# Generate environment variables
echo "🌍 Generating environment variables..."
find . -name ".env*" -o -name "env.*" | grep -v node_modules | while read file; do
    echo "## $file" >> docs/ENV_VARS.md
    grep -v "^#" "$file" | grep "=" | cut -d= -f1 | sort -u >> docs/ENV_VARS.md
    echo "" >> docs/ENV_VARS.md
done 2>/dev/null || echo "No environment files found" > docs/ENV_VARS.md

# Generate package dependencies
echo "📦 Generating package dependencies..."
find . -name "package.json" | grep -v node_modules | while read file; do
    echo "## $file" >> docs/PACKAGES.md
    jq -r '.dependencies | keys[]' "$file" 2>/dev/null | sort >> docs/PACKAGES.md
    echo "" >> docs/PACKAGES.md
done 2>/dev/null || echo "No package.json files found" > docs/PACKAGES.md

# Generate project structure
echo "🏗️  Generating project structure..."
cat > docs/PROJECT_STRUCTURE.md << 'EOF'
# Project Structure

## LightningFlow Project
- `apps/lightningflow/` - Main LightningFlow application
  - `lightning-ui/` - Next.js UI application
  - `web/` - Original web application
  - `api/` - API server
  - `scripts/` - Project-specific scripts

## n8n-Cursor Project  
- `apps/n8n-cursor/` - n8n automation workflows
  - `n8nbuilder/` - n8n workflow builder
  - `scripts/` - n8n-specific scripts

## Shared Packages
- `packages/shared-*/` - Shared utilities and components
- `packages/ui/` - UI components
- `packages/types/` - TypeScript types
- `packages/utils/` - Utility functions

## Infrastructure
- `infra/docker/` - Docker configurations
- `infra/caddy/` - Caddy reverse proxy
- `infra/cloudflare/` - Cloudflare DNS

## Documentation
- `docs/` - Project documentation
- `scripts/` - Build and deployment scripts
EOF

# Generate last updated timestamp
echo "⏰ Updating timestamp..."
echo "Last updated: $(date)" > docs/LAST_UPDATED.md

echo ""
echo "✅ Reindexing completed"
echo ""
echo "📋 Generated files:"
echo "  - docs/WORKSPACE_MAP.md"
echo "  - docs/ROUTES.md"
echo "  - docs/API_ENDPOINTS.md"
echo "  - docs/ENV_VARS.md"
echo "  - docs/PACKAGES.md"
echo "  - docs/PROJECT_STRUCTURE.md"
echo "  - docs/LAST_UPDATED.md"
echo ""
echo "🎯 Cursor now has fresh boundaries and context"
