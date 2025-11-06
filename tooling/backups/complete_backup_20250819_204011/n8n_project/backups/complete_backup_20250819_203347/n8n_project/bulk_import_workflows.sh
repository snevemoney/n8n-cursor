#!/bin/bash

echo "🚀 Bulk Workflow Import Script"
echo "=============================="
echo ""
echo "This script will import all your workflows via n8n API"
echo "You'll need your n8n API key after setting up your account"
echo ""

# List workflows to import
echo "📋 Workflows to import:"
for workflow in ~/n8n-cursor/workflows/*.json; do
    if [ -f "$workflow" ]; then
        echo "   📄 $(basename "$workflow")"
    fi
done

echo ""
echo "🔧 To run this after n8n setup:"
echo "1. Go to Settings > API in n8n"
echo "2. Generate an API key"
echo "3. Run: N8N_API_KEY='your-key' ./bulk_import_workflows.sh import"
echo ""

if [ "$1" = "import" ] && [ ! -z "$N8N_API_KEY" ]; then
    echo "🔄 Starting bulk import..."
    for workflow in ~/n8n-cursor/workflows/*.json; do
        if [ -f "$workflow" ]; then
            echo "Importing $(basename "$workflow")..."
            curl -X POST \
                -H "X-N8N-API-KEY: $N8N_API_KEY" \
                -H "Content-Type: application/json" \
                -d @"$workflow" \
                https://n8ncloud.tech/api/v1/workflows
            echo ""
        fi
    done
    echo "✅ Bulk import completed!"
fi
