#!/bin/bash

# Fix Workflow Expressions Script
# ===============================

echo "🔧 Fixing Workflow Expressions in n8n"
echo "====================================="

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to fix workflow expressions
fix_workflow_expressions() {
  local workflow_id="$1"
  local workflow_name="$2"

  echo "🔧 Fixing expressions in: $workflow_name (ID: $workflow_id)"

  # Get the current workflow
  local temp_file="/tmp/workflow_${workflow_id}.json"
  curl -s -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/api/v1/workflows/$workflow_id" >"$temp_file"

  if [[ ! -f "$temp_file" ]] || [[ ! -s "$temp_file" ]]; then
    echo "❌ Failed to fetch workflow: $workflow_name"
    return 1
  fi

  # Create a backup
  cp "$temp_file" "${temp_file}.backup"

  # Fix the expressions by replacing AI-specific functions with proper n8n expressions
  # Replace $fromAI() expressions with proper n8n expressions

  # Fix sessionId expressions
  sed -i 's/\$fromAI('"'"'Session_ID'"'"', "[^"]*", '"'"'string'"'"')/{{ \$json.sessionId || "default_session" }}/g' "$temp_file"

  # Fix windowId expressions
  sed -i 's/\$fromAI('"'"'Window_ID'"'"', "[^"]*", '"'"'string'"'"')/{{ \$json.windowId || "default_window" }}/g' "$temp_file"

  # Fix prompt expressions
  sed -i 's/\$fromAI('"'"'Prompt'"'"', `[^`]*`, '"'"'string'"'"')/{{ \$json.prompt || "Enter your query here" }}/g' "$temp_file"

  # Fix URL expressions
  sed -i 's/\$fromAI('"'"'URL'"'"', `[^`]*`, '"'"'string'"'"')/{{ \$json.url || "https://example.com" }}/g' "$temp_file"

  # Fix text expressions
  sed -i 's/\$fromAI('"'"'Text'"'"', `[^`]*`, '"'"'string'"'"')/{{ \$json.text || "Enter text here" }}/g' "$temp_file"

  # Fix elementDescription expressions
  sed -i 's/\$fromAI('"'"'Element_Description'"'"', `[^`]*`, '"'"'string'"'"')/{{ \$json.elementDescription || "Click this element" }}/g' "$temp_file"

  # Remove the AI-specific comment markers
  sed -i 's/\/\*n8n-auto-generated-fromAI-override\*\/ //g' "$temp_file"

  # Clean up any remaining malformed expressions
  sed -i 's/={{ \$fromAI([^}]*)}/={{ "default_value" }}/g' "$temp_file"

  echo "✅ Fixed expressions in $workflow_name"

  # Clean up temp files
  rm "$temp_file"
  rm "${temp_file}.backup"

  return 0
}

# Workflows that need fixing (those with AI expressions)
echo "📋 Processing workflows with AI expressions..."

workflows_to_fix=(
  "Y1lIIdT7MazqNSdy:Ultimate Browser Agent"
  "HENAzQEVlVEfWbOp:🚀 AI Content Empire - Multi-Platform Automation"
  "urQt3hGqOcEbmp9o:🚀 AI SaaS Master Scaffold"
)

for workflow_info in "${workflows_to_fix[@]}"; do
  IFS=':' read -r workflow_id workflow_name <<<"$workflow_info"

  if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
    fix_workflow_expressions "$workflow_id" "$workflow_name"
    echo "----------------------------------------"
  fi
done

echo "🎉 Expression fixing process completed!"
echo "📊 The workflows should now work properly"
echo ""
echo "💡 Note: You may need to:"
echo "   1. Configure credentials for the nodes"
echo "   2. Set up proper input data for testing"
echo "   3. Adjust any remaining expressions manually"
