#!/bin/bash

# Better Workflow Fixer Script
# ============================

echo "🔧 Better Workflow Fixer - Preserving Required Properties"
echo "========================================================="

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to create a fixed workflow preserving required properties
create_fixed_workflow() {
  local original_id="$1"
  local workflow_name="$2"

  echo "🔧 Creating fixed version of: $workflow_name"

  # Get the original workflow
  local temp_file="/tmp/workflow_${original_id}.json"
  curl -s -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/api/v1/workflows/$original_id" >"$temp_file"

  if [[ ! -f "$temp_file" ]] || [[ ! -s "$temp_file" ]]; then
    echo "❌ Failed to fetch workflow: $workflow_name"
    return 1
  fi

  # Create a fixed version by cleaning the JSON but preserving name
  local fixed_file="/tmp/workflow_${original_id}_fixed.json"

  # Use jq to clean the workflow but keep name, nodes, connections, settings
  jq '{
        name: .name,
        nodes: .nodes,
        connections: .connections,
        settings: .settings,
        staticData: .staticData
    }' "$temp_file" >"$fixed_file"

  # Fix the expressions using sed
  sed -i 's/\$fromAI([^}]*)/{{ \$json.default_value }}/g' "$fixed_file"
  sed -i 's/\/\*n8n-auto-generated-fromAI-override\*\/ //g' "$fixed_file"

  echo "✅ Created fixed workflow file: $fixed_file"

  # Clean up temp files
  rm "$temp_file"

  return 0
}

# Function to import fixed workflow
import_fixed_workflow() {
  local fixed_file="$1"
  local workflow_name="$2"

  echo "📤 Importing fixed workflow: $workflow_name"

  # Import the fixed workflow
  response=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$fixed_file")

  if echo "$response" | jq -e '.id' >/dev/null 2>&1; then
    workflow_id=$(echo "$response" | jq -r '.id')
    echo "✅ Successfully imported: $workflow_name (ID: $workflow_id)"
    return 0
  else
    echo "❌ Failed to import $workflow_name:"
    echo "$response" | jq -r '.message // .error // "Unknown error"'
    return 1
  fi
}

# Main process
echo "📋 Step 1: Creating fixed workflow files..."

# Create fixed versions of broken workflows
workflows_to_fix=(
  "HENAzQEVlVEfWbOp:🚀 AI Content Empire - Multi-Platform Automation"
  "urQt3hGqOcEbmp9o:🚀 AI SaaS Master Scaffold"
)

for workflow_info in "${workflows_to_fix[@]}"; do
  IFS=':' read -r workflow_id workflow_name <<<"$workflow_info"

  if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
    create_fixed_workflow "$workflow_id" "$workflow_name"
  fi
done

echo ""
echo "📋 Step 2: Importing fixed workflows..."

# Import the fixed workflows
for workflow_info in "${workflows_to_fix[@]}"; do
  IFS=':' read -r workflow_id workflow_name <<<"$workflow_info"

  if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
    fixed_file="/tmp/workflow_${workflow_id}_fixed.json"
    if [[ -f "$fixed_file" ]]; then
      import_fixed_workflow "$fixed_file" "$workflow_name"
      # Clean up
      rm "$fixed_file"
    fi
  fi
done

echo ""
echo "🎉 Workflow fixing process completed!"
echo "📊 Check n8n for the newly imported, fixed workflows"
