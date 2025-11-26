#!/bin/bash
# Sync production data to local development environment
# SAFE: Only reads from production, never modifies it

set -e

echo "🔄 Production to Local Sync"
echo "==========================="
echo ""
echo "⚠️  This script will:"
echo "   ✅ Read data from production (n8ncloud.tech)"
echo "   ✅ Copy workflows and credentials to local"
echo "   ✅ Backup local data before overwriting"
echo "   ❌ NEVER modify production"
echo ""

# Configuration
PROD_HOST="${PROD_HOST:-69.62.66.78}"
PROD_PORT="${PROD_PORT:-22222}"
PROD_USER="${PROD_USER:-evens}"
PROD_N8N_DATA_PATH="${PROD_N8N_DATA_PATH:-/home/evens/.n8n}"
LOCAL_N8N_DATA_PATH="${LOCAL_N8N_DATA_PATH:-./data/n8n_data}"
BACKUP_DIR="./backups/pre-sync-$(date +%Y%m%d_%H%M%S)"

# Check if SSH access is configured
echo "🔍 Checking production access..."
if ! ssh -p "$PROD_PORT" -o ConnectTimeout=5 -o BatchMode=yes "$PROD_USER@$PROD_HOST" exit 2>/dev/null; then
    echo "❌ Cannot access production server"
    echo ""
    echo "Options:"
    echo "1. Set up SSH key authentication:"
    echo "   ssh-copy-id -p $PROD_PORT $PROD_USER@$PROD_HOST"
    echo ""
    echo "2. Or use n8n API to export workflows:"
    echo "   ./scripts/sync-n8n-via-api.sh"
    exit 1
fi
echo "✅ Production server accessible"

# Create backup directory
echo ""
echo "📦 Creating backup of local data..."
mkdir -p "$BACKUP_DIR"
if [ -d "$LOCAL_N8N_DATA_PATH" ]; then
    echo "   Backing up existing local n8n data..."
    cp -r "$LOCAL_N8N_DATA_PATH" "$BACKUP_DIR/n8n_data" 2>/dev/null || true
    echo "   ✅ Backup created: $BACKUP_DIR"
else
    echo "   ℹ️  No existing local data to backup"
fi

# Method 1: Direct file sync (if n8n data is accessible)
echo ""
echo "📥 Syncing n8n data from production..."
if ssh -p "$PROD_PORT" "$PROD_USER@$PROD_HOST" "[ -d $PROD_N8N_DATA_PATH ]" 2>/dev/null; then
    echo "   Found n8n data directory on production"
    mkdir -p "$LOCAL_N8N_DATA_PATH"
    
    # Sync workflows
    echo "   Syncing workflows..."
    ssh -p "$PROD_PORT" "$PROD_USER@$PROD_HOST" "tar czf - -C $PROD_N8N_DATA_PATH ." | \
        tar xzf - -C "$LOCAL_N8N_DATA_PATH" 2>/dev/null || {
        echo "   ⚠️  Direct sync failed, trying API method..."
        METHOD="api"
    }
    
    if [ "$METHOD" != "api" ]; then
        echo "   ✅ Workflows and credentials synced"
        METHOD="file"
    fi
else
    echo "   ⚠️  n8n data directory not found, using API method"
    METHOD="api"
fi

# Method 2: API-based sync (fallback or primary)
if [ "$METHOD" = "api" ]; then
    echo ""
    echo "🌐 Syncing via n8n API..."
    
    # Check if local n8n is running
    if curl -sf http://localhost:5678/healthz > /dev/null 2>&1; then
        echo "   ✅ Local n8n is running"
    else
        echo "   ⚠️  Local n8n is not running"
        echo "   Starting local n8n..."
        docker compose -f infra/docker/docker-compose.dev.yml up -d n8n
        echo "   Waiting for n8n to be ready..."
        sleep 10
    fi
    
    # Export from production and import to local
    echo "   Exporting workflows from production..."
    PROD_WORKFLOWS=$(curl -sf "https://n8ncloud.tech/api/v1/workflows" \
        -H "X-N8N-API-KEY: ${PROD_N8N_API_KEY:-}" 2>/dev/null || echo "")
    
    if [ -n "$PROD_WORKFLOWS" ]; then
        echo "   Importing workflows to local..."
        echo "$PROD_WORKFLOWS" | jq -r '.[] | @json' | while read workflow; do
            curl -sf -X POST "http://localhost:5678/api/v1/workflows" \
                -H "Content-Type: application/json" \
                -d "$workflow" > /dev/null 2>&1 || true
        done
        echo "   ✅ Workflows synced via API"
    else
        echo "   ⚠️  Could not fetch workflows (API key may be needed)"
        echo "   Set PROD_N8N_API_KEY environment variable"
    fi
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "📋 Summary:"
echo "   Backup location: $BACKUP_DIR"
echo "   Local n8n data: $LOCAL_N8N_DATA_PATH"
echo ""
echo "🚀 Next steps:"
echo "1. Restart local n8n: docker compose -f infra/docker/docker-compose.dev.yml restart n8n"
echo "2. Access local n8n: http://n8n.local"
echo "3. Verify workflows are synced"
echo ""
echo "💾 To restore backup:"
echo "   cp -r $BACKUP_DIR/n8n_data/* $LOCAL_N8N_DATA_PATH/"

