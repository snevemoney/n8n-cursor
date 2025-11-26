#!/bin/bash
# Sync n8n workflows from production to local via API
# SAFE: Only reads from production API

set -e

echo "🌐 n8n API Sync (Production → Local)"
echo "====================================="

# Configuration
PROD_N8N_URL="${PROD_N8N_URL:-https://n8ncloud.tech}"
LOCAL_N8N_URL="${LOCAL_N8N_URL:-http://localhost:5678}"
PROD_API_KEY="${PROD_N8N_API_KEY:-}"
LOCAL_API_KEY="${LOCAL_N8N_API_KEY:-}"

# Check if API keys are provided
if [ -z "$PROD_API_KEY" ]; then
    echo "⚠️  PROD_N8N_API_KEY not set"
    echo ""
    echo "To get your API key:"
    echo "1. Log into https://n8ncloud.tech"
    echo "2. Go to Settings → API"
    echo "3. Create a new API key"
    echo "4. Export it: export PROD_N8N_API_KEY='your-key-here'"
    echo ""
    read -p "Enter production API key (or press Enter to skip): " PROD_API_KEY
fi

if [ -z "$PROD_API_KEY" ]; then
    echo "❌ API key required for sync"
    exit 1
fi

# Check local n8n is running
echo ""
echo "🔍 Checking local n8n..."
if ! curl -sf "$LOCAL_N8N_URL/healthz" > /dev/null 2>&1; then
    echo "   Starting local n8n..."
    docker compose -f infra/docker/docker-compose.dev.yml up -d n8n
    echo "   Waiting for n8n to be ready..."
    for i in {1..30}; do
        if curl -sf "$LOCAL_N8N_URL/healthz" > /dev/null 2>&1; then
            break
        fi
        sleep 1
    done
fi

if ! curl -sf "$LOCAL_N8N_URL/healthz" > /dev/null 2>&1; then
    echo "❌ Local n8n is not accessible"
    exit 1
fi
echo "✅ Local n8n is running"

# Create backup
BACKUP_DIR="./backups/api-sync-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "📥 Exporting workflows from production..."
WORKFLOWS_FILE="$BACKUP_DIR/production-workflows.json"

# Fetch workflows from production
curl -sf "$PROD_N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $PROD_API_KEY" \
    -o "$WORKFLOWS_FILE" || {
    echo "❌ Failed to fetch workflows from production"
    exit 1
}

WORKFLOW_COUNT=$(jq '. | length' "$WORKFLOWS_FILE" 2>/dev/null || echo "0")
echo "   ✅ Exported $WORKFLOW_COUNT workflows"

# Export credentials (if API supports it)
echo ""
echo "📥 Exporting credentials from production..."
CREDS_FILE="$BACKUP_DIR/production-credentials.json"
curl -sf "$PROD_N8N_URL/api/v1/credentials" \
    -H "X-N8N-API-KEY: $PROD_API_KEY" \
    -o "$CREDS_FILE" 2>/dev/null && {
    CRED_COUNT=$(jq '. | length' "$CREDS_FILE" 2>/dev/null || echo "0")
    echo "   ✅ Exported $CRED_COUNT credentials"
} || {
    echo "   ⚠️  Credentials export not available (may require different API)"
}

# Import to local
echo ""
echo "📤 Importing to local n8n..."

# Check if local API key is needed
if [ -z "$LOCAL_API_KEY" ]; then
    echo "   ℹ️  Local API key not set - workflows will be imported as inactive"
    echo "   Set LOCAL_N8N_API_KEY to activate workflows automatically"
fi

IMPORTED=0
FAILED=0

# Import workflows
jq -c '.[]' "$WORKFLOWS_FILE" 2>/dev/null | while read -r workflow; do
    WORKFLOW_NAME=$(echo "$workflow" | jq -r '.name // "Unnamed"')
    
    # Remove id to create new workflow
    WORKFLOW_DATA=$(echo "$workflow" | jq 'del(.id) | del(.updatedAt) | del(.createdAt)')
    
    if [ -n "$LOCAL_API_KEY" ]; then
        RESPONSE=$(curl -sf -X POST "$LOCAL_N8N_URL/api/v1/workflows" \
            -H "Content-Type: application/json" \
            -H "X-N8N-API-KEY: $LOCAL_API_KEY" \
            -d "$WORKFLOW_DATA" 2>/dev/null)
    else
        # Try without API key (may require manual activation)
        RESPONSE=$(curl -sf -X POST "$LOCAL_N8N_URL/api/v1/workflows" \
            -H "Content-Type: application/json" \
            -d "$WORKFLOW_DATA" 2>/dev/null)
    fi
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Imported: $WORKFLOW_NAME"
        IMPORTED=$((IMPORTED + 1))
    else
        echo "   ⚠️  Failed: $WORKFLOW_NAME"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "✅ Sync complete!"
echo ""
echo "📊 Summary:"
echo "   Exported: $WORKFLOW_COUNT workflows"
echo "   Imported: $IMPORTED workflows"
echo "   Failed: $FAILED workflows"
echo "   Backup: $BACKUP_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Access local n8n: http://n8n.local"
echo "2. Review imported workflows"
echo "3. Update credentials if needed (credentials are not automatically synced)"
echo ""
echo "💡 Note: Credentials need to be manually configured in local n8n"
echo "   for security reasons (they contain sensitive API keys)"

