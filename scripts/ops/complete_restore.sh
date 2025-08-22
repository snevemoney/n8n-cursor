#!/bin/bash

echo "🔄 Complete n8n Restoration Script"
echo "=================================="
echo ""
echo "This script will restore your entire n8n environment after initial setup"
echo ""

if [ -z "$1" ]; then
  echo "📋 Usage:"
  echo "1. Complete the n8n setup in the browser first"
  echo "2. Get your API key from Settings > API"
  echo "3. Run: ./complete_restore.sh YOUR_API_KEY"
  echo ""
  echo "📁 Workflows ready to restore:"
  ls -1 ~/n8n-cursor/workflows/*.json | while read file; do
    workflow_name=$(grep -o '"name":"[^"]*"' "$file" | head -1 | cut -d'"' -f4)
    echo "   ✅ $(basename "$file") - $workflow_name"
  done
  echo ""
  echo "🎯 This will restore all your workflows and recreate your environment!"
  exit 0
fi

API_KEY="$1"
N8N_URL="https://n8ncloud.tech"

echo "🚀 Starting complete restoration..."
echo ""

# Import each workflow
echo "📥 Importing workflows..."
for workflow_file in ~/n8n-cursor/workflows/*.json; do
  if [ -f "$workflow_file" ]; then
    workflow_name=$(grep -o '"name":"[^"]*"' "$workflow_file" | head -1 | cut -d'"' -f4)
    echo "   Importing: $workflow_name"

    response=$(curl -s -X POST \
      -H "X-N8N-API-KEY: $API_KEY" \
      -H "Content-Type: application/json" \
      -d @"$workflow_file" \
      "$N8N_URL/api/v1/workflows")

    if echo "$response" | grep -q '"id"'; then
      echo "   ✅ Success: $workflow_name"
    else
      echo "   ❌ Failed: $workflow_name"
      echo "      Error: $response"
    fi
  fi
done

echo ""
echo "🎉 Restoration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check your workflows in n8n"
echo "2. Update credentials (OpenAI, Supabase, Discord)"
echo "3. Test your workflows"
echo ""
echo "✅ Your n8n environment has been fully restored!"
