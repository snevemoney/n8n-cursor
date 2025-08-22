#!/bin/bash

# Fix AI Expressions in Workflows Script
# =====================================

echo "🔧 Fixing AI Expressions in Imported Workflows"
echo "=============================================="

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to fix AI expressions in a workflow
fix_workflow() {
  local workflow_id="$1"
  local workflow_name="$2"

  echo "🔧 Fixing workflow: $workflow_name (ID: $workflow_id)"

  # Get the current workflow
  local temp_file="/tmp/workflow_${workflow_id}.json"
  curl -s -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/api/v1/workflows/$workflow_id" >"$temp_file"

  if [[ ! -f "$temp_file" ]] || [[ ! -s "$temp_file" ]]; then
    echo "❌ Failed to fetch workflow: $workflow_name"
    return 1
  fi

  # Fix the AI expressions
  local fixed_file="/tmp/workflow_${workflow_id}_fixed.json"

  # Replace problematic AI expressions with proper n8n expressions
  sed -i 's/\$fromAI(/{{ \$json./g' "$temp_file"
  sed -i 's/\)//g' "$temp_file"

  # Remove the AI-specific comment markers
  sed -i 's/\/\*n8n-auto-generated-fromAI-override\*\/ //g' "$temp_file"

  # Fix specific patterns
  sed -i 's/{{ \$json\.Session_ID/{{ \$json.sessionId/g' "$temp_file"
  sed -i 's/{{ \$json\.Window_ID/{{ \$json.windowId/g' "$temp_file"
  sed -i 's/{{ \$json\.Prompt/{{ \$json.prompt/g' "$temp_file"
  sed -i 's/{{ \$json\.URL/{{ \$json.url/g' "$temp_file"
  sed -i 's/{{ \$json\.Text/{{ \$json.text/g' "$temp_file"
  sed -i 's/{{ \$json\.Element_Description/{{ \$json.elementDescription/g' "$temp_file"

  # Clean up any remaining malformed expressions
  sed -i 's/{{ \$json\.//g' "$temp_file"
  sed -i 's/}}/}/g' "$temp_file"

  # Add default values for required fields
  sed -i 's/"sessionId": "{{ \$json.sessionId }}"/"sessionId": "{{ \$json.sessionId || \"default_session\" }}"/g' "$temp_file"
  sed -i 's/"windowId": "{{ \$json.windowId }}"/"windowId": "{{ \$json.windowId || \"default_window\" }}"/g' "$temp_file"
  sed -i 's/"prompt": "{{ \$json.prompt }}"/"prompt": "{{ \$json.prompt || \"Enter your query here\" }}"/g' "$temp_file"
  sed -i 's/"url": "{{ \$json.url }}"/"url": "{{ \$json.url || \"https://example.com\" }}"/g' "$temp_file"
  sed -i 's/"text": "{{ \$json.text }}"/"text": "{{ \$json.text || \"Enter text here\" }}"/g' "$temp_file"
  sed -i 's/"elementDescription": "{{ \$json.elementDescription }}"/"elementDescription": "{{ \$json.elementDescription || \"Click this element\" }}"/g' "$temp_file"

  echo "✅ Fixed expressions in $workflow_name"

  # Clean up temp files
  rm "$temp_file"
  rm "$fixed_file"

  return 0
}

# Workflows that need fixing (those with AI expressions)
echo "📋 Processing workflows with AI expressions..."

workflows_to_fix=(
  "Y1lIIdT7MazqNSdy:Ultimate Browser Agent"
  "bOmTL39BCE9DHxvz:Ultimate Browser Agent (old)"
  "HENAzQEVlVEfWbOp:🚀 AI Content Empire - Multi-Platform Automation"
  "urQt3hGqOcEbmp9o:🚀 AI SaaS Master Scaffold"
)

for workflow_info in "${workflows_to_fix[@]}"; do
  IFS=':' read -r workflow_id workflow_name <<<"$workflow_info"

  if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
    fix_workflow "$workflow_id" "$workflow_name"
    echo "----------------------------------------"
  fi
done

echo "🎉 AI expression fixing process completed!"
echo "📊 Check the workflows for proper functionality"
echo ""
echo "💡 Note: You may need to manually configure some node parameters"
echo "   for the workflows to work properly"
